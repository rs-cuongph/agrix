"use client";

import { useState, useEffect, useCallback } from "react";
import { CrudDialog, adminApiCall } from "@/components/admin/crud-dialog";
import { AdminPageHero, AdminPanel, AdminStatsGrid } from "@/components/admin/admin-page-shell";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import { toast } from "sonner";

type TestimonialItem = {
  id: string;
  customerName: string;
  content: string;
  rating: number;
  avatarUrl?: string;
  isActive: boolean;
};
type Dialog = { mode: "create" | "edit"; data?: TestimonialItem } | null;

export default function TestimonialManagement() {
  const [items, setItems] = useState<TestimonialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApiCall("/admin/testimonials", "GET") as TestimonialItem[];
      setItems(data);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async (formData: Record<string, any>) => {
    const payload = {
      customerName: formData.customerName,
      content: formData.content,
      rating: parseInt(formData.rating) || 5,
      avatarUrl: formData.avatarUrl || null,
      isActive: formData.isActive !== false,
    };
    if (dialog?.mode === "create") {
      await adminApiCall("/admin/testimonials", "POST", payload);
      toast.success("Tạo đánh giá thành công");
    } else {
      await adminApiCall(`/admin/testimonials/${dialog?.data?.id}`, "PATCH", payload);
      toast.success("Cập nhật đánh giá thành công");
    }
    setDialog(null);
    fetchData();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await adminApiCall(`/admin/testimonials/${deleteId}`, "DELETE");
    toast.success("Đã xóa đánh giá");
    setDeleteId(null);
    fetchData();
  };

  return (
    <div className="space-y-6">
      <AdminPageHero
        badge="Testimonials"
        icon={Star}
        title="Quản lý đánh giá"
        description="Sắp xếp phản hồi khách hàng với cùng nhịp hero, card và bảng đang dùng ở các menu admin mới."
        actions={
          <Button size="sm" onClick={() => setDialog({ mode: "create" })}>
            <Plus className="w-4 h-4 mr-1" /> Thêm đánh giá
          </Button>
        }
      />

      <AdminStatsGrid
        items={[
          { label: "Tổng đánh giá", value: items.length.toLocaleString("vi-VN"), hint: "toàn bộ phản hồi", icon: Star },
          { label: "Đang hiển thị", value: items.filter((item) => item.isActive).length.toLocaleString("vi-VN"), hint: "xuất hiện ngoài website", icon: Plus, accentClassName: "border-emerald-100 bg-emerald-50 text-emerald-600" },
        ]}
      />

      {loading ? (
        <p className="text-muted-foreground text-sm">Đang tải...</p>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground text-sm">Chưa có đánh giá nào.</p>
      ) : (
        <AdminPanel title="Danh sách đánh giá" description="Quản trị trạng thái hiển thị và nội dung phản hồi khách hàng.">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50/90">
                <th className="text-left p-3">Khách hàng</th>
                <th className="text-left p-3 hidden md:table-cell">Nội dung</th>
                <th className="text-center p-3">Đánh giá</th>
                <th className="text-center p-3">Hiển thị</th>
                <th className="text-right p-3">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="p-3 font-medium">{t.customerName}</td>
                  <td className="p-3 hidden md:table-cell text-muted-foreground truncate max-w-[250px]">
                    {t.content}
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={12} className={i < t.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"} />
                      ))}
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${t.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {t.isActive ? "Hiện" : "Ẩn"}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => setDialog({ mode: "edit", data: t })}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteId(t.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminPanel>
      )}

      {/* Create/Edit Dialog */}
      {dialog && (
        <CrudDialog
          mode={dialog.mode}
          onClose={() => setDialog(null)}
          title="Đánh giá"
          initialData={dialog.data || {}}
          onSubmit={handleSave}
          fields={[
            { name: "customerName", label: "Tên khách hàng", required: true },
            { name: "content", label: "Nội dung đánh giá", type: "textarea", required: true },
            { name: "rating", label: "Điểm đánh giá (1-5)", type: "number" },
            { name: "avatarUrl", label: "URL ảnh đại diện" },
          ]}
        />
      )}

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>Bạn có chắc muốn xóa đánh giá này?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
