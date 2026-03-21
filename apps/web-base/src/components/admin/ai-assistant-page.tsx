'use client';

import React from 'react';
import { FileText, Settings, MessageCircle } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import KnowledgeManager from '@/components/admin/knowledge-manager';
import ChatbotConfigPanel from '@/components/admin/chatbot-config';
import SessionHistory from '@/components/admin/session-history';

export default function AiAssistantPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Trợ lý AI</h1>
        <p className="text-sm text-gray-500 mt-1">
          Quản lý kho tài liệu kiến thức, cấu hình AI, và xem lịch sử cuộc hội thoại
        </p>
      </div>

      <Tabs defaultValue="knowledge">
        <TabsList>
          <TabsTrigger value="knowledge" className="flex items-center gap-2">
            <FileText size={16} />
            Tài liệu
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings size={16} />
            Cấu hình
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <MessageCircle size={16} />
            Lịch sử chat
          </TabsTrigger>
        </TabsList>

        <TabsContent value="knowledge">
          <KnowledgeManager />
        </TabsContent>
        <TabsContent value="config">
          <ChatbotConfigPanel />
        </TabsContent>
        <TabsContent value="sessions">
          <SessionHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}
