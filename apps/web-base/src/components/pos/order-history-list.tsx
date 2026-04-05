"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import { getOrderHistory, PosOrder } from "@/lib/pos/pos-api";
import { Search, MapPin, Phone, User, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { OrderDetailDialog } from "./order-detail-dialog";

function formatPrice(n: number) {
  return new Intl.NumberFormat("vi-VN").format(n) + "đ";
}

function formatDate(dateString: string) {
  const d = new Date(dateString);
  return d.toLocaleDateString("vi-VN") + " " + d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

export function OrderHistoryList() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [orders, setOrders] = useState<PosOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20 });
  const [isPending, startTransition] = useTransition();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  // Fetch data
  const fetchOrders = useCallback(async (searchStr: string, pageNum: number) => {
    setLoading(true);
    try {
      const res = await getOrderHistory(searchStr, pageNum, 20);
      setOrders(res.data);
      setMeta(res.meta);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(debouncedQuery, 1);
  }, [debouncedQuery, fetchOrders]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > Math.ceil(meta.total / meta.limit)) return;
    startTransition(() => {
      fetchOrders(debouncedQuery, newPage);
    });
  };

  const totalPages = Math.ceil(meta.total / meta.limit);

  return (
    <div className="flex flex-col h-full bg-gray-50/50 relative">
      {/* Search Bar */}
      <div className="p-6 shrink-0 border-b border-gray-100">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none text-gray-800"
            placeholder="Tìm theo Mã HĐ, Tên KH, hoặc Số điện thoại..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* List content */}
      <div className="flex-1 overflow-y-auto min-h-0 p-6">
        {loading && orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <p>Không tìm thấy hoá đơn nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} onClick={() => setSelectedOrderId(order.id)} />
            ))}
          </div>
        )}
      </div>

      <OrderDetailDialog 
        orderId={selectedOrderId} 
        onClose={() => setSelectedOrderId(null)} 
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="shrink-0 p-4 border-t border-gray-100 bg-white flex items-center justify-between">
          <p className="text-sm text-gray-500 pl-2">
            Hiển thị <span className="font-semibold text-gray-700">{(meta.page - 1) * meta.limit + 1}</span> -{" "}
            <span className="font-semibold text-gray-700">
              {Math.min(meta.page * meta.limit, meta.total)}
            </span>{" "}
            trong tổng số <span className="font-semibold text-gray-700">{meta.total}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(meta.page - 1)}
              disabled={meta.page === 1 || loading || isPending}
              className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:bg-gray-50/50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="px-4 py-2 text-sm font-semibold text-gray-700">
              Trang {meta.page} / {totalPages}
            </div>
            <button
              onClick={() => handlePageChange(meta.page + 1)}
              disabled={meta.page === totalPages || loading || isPending}
              className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:bg-gray-50/50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function OrderCard({ order, onClick }: { order: PosOrder, onClick: () => void }) {
  const getStatusBadgeProps = (status: PosOrder["status"]) => {
    switch (status) {
      case "COMPLETED":
        return { label: "Hoàn thành", classes: "bg-emerald-100 text-emerald-700 font-semibold border-emerald-200" };
      case "PENDING":
        return { label: "Chờ thanh toán", classes: "bg-amber-100 text-amber-700 font-semibold border-amber-200" };
      case "CANCELLED":
        return { label: "Đã huỷ", classes: "bg-red-100 text-red-700 font-semibold border-red-200" };
      default:
        return { label: status, classes: "bg-gray-100 text-gray-600 border-gray-200" };
    }
  };

  const badgeProps = getStatusBadgeProps(order.status);

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col gap-4 group"
    >
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-gray-800 text-lg group-hover:text-emerald-600 transition-colors">
            {order.orderCode || order.id.slice(0, 8).toUpperCase()}
          </h3>
          <div className="flex items-center text-xs text-gray-400 mt-1 gap-1">
            <Clock className="w-3.5 h-3.5" />
            {formatDate(order.createdAt)}
          </div>
        </div>
        <div className={cn("px-2.5 py-1 rounded-lg text-xs leading-none border", badgeProps.classes)}>
          {badgeProps.label}
        </div>
      </div>

      {/* Customer Info */}
      <div className="flex gap-4">
         <div className="flex-1 flex gap-2 overflow-hidden items-center bg-gray-50 rounded-xl px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
               <User className="w-4 h-4"/>
            </div>
            <div className="min-w-0">
               <p className="text-sm font-semibold text-gray-700 truncate">{order.customer?.name || "Khách lẻ"}</p>
               {order.customer?.phone && (
                 <p className="text-xs text-gray-500 font-mono">{order.customer.phone}</p>
               )}
            </div>
         </div>
      </div>

      {/* Footer */}
      <div className="flex items-end justify-between pt-3 border-t border-gray-50">
        <div>
          <p className="text-xs text-gray-400">Tổng tiền {order.items.length} món</p>
          <p className="text-xl font-bold text-emerald-600">{formatPrice(order.totalAmount)}</p>
        </div>
        <div className="text-[11px] text-gray-400 font-medium">
          {order.paymentMethod === "CASH" ? "Tiền mặt" : order.paymentMethod === "BANK_TRANSFER" ? "Chuyển khoản" : "Khác"}
        </div>
      </div>
    </div>
  );
}
