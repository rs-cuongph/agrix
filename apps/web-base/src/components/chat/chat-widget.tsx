'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, RotateCcw, Minimize2 } from 'lucide-react';
import ChatMessageBubble from './chat-message';
import ChatInput from './chat-input';
import { useChatContext } from '@/lib/chat-context';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, isLoading, sendMessage, clearChat } = useChatContext();

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Detect mobile
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <>
      {/* Chat bubble button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-emerald-500 text-white shadow-lg hover:bg-emerald-600 hover:scale-105 transition-all flex items-center justify-center group chat-bubble-enter"
          aria-label="Mở chat tư vấn"
        >
          <MessageCircle size={24} />
          {/* Pulse animation */}
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div
          className={`fixed z-50 bg-white shadow-2xl flex flex-col chat-window-enter ${
            isMobile
              ? 'inset-0'
              : 'bottom-6 right-6 w-[380px] h-[560px] rounded-2xl border'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-emerald-500 text-white rounded-t-2xl flex-shrink-0">
            <div className="flex items-center gap-2">
              <MessageCircle size={20} />
              <div>
                <h3 className="text-sm font-semibold">Trợ lý Agrix</h3>
                <p className="text-xs text-emerald-100">Tư vấn nông nghiệp 24/7</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                className="p-1.5 hover:bg-emerald-600 rounded-full transition-colors"
                title="Cuộc hội thoại mới"
              >
                <RotateCcw size={16} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-emerald-600 rounded-full transition-colors"
                title={isMobile ? 'Đóng' : 'Thu nhỏ'}
              >
                {isMobile ? <X size={16} /> : <Minimize2 size={16} />}
              </button>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 mt-8">
                <MessageCircle size={40} className="mx-auto mb-3 text-gray-300" />
                <p className="text-sm font-medium">Xin chào!</p>
                <p className="text-xs mt-1">
                  Hãy hỏi tôi về sản phẩm nông nghiệp, cách sử dụng thuốc bảo vệ thực vật, phân
                  bón, hoặc bất kỳ câu hỏi gì.
                </p>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {[
                    'Cách sử dụng phân bón NPK?',
                    'Thuốc trừ sâu cho lúa?',
                    'Phòng bệnh vàng lá?',
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="text-xs px-3 py-1.5 border rounded-full text-gray-600 hover:bg-emerald-50 hover:border-emerald-300 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <ChatMessageBubble
                key={msg.id}
                role={msg.role}
                content={msg.content}
                sources={msg.sources}
                isStreaming={msg.isStreaming}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <ChatInput onSend={sendMessage} disabled={isLoading} />
        </div>
      )}
    </>
  );
}
