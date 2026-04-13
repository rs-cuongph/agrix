"use client";

import { useState, useEffect, useCallback } from "react";
import { adminApiCall } from "@/components/admin/crud-dialog";
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
import { Eye, Trash2, RefreshCw, MessageSquare, MailOpen, Clock3 } from "lucide-react";
import { toast } from "sonner";

type ContactSubmission = {
  id: string;
  customerName: string;
  phoneNumber: string;
  email?: string;
  message: string;
  status: "NEW" | "READ" | "REPLIED";
  createdAt: string;
};

export default function ContactManagement() {
  const [items, setItems] = useState<ContactSubmission[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<ContactSubmission | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApiCall("/admin/contact", "GET") as any;
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch {
      // error handled globally
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleMarkRead = async (id: string) => {
    await adminApiCall(`/admin/contact/${id}/status`, "PATCH", { status: "READ" });
    toast.success("Đã đánh dấu đã đọc");
    fetchData();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await adminApiCall(`/admin/contact/${deleteId}`, "DELETE");
    toast.success("Đã xóa liên hệ");
    setDeleteId(null);
    fetchData();
  };

  const statusBadge = (s: string) => {
    const colors: Record<string, string> = {
      NEW: "bg-blue-100 text-blue-700",
      READ: "bg-gray-100 text-gray-600",
      REPLIED: "bg-green-100 text-green-700",
    };
    const labels: Record<string, string> = { NEW: "Mới", READ: "Đã đọc", REPLIED: "Đã trả lời" };
    return (
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors[s] || ""}`}>
        {labels[s] || s}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <AdminPageHero
        badge="Contact Inbox"
        icon={MessageSquare}
        title="Quản lý liên hệ"
        description="Theo dõi inbox khách hàng bằng bố cục rõ nhịp, cùng hệ card và bảng với các menu đang được đồng bộ."
        actions={
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-1" /> Làm mới
          </Button>
        }
      />

      <AdminStatsGrid
        items={[
          { label: "Tổng liên hệ", value: total.toLocaleString("vi-VN"), hint: "mọi yêu cầu đã gửi", icon: MessageSquare },
          { label: "Mới", value: items.filter((item) => item.status === "NEW").length.toLocaleString("vi-VN"), hint: "cần đọc ngay", icon: Clock3, accentClassName: "border-sky-100 bg-sky-50 text-sky-600" },
          { label: "Đã đọc", value: items.filter((item) => item.status === "READ").length.toLocaleString("vi-VN"), hint: "đã được tiếp nhận", icon: MailOpen, accentClassName: "border-amber-100 bg-amber-50 text-amber-600" },
        ]}
      />

      {loading ? (
        <p className="text-muted-foreground text-sm">Đang tải...</p>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground text-sm">Chưa có liên hệ nào.</p>
      ) : (
        <AdminPanel title="Danh sách liên hệ" description="Xem nhanh trạng thái, nội dung rút gọn và mở chi tiết từng yêu cầu.">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50/90">
                <th className="text-left p-3">Họ tên</th>
                <th className="text-left p-3">SĐT</th>
                <th className="text-left p-3 hidden md:table-cell">Tin nhắn</th>
                <th className="text-center p-3">Trạng thái</th>
                <th className="text-left p-3 hidden sm:table-cell">Ngày</th>
                <th className="text-right p-3">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="p-3 font-medium">{c.customerName}</td>
                  <td className="p-3">{c.phoneNumber}</td>
                  <td className="p-3 hidden md:table-cell text-muted-foreground truncate max-w-[200px]">
                    {c.message}
                  </td>
                  <td className="p-3 text-center">{statusBadge(c.status)}</td>
                  <td className="p-3 hidden sm:table-cell text-muted-foreground">
                    {new Date(c.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="p-3 text-right space-x-1">
                    {c.status === "NEW" && (
                      <Button variant="ghost" size="sm" onClick={() => handleMarkRead(c.id)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => setSelectedItem(c)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteId(c.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminPanel>
      )}

      {/* Detail Dialog */}
      <AlertDialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Chi tiết liên hệ</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm">
                <p><strong>Họ tên:</strong> {selectedItem?.customerName}</p>
                <p><strong>SĐT:</strong> {selectedItem?.phoneNumber}</p>
                {selectedItem?.email && <p><strong>Email:</strong> {selectedItem.email}</p>}
                <p><strong>Tin nhắn:</strong></p>
                <p className="whitespace-pre-wrap bg-muted p-3 rounded-lg">{selectedItem?.message}</p>
                <p><strong>Ngày:</strong> {selectedItem && new Date(selectedItem.createdAt).toLocaleString("vi-VN")}</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Đóng</AlertDialogCancel>
            {selectedItem?.status === "NEW" && (
              <AlertDialogAction onClick={() => { handleMarkRead(selectedItem.id); setSelectedItem(null); }}>
                Đánh dấu đã đọc
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>Bạn có chắc muốn xóa liên hệ này?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
