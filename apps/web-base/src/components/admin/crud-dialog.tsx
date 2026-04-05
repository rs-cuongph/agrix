"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageGalleryUpload } from "./image-gallery-upload";
import { RichTextEditor } from "./rich-text-editor";

type FieldConfig = {
  name: string;
  label: string;
  type?: "text" | "number" | "textarea" | "select" | "image-gallery" | "rich-text";
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  uploadPath?: string;
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
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-bold">
            {mode === "create" ? `Tạo ${title}` : `Sửa ${title}`}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          {error && (
            <div className="md:col-span-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
          )}
          {fields.map((field) => (
            <div
              key={field.name}
              className={`space-y-1 ${field.type === "textarea" || field.type === "rich-text" || field.type === "image-gallery"
                  ? "md:col-span-2"
                  : ""
                }`}
            >
              <label className="text-sm font-medium text-gray-700">{field.label}</label>
              {field.type === "textarea" ? (
                <Textarea
                  value={formData[field.name] || ""}
                  onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                  required={field.required}
                  rows={3}
                  placeholder={field.placeholder}
                />
              ) : field.type === "select" ? (
                <Select
                  value={formData[field.name] || ""}
                  onValueChange={(v) => setFormData({ ...formData, [field.name]: v })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="-- Chọn --" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectGroup>
                      {field.options?.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              ) : field.type === "image-gallery" ? (
                <ImageGalleryUpload
                  value={formData[field.name] || []}
                  onChange={(urls: string[]) => setFormData({ ...formData, [field.name]: urls })}
                  uploadPath={field.uploadPath || "/products/admin/upload"}
                />
              ) : field.type === "rich-text" ? (
                <RichTextEditor
                  value={formData[field.name] || ""}
                  onChange={(val) => setFormData({ ...formData, [field.name]: val })}
                  placeholder={field.placeholder}
                />
              ) : (
                <Input
                  type={field.type || "text"}
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
          <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-medium text-sm hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Đang xử lý..." : mode === "create" ? "Tạo mới" : "Cập nhật"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const ERROR_MESSAGES: Record<number, string> = {
  401: "Phiên đăng nhập hết hạn. Đang chuyển đến trang đăng nhập...",
  403: "Bạn không có quyền thực hiện thao tác này.",
  404: "Không tìm thấy dữ liệu yêu cầu.",
  500: "Lỗi hệ thống. Vui lòng thử lại sau.",
};

// Helper to call the proxy API route with error handling
export async function adminApiCall(path: string, method: string, body?: unknown) {
  const res = await fetch("/api/admin/proxy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, method, body }),
  });

  if (!res.ok) {
    const status = res.status;

    // 401: redirect to login
    if (status === 401) {
      toast.error(ERROR_MESSAGES[401]);
      await fetch("/api/auth/logout", { method: "POST" });
      setTimeout(() => {
        window.location.href = "/admin/login";
      }, 1000);
      throw new Error(ERROR_MESSAGES[401]);
    }

    // 403, 404, 500: show toast
    const msg = ERROR_MESSAGES[status] || `Lỗi ${status}`;
    let detail = "";
    try {
      const json = JSON.parse(await res.text());
      detail = json.message || "";
    } catch {
      // ignore parse errors
    }
    toast.error(msg, { description: detail || undefined });
    throw new Error(detail || msg);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

