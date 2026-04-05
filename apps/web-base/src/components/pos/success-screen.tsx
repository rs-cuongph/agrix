"use client";

import { useEffect } from "react";
import { CheckCircle2, Printer } from "lucide-react";
import { cn } from "@/lib/utils";
import { printReceipt, PrintJobData } from "./receipt-printer";

function formatPrice(n: number) {
  return new Intl.NumberFormat("vi-VN").format(n) + "đ";
}

type Props = {
  change: number;
  onDone: () => void;
  printData?: PrintJobData;
};

export function SuccessScreen({ change, onDone, printData }: Props) {
  // Auto-dismiss after 4 seconds only if no printData available to allow them to manually print
  useEffect(() => {
    if (!printData) {
      const t = setTimeout(onDone, 4000);
      return () => clearTimeout(t);
    }
  }, [onDone, printData]);

  return (
    <div className="flex flex-col items-center justify-center py-12 px-8 text-center">
      <div className={cn(
        "w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mb-6",
        "animate-[scale-in_0.3s_ease-out]"
      )}>
        <CheckCircle2 className="w-14 h-14 text-emerald-500" strokeWidth={1.5} />
      </div>

      <h2 className="text-3xl font-bold text-gray-800 mb-2">Đơn hàng thành công!</h2>
      <p className="text-gray-400 text-base mb-6">Giao dịch đã được lưu</p>

      {change > 0 && (
        <div className="bg-emerald-50 rounded-2xl px-8 py-5 mb-6 w-full">
          <p className="text-gray-500 text-base mb-1">Tiền thừa trả khách</p>
          <p className="text-emerald-600 font-bold text-4xl">{formatPrice(change)}</p>
        </div>
      )}

      <div className="w-full flex justify-between items-center bg-gray-50 p-2 rounded-2xl gap-2 mt-2">
        <button
          onClick={onDone}
          className="flex-1 h-14 rounded-xl bg-gray-200 text-gray-700 text-lg font-bold hover:bg-gray-300 active:scale-[0.98] transition-all"
        >
          Đơn mới
        </button>
        {printData && (
          <button
            onClick={() => printReceipt(printData)}
            className="flex-1 h-14 rounded-xl bg-emerald-500 text-white text-lg font-bold hover:bg-emerald-400 active:scale-[0.98] transition-all flex justify-center items-center gap-2"
          >
            <Printer className="w-5 h-5" /> In hóa đơn
          </button>
        )}
      </div>
      {!printData && <p className="text-gray-300 text-sm mt-3">Tự động chuyển sau 4 giây</p>}
    </div>
  );
}
