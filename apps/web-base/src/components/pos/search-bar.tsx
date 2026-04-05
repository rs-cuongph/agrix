"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, ScanBarcode } from "lucide-react";
import { toast } from "sonner";
import { useBarcodeListener } from "@/lib/pos/barcode-listener";
import { searchProducts, getProductByBarcode, PosProduct } from "@/lib/pos/pos-api";
import { cn } from "@/lib/utils";

type Props = {
  categoryId?: string;
  onResults: (products: PosProduct[]) => void;
  onLoading: (loading: boolean) => void;
};

export function PosSearchBar({ categoryId, onResults, onLoading }: Props) {
  const [query, setQuery] = useState("");
  const [scanned, setScanned] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = useCallback(async (q: string, catId?: string) => {
    onLoading(true);
    try {
      const results = await searchProducts(q, catId);
      onResults(results);
    } finally {
      onLoading(false);
    }
  }, [onResults, onLoading]);

  // Text search with debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doSearch(query, categoryId);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, categoryId, doSearch]);

  // Barcode scanner listener
  useBarcodeListener(async (barcode) => {
    setScanned(true);
    setQuery(barcode);
    onLoading(true);
    try {
      const product = await getProductByBarcode(barcode);
      if (product) {
        onResults([product]);
      } else {
        // Fallback to text search
        const results = await searchProducts(barcode, categoryId);
        onResults(results);
      }
    } finally {
      onLoading(false);
      setTimeout(() => setScanned(false), 1500);
    }
  });

  return (
    <div className="relative">
      <div
        className={cn(
          "flex items-center gap-1 bg-white rounded-2xl border-2 px-2 transition-all duration-200 focus-within:border-emerald-400 focus-within:shadow-md",
          scanned ? "border-emerald-400 shadow-lg shadow-emerald-100" : "border-gray-200"
        )}
      >
        {scanned ? (
          <ScanBarcode className="w-6 h-6 text-emerald-500 shrink-0 ml-2" />
        ) : (
          <Search className="w-6 h-6 text-gray-400 shrink-0 ml-2" />
        )}
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setScanned(false); }}
          placeholder="Tìm theo tên, mã, hoặc quét barcode..."
          className="flex-1 py-4 px-2 text-lg outline-none bg-transparent text-gray-800 placeholder:text-gray-400"
          id="pos-search"
          autoComplete="off"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setScanned(false); inputRef.current?.focus(); }}
            className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-lg mx-1 transition-colors flex items-center justify-center"
          >
            ×
          </button>
        )}
        <div className="w-px h-8 bg-gray-200 mx-1 shrink-0 hidden sm:block"></div>
        <button
          onClick={() => toast.info("Tính năng quét mã bằng Camera đang được phát triển")}
          className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-2 rounded-lg font-medium transition-colors shrink-0"
        >
          <ScanBarcode className="w-5 h-5 flex-shrink-0" />
          <span className="hidden sm:inline">Quét mã</span>
        </button>
      </div>
    </div>
  );
}
