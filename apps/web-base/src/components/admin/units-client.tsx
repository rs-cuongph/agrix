"use client";

import { useState } from "react";
import { Ruler, Plus, Pencil, Trash2, ArrowRightLeft } from "lucide-react";
import { CrudDialog, adminApiCall } from "@/components/admin/crud-dialog";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type BaseUnit = {
  id: string; name: string; abbreviation?: string; description?: string;
};

type UnitConversion = {
  id: string; productId: string; unitName: string;
  conversionFactor: number; sellPrice: number | null;
  product: { id: string; name: string; baseUnit: string; baseSellPrice: number };
};

type Product = { id: string; name: string; baseUnit: string; baseSellPrice: number };

const TABS = [
  { id: "base", label: "Đơn vị gốc", icon: Ruler },
  { id: "conversion", label: "Quy đổi đơn vị", icon: ArrowRightLeft },
] as const;

export function UnitsClient({
  baseUnits, conversions, products,
}: {
  baseUnits: BaseUnit[]; conversions: UnitConversion[]; products: Product[];
}) {
  const [tab, setTab] = useState<string>("base");
  const [baseDialog, setBaseDialog] = useState<{ mode: "create" | "edit"; data?: BaseUnit } | null>(null);
  const [convDialog, setConvDialog] = useState<{ mode: "create" | "edit"; data?: UnitConversion } | null>(null);
  const router = useRouter();

  const baseFields = [
    { name: "name", label: "Tên đơn vị", required: true, placeholder: "VD: Kilogram, Chai, Gói" },
    { name: "abbreviation", label: "Viết tắt", placeholder: "VD: Kg, Chai, Gói" },
    { name: "description", label: "Mô tả" },
  ];

  const convFields = [
    { name: "productId", label: "Sản phẩm", type: "select" as const, required: true,
      options: products.map(p => ({ value: p.id, label: p.name })) },
    { name: "unitName", label: "Tên đơn vị", required: true, placeholder: "VD: Thùng, Bao, Lốc" },
    { name: "conversionFactor", label: "Hệ số quy đổi", type: "number" as const, required: true, placeholder: "VD: 40" },
    { name: "sellPrice", label: "Giá bán tuỳ chỉnh (đ)", type: "number" as const, placeholder: "Để trống = tự tính" },
  ];

  // Base unit handlers
  const handleCreateBase = async (data: Record<string, any>) => {
    await adminApiCall("/units", "POST", data);
    toast.success("Tạo đơn vị thành công");
    router.refresh();
  };
  const handleEditBase = async (data: Record<string, any>) => {
    await adminApiCall(`/units/${baseDialog?.data?.id}`, "PUT", data);
    toast.success("Cập nhật đơn vị thành công");
    router.refresh();
  };
  const handleDeleteBase = async (id: string) => {
    if (!confirm("Xóa đơn vị gốc này?")) return;
    await adminApiCall(`/units/${id}`, "DELETE");
    toast.success("Xóa đơn vị thành công");
    router.refresh();
  };

  // Conversion handlers
  const handleCreateConv = async (data: Record<string, any>) => {
    await adminApiCall("/unit-conversions", "POST", data);
    toast.success("Tạo quy đổi thành công");
    router.refresh();
  };
  const handleEditConv = async (data: Record<string, any>) => {
    await adminApiCall(`/unit-conversions/${convDialog?.data?.id}`, "PUT", data);
    toast.success("Cập nhật quy đổi thành công");
    router.refresh();
  };
  const handleDeleteConv = async (id: string) => {
    if (!confirm("Xóa quy đổi đơn vị này?")) return;
    await adminApiCall(`/unit-conversions/${id}`, "DELETE");
    toast.success("Xóa quy đổi thành công");
    router.refresh();
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
        <Ruler className="w-6 h-6" /> Quản lý Đơn vị
      </h1>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              tab === t.id ? "border-emerald-600 text-emerald-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* TAB: Đơn vị gốc */}
      {tab === "base" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setBaseDialog({ mode: "create" })}
              className="inline-flex items-center gap-1 px-3 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
              <Plus className="w-4 h-4" /> Tạo đơn vị gốc
            </button>
          </div>
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 font-semibold">Tên đơn vị</th>
                  <th className="text-left px-4 py-3 font-semibold">Viết tắt</th>
                  <th className="text-left px-4 py-3 font-semibold">Mô tả</th>
                  <th className="text-center px-4 py-3 font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {baseUnits.map((u) => (
                  <tr key={u.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{u.name}</td>
                    <td className="px-4 py-3">
                      {u.abbreviation ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">{u.abbreviation}</span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{u.description || "—"}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => setBaseDialog({ mode: "edit", data: u })} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-emerald-600 transition-colors" title="Sửa"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteBase(u.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-red-600 transition-colors" title="Xóa"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {baseUnits.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Chưa có đơn vị gốc nào.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: Quy đổi đơn vị */}
      {tab === "conversion" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setConvDialog({ mode: "create" })}
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
                {conversions.map((u) => {
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
                          <button onClick={() => setConvDialog({ mode: "edit", data: u })} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-emerald-600 transition-colors" title="Sửa"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteConv(u.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-red-600 transition-colors" title="Xóa"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {conversions.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Chưa có đơn vị quy đổi.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {baseDialog && (
        <CrudDialog title="đơn vị gốc" fields={baseFields}
          initialData={baseDialog.mode === "edit" ? baseDialog.data : {}}
          onSubmit={baseDialog.mode === "create" ? handleCreateBase : handleEditBase}
          onClose={() => setBaseDialog(null)} mode={baseDialog.mode} />
      )}
      {convDialog && (
        <CrudDialog title="đơn vị quy đổi" fields={convFields}
          initialData={convDialog.mode === "edit" ? convDialog.data : {}}
          onSubmit={convDialog.mode === "create" ? handleCreateConv : handleEditConv}
          onClose={() => setConvDialog(null)} mode={convDialog.mode} />
      )}
    </div>
  );
}
