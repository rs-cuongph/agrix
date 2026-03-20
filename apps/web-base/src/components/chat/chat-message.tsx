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
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
        }`}
      >
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>

      {/* Message bubble */}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'bg-emerald-500 text-white rounded-br-md'
            : 'bg-gray-100 text-gray-800 rounded-bl-md'
        }`}
      >
        <div className="whitespace-pre-wrap">{content}</div>

        {/* Streaming indicator */}
        {isStreaming && (
          <span className="inline-block ml-1 animate-pulse">▊</span>
        )}

        {/* Sources */}
        {sources && sources.length > 0 && !isStreaming && (
          <div className="mt-2 pt-2 border-t border-gray-200/50">
            <p className="text-xs text-gray-500 mb-1">Tham khảo:</p>
            {sources.slice(0, 3).map((s, i) => (
              <p key={i} className="text-xs text-gray-400 truncate">
                {s.snippet}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
