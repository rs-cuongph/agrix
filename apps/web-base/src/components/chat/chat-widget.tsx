'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, RotateCcw, Minimize2, Bot } from 'lucide-react';
import { usePathname } from 'next/navigation';
import ChatMessageBubble from './chat-message';
import ChatInput from './chat-input';
import { useChatContext } from '@/lib/chat-context';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, isLoading, sendMessage, clearChat } = useChatContext();
  const pathname = usePathname();
  const isPosRoute = pathname?.startsWith('/pos');
  const [posCartOpen, setPosCartOpen] = useState(true);

  // Listen to POS Cart Toggle
  useEffect(() => {
    const handleToggle = (e: Event) => {
      const customEvent = e as CustomEvent<boolean>;
      setPosCartOpen(customEvent.detail);
    };
    window.addEventListener('agrix-pos-cart-toggle', handleToggle);
    return () => window.removeEventListener('agrix-pos-cart-toggle', handleToggle);
  }, []);

  // Show tooltip after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen && messages.length === 0) {
        setShowTooltip(true);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [isOpen, messages.length]);

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
    const positionClass = isPosRoute && !isMobile 
      ? (posCartOpen ? 'right-[444px]' : 'right-28') 
      : 'right-6';
    return (
      <div className={`fixed bottom-6 ${positionClass} z-50 flex flex-col items-center justify-end chat-bubble-enter transition-all duration-300`}>
        {/* Tooltip Thought Bubble */}
        <div 
          className={`absolute bottom-[88px] right-2 transition-all duration-500 origin-bottom-right ${
            showTooltip ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
          }`}
        >
          <div className="bg-white text-gray-800 px-4 py-3 rounded-2xl rounded-br-sm shadow-[0_8px_30px_rgba(33,53,49,0.12)] border border-gray-100 max-w-[200px] animate-robot-bubble">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowTooltip(false);
              }}
              className="absolute -top-1.5 -right-1.5 bg-white text-gray-400 hover:text-gray-600 rounded-full p-0.5 shadow-sm border border-gray-100 transition-colors"
            >
              <X size={12} />
            </button>
            <p className="text-[13px] font-medium leading-relaxed text-center text-gray-600">
              Cần hỗ trợ <br />
              về nông nghiệp?
            </p>
            {/* Thought bubbles leading to robot */}
            <div className="absolute -bottom-3 right-6 w-3 h-3 bg-white rounded-full border border-gray-100 shadow-sm" />
            <div className="absolute -bottom-6 right-8 w-2 h-2 bg-white rounded-full border border-gray-100 shadow-sm" />
          </div>
        </div>

        {/* Animated Robot Button */}
        <button
          onClick={() => {
            setShowTooltip(false);
            setIsOpen(true);
          }}
          className="relative w-16 h-16 animate-robot-float flex items-end justify-center group"
          aria-label="Mở chat tư vấn"
        >
          {/* Glowing Shadow */}
          <div className="absolute -bottom-1 w-10 h-2 bg-emerald-500/30 rounded-full blur-md group-hover:bg-emerald-500/50 transition-colors" />

          {/* Robot Head */}
          <div className="relative w-14 h-[52px] bg-white rounded-2xl shadow-[0_4px_20px_rgba(16,185,129,0.25)] border-2 border-emerald-100 flex flex-col items-center justify-center overflow-visible group-hover:border-emerald-300 transition-colors">
            
            {/* Antenna */}
            <div className="absolute -top-4 flex flex-col items-center">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)] border border-white" />
              <div className="w-1 h-2 bg-gradient-to-b from-gray-300 to-gray-200" />
            </div>

            {/* Ears */}
            <div className="absolute top-4 -left-2 w-2 h-5 bg-gradient-to-b from-gray-200 to-gray-300 rounded-l-md border border-gray-300 shadow-sm" />
            <div className="absolute top-4 -right-2 w-2 h-5 bg-gradient-to-b from-gray-200 to-gray-300 rounded-r-md border border-gray-300 shadow-sm" />

            {/* Face Screen */}
            <div className="w-11 h-[26px] bg-gray-900 rounded-lg flex items-center justify-center gap-2.5 relative overflow-hidden shadow-inner border border-gray-800">
              {/* Eyes */}
              <div className="w-2.5 h-3.5 rounded-full bg-emerald-400 animate-robot-eye shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
              <div className="w-2.5 h-3.5 rounded-full bg-emerald-400 animate-robot-eye shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
              
              {/* Scanline reflection */}
              <div className="absolute top-0 left-0 w-full h-1/2 bg-white/10 rounded-t-lg" />
            </div>

            {/* Mouth / Speaker */}
            <div className="mt-1.5 w-3 h-0.5 bg-gray-300 rounded-full" />
            
            {/* Unread dot */}
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full animate-pulse ring-2 ring-white shadow-sm" />
          </div>
        </button>
      </div>
    );
  }

  const windowPositionClass = isPosRoute && !isMobile 
    ? (posCartOpen ? 'right-[444px]' : 'right-28') 
    : 'right-5';

  return (
    <div
      className={`fixed z-50 flex flex-col chat-window-enter overflow-hidden ${
        isMobile
          ? 'inset-0 bg-white'
          : `bottom-5 ${windowPositionClass} w-[380px] h-[540px] bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.15)] border border-gray-200/60`
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
