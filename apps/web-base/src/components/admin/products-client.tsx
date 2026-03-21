"use client";

import { useState } from "react";
import { Plus, Pencil, Power, RefreshCw } from "lucide-react";
import { CrudDialog, adminApiCall } from "@/components/admin/crud-dialog";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Product = {
  id: string; sku: string; name: string; baseUnit: string;
  baseSellPrice: number; currentStockBase: number;
  isActive: boolean; categoryId: string; barcodeEan13?: string;
  description?: string;
};

type Category = { id: string; name: string };
type BaseUnit = { id: string; name: string; abbreviation?: string };

export function ProductsClient({
  products, categories, units,
}: {
  products: Product[]; categories: Category[]; units: BaseUnit[];
}) {
  const [dialog, setDialog] = useState<{ mode: "create" | "edit"; data?: Product } | null>(null);
  const router = useRouter();

  const productFields = [
    { name: "sku", label: "SKU", required: true, placeholder: "VD: PB-001" },
    { name: "name", label: "Tên sản phẩm", required: true },
    { name: "categoryId", label: "Danh mục", type: "select" as const, required: true,
      options: categories.map(c => ({ value: c.id, label: c.name })) },
    { name: "baseUnit", label: "Đơn vị gốc", type: "select" as const, required: true,
      options: units.map(u => ({ value: u.name, label: u.abbreviation ? `${u.name} (${u.abbreviation})` : u.name })) },
    { name: "baseSellPrice", label: "Giá bán lẻ (đ)", type: "number" as const, required: true },
    { name: "imageUrls", label: "Thư viện ảnh sản phẩm", type: "image-gallery" as const, uploadPath: "/products/admin/upload" },
    { name: "barcodeEan13", label: "Barcode EAN-13", placeholder: "13 số hoặc để trống tự sinh" },
    { name: "description", label: "Mô tả", type: "textarea" as const },
  ];

  const handleCreate = async (data: Record<string, any>) => {
    await adminApiCall("/products", "POST", data);
    toast.success("Tạo sản phẩm thành công");
    router.refresh();
  };
  const handleEdit = async (data: Record<string, any>) => {
    await adminApiCall(`/products/${dialog?.data?.id}`, "PUT", data);
    toast.success("Cập nhật sản phẩm thành công");
    router.refresh();
  };
  const handleToggle = async (id: string) => {
    await adminApiCall(`/products/${id}/toggle-active`, "PATCH");
    toast.success("Đã thay đổi trạng thái sản phẩm");
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <button onClick={() => setDialog({ mode: "create" })}
          className="inline-flex items-center gap-1 px-3 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
          <Plus className="w-4 h-4" /> Tạo sản phẩm
        </button>
        <button onClick={() => router.refresh()}
          className="inline-flex items-center gap-1 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 transition-colors">
          <RefreshCw className="w-4 h-4" /> Làm mới
        </button>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 font-semibold">SKU</th>
              <th className="text-left px-4 py-3 font-semibold">Tên sản phẩm</th>
              <th className="text-left px-4 py-3 font-semibold">Đơn vị</th>
              <th className="text-right px-4 py-3 font-semibold">Giá bán</th>
              <th className="text-right px-4 py-3 font-semibold">Tồn kho</th>
              <th className="text-center px-4 py-3 font-semibold">Trạng thái</th>
              <th className="text-center px-4 py-3 font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{p.sku}</td>
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.baseUnit}</td>
                <td className="px-4 py-3 text-right">{p.baseSellPrice?.toLocaleString()}đ</td>
                <td className="px-4 py-3 text-right font-semibold">{p.currentStockBase}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    p.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                  }`}>
                    {p.isActive ? "Hoạt động" : "Ngưng"}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center gap-1">
                    <button onClick={() => setDialog({ mode: "edit", data: p })}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-emerald-600 transition-colors" title="Sửa">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleToggle(p.id)}
                      className={`p-1.5 rounded-lg hover:bg-gray-100 transition-colors ${p.isActive ? "text-gray-500 hover:text-red-600" : "text-gray-500 hover:text-emerald-600"}`}
                      title={p.isActive ? "Ngưng hoạt động" : "Kích hoạt"}>
                      <Power className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Chưa có sản phẩm</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {dialog && (
        <CrudDialog
          title="sản phẩm"
          fields={productFields}
          initialData={dialog.mode === "edit" ? dialog.data : {}}
          onSubmit={dialog.mode === "create" ? handleCreate : handleEdit}
          onClose={() => setDialog(null)}
          mode={dialog.mode}
        />
      )}
    </div>
  );
}

