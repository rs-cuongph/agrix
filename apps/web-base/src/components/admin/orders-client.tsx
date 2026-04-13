"use client";

import { Fragment, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ClipboardList, ChevronDown, ChevronUp, User,
  Search, Trash2, Loader2, Banknote, QrCode, Clock, CheckCircle2, XCircle,
} from "lucide-react";
import { AdminPageHero, AdminPanel, AdminStatsGrid } from "@/components/admin/admin-page-shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { deleteOrderAction } from "@/app/admin/orders/actions";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type OrderItem = {
  id: string; productId: string; quantityBase: number;
  soldUnit: string; unitPrice: number; lineTotal: number;
  product?: { name: string };
};

type Order = {
  id: string; orderCode?: string; totalAmount: number; paidAmount: number;
  paymentMethod: string; createdAt: string; syncStatus: string;
  status?: string;
  customer?: { id: string; name: string; phone?: string };
  items?: OrderItem[];
};

function fmt(n: number) {
  return new Intl.NumberFormat("vi-VN").format(n) + "đ";
}

function PaymentBadge({ method }: { method: string }) {
  if (method === "BANK_TRANSFER") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-violet-50 text-violet-700 border border-violet-200">
        <QrCode className="w-3 h-3" /> Chuyển khoản
      </span>
    );
  }
  if (method === "MIXED") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
        <Banknote className="w-3 h-3" /> Kết hợp
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
      <Banknote className="w-3 h-3" /> Tiền mặt
    </span>
  );
}

function StatusBadge({ status }: { status?: string }) {
  if (!status) return null;
  if (status === "COMPLETED") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="w-3 h-3" /> Đã thanh toán
      </span>
    );
  }
  if (status === "PENDING") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
        <Clock className="w-3 h-3" /> Chờ thanh toán
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-200">
      <XCircle className="w-3 h-3" /> Đã hủy
    </span>
  );
}

function DebtBadge({ total, paid }: { total: number; paid: number }) {
  const debt = total - paid;
  if (debt <= 0) return null;
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-red-50 text-red-600 border border-red-200">
      Nợ {fmt(debt)}
    </span>
  );
}

