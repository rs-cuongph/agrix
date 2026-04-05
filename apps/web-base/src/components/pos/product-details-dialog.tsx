"use client";

import { PosProduct } from "@/lib/pos/pos-api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { Package } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import DOMPurify from "isomorphic-dompurify";

type Props = {
  product: PosProduct | null;
  open: boolean;
  onClose: () => void;
};

export function ProductDetailsDialog({ product, open, onClose }: Props) {
  if (!product) return null;

  const imageUrl = product.imageUrls?.[0] ?? null;

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl border-none bg-white">
        <DialogHeader className="p-5 pb-0">
          <DialogTitle className="text-xl font-bold text-gray-800 leading-tight">
            Chi tiết sản phẩm
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="p-5 flex flex-col gap-6">
            <div className="flex gap-4 items-start">
              <div className="relative w-24 h-24 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={product.name}
                    fill
                    className="object-contain p-2"
                    sizes="96px"
                  />
                ) : (
                  <Package className="w-8 h-8 text-gray-300" />
                )}
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-semibold text-lg text-gray-800 leading-snug">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-500">Mã SKU: <span className="font-medium text-gray-700">{product.sku}</span></p>
                {product.barcodeEan13 && (
                  <p className="text-sm text-gray-500">Mã vạch: <span className="font-medium text-gray-700">{product.barcodeEan13}</span></p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100/50">
                <p className="text-xs text-emerald-600 mb-1 font-medium">Giá bán cơ sở</p>
                <p className="font-bold text-emerald-800 text-lg">
                  {new Intl.NumberFormat("vi-VN").format(product.baseSellPrice)}đ
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-xs text-gray-500 mb-1 font-medium">Đơn vị cơ sở</p>
                <p className="font-bold text-gray-800 text-lg">
                  {product.baseUnit}
                </p>
              </div>
            </div>

            <div className="space-y-4 text-sm mt-2">
              <div>
                <h4 className="font-bold text-gray-800 mb-1">Thông tin bổ sung</h4>
                {product.description ? (
                  <div
                    className="text-gray-600 leading-relaxed text-sm [&>p]:mb-1 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>h2]:text-base [&>h2]:font-bold [&>h2]:mt-2 [&>h3]:font-semibold [&>h3]:mt-1 [&_a]:text-emerald-600"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.description) }}
                  />
                ) : (
                  <p className="text-gray-500 italic text-sm">
                    Chưa có thông tin bổ sung.
                  </p>
                )}
              </div>

              {product.units && product.units.length > 0 && (
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Quy đổi đơn vị</h4>
                  <div className="flex flex-col gap-2">
                    {product.units.map(u => (
                      <div key={u.id} className="flex justify-between border-b border-gray-100 pb-2 text-gray-600">
                        <span>1 {u.unitName}</span>
                        <span className="font-medium">= {u.conversionFactor} {product.baseUnit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
