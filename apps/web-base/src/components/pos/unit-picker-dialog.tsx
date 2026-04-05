"use client";

import { PosProduct } from "@/lib/pos/pos-api";
import { useCart } from "@/lib/pos/cart-store";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

function formatPrice(n: number) {
  return new Intl.NumberFormat("vi-VN").format(n) + "đ";
}

type Unit = {
  unitName: string;
  conversionFactor: number;
  sellPrice: number | null;
};

type Props = {
  product: PosProduct | null;
  open: boolean;
  onClose: () => void;
};

export function UnitPickerDialog({ product, open, onClose }: Props) {
  const { dispatch } = useCart();

  if (!product) return null;

  // Build list: base unit + all converted units (and deduplicate by unitName)
  const rawUnits: Unit[] = [
    { unitName: product.baseUnit, conversionFactor: 1, sellPrice: product.baseSellPrice },
    ...(product.units || []).map((u) => ({
      unitName: u.unitName,
      conversionFactor: u.conversionFactor,
      sellPrice: u.sellPrice ?? product.baseSellPrice * u.conversionFactor,
    })),
  ];
  
  const allUnits = Array.from(new Map(rawUnits.map(item => [item.unitName, item])).values());

  const handleSelect = (unit: Unit) => {
    dispatch({
      type: "ADD_ITEM",
      payload: {
        productId: product.id,
        productName: product.name,
        imageUrl: product.imageUrls?.[0] ?? null,
        soldUnit: unit.unitName,
        unitPrice: unit.sellPrice!,
        conversionFactor: unit.conversionFactor,
        maxStockBase: product.currentStockBase,
      },
    });
    toast.success(`Đã thêm: ${product.name} (${unit.unitName})`);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v: boolean) => !v && onClose()}>
      <DialogContent className="max-w-sm rounded-2xl p-0 overflow-hidden bg-white">
        <DialogHeader className="px-6 pt-6 pb-4 bg-emerald-950 text-white">
          <DialogTitle className="text-xl font-bold">Chọn đơn vị bán</DialogTitle>
          <p className="text-white/60 text-sm mt-1 truncate">{product.name}</p>
        </DialogHeader>
        <div className="p-4 space-y-3">
          {allUnits.map((unit) => (
            <button
              key={unit.unitName}
              onClick={() => handleSelect(unit)}
              className={cn(
                "w-full flex items-center justify-between px-5 py-4 rounded-xl border-2 border-gray-100",
                "hover:border-emerald-400 hover:bg-emerald-50 active:scale-[0.98] transition-all duration-150",
                "min-h-[64px]"
              )}
            >
              <span className="text-gray-800 font-semibold text-lg">{unit.unitName}</span>
              <span className="text-emerald-600 font-bold text-xl">{formatPrice(unit.sellPrice!)}</span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
