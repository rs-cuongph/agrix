"use client";

import { useState } from "react";
import { FolderTree, Plus, Pencil, Trash2 } from "lucide-react";
import { CrudDialog, adminApiCall } from "@/components/admin/crud-dialog";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type BlogCategory = { id: string; name: string; slug: string; description?: string };

const categoryFields = [
  { name: "name", label: "Tên danh mục", required: true },
  { name: "slug", label: "Slug", placeholder: "Tự sinh nếu để trống" },
  { name: "description", label: "Mô tả", type: "textarea" as const },
];

export function BlogCategoriesClient({ categories }: { categories: BlogCategory[] }) {
  const [dialog, setDialog] = useState<{ mode: "create" | "edit"; data?: BlogCategory } | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const router = useRouter();

  const handleCreate = async (data: Record<string, any>) => {
    await adminApiCall("/blog/admin/categories", "POST", data);
    toast.success("Tạo danh mục thành công");
    router.refresh();
  };
  const handleEdit = async (data: Record<string, any>) => {
    await adminApiCall(`/blog/admin/categories/${dialog?.data?.id}`, "PUT", data);
    toast.success("Cập nhật danh mục thành công");
    router.refresh();
  };
  const confirmDelete = async () => {
    if (!deleteId) return;
    await adminApiCall(`/blog/admin/categories/${deleteId}`, "DELETE");
    toast.success("Xóa danh mục thành công");
    setDeleteId(null);
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold flex items-center gap-2"><FolderTree className="w-5 h-5" /> Danh mục Blog</h2>
        <button onClick={() => setDialog({ mode: "create" })}
          className="inline-flex items-center gap-1 px-3 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
          <Plus className="w-4 h-4" /> Thêm
        </button>
      </div>
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-muted/50 text-left"><th className="px-4 py-3 font-semibold">Tên</th><th className="px-4 py-3 font-semibold">Slug</th><th className="px-4 py-3 font-semibold">Mô tả</th><th className="px-4 py-3 w-24"></th></tr></thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-t hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.slug}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.description || "—"}</td>
                <td className="px-4 py-3 flex gap-1">
                  <button onClick={() => setDialog({ mode: "edit", data: c })} className="p-1.5 rounded hover:bg-gray-100"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => setDeleteId(c.id)} className="p-1.5 rounded hover:bg-red-50 text-red-500"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
            {!categories.length && <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Chưa có danh mục</td></tr>}
          </tbody>
        </table>
      </div>
      {dialog && (
        <CrudDialog
          title={dialog.mode === "create" ? "Thêm danh mục" : "Sửa danh mục"}
          mode={dialog.mode}
          fields={categoryFields}
          initialData={dialog.data || {}}
          onSubmit={dialog.mode === "create" ? handleCreate : handleEdit}
          onClose={() => setDialog(null)}
        />
      )}
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        description="Xóa danh mục này? Bài viết sẽ chuyển về 'Chưa phân loại'."
      />
    </div>
  );
}
