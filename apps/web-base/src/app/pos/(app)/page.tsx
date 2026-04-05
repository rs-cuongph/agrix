"use client";

import { useState, useCallback } from "react";
import { CartProvider } from "@/lib/pos/cart-store";
import { PosProduct } from "@/lib/pos/pos-api";
import { PosSearchBar } from "@/components/pos/search-bar";
import { ProductGrid } from "@/components/pos/product-grid";
import { CategoryTabs } from "@/components/pos/category-tabs";
import { CartPanel } from "@/components/pos/cart-panel";

export default function PosPage() {
  const [products, setProducts] = useState<PosProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);

  const handleResults = useCallback((results: PosProduct[]) => setProducts(results), []);
  const handleLoading = useCallback((l: boolean) => setLoading(l), []);

  return (
    <CartProvider>
      <div className="flex h-full overflow-hidden">
        {/* Left: Products */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Search & Category bar */}
          <div className="px-4 pt-4 pb-2 flex flex-col gap-3 bg-gray-50 shrink-0">
            <PosSearchBar
              categoryId={categoryId}
              onResults={handleResults}
              onLoading={handleLoading}
            />
            <CategoryTabs selectedId={categoryId} onSelect={setCategoryId} />
          </div>

          {/* Product grid */}
          <div className="flex-1 overflow-hidden flex flex-col bg-gray-50">
            <ProductGrid products={products} loading={loading} />
          </div>
        </div>

        {/* Right: Cart panel — fixed width */}
        <div className="w-[420px] shrink-0 h-full">
          <CartPanel />
        </div>
      </div>
    </CartProvider>
  );
}
