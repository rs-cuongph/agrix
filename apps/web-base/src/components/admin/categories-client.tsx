"use client";

import { useState } from "react";
import { FolderTree, Plus, Pencil, Trash2 } from "lucide-react";
import { CrudDialog, adminApiCall } from "@/components/admin/crud-dialog";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Category = {
  id: string;
  name: string;
  description?: string;
};

const categoryFields = [
  { name: "name", label: "Tên danh mục", required: true },
  { name: "description", label: "Mô tả", type: "textarea" as const },
];

export function CategoriesClient({ categories }: { categories: Category[] }) {
  const [dialog, setDialog] = useState<{ mode: "create" | "edit"; data?: Category } | null>(null);
  const router = useRouter();

  const handleCreate = async (data: Record<string, any>) => {
    await adminApiCall("/categories", "POST", data);
    toast.success("Tạo danh mục thành công");
    router.refresh();
  };

  const handleEdit = async (data: Record<string, any>) => {
    await adminApiCall(`/categories/${dialog?.data?.id}`, "PUT", data);
    toast.success("Cập nhật danh mục thành công");
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa danh mục này? Hãy đảm bảo không có sản phẩm nào đang sử dụng danh mục này.")) return;
    await adminApiCall(`/categories/${id}`, "DELETE");
    toast.success("Xóa danh mục thành công");
    router.refresh();
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
          <FolderTree className="w-6 h-6" /> Danh mục sản phẩm
        </h1>
        <button onClick={() => setDialog({ mode: "create" })}
          className="inline-flex items-center gap-1 px-3 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
          <Plus className="w-4 h-4" /> Thêm danh mục
        </button>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 font-semibold">Tên danh mục</th>
              <th className="text-left px-4 py-3 font-semibold">Mô tả</th>
              <th className="text-center px-4 py-3 font-semibold w-24">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.description || "—"}</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center gap-1">
                    <button onClick={() => setDialog({ mode: "edit", data: c })} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-emerald-600 transition-colors" title="Sửa"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-red-600 transition-colors" title="Xóa"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">Chưa có danh mục</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {dialog && (
        <CrudDialog title="danh mục" fields={categoryFields}
          initialData={dialog.mode === "edit" ? dialog.data : {}}
          onSubmit={dialog.mode === "create" ? handleCreate : handleEdit}
          onClose={() => setDialog(null)} mode={dialog.mode} />
      )}
    </div>
  );
}
