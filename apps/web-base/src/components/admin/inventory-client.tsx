"use client";

import { useState } from "react";
import {
  Warehouse, ArrowDownToLine, Wrench, History, ClipboardList,
  AlertTriangle, Clock, Package, Plus, Boxes, ShieldAlert,
} from "lucide-react";
import { AdminActionButton } from "@/components/admin/admin-action-button";
import { AdminPageHero, AdminPanel, AdminStatsGrid } from "@/components/admin/admin-page-shell";
import { CrudDialog, adminApiCall } from "@/components/admin/crud-dialog";
import { ProductsClient } from "@/components/admin/products-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type StockEntry = {
  id: string; productId: string; quantityBase: number;
  type: string; costPricePerUnit?: number; batchNumber?: string;
  remainingQuantity?: number; note?: string; createdAt: string;
  product?: { name: string; baseUnit: string; sku: string };
  creator?: { fullName: string };
};

type Product = {
  id: string; name: string; sku: string; baseUnit: string;
  currentStockBase: number; minStockThreshold: number;
  baseSellPrice: number; isActive: boolean; categoryId: string;
  barcodeEan13?: string; description?: string;
  expirationDate?: string;
};

type AlertData = {
  lowStock: Product[];
  expiring: Product[];
  summary: { lowStockCount: number; expiringCount: number };
};

type Category = { id: string; name: string };
type BaseUnit = { id: string; name: string; abbreviation?: string };

const TABS = [
  { id: "overview", label: "Tổng quan", icon: Warehouse },
  { id: "products", label: "Sản phẩm", icon: Package },
  { id: "import", label: "Nhập kho", icon: ArrowDownToLine },
  { id: "adjust", label: "Điều chỉnh kho", icon: Wrench },
  { id: "history", label: "Lịch sử", icon: History },
] as const;

const TYPE_LABELS: Record<string, string> = {
  IMPORT: "Nhập kho", SALE: "Bán hàng", DAMAGE: "Hao hụt/Hư hỏng",
  RETURN: "Trả NCC", ADJUSTMENT: "Điều chỉnh", SYNC: "Đồng bộ",
};
const TYPE_COLORS: Record<string, string> = {
  IMPORT: "bg-emerald-100 text-emerald-700", SALE: "bg-blue-100 text-blue-700",
  DAMAGE: "bg-red-100 text-red-700", RETURN: "bg-orange-100 text-orange-700",
  ADJUSTMENT: "bg-yellow-100 text-yellow-700", SYNC: "bg-gray-100 text-gray-700",
};

