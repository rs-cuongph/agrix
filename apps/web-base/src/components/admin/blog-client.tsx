"use client";

import { useState } from "react";
import { FileText, Plus, Pencil, Trash2 } from "lucide-react";
import { CrudDialog, adminApiCall } from "@/components/admin/crud-dialog";
import { useRouter } from "next/navigation";

type BlogPost = {
  id: string; title: string; slug: string; status: string;
  content?: string; createdAt: string;
};

const blogFields = [
  { name: "title", label: "Tiêu đề", required: true },
  { name: "slug", label: "Slug (URL)", required: true, placeholder: "vd: bai-viet-moi" },
  { name: "status", label: "Trạng thái", type: "select" as const, required: true,
    options: [{ value: "draft", label: "Nháp" }, { value: "published", label: "Xuất bản" }] },
  { name: "content", label: "Nội dung", type: "textarea" as const },
];

export function BlogClient({ posts }: { posts: BlogPost[] }) {
  const [dialog, setDialog] = useState<{ mode: "create" | "edit"; data?: BlogPost } | null>(null);
  const router = useRouter();

  const handleCreate = async (data: Record<string, any>) => {
    await adminApiCall("/blog/admin/posts", "POST", data);
    router.refresh();
  };
  const handleEdit = async (data: Record<string, any>) => {
    await adminApiCall(`/blog/admin/posts/${dialog?.data?.id}`, "PUT", data);
    router.refresh();
  };
  const handleDelete = async (id: string) => {
    if (!confirm("Xóa bài viết này?")) return;
    await adminApiCall(`/blog/admin/posts/${id}`, "DELETE");
    router.refresh();
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
          <FileText className="w-6 h-6" /> Blog
        </h1>
        <button onClick={() => setDialog({ mode: "create" })}
          className="inline-flex items-center gap-1 px-3 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
          <Plus className="w-4 h-4" /> Tạo bài viết
        </button>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 font-semibold">Tiêu đề</th>
              <th className="text-left px-4 py-3 font-semibold">Slug</th>
              <th className="text-center px-4 py-3 font-semibold">Trạng thái</th>
              <th className="text-left px-4 py-3 font-semibold">Ngày tạo</th>
              <th className="text-center px-4 py-3 font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium">{p.title}</td>
                <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{p.slug}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    p.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-yellow-100 text-yellow-700"
                  }`}>{p.status === "published" ? "Xuất bản" : "Nháp"}</span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(p.createdAt).toLocaleDateString("vi-VN")}</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center gap-1">
                    <button onClick={() => setDialog({ mode: "edit", data: p })} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-emerald-600 transition-colors" title="Sửa"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-red-600 transition-colors" title="Xóa"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Chưa có bài viết</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {dialog && (
        <CrudDialog title="bài viết" fields={blogFields}
          initialData={dialog.mode === "edit" ? dialog.data : { status: "draft" }}
          onSubmit={dialog.mode === "create" ? handleCreate : handleEdit}
          onClose={() => setDialog(null)} mode={dialog.mode} />
      )}
    </div>
  );
}
