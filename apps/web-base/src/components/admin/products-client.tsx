"use client";

import { useState } from "react";
import { Plus, Pencil, Power, RefreshCw, Package, ScanBarcode, CircleDollarSign } from "lucide-react";
import { AdminActionButton, AdminIconButton } from "@/components/admin/admin-action-button";
import { AdminPanel, AdminStatsGrid } from "@/components/admin/admin-page-shell";
import { CrudDialog, adminApiCall } from "@/components/admin/crud-dialog";
import { ExportBarcodeButton } from "./export-barcode-button";
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
  const activeProducts = products.filter((product) => product.isActive);
  const barcodeProducts = products.filter((product) => Boolean(product.barcodeEan13));
  const stockValue = products.reduce(
    (sum, product) => sum + product.currentStockBase * product.baseSellPrice,
    0,
  );

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
    { name: "description", label: "Mô tả", type: "rich-text" as const },
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
    <div className="space-y-6">
      <AdminStatsGrid
        items={[
          { label: "Tổng sản phẩm", value: products.length.toLocaleString("vi-VN"), hint: `${categories.length} danh mục, ${units.length} đơn vị`, icon: Package },
          { label: "Đang hoạt động", value: activeProducts.length.toLocaleString("vi-VN"), hint: "sẵn sàng bán ra", icon: Power, accentClassName: "border-emerald-100 bg-emerald-50 text-emerald-600" },
          { label: "Có mã vạch", value: barcodeProducts.length.toLocaleString("vi-VN"), hint: "sẵn cho quét POS", icon: ScanBarcode, accentClassName: "border-sky-100 bg-sky-50 text-sky-600" },
          { label: "Giá trị tồn", value: `${stockValue.toLocaleString("vi-VN")}đ`, hint: "ước tính theo giá bán lẻ", icon: CircleDollarSign, accentClassName: "border-amber-100 bg-amber-50 text-amber-600" },
        ]}
      />

      <div className="flex justify-end gap-2">
        <AdminActionButton onClick={() => setDialog({ mode: "create" })}>
          <Plus className="w-4 h-4" /> Tạo sản phẩm
        </AdminActionButton>
        <ExportBarcodeButton />
        <AdminActionButton tone="secondary" onClick={() => router.refresh()}>
          <RefreshCw className="w-4 h-4" /> Làm mới
        </AdminActionButton>
      </div>

      <AdminPanel
        title="Danh sách sản phẩm"
        description="Giữ cấu trúc thao tác, bảng dữ liệu và nhịp khoảng trắng nhất quán với các màn quản trị mới."
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-slate-50/90">
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
                    <AdminIconButton onClick={() => setDialog({ mode: "edit", data: p })} title="Sửa">
                      <Pencil className="w-4 h-4" />
                    </AdminIconButton>
                    <AdminIconButton
                      tone={p.isActive ? "danger" : "default"}
                      onClick={() => handleToggle(p.id)}
                      title={p.isActive ? "Ngưng hoạt động" : "Kích hoạt"}
                    >
                      <Power className="w-4 h-4" />
                    </AdminIconButton>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Chưa có sản phẩm</td></tr>
            )}
          </tbody>
        </table>
      </AdminPanel>

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
