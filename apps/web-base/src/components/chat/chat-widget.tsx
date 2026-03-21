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

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-emerald-500 text-white shadow-[0_4px_20px_rgba(16,185,129,0.4)] hover:bg-emerald-600 hover:shadow-[0_4px_24px_rgba(16,185,129,0.55)] hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center chat-bubble-enter"
        aria-label="Mở chat tư vấn"
      >
        <MessageCircle size={24} />
        <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full animate-pulse ring-2 ring-white" />
      </button>
    );
  }

  return (
    <div
      className={`fixed z-50 flex flex-col chat-window-enter overflow-hidden ${
        isMobile
          ? 'inset-0 bg-white'
          : 'bottom-5 right-5 w-[380px] h-[540px] bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.15)] border border-gray-200/60'
      }`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white flex-shrink-0 ${
          !isMobile ? 'rounded-t-2xl' : ''
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <MessageCircle size={18} />
          </div>
          <div>
            <h3 className="text-sm font-semibold leading-tight">Trợ lý Agrix</h3>
            <p className="text-[11px] text-emerald-100 leading-tight">Tư vấn nông nghiệp 24/7</p>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={clearChat}
            className="p-2 hover:bg-white/15 rounded-full transition-colors"
            title="Cuộc hội thoại mới"
          >
            <RotateCcw size={15} />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/15 rounded-full transition-colors"
            title={isMobile ? 'Đóng' : 'Thu nhỏ'}
          >
            {isMobile ? <X size={15} /> : <Minimize2 size={15} />}
          </button>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-10 px-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3">
              <MessageCircle size={24} className="text-emerald-400" />
            </div>
            <p className="text-sm font-medium text-gray-600">Xin chào! 👋</p>
            <p className="text-xs mt-1.5 text-gray-400 leading-relaxed">
              Hãy hỏi tôi về sản phẩm nông nghiệp, cách sử dụng thuốc BVTV, phân bón, hoặc bất
              kỳ câu hỏi gì.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-5">
              {[
                'Cách sử dụng phân bón NPK?',
                'Thuốc trừ sâu cho lúa?',
                'Phòng bệnh vàng lá?',
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-full text-gray-600 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition-all shadow-sm"
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
  );
}
