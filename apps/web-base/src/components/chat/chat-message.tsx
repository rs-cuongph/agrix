'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
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
        {isUser ? (
          <div className="whitespace-pre-wrap break-words">{content}</div>
        ) : (
          <div className="chat-markdown break-words">
            <ReactMarkdown
              components={{
                // Headings
                h1: ({ children }) => <h3 className="text-sm font-bold mt-2 mb-1">{children}</h3>,
                h2: ({ children }) => <h4 className="text-sm font-bold mt-2 mb-1">{children}</h4>,
                h3: ({ children }) => <h5 className="text-[13px] font-bold mt-1.5 mb-0.5">{children}</h5>,
                // Paragraphs
                p: ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,
                // Bold / Italic
                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                em: ({ children }) => <em className="italic">{children}</em>,
                // Lists
                ul: ({ children }) => <ul className="list-disc pl-4 mb-1.5 space-y-0.5">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-4 mb-1.5 space-y-0.5">{children}</ol>,
                li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                // Code
                code: ({ children, className }) => {
                  const isBlock = className?.includes('language-');
                  return isBlock ? (
                    <code className="block bg-gray-100 rounded-lg p-2 my-1.5 text-[12px] font-mono overflow-x-auto whitespace-pre">
                      {children}
                    </code>
                  ) : (
                    <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-[12px] font-mono">
                      {children}
                    </code>
                  );
                },
                pre: ({ children }) => <>{children}</>,
                // Links
                a: ({ href, children }) => (
                  <a href={href} target="_blank" rel="noopener noreferrer"
                    className="text-emerald-600 underline hover:text-emerald-700">
                    {children}
                  </a>
                ),
                // Blockquote
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-gray-300 pl-2 my-1.5 text-gray-500 italic">
                    {children}
                  </blockquote>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}

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
