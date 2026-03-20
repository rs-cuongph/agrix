import { apiGet, type PaginatedResponse } from "@/lib/api";
import { ClipboardList } from "lucide-react";

type Order = {
  id: string; totalAmount: number; paymentMethod: string;
  syncStatus: string; createdAt: string;
  customer?: { name: string };
};

export default async function OrdersPage() {
  let orders: Order[] = [];
  try {
    const res = await apiGet<PaginatedResponse<Order>>("/orders");
    orders = res.data;
  } catch (e) {
    console.error("Orders fetch error:", e);
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
        <ClipboardList className="w-6 h-6" /> Đơn hàng
      </h1>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 font-semibold">Mã đơn</th>
              <th className="text-left px-4 py-3 font-semibold">Khách hàng</th>
              <th className="text-left px-4 py-3 font-semibold">Thời gian</th>
              <th className="text-right px-4 py-3 font-semibold">Tổng tiền</th>
              <th className="text-center px-4 py-3 font-semibold">Thanh toán</th>
              <th className="text-center px-4 py-3 font-semibold">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{o.id.slice(0, 8)}</td>
                <td className="px-4 py-3">{o.customer?.name || "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(o.createdAt).toLocaleString("vi-VN")}</td>
                <td className="px-4 py-3 text-right font-semibold">{o.totalAmount?.toLocaleString()}đ</td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">
                    {o.paymentMethod}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${
                    o.syncStatus === "SYNCED" ? "bg-emerald-100 text-emerald-700" : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {o.syncStatus}
                  </span>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Chưa có đơn hàng</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
