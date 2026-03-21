'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MessageCircle, Eye, ChevronLeft, ChevronRight, User, Bot } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

interface Session {
  id: string;
  messageCount: number;
  productContext?: string;
  createdAt: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: any[];
  createdAt: string;
}

async function adminFetch(path: string) {
  const res = await fetch(`/api/admin/proxy?path=${encodeURIComponent(path)}`);
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json();
}

export default function SessionHistory() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const limit = 20;

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminFetch(`/ai/admin/sessions?page=${page}&limit=${limit}`);
      setSessions(data.data);
      setTotal(data.total);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const viewSession = async (id: string) => {
    try {
      const data = await adminFetch(`/ai/admin/sessions/${id}`);
      setMessages(data.messages || []);
      setSelectedSession(id);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const totalPages = Math.ceil(total / limit);

  if (selectedSession) {
    return (
      <div className="flex flex-col h-[calc(100vh-240px)] max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b mb-4">
          <button
            onClick={() => setSelectedSession(null)}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors"
          >
            <ChevronLeft size={16} /> Quay lại
          </button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MessageCircle size={14} />
            <span>{messages.length} tin nhắn</span>
          </div>
        </div>

        {/* Messages container */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((msg, i) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={i}
                className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    isUser
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {isUser ? (
                    <User size={14} />
                  ) : (
                    <Bot size={14} />
                  )}
                </div>

                {/* Bubble */}
                <div className={`max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isUser
                        ? 'bg-emerald-500 text-white rounded-br-md'
                        : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md shadow-sm'
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    ) : (
                      <div className="break-words [&_p]:mb-1.5 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:mb-1.5 [&_ul]:space-y-0.5 [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:mb-1.5 [&_ol]:space-y-0.5 [&_code]:bg-gray-100 [&_code]:text-gray-800 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono [&_blockquote]:border-l-2 [&_blockquote]:border-gray-300 [&_blockquote]:pl-2 [&_blockquote]:my-1.5 [&_blockquote]:text-gray-500 [&_blockquote]:italic [&_a]:text-emerald-600 [&_a]:underline">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                  <span
                    className={`block text-[10px] text-gray-400 mt-1 ${
                      isUser ? 'text-right' : 'text-left'
                    }`}
                  >
                    {new Date(msg.createdAt).toLocaleString('vi-VN')}
                  </span>
                </div>
              </div>
            );
          })}
          {messages.length === 0 && (
            <div className="text-center text-gray-400 py-12">
              <MessageCircle size={32} className="mx-auto mb-2 text-gray-300" />
              <p>Phiên chat trống.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="text-center text-gray-400 py-8">Đang tải...</div>
      ) : sessions.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          <MessageCircle size={40} className="mx-auto mb-2 text-gray-300" />
          <p>Chưa có cuộc hội thoại nào.</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Phiên</th>
                  <th className="text-left px-4 py-3 font-medium">Tin nhắn</th>
                  <th className="text-left px-4 py-3 font-medium">Sản phẩm</th>
                  <th className="text-left px-4 py-3 font-medium">Ngày</th>
                  <th className="text-right px-4 py-3 font-medium">Xem</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sessions.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">
                      {s.id.slice(0, 8)}...
                    </td>
                    <td className="px-4 py-3">{s.messageCount}</td>
                    <td className="px-4 py-3 text-gray-500 truncate max-w-[200px]">
                      {s.productContext || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(s.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => viewSession(s.id)}
                        className="text-emerald-500 hover:text-emerald-700 p-1"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-1 disabled:opacity-30"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm text-gray-600">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="p-1 disabled:opacity-30"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
