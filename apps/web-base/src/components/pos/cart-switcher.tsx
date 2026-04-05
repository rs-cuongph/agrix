"use client";

import { useCart } from "@/lib/pos/cart-store";
import { Plus, X, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHorizontalScroll } from "@/hooks/use-horizontal-scroll";

export function CartSwitcher() {
  const { globalState, dispatch } = useCart();
  const { carts, activeCartId } = globalState;
  const scrollRef = useHorizontalScroll<HTMLDivElement>();

  const handleNewCart = () => {
    dispatch({ type: "NEW_CART" });
  };

  const handleSwitchCart = (id: string) => {
    dispatch({ type: "SWITCH_CART", payload: id });
  };

  const handleRemoveCart = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    dispatch({ type: "REMOVE_CART", payload: id });
  };

  return (
    <div 
      ref={scrollRef}
      className="flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth w-full px-2 py-2 bg-emerald-50/50"
    >
      {carts.map((cart) => {
        const isActive = activeCartId === cart.id;
        const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

        return (
          <button
            key={cart.id}
            onClick={() => handleSwitchCart(cart.id)}
            className={cn(
              "flex-shrink-0 relative group flex items-center gap-2 h-10 px-3 rounded-lg text-sm transition-all border",
              isActive
                ? "bg-white border-emerald-200 text-emerald-800 shadow-sm font-semibold"
                : "bg-transparent border-transparent text-emerald-600/70 hover:bg-emerald-100/50 hover:text-emerald-700"
            )}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{cart.name}</span>
            {itemCount > 0 && (
              <span className={cn(
                "flex items-center justify-center h-5 px-1.5 rounded-full text-[10px] font-bold ml-1 transition-colors",
                isActive ? "bg-emerald-100 text-emerald-700" : "bg-emerald-100/50 text-emerald-600/70"
              )}>
                {itemCount}
              </span>
            )}
            
            {/* Delete button (only show on hover if it's the active tab, or if there is more than 1 tab) - actually just always allow delete if > 1 or active */}
            {carts.length > 1 && (
              <div 
                onClick={(e) => handleRemoveCart(e, cart.id)}
                className="w-5 h-5 flex flex-shrink-0 items-center justify-center rounded-full hover:bg-red-100 hover:text-red-600 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity ml-1 -mr-1"
              >
                <X className="w-3 h-3" />
              </div>
            )}
          </button>
        );
      })}

      {carts.length < 5 && (
        <button
          onClick={handleNewCart}
          title="Tạo giỏ hàng mới"
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg text-emerald-600 hover:bg-emerald-100 transition-colors ml-1"
        >
          <Plus className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
