'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Upload, Trash2, RefreshCw, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { AdminActionButton, AdminIconButton } from '@/components/admin/admin-action-button';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';

interface Document {
  id: string;
  filename: string;
  mimeType: string;
  fileSize: number;
  status: 'PROCESSING' | 'READY' | 'ERROR';
  statusMessage?: string;
  chunkCount: number;
  createdAt: string;
}

async function adminFetch(path: string, options?: { method?: string; body?: any }) {
  if (options?.method === 'DELETE' || (!options?.method && !options?.body)) {
    // GET or DELETE — use query param
    const method = options?.method || 'GET';
    if (method === 'GET') {
      const res = await fetch(`/api/admin/proxy?path=${encodeURIComponent(path)}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Lỗi' }));
        throw new Error(err.message || `Error ${res.status}`);
      }
      return res.json();
    }
    // DELETE
    const res = await fetch('/api/admin/proxy', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, method: 'DELETE' }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Lỗi' }));
      throw new Error(err.message || `Error ${res.status}`);
    }
    return res.json();
  }
  // POST/PUT with JSON body
  const res = await fetch('/api/admin/proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, method: options?.method || 'POST', body: options?.body }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Lỗi' }));
    throw new Error(err.message || `Error ${res.status}`);
  }
  return res.json();
}

export default function KnowledgeManager() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; filename: string } | null>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      const data = await adminFetch('/ai/admin/knowledge');
      setDocuments(data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/proxy?path=/ai/admin/knowledge', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Lỗi' }));
        throw new Error(err.message || `Error ${res.status}`);
      }

      toast.success(`Đã upload "${file.name}"`);
      fetchDocuments();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminFetch(`/ai/admin/knowledge/${deleteTarget.id}`, { method: 'DELETE' });
      toast.success('Đã xóa tài liệu');
      setDeleteTarget(null);
      fetchDocuments();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleSyncProducts = async () => {
    setSyncing(true);
    try {
      const result = await adminFetch('/ai/admin/sync-products', { method: 'POST' });
      toast.success(`${result.message} — ${result.productCount} sản phẩm, ${result.chunkCount} chunks`);
      fetchDocuments();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSyncing(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case 'READY':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'PROCESSING':
        return <RefreshCw size={16} className="text-blue-500 animate-spin" />;
      case 'ERROR':
        return <AlertCircle size={16} className="text-red-500" />;
      default:
        return null;
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case 'READY': return 'Sẵn sàng';
      case 'PROCESSING': return 'Đang xử lý';
      case 'ERROR': return 'Lỗi';
      default: return status;
    }
  };

  return (
    <div className="space-y-4">
      {/* Actions bar */}
      <div className="flex flex-wrap gap-3">
        <AdminActionButton asChild disabled={uploading}>
          <label className="cursor-pointer">
            <Upload size={16} />
            {uploading ? 'Đang upload...' : 'Upload tài liệu'}
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </AdminActionButton>

        <AdminActionButton
          onClick={handleSyncProducts}
          disabled={syncing}
          tone="secondary"
          className="border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100"
        >
          <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'Đang đồng bộ...' : 'Đồng bộ sản phẩm'}
        </AdminActionButton>
      </div>

      {/* Documents table */}
      {loading ? (
        <div className="text-center text-gray-400 py-8">Đang tải...</div>
      ) : documents.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          <FileText size={40} className="mx-auto mb-2 text-gray-300" />
          <p>Chưa có tài liệu nào. Upload tài liệu kỹ thuật để AI có dữ liệu tham khảo.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Tên file</th>
                <th className="text-left px-4 py-3 font-medium">Kích thước</th>
                <th className="text-left px-4 py-3 font-medium">Trạng thái</th>
                <th className="text-left px-4 py-3 font-medium">Chunks</th>
                <th className="text-left px-4 py-3 font-medium">Ngày upload</th>
                <th className="text-right px-4 py-3 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 flex items-center gap-2">
                    <FileText size={16} className="text-gray-400" />
                    <span className="truncate max-w-[200px]">{doc.filename}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatSize(doc.fileSize)}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1">
                      {statusIcon(doc.status)}
                      {statusLabel(doc.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{doc.chunkCount}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(doc.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <AdminIconButton
                      tone="danger"
                      onClick={() => setDeleteTarget({ id: doc.id, filename: doc.filename })}
                      title="Xóa"
                    >
                      <Trash2 size={16} />
                    </AdminIconButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        description={deleteTarget ? `Xóa tài liệu "${deleteTarget.filename}"?` : ''}
      />
    </div>
  );
}
