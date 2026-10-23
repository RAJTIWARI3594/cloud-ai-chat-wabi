import { aiClient, configureStorage, createStore, Generators } from '$sdk';
import { ChatReplyDef } from '../types';
import type { ChatMessage, ChatThread } from '../types';
import { STORE_MIGRATIONS, STORE_SCHEMA_VERSION } from './migrations';

type AppStore = {
  threads: ChatThread[];
  activeThreadId: string | null;
  generatingThreadId: string | null;
  errorsByThread: Record<string, string>;
  startNewChat: () => void;
  setActiveThread: (id: string) => void;
  sendMessage: (content: string) => Promise<void>;
  retryLastReply: (threadId: string) => Promise<void>;
  dismissError: (threadId: string) => void;
};

configureStorage({
  partialize: (state: AppStore) => ({
    threads: state.threads,
    activeThreadId: state.activeThreadId,
  }),
  schemaVersion: STORE_SCHEMA_VERSION,
  migrations: STORE_MIGRATIONS,
});

async function requestCloudReply(messages: ChatMessage[]): Promise<string> {
  const recent = messages.slice(-24).map(({ role, content }) => ({ role, content }));
  const response = await aiClient.llm<{ id: string; answer?: string }>({
    type: ChatReplyDef.typeName,
    save: false,
    data: { id: Generators.ids.random() },
    context: {
      conversation: JSON.stringify(recent),
      currentMessage: [...recent].reverse().find((message) => message.role === 'user')?.content ?? '',
    },
  });
  const answer = response[0]?.answer?.trim();
  if (!answer) throw new Error('The AI service returned an empty reply. Try again.');
  return answer;
}

function visibleError(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return 'The AI reply could not be generated. Check your connection and try again.';
}

export const useAppStore = createStore<AppStore>((set, get) => ({
  threads: [],
  activeThreadId: null,
  generatingThreadId: null,
  errorsByThread: {},

  startNewChat: () => set({ activeThreadId: null }),
  setActiveThread: (id) => set({ activeThreadId: id }),
  dismissError: (threadId) => set((state) => {
    const errors = { ...state.errorsByThread };
    delete errors[threadId];
    return { errorsByThread: errors };
  }),

  sendMessage: async (rawContent) => {
    const content = rawContent.trim();
    if (!content || get().generatingThreadId) return;

    const now = Date.now();
    const state = get();
    const current = state.threads.find((thread) => thread.id === state.activeThreadId);
    const threadId = current?.id ?? Generators.ids.random();
    const message: ChatMessage = {
      id: Generators.ids.random(),
      role: 'user',
      content,
      createdAt: now,
    };
    const baseThread: ChatThread = current ?? {
      id: threadId,
      createdAt: now,
      updatedAt: now,
      messages: [],
    };
    const updatedThread: ChatThread = {
      ...baseThread,
      updatedAt: now,
      messages: [...baseThread.messages, message],
    };
    const withoutOldError = { ...state.errorsByThread };
    delete withoutOldError[threadId];
    set((latest) => ({
      threads: current
        ? latest.threads.map((thread) => thread.id === threadId ? updatedThread : thread)
        : [updatedThread, ...latest.threads],
      activeThreadId: threadId,
      generatingThreadId: threadId,
      errorsByThread: withoutOldError,
    }));

    await finishReply(threadId, updatedThread.messages, set);
  },

  retryLastReply: async (threadId) => {
    const state = get();
    if (state.generatingThreadId) return;
    const thread = state.threads.find((item) => item.id === threadId);
    if (!thread || thread.messages.at(-1)?.role !== 'user') return;
    const errors = { ...state.errorsByThread };
    delete errors[threadId];
    set({ generatingThreadId: threadId, errorsByThread: errors });
    await finishReply(threadId, thread.messages, set);
  },
}));

async function finishReply(
  threadId: string,
  messages: ChatMessage[],
  set: (partial: Partial<AppStore> | ((state: AppStore) => Partial<AppStore>)) => void,
): Promise<void> {
  try {
    const content = await requestCloudReply(messages);
    const reply: ChatMessage = {
      id: Generators.ids.random(),
      role: 'assistant',
      content,
      createdAt: Date.now(),
    };
    set((state) => ({
      threads: state.threads.map((thread) => thread.id === threadId
        ? { ...thread, updatedAt: reply.createdAt, messages: [...thread.messages, reply] }
        : thread),
    }));
  } catch (error) {
    set((state) => ({
      errorsByThread: { ...state.errorsByThread, [threadId]: visibleError(error) },
    }));
  } finally {
    set((state) => state.generatingThreadId === threadId ? { generatingThreadId: null } : {});
  }
}
