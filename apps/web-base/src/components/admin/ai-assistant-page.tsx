'use client';

import React, { useState } from 'react';
import { FileText, Settings, MessageCircle } from 'lucide-react';
import KnowledgeManager from '@/components/admin/knowledge-manager';
import ChatbotConfigPanel from '@/components/admin/chatbot-config';
import SessionHistory from '@/components/admin/session-history';

const tabs = [
  { key: 'knowledge', label: 'Tài liệu', icon: FileText },
  { key: 'config', label: 'Cấu hình', icon: Settings },
  { key: 'sessions', label: 'Lịch sử chat', icon: MessageCircle },
] as const;

type TabKey = (typeof tabs)[number]['key'];

export default function AiAssistantPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('knowledge');

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Trợ lý AI</h1>
        <p className="text-sm text-gray-500 mt-1">
          Quản lý kho tài liệu kiến thức, cấu hình AI, và xem lịch sử cuộc hội thoại
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'knowledge' && <KnowledgeManager />}
      {activeTab === 'config' && <ChatbotConfigPanel />}
      {activeTab === 'sessions' && <SessionHistory />}
    </div>
  );
}
