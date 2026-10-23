import { defineType } from '$sdk';

export interface ChatReply {
  id: string;
  answer?: string;
}

export const ChatReplyDef = defineType<ChatReply>({
  typeName: 'ChatReply',
  fields: {
    id: { type: 'string', runtimeManaged: true },
    answer: {
      type: 'string',
      isMarkdown: true,
      description: 'A direct conversational answer to the current user message, grounded in the supplied recent conversation.',
    },
  },
});

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
}

export interface ChatThread {
  id: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
}
