import { apiGet } from "@/lib/api";
import { StatCard } from "@/components/admin/stat-card";
import { DollarSign, ShoppingCart, Package, Users, TrendingUp, AlertTriangle } from "lucide-react";

type Revenue = { revenueToday: number; orderCountToday: number; totalProducts: number; totalCustomers: number };
type TopProduct = { name: string; sku: string; totalSold: number };
type Alerts = { lowStock: { id: string; name: string; sku: string; currentStock: number; baseUnit: string }[] };

export default async function AdminDashboard() {
  let revenue: Revenue = { revenueToday: 0, orderCountToday: 0, totalProducts: 0, totalCustomers: 0 };
  let topProducts: TopProduct[] = [];
  let alerts: Alerts = { lowStock: [] };

  try {
    [revenue, topProducts, alerts] = await Promise.all([
      apiGet<Revenue>("/dashboard/revenue"),
      apiGet<TopProduct[]>("/dashboard/top-products"),
      apiGet<Alerts>("/dashboard/alerts"),
    ]);
  } catch (e) {
    console.error("Dashboard fetch error:", e);
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-extrabold text-gray-900">📊 Tổng quan</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="Doanh thu hôm nay" value={`${revenue.revenueToday.toLocaleString()}đ`} color="text-emerald-600" />
        <StatCard icon={ShoppingCart} label="Đơn hàng hôm nay" value={revenue.orderCountToday} color="text-blue-600" />
        <StatCard icon={Package} label="Tổng sản phẩm" value={revenue.totalProducts} color="text-orange-600" />
        <StatCard icon={Users} label="Tổng khách hàng" value={revenue.totalCustomers} color="text-purple-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top Products */}
        <div className="lg:col-span-2 rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="text-base font-bold flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-emerald-600" /> Top sản phẩm bán chạy
          </h2>
          {topProducts.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-2">Sản phẩm</th>
                  <th className="text-left py-2">SKU</th>
                  <th className="text-right py-2">Đã bán</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-2.5 font-medium">{p.name}</td>
                    <td className="py-2.5 text-muted-foreground">{p.sku}</td>
                    <td className="py-2.5 text-right font-semibold">{p.totalSold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-muted-foreground text-sm">Chưa có dữ liệu bán hàng</p>
          )}
        </div>

        {/* Alerts */}
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="text-base font-bold flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-orange-500" /> Cảnh báo tồn kho
          </h2>
          {alerts.lowStock.length > 0 ? (
            <div className="space-y-2">
              {alerts.lowStock.map((a) => (
                <div key={a.id} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-sm">{a.name}</p>
                    <p className="text-xs text-muted-foreground">{a.sku}</p>
                  </div>
                  <span className="text-sm font-semibold text-orange-600">
                    {a.currentStock} {a.baseUnit}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Không có cảnh báo</p>
          )}
        </div>
      </div>
    </div>
  );
}
