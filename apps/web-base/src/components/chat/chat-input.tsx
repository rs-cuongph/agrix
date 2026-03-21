'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function ChatInput({ onSend, disabled, placeholder }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed || disabled) return;
    if (trimmed.length > 2000) {
      alert('Tin nhắn tối đa 2000 ký tự.');
      return;
    }
    onSend(trimmed);
    setMessage('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  return (
    <div className="flex items-end gap-2 px-3 py-3 bg-white border-t border-gray-100 flex-shrink-0">
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder || 'Nhập câu hỏi...'}
          rows={1}
          className="w-full resize-none bg-gray-50 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-400 disabled:opacity-50 max-h-[120px] placeholder:text-gray-400 transition-all"
        />
      </div>
      <button
        onClick={handleSend}
        disabled={disabled || !message.trim()}
        className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 disabled:opacity-30 disabled:hover:bg-emerald-500 transition-all active:scale-90 shadow-sm"
      >
        <Send size={16} className="ml-0.5" />
      </button>
    </div>
  );
}
