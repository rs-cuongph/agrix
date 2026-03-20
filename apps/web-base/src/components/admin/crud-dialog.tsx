"use client";

import { useState } from "react";

type FieldConfig = {
  name: string;
  label: string;
  type?: "text" | "number" | "textarea" | "select";
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
};

type CrudDialogProps = {
  title: string;
  fields: FieldConfig[];
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => Promise<void>;
  onClose: () => void;
  mode: "create" | "edit";
};

export function CrudDialog({
  title,
  fields,
  initialData = {},
  onSubmit,
  onClose,
  mode,
}: CrudDialogProps) {
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-bold">
            {mode === "create" ? `Tạo ${title}` : `Sửa ${title}`}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
          )}
          {fields.map((field) => (
            <div key={field.name} className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{field.label}</label>
              {field.type === "textarea" ? (
                <textarea
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  value={formData[field.name] || ""}
                  onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                  required={field.required}
                  rows={3}
                  placeholder={field.placeholder}
                />
              ) : field.type === "select" ? (
                <select
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  value={formData[field.name] || ""}
                  onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                  required={field.required}
                >
                  <option value="">-- Chọn --</option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type || "text"}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  value={formData[field.name] ?? ""}
                  onChange={(e) => setFormData({
                    ...formData,
                    [field.name]: field.type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value,
                  })}
                  required={field.required}
                  placeholder={field.placeholder}
                />
              )}
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-emerald-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Đang xử lý..." : mode === "create" ? "Tạo mới" : "Cập nhật"}
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2.5 border rounded-lg text-sm hover:bg-gray-50 transition-colors">
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Helper to call the proxy API route
export async function adminApiCall(path: string, method: string, body?: unknown) {
  const res = await fetch("/api/admin/proxy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, method, body }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Error ${res.status}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : {};
}
