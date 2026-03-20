"use client";

import { useState } from "react";
import { Tag, Plus, Pencil, Trash2 } from "lucide-react";
import { CrudDialog, adminApiCall } from "@/components/admin/crud-dialog";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type BlogTag = { id: string; name: string; slug: string };

const tagFields = [
  { name: "name", label: "Tên tag", required: true },
  { name: "slug", label: "Slug", placeholder: "Tự sinh nếu để trống" },
];

export function BlogTagsClient({ tags }: { tags: BlogTag[] }) {
  const [dialog, setDialog] = useState<{ mode: "create" | "edit"; data?: BlogTag } | null>(null);
  const router = useRouter();

  const handleCreate = async (data: Record<string, any>) => {
    await adminApiCall("/blog/admin/tags", "POST", data);
    toast.success("Tạo tag thành công");
    router.refresh();
  };
  const handleEdit = async (data: Record<string, any>) => {
    await adminApiCall(`/blog/admin/tags/${dialog?.data?.id}`, "PUT", data);
    toast.success("Cập nhật tag thành công");
    router.refresh();
  };
  const handleDelete = async (id: string) => {
    if (!confirm("Xóa tag này?")) return;
    await adminApiCall(`/blog/admin/tags/${id}`, "DELETE");
    toast.success("Xóa tag thành công");
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold flex items-center gap-2"><Tag className="w-5 h-5" /> Tags</h2>
        <button onClick={() => setDialog({ mode: "create" })}
          className="inline-flex items-center gap-1 px-3 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
          <Plus className="w-4 h-4" /> Thêm
        </button>
      </div>
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-muted/50 text-left"><th className="px-4 py-3 font-semibold">Tên</th><th className="px-4 py-3 font-semibold">Slug</th><th className="px-4 py-3 w-24"></th></tr></thead>
          <tbody>
            {tags.map((t) => (
              <tr key={t.id} className="border-t hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{t.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{t.slug}</td>
                <td className="px-4 py-3 flex gap-1">
                  <button onClick={() => setDialog({ mode: "edit", data: t })} className="p-1.5 rounded hover:bg-gray-100"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded hover:bg-red-50 text-red-500"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
            {!tags.length && <tr><td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">Chưa có tag</td></tr>}
          </tbody>
        </table>
      </div>
      {dialog && (
        <CrudDialog
          title={dialog.mode === "create" ? "Thêm tag" : "Sửa tag"}
          mode={dialog.mode}
          fields={tagFields}
          initialData={dialog.data || {}}
          onSubmit={dialog.mode === "create" ? handleCreate : handleEdit}
          onClose={() => setDialog(null)}
        />
      )}
    </div>
  );
}
