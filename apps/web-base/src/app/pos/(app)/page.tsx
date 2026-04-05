"use client";

import { useState, useCallback, useEffect } from "react";
import { CartProvider } from "@/lib/pos/cart-store";
import { PosProduct } from "@/lib/pos/pos-api";
import { PosSearchBar } from "@/components/pos/search-bar";
import { ProductGrid } from "@/components/pos/product-grid";
import { CategoryTabs } from "@/components/pos/category-tabs";
import { CartPanel } from "@/components/pos/cart-panel";

import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/pos/cart-store";
import { cn } from "@/lib/utils";

export default function PosPage() {
  const [products, setProducts] = useState<PosProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [cartOpen, setCartOpen] = useState(true);

  const handleResults = useCallback((results: PosProduct[]) => setProducts(results), []);
  const handleLoading = useCallback((l: boolean) => setLoading(l), []);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("agrix-pos-cart-toggle", { detail: cartOpen }));
    return () => {
      // Revert when unmounting
      window.dispatchEvent(new CustomEvent("agrix-pos-cart-toggle", { detail: false }));
    };
  }, [cartOpen]);

  return (
    <CartProvider>
      <div className="flex h-full overflow-hidden relative">
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
          <div className="flex-1 overflow-hidden flex flex-col bg-gray-50 relative">
            <ProductGrid products={products} loading={loading} />
            
            {/* Floating button when cart is hidden */}
            {!cartOpen && (
              <FloatingCartButton onClick={() => setCartOpen(true)} />
            )}
          </div>
        </div>

        {/* Right: Cart panel — collapsible */}
        <div 
          className={cn(
            "shrink-0 h-full transition-all duration-300 ease-in-out border-l border-gray-200 overflow-hidden",
            cartOpen ? "w-[420px]" : "w-0 border-l-0"
          )}
        >
          <div className="w-[420px] h-full flex flex-col">
            <CartPanel onClose={() => setCartOpen(false)} />
          </div>
        </div>
      </div>
    </CartProvider>
  );
}

function FloatingCartButton({ onClick }: { onClick: () => void }) {
  const { state } = useCart();
  const itemCount = state.items.length;
  
  return (
    <button 
      onClick={onClick}
      className="absolute bottom-6 right-6 bg-emerald-600 text-white rounded-full p-4 shadow-xl flex items-center justify-center hover:bg-emerald-500 hover:scale-105 active:scale-95 transition-all z-20 group"
    >
      <div className="relative">
        <ShoppingCart className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        {itemCount > 0 && (
          <span className="absolute -top-3 -right-3 bg-red-500 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
            {itemCount}
          </span>
        )}
      </div>
    </button>
  );
}
