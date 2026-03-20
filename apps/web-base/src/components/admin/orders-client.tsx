"use client";

import { useState } from "react";
import { ClipboardList, ChevronDown, ChevronUp } from "lucide-react";

type OrderItem = {
  id: string; productId: string; quantityBase: number;
  soldUnit: string; unitPrice: number; lineTotal: number;
};

type Order = {
  id: string; totalAmount: number; paidAmount: number;
  paymentMethod: string; createdAt: string; syncStatus: string;
  customer?: { id: string; name: string; phone?: string };
  items?: OrderItem[];
};

export function OrdersClient({ orders }: { orders: Order[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
        <ClipboardList className="w-6 h-6" /> Đơn hàng
      </h1>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="w-8 px-2"></th>
              <th className="text-left px-4 py-3 font-semibold">Mã đơn</th>
              <th className="text-left px-4 py-3 font-semibold">Khách hàng</th>
              <th className="text-right px-4 py-3 font-semibold">Tổng tiền</th>
              <th className="text-right px-4 py-3 font-semibold">Đã trả</th>
              <th className="text-center px-4 py-3 font-semibold">Thanh toán</th>
              <th className="text-left px-4 py-3 font-semibold">Ngày tạo</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <>
                <tr key={o.id} onClick={() => toggleExpand(o.id)}
                  className="border-b hover:bg-muted/30 transition-colors cursor-pointer">
                  <td className="px-2 text-center text-gray-400">
                    {expandedId === o.id ? <ChevronUp className="w-4 h-4 inline" /> : <ChevronDown className="w-4 h-4 inline" />}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{o.id.substring(0, 8)}...</td>
                  <td className="px-4 py-3 font-medium">{o.customer?.name || "Khách lẻ"}</td>
                  <td className="px-4 py-3 text-right font-semibold">{o.totalAmount?.toLocaleString()}đ</td>
                  <td className="px-4 py-3 text-right">{o.paidAmount?.toLocaleString()}đ</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">{o.paymentMethod}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(o.createdAt).toLocaleDateString("vi-VN")}</td>
                </tr>
                {expandedId === o.id && o.items && (
                  <tr key={`${o.id}-detail`}>
                    <td colSpan={7} className="px-6 py-4 bg-gray-50">
                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Chi tiết đơn hàng</h4>
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-gray-500">
                              <th className="text-left py-1">Sản phẩm ID</th>
                              <th className="text-right py-1">SL</th>
                              <th className="text-left py-1">Đơn vị</th>
                              <th className="text-right py-1">Đơn giá</th>
                              <th className="text-right py-1">Thành tiền</th>
                            </tr>
                          </thead>
                          <tbody>
                            {o.items.map((item) => (
                              <tr key={item.id} className="border-t border-gray-200">
                                <td className="py-1 font-mono">{item.productId.substring(0, 8)}...</td>
                                <td className="py-1 text-right">{item.quantityBase}</td>
                                <td className="py-1">{item.soldUnit}</td>
                                <td className="py-1 text-right">{item.unitPrice?.toLocaleString()}đ</td>
                                <td className="py-1 text-right font-semibold">{item.lineTotal?.toLocaleString()}đ</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {o.customer && (
                          <div className="text-xs text-gray-500 pt-1">
                            👤 {o.customer.name} {o.customer.phone ? `• ${o.customer.phone}` : ""}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Chưa có đơn hàng</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
