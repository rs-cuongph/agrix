"use client";

import { useState } from "react";
import { Users, Plus, Pencil, Trash2 } from "lucide-react";
import { CrudDialog, adminApiCall } from "@/components/admin/crud-dialog";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Customer = {
  id: string; name: string; phone: string; address: string; outstandingDebt: number;
};

const customerFields = [
  { name: "name", label: "Tên khách hàng", required: true },
  { name: "phone", label: "Số điện thoại", placeholder: "09xx xxx xxx" },
  { name: "address", label: "Địa chỉ", type: "textarea" as const },
];

export function CustomersClient({ customers }: { customers: Customer[] }) {
  const [dialog, setDialog] = useState<{ mode: "create" | "edit"; data?: Customer } | null>(null);
  const router = useRouter();

  const handleCreate = async (data: Record<string, any>) => {
    await adminApiCall("/customers", "POST", data);
    toast.success("Tạo khách hàng thành công");
    router.refresh();
  };
  const handleEdit = async (data: Record<string, any>) => {
    await adminApiCall(`/customers/${dialog?.data?.id}`, "PUT", data);
    toast.success("Cập nhật khách hàng thành công");
    router.refresh();
  };
  const handleDelete = async (id: string) => {
    if (!confirm("Xóa khách hàng này? Dữ liệu công nợ sẽ bị mất.")) return;
    await adminApiCall(`/customers/${id}`, "DELETE");
    toast.success("Xóa khách hàng thành công");
    router.refresh();
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
          <Users className="w-6 h-6" /> Khách hàng
        </h1>
        <button onClick={() => setDialog({ mode: "create" })}
          className="inline-flex items-center gap-1 px-3 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
          <Plus className="w-4 h-4" /> Thêm khách hàng
        </button>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 font-semibold">Tên</th>
              <th className="text-left px-4 py-3 font-semibold">SĐT</th>
              <th className="text-left px-4 py-3 font-semibold">Địa chỉ</th>
              <th className="text-right px-4 py-3 font-semibold">Công nợ</th>
              <th className="text-center px-4 py-3 font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.phone || "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.address || "—"}</td>
                <td className="px-4 py-3 text-right">
                  <span className={c.outstandingDebt > 0 ? "text-red-600 font-semibold" : ""}>
                    {c.outstandingDebt?.toLocaleString()}đ
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center gap-1">
                    <button onClick={() => setDialog({ mode: "edit", data: c })} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-emerald-600 transition-colors" title="Sửa"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-red-600 transition-colors" title="Xóa"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Chưa có khách hàng</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {dialog && (
        <CrudDialog title="khách hàng" fields={customerFields}
          initialData={dialog.mode === "edit" ? dialog.data : {}}
          onSubmit={dialog.mode === "create" ? handleCreate : handleEdit}
          onClose={() => setDialog(null)} mode={dialog.mode} />
      )}
    </div>
  );
}
