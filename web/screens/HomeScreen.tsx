import React, { useMemo, useState } from 'react';
import type { ChatMessage, ChatThread } from '../../types';
import { useAppStore } from '../../store';
import { FONT_STACKS } from '../fonts';

type WebScreenProps = {
  params: Record<string, string>;
  navigate: (screenName: string, params?: Record<string, string>) => void;
  goBack: () => void;
};

function threadTitle(thread: ChatThread): string {
  const first = thread.messages.find((message) => message.role === 'user')?.content ?? 'New chat';
  return first.length > 42 ? `${first.slice(0, 42).trim()}…` : first;
}

function formatTime(timestamp: number): string {
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(timestamp);
}

function MessageRow({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <article className={`message-row ${isUser ? 'message-user' : 'message-assistant'}`} data-wabi-block={isUser ? 'Your message' : 'AI reply'}>
      <div className={`message-avatar ${isUser ? 'avatar-user' : 'avatar-ai'}`} aria-hidden="true">{isUser ? 'Y' : '✳'}</div>
      <div className="message-body">
        <div className="message-label">{isUser ? 'You' : 'Assistant'}</div>
        <p>{message.content}</p>
      </div>
    </article>
  );
}

export const HomeScreen: React.FC<WebScreenProps> = () => {
  const threads = useAppStore((state) => state.threads);
  const activeThreadId = useAppStore((state) => state.activeThreadId);
  const generatingThreadId = useAppStore((state) => state.generatingThreadId);
  const errorsByThread = useAppStore((state) => state.errorsByThread);
  const startNewChat = useAppStore((state) => state.startNewChat);
  const setActiveThread = useAppStore((state) => state.setActiveThread);
  const sendMessage = useAppStore((state) => state.sendMessage);
  const retryLastReply = useAppStore((state) => state.retryLastReply);
  const dismissError = useAppStore((state) => state.dismissError);
  const [draft, setDraft] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const activeThread = useMemo(() => threads.find((thread) => thread.id === activeThreadId) ?? null, [threads, activeThreadId]);
  const isGenerating = Boolean(activeThread && generatingThreadId === activeThread.id);
  const currentError = activeThread ? errorsByThread[activeThread.id] : null;

  const chooseThread = (id: string) => {
    setActiveThread(id);
    setHistoryOpen(false);
    setDraft('');
  };

  const beginNewChat = () => {
    startNewChat();
    setDraft('');
    setHistoryOpen(false);
  };

  const submit = async (event?: React.FormEvent) => {
    event?.preventDefault();
    if (!draft.trim() || isGenerating || Boolean(generatingThreadId)) return;
    const content = draft.trim();
    setDraft('');
    await sendMessage(content);
  };

  const submitSuggestion = (prompt: string) => {
    if (generatingThreadId) return;
    setDraft('');
    void sendMessage(prompt);
  };

  return (
    <main className="home" data-wabi-block="Cloud AI chat" style={{ fontFamily: FONT_STACKS.sans }}>
      <section className="compact-home" aria-label="Chat preview">
        <div className="compact-mark" aria-hidden="true">✳</div>
        <div className="compact-copy">
          <strong>{activeThread ? threadTitle(activeThread) : 'Ready when you are'}</strong>
          <span>{activeThread ? `${activeThread.messages.length} messages` : 'Cloud AI chat'}</span>
        </div>
      </section>

      <section className="expanded-home" data-wabi-block="Chat workspace">
        <aside className={`history-panel ${historyOpen ? 'history-open' : ''}`} data-wabi-block="Chat history" aria-label="Chat history">
          <div className="history-top">
            <div className="brand-lockup"><span className="brand-symbol" aria-hidden="true">✳</span><span>Chat</span></div>
            <button className="icon-button new-chat-button" type="button" data-wabi-action="new-chat" onClick={beginNewChat} aria-label="New chat" title="New chat">＋</button>
          </div>
          <button className="new-chat-wide" type="button" data-wabi-action="new-chat" onClick={beginNewChat}>＋ <span>New chat</span></button>
          <div className="history-label">Recent</div>
          <div className="thread-list" role="list">
            {threads.length === 0 ? (
              <p className="history-empty">Your conversations will appear here.</p>
            ) : threads.map((thread) => (
              <button
                key={thread.id}
                type="button"
                className={`thread-item ${thread.id === activeThreadId ? 'thread-active' : ''}`}
                data-wabi-action="open-chat"
                onClick={() => chooseThread(thread.id)}
                aria-current={thread.id === activeThreadId ? 'page' : undefined}
                title={threadTitle(thread)}
              >
                <span className="thread-title">{threadTitle(thread)}</span>
                <span className="thread-date">{formatTime(thread.updatedAt)}</span>
              </button>
            ))}
          </div>
          <div className="history-bottom"><span className="service-dot" />Cloud replies via Wabi AI</div>
        </aside>

        {historyOpen && <button className="history-scrim" type="button" aria-label="Close history" onClick={() => setHistoryOpen(false)} />}

        <section className="chat-panel" data-wabi-block="Conversation">
          <header className="chat-header">
            <button className="icon-button mobile-history-button" type="button" data-wabi-action="toggle-history" onClick={() => setHistoryOpen((open) => !open)} aria-label={historyOpen ? 'Close chat history' : 'Open chat history'} aria-expanded={historyOpen}>☰</button>
            <div className="chat-header-title">{activeThread ? threadTitle(activeThread) : 'New chat'}</div>
            <button className="icon-button mobile-new-button" type="button" data-wabi-action="new-chat" onClick={beginNewChat} aria-label="Start a new chat">＋</button>
          </header>

          <div className="conversation-scroll" key={activeThread?.id ?? 'empty'}>
            {activeThread ? (
              <div className="message-list" role="log" aria-label="Conversation" aria-live="polite">
                {activeThread.messages.map((message) => <MessageRow key={message.id} message={message} />)}
                {isGenerating && (
                  <article className="message-row message-assistant" data-wabi-block="Generating reply" aria-label="Assistant is thinking">
                    <div className="message-avatar avatar-ai" aria-hidden="true">✳</div>
                    <div className="message-body"><div className="message-label">Assistant</div><div className="thinking-line"><span /><span /><span /></div></div>
                  </article>
                )}
              </div>
            ) : (
              <div className="welcome" data-wabi-block="Start a conversation">
                <div className="welcome-emblem" aria-hidden="true">✳</div>
                <h1>What can I help with?</h1>
                <p>Ask a question, explore an idea, or work through a task.</p>
                <div className="suggestions" aria-label="Suggested prompts">
                  <button type="button" data-wabi-action="send-suggestion" onClick={() => submitSuggestion('Help me understand a topic step by step.')}>Explain a topic</button>
                  <button type="button" data-wabi-action="send-suggestion" onClick={() => submitSuggestion('Help me brainstorm a few fresh ideas for a project.')}>Brainstorm ideas</button>
                  <button type="button" data-wabi-action="send-suggestion" onClick={() => submitSuggestion('Help me make a simple plan for something I want to get done.')}>Make a plan</button>
                </div>
              </div>
            )}
          </div>

          <div className="composer-region" data-wabi-block="Message composer">
            {currentError && activeThread && (
              <div className="error-banner" role="alert">
                <span>{currentError}</span>
                <button type="button" data-wabi-action="retry-reply" onClick={() => void retryLastReply(activeThread.id)} disabled={Boolean(generatingThreadId)}>Retry</button>
                <button className="error-dismiss" type="button" data-wabi-action="dismiss-error" onClick={() => dismissError(activeThread.id)} aria-label="Dismiss error">×</button>
              </div>
            )}
            <form className="composer" onSubmit={(event) => void submit(event)}>
              <label className="sr-only" htmlFor="chat-prompt">Message</label>
              <textarea
                id="chat-prompt"
                data-wabi-action="write-message"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    void submit();
                  }
                }}
                placeholder="Message…"
                rows={1}
                maxLength={12000}
                disabled={Boolean(generatingThreadId)}
              />
              <button className="send-button" type="submit" data-wabi-action="send-message" aria-label={isGenerating ? 'Generating reply' : 'Send message'} disabled={!draft.trim() || Boolean(generatingThreadId)}>
                {isGenerating ? <span className="send-spinner" aria-hidden="true" /> : <span aria-hidden="true">↑</span>}
              </button>
            </form>
            <div className="composer-note">Replies are generated by Wabi AI. Verify important information.</div>
          </div>
        </section>
      </section>
    </main>
  );
};
