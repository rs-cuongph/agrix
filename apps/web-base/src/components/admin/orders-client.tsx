"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList, ChevronDown, ChevronUp, User, Search, Trash2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { deleteOrderAction } from "@/app/admin/orders/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type OrderItem = {
  id: string; productId: string; quantityBase: number;
  soldUnit: string; unitPrice: number; lineTotal: number;
  product?: { name: string };
};

type Order = {
  id: string; totalAmount: number; paidAmount: number;
  paymentMethod: string; createdAt: string; syncStatus: string;
  customer?: { id: string; name: string; phone?: string };
  items?: OrderItem[];
};

export function OrdersClient({ orders, initialSearch = "" }: { orders: Order[], initialSearch?: string }) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState(initialSearch);
  const [isPending, startTransition] = useTransition();

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
      if (!res.success) {
        alert("Xóa đơn hàng thất bại!");
      }
    });
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
          <ClipboardList className="w-6 h-6" /> Đơn hàng
        </h1>
        <form onSubmit={handleSearch} className="flex items-center relative w-72">
          <Input 
            value={searchValue} 
            onChange={(e) => setSearchValue(e.target.value)} 
            placeholder="Tìm theo ID, Khách hàng..." 
            className="pr-10 bg-white"
          />
          <Button type="submit" variant="ghost" size="icon" className="absolute right-1 w-8 h-8 opacity-70 hover:bg-transparent" disabled={isPending}>
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
        </form>
      </div>

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
                    <td colSpan={7} className="px-8 py-5 bg-gray-50/80 border-b border-gray-200">
                      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm w-full">
                        <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-4">
                          <div className="flex items-center gap-3">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Chi tiết đơn hàng</h4>
                            <span className="font-mono text-[11px] text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded">
                              ID: {o.id}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            {o.customer && (
                              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-gray-50 px-4 py-1.5 rounded-lg border border-gray-100 shadow-sm">
                                <User className="w-4 h-4 text-gray-400" />
                                <span>{o.customer.name}</span>
                                {o.customer.phone && <span className="text-gray-400 font-normal">({o.customer.phone})</span>}
                              </div>
                            )}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" className="h-8 shadow-sm">
                                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                                  Xóa
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Xóa đơn hàng vĩnh viễn?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Hành động này không thể hoàn tác. Việc xóa đơn hàng sẽ tự động:
                                    <br/><br/>
                                    • Cộng lại tất cả số lượng của sản phẩm vào tồn kho.<br/>
                                    • Điều chỉnh lại công nợ của khách hàng (nếu có).<br/>
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
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-gray-500 border-b border-gray-100">
                              <th className="text-left font-semibold py-2 pb-3 w-[45%]">Sản phẩm</th>
                              <th className="text-center font-semibold py-2 pb-3 w-[15%]">Số lượng</th>
                              <th className="text-right font-semibold py-2 pb-3 w-[20%]">Đơn giá</th>
                              <th className="text-right font-semibold py-2 pb-3 w-[20%]">Thành tiền</th>
                            </tr>
                          </thead>
                          <tbody>
                            {o.items?.map((item) => (
                              <tr key={item.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/30 transition-colors">
                                <td className="py-4">
                                  <p className="font-semibold text-gray-900 text-sm tracking-tight">{item.product?.name || "Sản phẩm ẩn/đã xóa"}</p>
                                  <p className="font-mono text-[10px] text-gray-400 mt-1">ID: {item.productId}</p>
                                </td>
                                <td className="py-4 text-center">
                                  <span className="font-semibold text-gray-800">{item.quantityBase}</span>
                                  <span className="text-gray-500 ml-1">{item.soldUnit}</span>
                                </td>
                                <td className="py-4 text-right text-gray-600 font-medium">{item.unitPrice?.toLocaleString()}đ</td>
                                <td className="py-4 text-right font-bold text-emerald-600 text-base">{item.lineTotal?.toLocaleString()}đ</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
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
