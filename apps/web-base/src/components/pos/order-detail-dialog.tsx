"use client";

import { useEffect, useState, useRef } from "react";
import { getOrderDetail, PosOrder } from "@/lib/pos/pos-api";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { X, Printer, Undo2, ArrowLeft, Loader2, Store, Clock, User, Phone, CheckCircle2, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function formatPrice(n: number) {
  return new Intl.NumberFormat("vi-VN").format(n) + "đ";
}

function formatDate(dateString: string) {
  const d = new Date(dateString);
  return d.toLocaleDateString("vi-VN") + " " + d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

type Props = {
  orderId: string | null;
  onClose: () => void;
};

export function OrderDetailDialog({ orderId, onClose }: Props) {
  const [order, setOrder] = useState<PosOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (orderId) {
      setLoading(true);
      getOrderDetail(orderId)
        .then(setOrder)
        .catch((e) => {
          toast.error("Không thể tải chi tiết đơn hàng");
          console.error(e);
        })
        .finally(() => setLoading(false));
    } else {
      setOrder(null);
    }
  }, [orderId]);

  const handlePrint = () => {
    if (!printRef.current) return;
    
    // Create printable contents
    const printContent = printRef.current.innerHTML;
    const originalContent = document.body.innerHTML;
    const originalDisplay = document.body.style.display;

    // A hack for print without extra plugins is updating the body temporarily 
    // and printing. NextJS routers handle this fine usually if restored immediately
    // For more robust printing an iframe is better. We will use a print stylesheet approach.
    window.print();
  };

  const handleRefund = () => {
    toast.info("Tính năng hoàn trả đang được phát triển", {
      icon: "ℹ️"
    });
  };

  if (!orderId) return null;

  return (
    <>
      <Dialog open={!!orderId} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="max-w-3xl sm:max-w-3xl w-[95vw] sm:w-[500px] md:w-[800px] rounded-2xl p-0 overflow-hidden bg-white max-h-[90vh] flex flex-col gap-0 border-0" showCloseButton={false}>
          <DialogTitle className="sr-only">Chi tiết đơn hàng</DialogTitle>
          
          {loading || !order ? (
            <div className="h-64 flex flex-col justify-center items-center gap-3 text-emerald-600">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p>Đang lấy thông tin bill...</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="shrink-0 flex items-center justify-between px-6 pt-6 pb-4 bg-emerald-950 text-white relative">
                <div>
                  <div className="text-white/60 text-sm mb-1 font-mono uppercase">
                    Invoice
                  </div>
                  <h2 className="text-3xl font-bold font-mono tracking-tight">#{order.orderCode || order.id.slice(0, 8).toUpperCase()}</h2>
                </div>
                <button onClick={onClose} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Main Content (Scrollable) */}
              <div className="flex-1 overflow-y-auto min-h-0 bg-gray-50/50 p-6 flex flex-col gap-6" id="printable-bill-area">
                
                {/* Meta Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex justify-center items-center shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Thời gian tạo</p>
                      <p className="text-sm font-semibold text-gray-700">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex justify-center items-center shrink-0",
                      order.status === "COMPLETED" ? "bg-emerald-100 text-emerald-600" :
                      order.status === "PENDING" ? "bg-amber-100 text-amber-600" :
                      "bg-red-100 text-red-600"
                    )}>
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Trạng thái</p>
                      <p className={cn(
                        "text-sm font-semibold capitalize",
                        order.status === "COMPLETED" ? "text-emerald-700" :
                        order.status === "PENDING" ? "text-amber-700" :
                        "text-red-700"
                      )}>
                         {order.status === "COMPLETED" ? "Hoàn thành" : order.status === "PENDING" ? "Chờ thanh toán" : "Đã hủy"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex divide-x divide-gray-100">
                  <div className="flex-1 p-4 flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 flex justify-center items-center shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Khách hàng</p>
                      <p className="text-sm font-semibold text-gray-800">{order.customer?.name || "Khách lẻ"}</p>
                    </div>
                  </div>
                  {order.customer?.phone && (
                    <div className="flex-1 p-4 flex gap-3 items-center">
                      <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 flex justify-center items-center shrink-0">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Số điện thoại</p>
                        <p className="text-sm font-semibold text-gray-800">{order.customer.phone}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Order Items */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden pb-2">
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
                    <Ticket className="w-4 h-4 text-gray-400" />
                    <h3 className="font-semibold text-gray-700">Chi tiết sản phẩm</h3>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {order.items.map((item, idx) => (
                      <div key={item.id} className="p-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
                         <div className="w-6 text-center text-sm text-gray-300 font-medium">{idx + 1}</div>
                         <div className="flex-1 min-w-0">
                           <p className="font-semibold text-gray-800 truncate text-base">{item.product?.name || "Sản phẩm không xác định"}</p>
                           <p className="text-sm text-gray-500">
                             {formatPrice(item.unitPrice)} &times; {item.quantityBase} {item.soldUnit}
                           </p>
                         </div>
                         <div className="text-right">
                           <p className="font-bold text-gray-800">{formatPrice(item.lineTotal)}</p>
                         </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Summary Footer */}
                  <div className="mt-4 px-6 pt-4 pb-2 border-t border-dashed border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-500">Tổng tiền mặt hàng</span>
                      <span className="font-semibold text-gray-700">{formatPrice(order.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-500">Thanh toán bằng</span>
                      <span className="font-semibold text-gray-700 border border-gray-200 px-2 py-0.5 rounded text-xs bg-gray-50">
                        {order.paymentMethod === "CASH" ? "Tiền mặt" : order.paymentMethod === "BANK_TRANSFER" ? "Chuyển khoản QR" : "Khác"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-emerald-100">
                      <span className="text-lg font-bold text-gray-800">Khách đã trả</span>
                      <span className="text-2xl font-bold text-emerald-600">{formatPrice(order.paidAmount)}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Action Buttons (Footer) */}
              <div className="shrink-0 p-4 border-t border-gray-100 flex gap-3 bg-white">
                <button
                  onClick={handleRefund}
                  className="flex-1 flex items-center justify-center gap-2 h-14 rounded-xl border-2 border-red-100 text-red-600 font-bold hover:bg-red-50 hover:border-red-200 active:scale-95 transition-all"
                >
                  <Undo2 className="w-5 h-5" />
                  Hoàn Trả
                </button>
                <button
                  onClick={handlePrint}
                  className="flex-[2] flex items-center justify-center gap-2 h-14 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 active:scale-95 transition-all shadow-md shadow-emerald-600/20"
                >
                  <Printer className="w-5 h-5" />
                  In Lại Receipt
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Hidden Print Structure */}
      {order && (
        <div className="hidden print:block text-black print:absolute print:left-0 print:top-0 print:bg-white print:w-[80mm] print:m-0 print:p-2" ref={printRef}>
          {/* This part only shows up when printing, it simulates thermal receipt */}
          <style dangerouslySetInnerHTML={{__html: `
            @media print {
              @page { margin: 0; size: 80mm auto; }
              body * { visibility: hidden; }
              .print\\:block, .print\\:block * { visibility: visible; }
            }
          `}} />
          <div className="text-center pb-4 mb-4 border-b border-dashed border-black">
             <h1 className="text-xl font-bold uppercase mb-1">Agrix Store</h1>
             <p className="text-xs mb-1">Hoá Đơn Bán Lẻ (Bản Sao)</p>
             <p className="text-xs">Mã HĐ: {order.orderCode}</p>
             <p className="text-xs">Ngày: {formatDate(order.createdAt)}</p>
          </div>
          
          {order.customer && (
            <div className="text-xs mb-4 pb-4 border-b border-dashed border-black">
              KH: {order.customer.name} {order.customer.phone && `- ${order.customer.phone}`}
            </div>
          )}

          <table className="w-full text-xs text-left mb-4 break-words">
            <thead>
              <tr className="border-b border-black">
                <th className="py-1 w-2/4">Tên SP</th>
                <th className="py-1 text-center">SL</th>
                <th className="py-1 text-right">TT</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map(item => (
                <tr key={item.id}>
                  <td className="py-1.5">{item.product?.name}</td>
                  <td className="py-1.5 text-center">{item.quantityBase}</td>
                  <td className="py-1.5 text-right font-semibold">{new Intl.NumberFormat('vi-VN').format(item.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-between items-center text-sm font-bold border-t border-black pt-2 mb-4">
             <span>TỔNG CỘNG</span>
             <span>{formatPrice(order.totalAmount)}</span>
          </div>

          <div className="text-center text-xs">
             <p className="mb-1">Cảm ơn quý khách!</p>
             <p>-------------------------</p>
          </div>
        </div>
      )}
    </>
  );
}
