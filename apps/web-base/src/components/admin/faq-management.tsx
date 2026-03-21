"use client";

import { useState, useEffect, useCallback } from "react";
import { CrudDialog, adminApiCall } from "@/components/admin/crud-dialog";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

type FaqItem = { id: string; question: string; answer: string; order: number; isActive: boolean };
type Dialog = { mode: "create" | "edit"; data?: FaqItem } | null;

export default function FaqManagement() {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApiCall("/admin/faq", "GET") as FaqItem[];
      setItems(data);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async (formData: Record<string, any>) => {
    const payload = {
      question: formData.question,
      answer: formData.answer,
      order: parseInt(formData.order) || 0,
      isActive: formData.isActive !== false,
    };
    if (dialog?.mode === "create") {
      await adminApiCall("/admin/faq", "POST", payload);
      toast.success("Tạo FAQ thành công");
    } else {
      await adminApiCall(`/admin/faq/${dialog?.data?.id}`, "PATCH", payload);
      toast.success("Cập nhật FAQ thành công");
    }
    setDialog(null);
    fetchData();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await adminApiCall(`/admin/faq/${deleteId}`, "DELETE");
    toast.success("Đã xóa FAQ");
    setDeleteId(null);
    fetchData();
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-gray-900">Quản lý FAQ</h1>
        <Button size="sm" onClick={() => setDialog({ mode: "create" })}>
          <Plus className="w-4 h-4 mr-1" /> Thêm FAQ
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Đang tải...</p>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground text-sm">Chưa có FAQ nào.</p>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3">Thứ tự</th>
                <th className="text-left p-3">Câu hỏi</th>
                <th className="text-center p-3">Hiển thị</th>
                <th className="text-right p-3">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {items.map((faq) => (
                <tr key={faq.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="p-3">{faq.order}</td>
                  <td className="p-3 font-medium">{faq.question}</td>
                  <td className="p-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${faq.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {faq.isActive ? "Hiện" : "Ẩn"}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => setDialog({ mode: "edit", data: faq })}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteId(faq.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Dialog */}
      {dialog && (
        <CrudDialog
          mode={dialog.mode}
          onClose={() => setDialog(null)}
          title="FAQ"
          initialData={dialog.data || {}}
          onSubmit={handleSave}
          fields={[
            { name: "question", label: "Câu hỏi", required: true },
            { name: "answer", label: "Câu trả lời", type: "textarea", required: true },
            { name: "order", label: "Thứ tự", type: "number" },
          ]}
        />
      )}

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>Bạn có chắc muốn xóa FAQ này?</AlertDialogDescription>
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
