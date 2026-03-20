'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MessageCircle, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

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

async function adminApiCall(path: string) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
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
      const data = await adminApiCall(`/ai/admin/sessions?page=${page}&limit=${limit}`);
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
      const data = await adminApiCall(`/ai/admin/sessions/${id}`);
      setMessages(data.messages || []);
      setSelectedSession(id);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const totalPages = Math.ceil(total / limit);

  if (selectedSession) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setSelectedSession(null)}
          className="text-sm text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
        >
          <ChevronLeft size={16} /> Quay lại danh sách
        </button>

        <div className="space-y-3 max-w-2xl">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg text-sm ${
                msg.role === 'user' ? 'bg-emerald-50 ml-8' : 'bg-gray-50 mr-8'
              }`}
            >
              <div className="flex justify-between mb-1">
                <span className="text-xs font-medium text-gray-500">
                  {msg.role === 'user' ? 'Khách hàng' : 'Trợ lý AI'}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(msg.createdAt).toLocaleString('vi-VN')}
                </span>
              </div>
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          ))}
          {messages.length === 0 && (
            <p className="text-center text-gray-400">Phiên chat trống.</p>
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