export function OrdersClient({ orders, initialSearch = "" }: { orders: Order[], initialSearch?: string }) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState(initialSearch);
  const [isPending, startTransition] = useTransition();
  const pendingCount = orders.filter((order) => order.status === "PENDING").length;
  const debtCount = orders.filter((order) => order.totalAmount - order.paidAmount > 0).length;
  const paidTotal = orders.reduce((sum, order) => sum + order.paidAmount, 0);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => {
      router.push(searchValue ? `/admin/orders?search=${encodeURIComponent(searchValue)}` : "/admin/orders");
    });
  };

  const handleDelete = async (id: string) => {
    startTransition(async () => {
      const res = await deleteOrderAction(id);
      if (!res.success) alert("Xóa đơn hàng thất bại!");
    });
  };

  return (
    <div className="space-y-6">
      <AdminPageHero
        badge="Order Desk"
        icon={ClipboardList}
        title="Quản lý đơn hàng"
        description="Theo dõi trạng thái thanh toán, công nợ và chi tiết giao dịch bằng cùng hệ bố cục đang dùng ở quản lý mùa vụ."
        actions={
          <form onSubmit={handleSearch} className="relative w-full max-w-[27rem]">
            <Input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Tìm theo mã đơn hoặc khách hàng..."
              className="h-11 rounded-2xl border-white/70 bg-white/90 pr-11 shadow-sm"
            />
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1 h-9 w-9 rounded-xl text-slate-500 hover:bg-slate-100"
              disabled={isPending}
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </form>
        }
      />

      <AdminStatsGrid
        items={[
          { label: "Tổng đơn", value: orders.length.toLocaleString("vi-VN"), hint: "danh sách hiện tại", icon: ClipboardList },
          { label: "Chờ thanh toán", value: pendingCount.toLocaleString("vi-VN"), hint: "đơn cần xử lý", icon: Clock, accentClassName: "border-amber-100 bg-amber-50 text-amber-600" },
          { label: "Có công nợ", value: debtCount.toLocaleString("vi-VN"), hint: "đơn chưa thanh toán đủ", icon: XCircle, accentClassName: "border-rose-100 bg-rose-50 text-rose-600" },
          { label: "Đã thu", value: fmt(paidTotal), hint: "tổng tiền đã ghi nhận", icon: CheckCircle2, accentClassName: "border-sky-100 bg-sky-50 text-sky-600" },
        ]}
      />

      <AdminPanel
        title="Danh sách đơn hàng"
        description="Nhấn vào từng dòng để mở chi tiết mặt hàng và tác vụ quản trị."
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-slate-50/90 text-slate-600">
              <th className="w-8 px-3" />
              <th className="text-left px-4 py-3 font-semibold w-28">Mã đơn</th>
              <th className="text-left px-4 py-3 font-semibold">Khách hàng</th>
              <th className="text-right px-4 py-3 font-semibold">Tổng tiền</th>
              <th className="text-center px-4 py-3 font-semibold">Phương thức</th>
              <th className="text-center px-4 py-3 font-semibold">Trạng thái</th>
              <th className="text-left px-4 py-3 font-semibold">Ngày tạo</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <Fragment key={o.id}>
                <tr
                  onClick={() => toggleExpand(o.id)}
                  className={`border-b transition-colors cursor-pointer ${
                    expandedId === o.id ? "bg-emerald-50/40" : "hover:bg-muted/25"
                  }`}
                >
                  {/* Expand icon */}
                  <td className="px-3 text-center text-gray-300">
                    {expandedId === o.id
                      ? <ChevronUp className="w-4 h-4 inline text-emerald-500" />
                      : <ChevronDown className="w-4 h-4 inline" />}
                  </td>

                  {/* Mã đơn */}
                  <td className="px-4 py-3.5">
                    {o.orderCode ? (
                      <span className="font-mono font-bold text-emerald-700 text-sm">{o.orderCode}</span>
                    ) : (
                      <span className="font-mono text-xs text-gray-400" title={o.id}>
                        {o.id.substring(0, 8)}…
                      </span>
                    )}
                  </td>

                  {/* Khách hàng */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      {o.customer ? (
                        <>
                          <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                            <User className="w-3.5 h-3.5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 leading-tight">{o.customer.name}</p>
                            {o.customer.phone && (
                              <p className="text-xs text-gray-400">{o.customer.phone}</p>
                            )}
                          </div>
                        </>
                      ) : (
                        <span className="text-gray-400 italic">Khách lẻ</span>
                      )}
                    </div>
                  </td>

                  {/* Tổng tiền */}
                  <td className="px-4 py-3.5 text-right">
                    <p className="font-semibold text-gray-900">{fmt(o.totalAmount)}</p>
                    <DebtBadge total={o.totalAmount} paid={o.paidAmount} />
                  </td>

                  {/* Phương thức */}
                  <td className="px-4 py-3.5 text-center">
                    <PaymentBadge method={o.paymentMethod} />
                  </td>

                  {/* Trạng thái */}
                  <td className="px-4 py-3.5 text-center">
                    <StatusBadge status={o.status} />
                  </td>

                  {/* Ngày tạo */}
                  <td className="px-4 py-3.5 text-muted-foreground text-sm">
                    {new Date(o.createdAt).toLocaleDateString("vi-VN", {
                      day: "2-digit", month: "2-digit", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </td>
                </tr>

                {/* Expanded detail row */}
                {expandedId === o.id && o.items && (
                  <tr>
                    <td colSpan={7} className="bg-emerald-50/30 border-b border-emerald-100/60 px-6 py-4">
                      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                        {/* Detail header */}
                        <div className="flex items-center justify-between px-5 py-3.5 bg-gray-50/70 border-b border-gray-100">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Chi tiết đơn</span>
                            {o.orderCode && (
                              <span className="font-mono text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                                {o.orderCode}
                              </span>
                            )}
                            <span className="font-mono text-[11px] text-gray-400 bg-white border border-gray-100 px-2 py-0.5 rounded" title={o.id}>
                              {o.id.substring(0, 18)}…
                            </span>
                            <PaymentBadge method={o.paymentMethod} />
                            <StatusBadge status={o.status} />
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {o.customer && (
                              <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-white px-3 py-1.5 rounded-lg border border-gray-100">
                                <User className="w-3.5 h-3.5 text-gray-400" />
                                <span>{o.customer.name}</span>
                                {o.customer.phone && <span className="text-gray-400">· {o.customer.phone}</span>}
                              </div>
                            )}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" className="h-7 text-xs gap-1">
                                  <Trash2 className="w-3 h-3" /> Xóa đơn
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Xóa đơn hàng vĩnh viễn?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Hành động này không thể hoàn tác. Việc xóa đơn hàng sẽ tự động:
                                    <br /><br />
                                    • Cộng lại tất cả số lượng sản phẩm vào tồn kho.<br />
                                    • Điều chỉnh lại công nợ của khách hàng (nếu có).<br />
                                    • Xóa toàn bộ chi tiết đơn hàng khỏi hệ thống.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(o.id)} className="bg-red-600 hover:bg-red-700">
                                    Xác nhận Xóa
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>

                        {/* Items table */}
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-xs text-gray-500 border-b border-gray-100 bg-gray-50/40">
                              <th className="text-left font-semibold px-5 py-2.5 w-[45%]">Sản phẩm</th>
                              <th className="text-center font-semibold py-2.5 w-[18%]">Số lượng</th>
                              <th className="text-right font-semibold py-2.5 px-4 w-[18%]">Đơn giá</th>
                              <th className="text-right font-semibold py-2.5 px-5 w-[19%]">Thành tiền</th>
                            </tr>
                          </thead>
                          <tbody>
                            {o.items?.map((item) => (
                              <tr key={item.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/40 transition-colors">
                                <td className="px-5 py-3">
                                  <p className="font-semibold text-gray-900">{item.product?.name || "Sản phẩm đã xóa"}</p>
                                  <p className="font-mono text-[10px] text-gray-400 mt-0.5">{item.productId}</p>
                                </td>
                                <td className="py-3 text-center">
                                  <span className="font-semibold text-gray-800">{item.quantityBase}</span>
                                  <span className="text-gray-400 ml-1 text-xs">{item.soldUnit}</span>
                                </td>
                                <td className="py-3 text-right px-4 text-gray-500">{fmt(item.unitPrice)}</td>
                                <td className="py-3 text-right px-5 font-bold text-emerald-600">{fmt(item.lineTotal)}</td>
                              </tr>
                            ))}
                          </tbody>
                          {/* Footer total */}
                          <tfoot>
                            <tr className="border-t border-gray-100 bg-gray-50/40">
                              <td colSpan={3} className="px-5 py-3 text-right text-sm font-medium text-gray-500">Tổng cộng</td>
                              <td className="px-5 py-3 text-right font-bold text-lg text-emerald-600">{fmt(o.totalAmount)}</td>
                            </tr>
                            {o.paidAmount < o.totalAmount && (
                              <tr className="bg-red-50/40">
                                <td colSpan={3} className="px-5 py-2 text-right text-xs font-medium text-red-500">Còn nợ</td>
                                <td className="px-5 py-2 text-right font-semibold text-red-600">{fmt(o.totalAmount - o.paidAmount)}</td>
                              </tr>
                            )}
                          </tfoot>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-16 text-center">
                  <ClipboardList className="w-10 h-10 mx-auto text-gray-200 mb-3" />
                  <p className="text-muted-foreground">Chưa có đơn hàng nào</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </AdminPanel>
    </div>
  );
}
