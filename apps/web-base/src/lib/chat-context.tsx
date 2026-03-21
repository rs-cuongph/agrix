'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: { documentId: string; snippet: string }[];
  isStreaming?: boolean;
}

interface ChatContextType {
  messages: Message[];
  sessionId: string | null;
  isLoading: boolean;
  productId: string | null;
  setProductId: (id: string | null) => void;
  sendMessage: (content: string) => Promise<void>;
  clearChat: () => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function useChatContext() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChatContext must be used within ChatProvider');
  return ctx;
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [productId, setProductId] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    if (isLoading) return;

    // Add user message
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    // Add placeholder assistant message
    const assistantId = `assistant-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: 'assistant', content: '', isStreaming: true },
    ]);

    try {
      abortRef.current = new AbortController();

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          question: content,
          productId,
        }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Lỗi không xác định' }));
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: error.message || 'Có lỗi xảy ra.', isStreaming: false }
              : m,
          ),
        );
        setIsLoading(false);
        return;
      }

      // Read SSE stream
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('event: token')) {
            // Next line is data
          } else if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.token) {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, content: m.content + data.token } : m,
                  ),
                );
              }
              if (data.sessionId) {
                setSessionId(data.sessionId);
              }
              if (data.sources) {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, sources: data.sources, isStreaming: false } : m,
                  ),
                );
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }

      // Ensure streaming is marked done
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, isStreaming: false } : m)),
      );
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: 'Lỗi kết nối. Vui lòng thử lại.', isStreaming: false }
              : m,
          ),
        );
      }
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  }, [isLoading, sessionId, productId]);

  const clearChat = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    setMessages([]);
    setSessionId(null);
    setIsLoading(false);
  }, []);

  return (
    <ChatContext.Provider
      value={{ messages, sessionId, isLoading, productId, setProductId, sendMessage, clearChat }}
    >
      {children}
    </ChatContext.Provider>
  );
}
