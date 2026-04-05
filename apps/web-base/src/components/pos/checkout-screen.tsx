"use client";

import { useCart } from "@/lib/pos/cart-store";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import { PaymentCash } from "./payment-cash";
import { PaymentQR } from "./payment-qr";
import { SuccessScreen } from "./success-screen";
import { submitOrder, CreateOrderPayload } from "@/lib/pos/pos-api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Banknote, QrCode, X } from "lucide-react";

type PaymentMethod = "CASH" | "BANK_TRANSFER";

function formatPrice(n: number) {
  return new Intl.NumberFormat("vi-VN").format(n) + "đ";
}

export function CheckoutScreen({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, dispatch } = useCart();
  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [paidAmount, setPaidAmount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const changeAmount = paidAmount - state.totalAmount;
  const canConfirm = method === "BANK_TRANSFER" || paidAmount >= state.totalAmount;

  const handleConfirm = async () => {
    if (method === "CASH" && paidAmount < state.totalAmount && !state.customerId) {
      toast.error("Vui lòng chọn khách hàng để ghi nợ khi thanh toán thiếu");
      return;
    }

    setSubmitting(true);
    try {
      const idempotencyKey = crypto.randomUUID();
      const payload: CreateOrderPayload = {
        customerId: state.customerId || undefined,
        totalAmount: state.totalAmount,
        paidAmount: method === "BANK_TRANSFER" ? state.totalAmount : paidAmount,
        paymentMethod: method,
        idempotencyKey,
        items: state.items.map((item) => ({
          productId: item.productId,
          quantityBase: item.quantityBase,
          soldUnit: item.soldUnit,
          unitPrice: item.unitPrice,
          lineTotal: item.lineTotal,
        })),
      };
      await submitOrder(payload);
      setSuccess(true);
    } catch (err) {
      toast.error("Lỗi khi tạo đơn hàng. Vui lòng thử lại.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuccessDone = () => {
    dispatch({ type: "CLEAR_CART" });
    setSuccess(false);
    setPaidAmount(0);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v: boolean) => { if (!v && !submitting) onClose(); }}>
      <DialogContent className="max-w-2xl sm:max-w-2xl md:max-w-[700px] w-[90vw] md:w-[700px] rounded-2xl p-0 overflow-hidden bg-white max-h-[calc(100vh-20px)] flex flex-col gap-0">
        {success ? (
          <SuccessScreen change={changeAmount > 0 ? changeAmount : 0} onDone={handleSuccessDone} />
        ) : (
          <>
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between px-6 pt-6 pb-4 bg-emerald-950 text-white">
              <div>
                <p className="text-white/60 text-sm mb-1">Tổng thanh toán</p>
                <p className="text-4xl font-bold">{formatPrice(state.totalAmount)}</p>
              </div>
              <button onClick={onClose} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Method tabs */}
            <div className="shrink-0 flex border-b border-gray-100">
              {(["CASH", "BANK_TRANSFER"] as PaymentMethod[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMethod(m)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-3 py-5 text-lg font-semibold transition-colors border-b-2",
                    method === m ? "border-emerald-500 text-emerald-600" : "border-transparent text-gray-400 hover:text-gray-600"
                  )}
                >
                  {m === "CASH" ? <Banknote className="w-5 h-5" /> : <QrCode className="w-5 h-5" />}
                  {m === "CASH" ? "Tiền mặt" : "Chuyển khoản"}
                </button>
              ))}
            </div>

            {/* Payment panel */}
            <div className="p-4 flex-1 overflow-y-auto min-h-0">
              {method === "CASH" ? (
                <PaymentCash
                  total={state.totalAmount}
                  paid={paidAmount}
                  onChange={setPaidAmount}
                />
              ) : (
                <PaymentQR total={state.totalAmount} />
              )}
            </div>

            {/* Confirm */}
            <div className="shrink-0 px-4 pb-4">
              <button
                onClick={handleConfirm}
                disabled={!canConfirm || submitting}
                className={cn(
                  "w-full h-20 rounded-2xl text-2xl font-bold text-white transition-all duration-200",
                  canConfirm && !submitting
                    ? "bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98]"
                    : "bg-gray-200 cursor-not-allowed"
                )}
              >
                {submitting ? "Đang xử lý..." : "Xác nhận thanh toán"}
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
