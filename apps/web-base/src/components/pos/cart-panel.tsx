"use client";

import { useState } from "react";
import { useCart } from "@/lib/pos/cart-store";
import { CartItemRow } from "./cart-item";
import { CustomerPicker } from "./customer-picker";
import { CheckoutScreen } from "./checkout-screen";

import { ShoppingCart, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

function formatPrice(n: number) {
  return new Intl.NumberFormat("vi-VN").format(n) + "đ";
}

export function CartPanel() {
  const { state } = useCart();
  const [customerPickerOpen, setCustomerPickerOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const isEmpty = state.items.length === 0;

  return (
    <>
      <div className="flex flex-col h-full bg-white border-l border-gray-100">
        {/* Customer Area */}
        <button
          onClick={() => setCustomerPickerOpen(true)}
          className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left"
        >
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
            state.customerId ? "bg-emerald-100" : "bg-gray-100"
          )}>
            <UserRound className={cn("w-5 h-5", state.customerId ? "text-emerald-600" : "text-gray-400")} />
          </div>
          <div className="flex-1 min-w-0">
            {state.customerId ? (
              <>
                <p className="text-gray-800 font-semibold text-base truncate">{state.customerName}</p>
                {state.customerDebt > 0 && (
                  <p className="text-red-500 text-sm">Nợ: {formatPrice(state.customerDebt)}</p>
                )}
              </>
            ) : (
              <p className="text-gray-400 text-base">Chọn khách hàng (tùy chọn)</p>
            )}
          </div>
        </button>

        {/* Cart Items */}
        {isEmpty ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-300 gap-4 px-6">
            <ShoppingCart className="w-16 h-16" />
            <p className="text-center text-lg font-medium text-gray-400">Chạm hoặc quét sản phẩm để bắt đầu</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-4 min-h-0">
            <div className="py-2">
              {state.items.map((item) => (
                <CartItemRow key={`${item.productId}-${item.soldUnit}`} item={item} />
              ))}
            </div>
          </div>
        )}

        {/* Total + Checkout */}
        <div className="border-t border-gray-100 px-5 py-4 bg-white relative">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 text-lg">Tổng cộng</span>
            <span className="text-gray-800 font-bold text-3xl">{formatPrice(state.totalAmount)}</span>
          </div>
          <button
            onClick={() => setCheckoutOpen(true)}
            disabled={isEmpty}
            className={cn(
              "w-full h-16 rounded-2xl text-xl font-bold text-white transition-all duration-200",
              isEmpty
                ? "bg-gray-200 cursor-not-allowed"
                : "bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] shadow-lg shadow-emerald-200"
            )}
          >
            Thanh toán
          </button>
        </div>
      </div>

      <CustomerPicker open={customerPickerOpen} onClose={() => setCustomerPickerOpen(false)} />
      <CheckoutScreen open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
    </>
  );
}
