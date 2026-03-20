"use client";

import { useState } from "react";
import { Ruler, Plus, Pencil, Trash2 } from "lucide-react";
import { CrudDialog, adminApiCall } from "@/components/admin/crud-dialog";
import { useRouter } from "next/navigation";

type UnitConversion = {
  id: string; productId: string; unitName: string;
  conversionFactor: number; sellPrice: number | null;
  product: { id: string; name: string; baseUnit: string; baseSellPrice: number };
};

type Product = { id: string; name: string; baseUnit: string; baseSellPrice: number };

export function UnitsClient({ units, products }: { units: UnitConversion[]; products: Product[] }) {
  const [dialog, setDialog] = useState<{ mode: "create" | "edit"; data?: UnitConversion } | null>(null);
  const router = useRouter();

  const unitFields = [
    { name: "productId", label: "Sản phẩm", type: "select" as const, required: true,
      options: products.map(p => ({ value: p.id, label: p.name })) },
    { name: "unitName", label: "Tên đơn vị", required: true, placeholder: "VD: Thùng, Bao, Lốc" },
    { name: "conversionFactor", label: "Hệ số quy đổi", type: "number" as const, required: true, placeholder: "VD: 40" },
    { name: "sellPrice", label: "Giá bán tuỳ chỉnh (đ)", type: "number" as const, placeholder: "Để trống = tự tính" },
  ];

  const handleCreate = async (data: Record<string, any>) => {
    await adminApiCall("/unit-conversions", "POST", data);
    router.refresh();
  };
  const handleEdit = async (data: Record<string, any>) => {
    await adminApiCall(`/unit-conversions/${dialog?.data?.id}`, "PUT", data);
    router.refresh();
  };
  const handleDelete = async (id: string) => {
    if (!confirm("Xóa đơn vị quy đổi này?")) return;
    await adminApiCall(`/unit-conversions/${id}`, "DELETE");
    router.refresh();
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
          <Ruler className="w-6 h-6" /> Quản lý Đơn vị Quy đổi
        </h1>
        <button onClick={() => setDialog({ mode: "create" })}
          className="inline-flex items-center gap-1 px-3 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
          <Plus className="w-4 h-4" /> Tạo quy đổi
        </button>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 font-semibold">Sản phẩm</th>
              <th className="text-left px-4 py-3 font-semibold">Đơn vị gốc</th>
              <th className="text-left px-4 py-3 font-semibold">Đơn vị quy đổi</th>
              <th className="text-right px-4 py-3 font-semibold">Hệ số</th>
              <th className="text-right px-4 py-3 font-semibold">Giá bán</th>
              <th className="text-center px-4 py-3 font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {units.map((u) => {
              const derivedPrice = u.product.baseSellPrice * u.conversionFactor;
              const displayPrice = u.sellPrice ?? derivedPrice;
              const isCustom = u.sellPrice !== null;
              return (
                <tr key={u.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{u.product.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.product.baseUnit}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">{u.unitName}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono">1 {u.unitName} = {u.conversionFactor} {u.product.baseUnit}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-semibold">{displayPrice.toLocaleString()}đ</span>
                    {isCustom ? <span className="ml-1 text-xs text-orange-500">✎</span> : <span className="ml-1 text-xs text-muted-foreground">(auto)</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-1">
                      <button onClick={() => setDialog({ mode: "edit", data: u })} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-emerald-600 transition-colors" title="Sửa"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(u.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-red-600 transition-colors" title="Xóa"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {units.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Chưa có đơn vị quy đổi.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {dialog && (
        <CrudDialog title="đơn vị quy đổi" fields={unitFields}
          initialData={dialog.mode === "edit" ? dialog.data : {}}
          onSubmit={dialog.mode === "create" ? handleCreate : handleEdit}
          onClose={() => setDialog(null)} mode={dialog.mode} />
      )}
    </div>
  );
}
