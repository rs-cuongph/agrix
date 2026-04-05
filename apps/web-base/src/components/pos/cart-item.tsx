"use client";

import { CartItem as CartItemType, useCart } from "@/lib/pos/cart-store";
import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { Package } from "lucide-react";

function formatPrice(n: number) {
  return new Intl.NumberFormat("vi-VN").format(n) + "đ";
}

export function CartItemRow({ item }: { item: CartItemType }) {
  const { dispatch } = useCart();

  const decrease = () => {
    if (item.quantity === 1) {
      dispatch({ type: "REMOVE_ITEM", productId: item.productId, soldUnit: item.soldUnit });
    } else {
      dispatch({ type: "UPDATE_QUANTITY", productId: item.productId, soldUnit: item.soldUnit, quantity: item.quantity - 1 });
    }
  };

  const increase = () => {
    dispatch({ type: "UPDATE_QUANTITY", productId: item.productId, soldUnit: item.soldUnit, quantity: item.quantity + 1 });
  };

  const remove = () => {
    dispatch({ type: "REMOVE_ITEM", productId: item.productId, soldUnit: item.soldUnit });
  };

  return (
    <div className="flex items-start gap-3 py-4 border-b border-gray-100 last:border-0">
      {/* Thumbnail */}
      <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
        {item.imageUrl ? (
          <Image src={item.imageUrl} alt={item.productName} width={56} height={56} className="object-cover w-full h-full rounded-xl" />
        ) : (
          <Package className="w-6 h-6 text-gray-300" />
        )}
      </div>

      {/* Main Container */}
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        {/* Top Row: Name and Trash */}
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-gray-800 font-semibold text-base leading-tight truncate">{item.productName}</p>
            <p className="text-gray-400 text-sm mt-0.5">{item.soldUnit} · {formatPrice(item.unitPrice)}</p>
          </div>
          <button onClick={remove} className="p-1 -mr-1 text-gray-300 hover:text-red-500 transition-colors shrink-0">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {/* Bottom Row: Controls and Total */}
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={decrease}
              className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all flex items-center justify-center shrink-0"
            >
              {item.quantity === 1 ? (
                <Trash2 className="w-4 h-4 text-red-500" />
              ) : (
                <Minus className="w-4 h-4 text-gray-600" />
              )}
            </button>
            <span className="w-8 text-center text-gray-800 font-bold text-base">{item.quantity}</span>
            <button
              onClick={increase}
              className="w-10 h-10 rounded-xl bg-emerald-100 hover:bg-emerald-200 active:scale-95 transition-all flex items-center justify-center shrink-0"
            >
              <Plus className="w-4 h-4 text-emerald-700" />
            </button>
          </div>
          
          <div className="text-right shrink-0">
            <p className="text-gray-800 font-bold text-lg">{formatPrice(item.lineTotal)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
