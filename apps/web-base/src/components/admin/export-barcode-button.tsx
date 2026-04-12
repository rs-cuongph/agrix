"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { generateProductBarcodesPdf, type ProductLabelData } from "@/lib/barcode-pdf-generator";
import { toast } from "sonner";
import { adminApiCall } from "./crud-dialog";

export function ExportBarcodeButton() {
  const [isExporting, setIsExporting] = useState(false);

  const loadBarcodeProducts = async (): Promise<ProductLabelData[]> => {
    const data = await adminApiCall("/products?isActive=true&limit=2000", "GET");
    const items = data.data || data;

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("Không có dữ liệu sản phẩm");
    }

    return items.map((product: any) => ({
      id: product.id,
      name: product.name,
      price: product.baseSellPrice || 0,
      barcode: product.barcodeEan13 || product.sku || product.id,
    }));
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      toast.loading("Đang tải dữ liệu sản phẩm...", { id: "export-pdf" });
      const printData = await loadBarcodeProducts();

      toast.loading("Đang tạo PDF mã vạch...", { id: "export-pdf" });
      await generateProductBarcodesPdf(printData);

      toast.success("Xuất file PDF thành công!", { id: "export-pdf" });
    } catch (err: any) {
      toast.error("Lỗi khi xuất PDF: " + err.message, { id: "export-pdf" });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="inline-flex items-center gap-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
    >
      {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
      Xuất Barcode (PDF)
    </button>
  );
}
