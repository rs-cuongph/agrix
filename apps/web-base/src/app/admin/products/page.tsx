import { apiGet, type PaginatedResponse } from "@/lib/api";
import { Package, RefreshCw } from "lucide-react";
import Link from "next/link";

type Product = {
  id: string; sku: string; name: string; baseUnit: string;
  baseSellPrice: number; currentStockBase: number; isActive: boolean;
};

export default async function ProductsPage() {
  let products: Product[] = [];
  try {
    const res = await apiGet<PaginatedResponse<Product>>("/products");
    products = res.data;
  } catch (e) {
    console.error("Products fetch error:", e);
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
          <Package className="w-6 h-6" /> Sản phẩm
        </h1>
        <div className="flex gap-2">
          <Link href="/admin/products" className="inline-flex items-center gap-1 px-3 py-2 text-sm border rounded-lg hover:bg-muted transition-colors">
            <RefreshCw className="w-4 h-4" /> Làm mới
          </Link>
        </div>
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
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Chưa có sản phẩm</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
