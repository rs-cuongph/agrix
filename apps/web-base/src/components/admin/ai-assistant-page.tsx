'use client';

import React from 'react';
import { Bot, FileText, Settings, MessageCircle, Database, MessagesSquare } from 'lucide-react';
import { AdminPageHero, AdminStatsGrid } from '@/components/admin/admin-page-shell';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import KnowledgeManager from '@/components/admin/knowledge-manager';
import ChatbotConfigPanel from '@/components/admin/chatbot-config';
import SessionHistory from '@/components/admin/session-history';

export default function AiAssistantPage() {
  return (
    <div className="space-y-6">
      <AdminPageHero
        badge="AI Operations"
        icon={Bot}
        title="Trợ lý AI"
        description="Quản lý nguồn tri thức, cấu hình chatbot và lịch sử hội thoại theo cùng phong cách điều khiển với các menu admin khác."
      />

      <AdminStatsGrid
        items={[
          { label: 'Kho tri thức', value: '01 hub', hint: 'tài liệu và embeddings vận hành', icon: Database },
          { label: 'Cấu hình', value: '01 bảng', hint: 'điều chỉnh hành vi và model', icon: Settings, accentClassName: 'border-sky-100 bg-sky-50 text-sky-600' },
          { label: 'Lịch sử chat', value: '01 luồng', hint: 'kiểm tra chất lượng trả lời', icon: MessagesSquare, accentClassName: 'border-amber-100 bg-amber-50 text-amber-600' },
        ]}
      />

      <Tabs defaultValue="knowledge" className="space-y-5">
        <TabsList className="w-full justify-start rounded-2xl border border-slate-200/80 bg-white/85 p-1.5 shadow-sm">
          <TabsTrigger value="knowledge" className="flex items-center gap-2 rounded-xl px-4 py-2.5">
            <FileText size={16} />
            Tài liệu
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-2 rounded-xl px-4 py-2.5">
            <Settings size={16} />
            Cấu hình
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center gap-2 rounded-xl px-4 py-2.5">
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
