"use client";

import { useState } from "react";
import { PosProduct } from "@/lib/pos/pos-api";
import { useCart } from "@/lib/pos/cart-store";
import { toast } from "sonner";
import { ProductCard } from "./product-card";
import { UnitPickerDialog } from "./unit-picker-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";

type Props = {
  products: PosProduct[];
  loading: boolean;
};

export function ProductGrid({ products, loading }: Props) {
  const { dispatch } = useCart();
  const [unitPickerProduct, setUnitPickerProduct] = useState<PosProduct | null>(null);

  const handleProductTap = (product: PosProduct) => {
    const hasMultipleUnits = product.units && product.units.length > 0;

    if (hasMultipleUnits) {
      setUnitPickerProduct(product);
    } else {
      // Single unit: add directly
      dispatch({
        type: "ADD_ITEM",
        payload: {
          productId: product.id,
          productName: product.name,
          imageUrl: product.imageUrls?.[0] ?? null,
          soldUnit: product.baseUnit,
          unitPrice: product.baseSellPrice,
          conversionFactor: 1,
          maxStockBase: product.currentStockBase,
        },
      });
      toast.success(`Đã thêm: ${product.name}`);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3 py-16">
        <p className="text-xl font-medium">Không tìm thấy sản phẩm</p>
        <p className="text-base">Thử từ khóa khác hoặc quét barcode</p>
      </div>
    );
  }

  return (
    <>
      <ScrollArea className="flex-1 h-full">
        <div className="grid grid-cols-3 xl:grid-cols-4 gap-4 p-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onClick={handleProductTap} />
          ))}
        </div>
      </ScrollArea>

      <UnitPickerDialog
        product={unitPickerProduct}
        open={!!unitPickerProduct}
        onClose={() => setUnitPickerProduct(null)}
      />
    </>
  );
}
