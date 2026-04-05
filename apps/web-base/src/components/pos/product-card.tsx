"use client";

import Image from "next/image";
import { PosProduct } from "@/lib/pos/pos-api";
import { cn } from "@/lib/utils";
import { Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";

function formatPrice(n: number) {
  return new Intl.NumberFormat("vi-VN").format(n) + "đ";
}

type Props = {
  product: PosProduct;
  onClick: (product: PosProduct) => void;
};

export function ProductCard({ product, onClick }: Props) {
  const outOfStock = product.currentStockBase <= 0;
  const imageUrl = product.imageUrls?.[0] ?? null;

  return (
    <button
      onClick={() => !outOfStock && onClick(product)}
      disabled={outOfStock}
      className={cn(
        "relative flex flex-col bg-white rounded-2xl border-2 overflow-hidden transition-all duration-200 text-left w-full",
        "min-h-[180px] active:scale-[0.97]",
        outOfStock
          ? "border-gray-100 opacity-60 cursor-not-allowed"
          : "border-gray-100 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-100 cursor-pointer"
      )}
    >
      {/* Image area */}
      <div className="relative h-28 bg-gray-50 flex items-center justify-center overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <Package className="w-10 h-10 text-gray-300" />
        )}
        {outOfStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <Badge className="bg-red-100 text-red-600 border-red-200 text-sm font-semibold">
              Hết hàng
            </Badge>
          </div>
        )}
      </div>

      {/* Info area */}
      <div className="p-3 flex flex-col gap-1 flex-1">
        <p className="text-gray-800 font-semibold text-base leading-tight line-clamp-2">
          {product.name}
        </p>
        <p className="text-emerald-600 font-bold text-lg mt-auto">
          {formatPrice(product.baseSellPrice)}
        </p>
        {product.units && product.units.length > 0 && (
          <p className="text-xs text-gray-400">{product.units.length + 1} đơn vị</p>
        )}
      </div>
    </button>
  );
}