function formatNum(n: number) {
  return n.toLocaleString("vi-VN");
}
function formatDate(s: string) {
  return new Date(s).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function InventoryClient({
  alerts, products, history, categories, units,
}: {
  alerts: AlertData; products: Product[]; history: { data: StockEntry[]; meta: any };
  categories: Category[]; units: BaseUnit[];
}) {
  const [importDialog, setImportDialog] = useState(false);
  const [adjustDialog, setAdjustDialog] = useState(false);
  const router = useRouter();

  const productOpts = products.map(p => ({ value: p.id, label: `${p.name} (${p.sku})` }));

  const unitOpts = units.map(u => ({ value: u.name, label: u.abbreviation ? `${u.name} (${u.abbreviation})` : u.name }));

  const importFields = [
    { name: "productId", label: "Sản phẩm", type: "select" as const, required: true, options: productOpts },
    { name: "quantity", label: "Số lượng", type: "number" as const, required: true },
    { name: "unitName", label: "Đơn vị", type: "select" as const, required: true, options: unitOpts },
    { name: "costPricePerUnit", label: "Giá nhập/đơn vị (đ)", type: "number" as const },
    { name: "note", label: "Ghi chú" },
  ];

  const adjustFields = [
    { name: "productId", label: "Sản phẩm", type: "select" as const, required: true, options: productOpts },
    { name: "quantity", label: "Số lượng", type: "number" as const, required: true },
    { name: "unitName", label: "Đơn vị", type: "select" as const, required: true, options: unitOpts },
    { name: "type", label: "Loại", type: "select" as const, required: true, options: [
      { value: "DAMAGE", label: "Hao hụt / Hư hỏng" },
      { value: "RETURN", label: "Trả hàng NCC" },
      { value: "ADJUSTMENT", label: "Điều chỉnh kiểm kê" },
    ] },
    { name: "note", label: "Lý do", required: true },
  ];

  const handleImport = async (data: Record<string, any>) => {
    await adminApiCall("/stock/import", "POST", data);
    toast.success("Nhập kho thành công");
    router.refresh();
  };

  const handleAdjust = async (data: Record<string, any>) => {
    await adminApiCall("/stock/adjust", "POST", data);
    toast.success("Điều chỉnh kho thành công");
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <AdminPageHero
        badge="Inventory Control"
        icon={Warehouse}
        title="Quản lý kho hàng"
        description="Đồng bộ phần tồn kho với ngôn ngữ hiển thị của mùa vụ: rõ lớp thông tin, nhấn vào số liệu và giữ thao tác chính luôn nổi bật."
      />

      <AdminStatsGrid
        items={[
          { label: "Sản phẩm trong kho", value: products.length.toLocaleString("vi-VN"), hint: "toàn bộ SKU đang theo dõi", icon: Boxes },
          { label: "Sắp hết hàng", value: alerts.summary.lowStockCount.toLocaleString("vi-VN"), hint: "cần bổ sung sớm", icon: ShieldAlert, accentClassName: "border-rose-100 bg-rose-50 text-rose-600" },
          { label: "Sắp hết hạn", value: alerts.summary.expiringCount.toLocaleString("vi-VN"), hint: "ưu tiên xử lý trong kho", icon: Clock, accentClassName: "border-amber-100 bg-amber-50 text-amber-600" },
          { label: "Bút toán lịch sử", value: history.data.length.toLocaleString("vi-VN"), hint: "ghi nhận nhập và điều chỉnh", icon: ClipboardList, accentClassName: "border-sky-100 bg-sky-50 text-sky-600" },
        ]}
      />

      <Tabs defaultValue="overview" className="space-y-5">
        <TabsList className="w-full justify-start rounded-2xl border border-slate-200/80 bg-white/85 p-1.5 shadow-sm">
          {TABS.map((t) => (
            <TabsTrigger key={t.id} value={t.id} className="flex items-center gap-1.5 rounded-xl px-4 py-2.5">
              <t.icon className="w-4 h-4" /> {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* TAB: Sản phẩm */}
        <TabsContent value="products">
          <ProductsClient products={products} categories={categories} units={units} />
        </TabsContent>

        {/* TAB: Tổng quan */}
        <TabsContent value="overview">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-sm">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><Package className="w-4 h-4" /> Tổng sản phẩm</div>
                <div className="text-2xl font-bold text-gray-900">{products.length}</div>
              </div>
              <div className="rounded-3xl border border-rose-100 bg-rose-50/70 p-5 shadow-sm">
                <div className="flex items-center gap-2 text-sm text-red-600 mb-1"><AlertTriangle className="w-4 h-4" /> Sắp hết hàng</div>
                <div className="text-2xl font-bold text-red-600">{alerts.summary.lowStockCount}</div>
              </div>
              <div className="rounded-3xl border border-amber-100 bg-amber-50/70 p-5 shadow-sm">
                <div className="flex items-center gap-2 text-sm text-orange-600 mb-1"><Clock className="w-4 h-4" /> Sắp hết hạn</div>
                <div className="text-2xl font-bold text-orange-600">{alerts.summary.expiringCount}</div>
              </div>
            </div>

            {alerts.lowStock.length > 0 && (
              <AdminPanel
                title="Sản phẩm sắp hết hàng"
                description="Danh sách ưu tiên bổ sung để tránh hụt hàng trong mùa vụ cao điểm."
              >
                <div className="px-4 py-3 bg-red-50 border-b font-semibold text-sm text-red-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Sản phẩm sắp hết hàng
                </div>
                <table className="w-full text-sm">
                  <thead><tr className="border-b bg-muted/50">
                    <th className="text-left px-4 py-2 font-medium">Sản phẩm</th>
                    <th className="text-right px-4 py-2 font-medium">Tồn kho</th>
                    <th className="text-right px-4 py-2 font-medium">Ngưỡng tối thiểu</th>
                  </tr></thead>
                  <tbody>
                    {alerts.lowStock.map((p) => (
                      <tr key={p.id} className="border-b last:border-0">
                        <td className="px-4 py-2 font-medium">{p.name}</td>
                        <td className="px-4 py-2 text-right text-red-600 font-semibold">{formatNum(p.currentStockBase)} {p.baseUnit}</td>
                        <td className="px-4 py-2 text-right text-muted-foreground">{formatNum(p.minStockThreshold)} {p.baseUnit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </AdminPanel>
            )}

            {alerts.expiring.length > 0 && (
              <AdminPanel
                title="Sản phẩm sắp hết hạn"
                description="Theo dõi lô sắp quá hạn để điều phối bán hàng và tồn kho."
              >
                <div className="px-4 py-3 bg-orange-50 border-b font-semibold text-sm text-orange-700 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Sản phẩm sắp hết hạn
                </div>
                <table className="w-full text-sm">
                  <thead><tr className="border-b bg-muted/50">
                    <th className="text-left px-4 py-2 font-medium">Sản phẩm</th>
                    <th className="text-right px-4 py-2 font-medium">Ngày hết hạn</th>
                  </tr></thead>
                  <tbody>
                    {alerts.expiring.map((p) => (
                      <tr key={p.id} className="border-b last:border-0">
                        <td className="px-4 py-2 font-medium">{p.name}</td>
                        <td className="px-4 py-2 text-right text-orange-600">{p.expirationDate ? new Date(p.expirationDate).toLocaleDateString("vi-VN") : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </AdminPanel>
            )}
          </div>
        </TabsContent>

        {/* TAB: Nhập kho */}
        <TabsContent value="import">
          <div className="space-y-4">
            <div className="flex justify-end">
              <AdminActionButton onClick={() => setImportDialog(true)}>
                <Plus className="w-4 h-4" /> Nhập kho
              </AdminActionButton>
            </div>
            <AdminPanel
              title="Lịch sử nhập kho"
              description="Theo dõi các đợt nhập hàng và giá vốn gần nhất."
            >
              <div className="px-4 py-3 bg-muted/50 border-b font-semibold text-sm flex items-center gap-1.5"><ArrowDownToLine className="w-4 h-4" /> Lịch sử nhập kho</div>
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-muted/30">
                  <th className="text-left px-4 py-2 font-medium">Thời gian</th>
                  <th className="text-left px-4 py-2 font-medium">Sản phẩm</th>
                  <th className="text-right px-4 py-2 font-medium">Số lượng</th>
                  <th className="text-right px-4 py-2 font-medium">Giá nhập/ĐV</th>
                  <th className="text-left px-4 py-2 font-medium">Lô</th>
                  <th className="text-left px-4 py-2 font-medium">Người nhập</th>
                </tr></thead>
                <tbody>
                  {history.data.filter(e => e.type === "IMPORT").map((e) => (
                    <tr key={e.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-2 text-muted-foreground text-xs">{formatDate(e.createdAt)}</td>
                      <td className="px-4 py-2 font-medium">{e.product?.name || "—"}</td>
                      <td className="px-4 py-2 text-right text-emerald-600 font-semibold">+{formatNum(e.quantityBase)} {e.product?.baseUnit}</td>
                      <td className="px-4 py-2 text-right">{e.costPricePerUnit ? `${formatNum(e.costPricePerUnit)}đ` : "—"}</td>
                      <td className="px-4 py-2 text-xs text-muted-foreground">{e.batchNumber || "—"}</td>
                      <td className="px-4 py-2 text-xs">{e.creator?.fullName || "—"}</td>
                    </tr>
                  ))}
                  {history.data.filter(e => e.type === "IMPORT").length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Chưa có lịch sử nhập kho</td></tr>
                  )}
                </tbody>
              </table>
            </AdminPanel>
          </div>
        </TabsContent>

        {/* TAB: Điều chỉnh kho */}
        <TabsContent value="adjust">
          <div className="space-y-4">
            <div className="flex justify-end">
              <AdminActionButton
                tone="secondary"
                onClick={() => setAdjustDialog(true)}
                className="border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100"
              >
                <Plus className="w-4 h-4" /> Điều chỉnh kho
              </AdminActionButton>
            </div>
            <AdminPanel
              title="Lịch sử điều chỉnh kho"
              description="Ghi nhận hao hụt, trả hàng và cân chỉnh kiểm kê."
            >
              <div className="px-4 py-3 bg-muted/50 border-b font-semibold text-sm flex items-center gap-1.5"><Wrench className="w-4 h-4" /> Lịch sử điều chỉnh kho</div>
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-muted/30">
                  <th className="text-left px-4 py-2 font-medium">Thời gian</th>
                  <th className="text-left px-4 py-2 font-medium">Sản phẩm</th>
                  <th className="text-center px-4 py-2 font-medium">Loại</th>
                  <th className="text-right px-4 py-2 font-medium">Số lượng</th>
                  <th className="text-left px-4 py-2 font-medium">Lô gốc</th>
                  <th className="text-right px-4 py-2 font-medium">Giá nhập</th>
                  <th className="text-left px-4 py-2 font-medium">Lý do</th>
                  <th className="text-left px-4 py-2 font-medium">Người thực hiện</th>
                </tr></thead>
                <tbody>
                  {history.data.filter(e => ["DAMAGE","RETURN","ADJUSTMENT"].includes(e.type)).map((e) => (
                    <tr key={e.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-2 text-muted-foreground text-xs">{formatDate(e.createdAt)}</td>
                      <td className="px-4 py-2 font-medium">{e.product?.name || "—"}</td>
                      <td className="px-4 py-2 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[e.type] || ""}`}>{TYPE_LABELS[e.type]}</span>
                      </td>
                      <td className="px-4 py-2 text-right text-red-600 font-semibold">{formatNum(e.quantityBase)} {e.product?.baseUnit}</td>
                      <td className="px-4 py-2 text-xs text-muted-foreground">{e.batchNumber || "—"}</td>
                      <td className="px-4 py-2 text-right text-xs">{e.costPricePerUnit ? `${formatNum(e.costPricePerUnit)}đ` : "—"}</td>
                      <td className="px-4 py-2 text-xs">{e.note || "—"}</td>
                      <td className="px-4 py-2 text-xs">{e.creator?.fullName || "—"}</td>
                    </tr>
                  ))}
                  {history.data.filter(e => ["DAMAGE","RETURN","ADJUSTMENT"].includes(e.type)).length === 0 && (
                    <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">Chưa có lịch sử xuất/điều chỉnh</td></tr>
                  )}
                </tbody>
              </table>
            </AdminPanel>
          </div>
        </TabsContent>

        {/* TAB: Lịch sử */}
        <TabsContent value="history">
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-muted/50 border-b font-semibold text-sm flex items-center gap-1.5"><ClipboardList className="w-4 h-4" /> Toàn bộ lịch sử kho ({history.meta.total} bản ghi)</div>
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-muted/30">
                <th className="text-left px-4 py-2 font-medium">Thời gian</th>
                <th className="text-left px-4 py-2 font-medium">Sản phẩm</th>
                <th className="text-center px-4 py-2 font-medium">Loại</th>
                <th className="text-right px-4 py-2 font-medium">Số lượng</th>
                <th className="text-left px-4 py-2 font-medium">Lô</th>
                <th className="text-right px-4 py-2 font-medium">Giá nhập</th>
                <th className="text-left px-4 py-2 font-medium">Ghi chú</th>
                <th className="text-left px-4 py-2 font-medium">Người thực hiện</th>
              </tr></thead>
              <tbody>
                {history.data.map((e) => (
                  <tr key={e.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-2 text-muted-foreground text-xs">{formatDate(e.createdAt)}</td>
                    <td className="px-4 py-2 font-medium">{e.product?.name || "—"}</td>
                    <td className="px-4 py-2 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[e.type] || ""}`}>{TYPE_LABELS[e.type]}</span>
                    </td>
                    <td className={`px-4 py-2 text-right font-semibold ${e.quantityBase >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {e.quantityBase >= 0 ? "+" : ""}{formatNum(e.quantityBase)} {e.product?.baseUnit}
                    </td>
                    <td className="px-4 py-2 text-xs text-muted-foreground">{e.batchNumber || "—"}</td>
                    <td className="px-4 py-2 text-right text-xs">{e.costPricePerUnit ? `${formatNum(e.costPricePerUnit)}đ` : "—"}</td>
                    <td className="px-4 py-2 text-xs">{e.note || "—"}</td>
                    <td className="px-4 py-2 text-xs">{e.creator?.fullName || "—"}</td>
                  </tr>
                ))}
                {history.data.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">Chưa có dữ liệu</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      {importDialog && (
        <CrudDialog title="nhập kho" fields={importFields}
          initialData={{}} onSubmit={handleImport}
          onClose={() => setImportDialog(false)} mode="create" />
      )}
      {adjustDialog && (
        <CrudDialog title="điều chỉnh kho" fields={adjustFields}
          initialData={{ type: "DAMAGE" }} onSubmit={handleAdjust}
          onClose={() => setAdjustDialog(false)} mode="create" />
      )}
    </div>
  );
}
