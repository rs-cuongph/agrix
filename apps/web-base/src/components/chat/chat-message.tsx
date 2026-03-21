'use client';

import React from 'react';
import { Bot, User } from 'lucide-react';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  sources?: { documentId: string; snippet: string }[];
  isStreaming?: boolean;
}

export default function ChatMessageBubble({ role, content, sources, isStreaming }: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'} mb-3`}>
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5 ${
          isUser ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-50 text-blue-500'
        }`}
      >
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>

      {/* Message bubble */}
      <div
        className={`max-w-[80%] px-3.5 py-2.5 text-[13px] leading-relaxed ${
          isUser
            ? 'bg-emerald-500 text-white rounded-2xl rounded-br-md shadow-sm'
            : 'bg-white text-gray-700 rounded-2xl rounded-bl-md shadow-sm border border-gray-100'
        }`}
      >
        <div className="whitespace-pre-wrap break-words">{content}</div>

        {/* Streaming indicator */}
        {isStreaming && !content && (
          <div className="flex gap-1 py-1">
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}
        {isStreaming && content && (
          <span className="inline-block w-0.5 h-4 bg-gray-400 animate-pulse ml-0.5 align-text-bottom" />
        )}

        {/* Sources */}
        {sources && sources.length > 0 && !isStreaming && (
          <div className="mt-2 pt-2 border-t border-gray-200/50">
            <p className="text-[11px] text-gray-400 mb-0.5">Tham khảo:</p>
            {sources.slice(0, 3).map((s, i) => (
              <p key={i} className="text-[11px] text-gray-400 truncate">
                {s.snippet}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
