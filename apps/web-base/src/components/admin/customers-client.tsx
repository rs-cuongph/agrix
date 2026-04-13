"use client";

import { useState } from "react";
import { Users, Plus, Pencil, Trash2, Wallet, MapPin, Phone } from "lucide-react";
import { AdminActionButton, AdminIconButton } from "@/components/admin/admin-action-button";
import { AdminPageHero, AdminPanel, AdminStatsGrid } from "@/components/admin/admin-page-shell";
import { CrudDialog, adminApiCall } from "@/components/admin/crud-dialog";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
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
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const router = useRouter();
  const debtCustomers = customers.filter((customer) => customer.outstandingDebt > 0);
  const totalDebt = debtCustomers.reduce((sum, customer) => sum + customer.outstandingDebt, 0);
  const customersWithPhone = customers.filter((customer) => Boolean(customer.phone)).length;
  const customersWithAddress = customers.filter((customer) => Boolean(customer.address)).length;

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
  const confirmDelete = async () => {
    if (!deleteId) return;
    await adminApiCall(`/customers/${deleteId}`, "DELETE");
    toast.success("Xóa khách hàng thành công");
    setDeleteId(null);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <AdminPageHero
        badge="Customer Hub"
        icon={Users}
        title="Quản lý khách hàng"
        description="Chuẩn hoá dữ liệu khách mua, theo dõi công nợ và giữ nhịp hiển thị đồng nhất với các phân hệ admin mới."
        actions={
          <AdminActionButton onClick={() => setDialog({ mode: "create" })}>
            <Plus className="h-4 w-4" />
            Thêm khách hàng
          </AdminActionButton>
        }
      />

      <AdminStatsGrid
        items={[
          { label: "Tổng khách", value: customers.length.toLocaleString("vi-VN"), hint: "hồ sơ hiện có", icon: Users },
          { label: "Có công nợ", value: debtCustomers.length.toLocaleString("vi-VN"), hint: totalDebt > 0 ? `${totalDebt.toLocaleString("vi-VN")}đ cần theo dõi` : "không phát sinh nợ", icon: Wallet, accentClassName: "border-rose-100 bg-rose-50 text-rose-600" },
          { label: "Có số điện thoại", value: customersWithPhone.toLocaleString("vi-VN"), hint: "dữ liệu liên hệ sẵn sàng", icon: Phone, accentClassName: "border-sky-100 bg-sky-50 text-sky-600" },
          { label: "Có địa chỉ", value: customersWithAddress.toLocaleString("vi-VN"), hint: "phục vụ tư vấn khu vực", icon: MapPin, accentClassName: "border-amber-100 bg-amber-50 text-amber-600" },
        ]}
      />

      <AdminPanel
        title="Danh sách khách hàng"
        description="Chỉnh sửa nhanh thông tin liên hệ, địa chỉ và công nợ trực tiếp từ bảng."
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-slate-50/90">
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
                    <AdminIconButton onClick={() => setDialog({ mode: "edit", data: c })} title="Sửa">
                      <Pencil className="w-4 h-4" />
                    </AdminIconButton>
                    <AdminIconButton tone="danger" onClick={() => setDeleteId(c.id)} title="Xóa">
                      <Trash2 className="w-4 h-4" />
                    </AdminIconButton>
                  </div>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Chưa có khách hàng</td></tr>
            )}
          </tbody>
        </table>
      </AdminPanel>

      {dialog && (
        <CrudDialog title="khách hàng" fields={customerFields}
          initialData={dialog.mode === "edit" ? dialog.data : {}}
          onSubmit={dialog.mode === "create" ? handleCreate : handleEdit}
          onClose={() => setDialog(null)} mode={dialog.mode} />
      )}
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        description="Xóa khách hàng này? Dữ liệu công nợ sẽ bị mất."
      />
    </div>
  );
}
