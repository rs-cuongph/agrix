"use client";

import React, { createContext, useContext, useReducer, ReactNode, useEffect, useState } from "react";

export type CartItem = {
  productId: string;
  productName: string;
  imageUrl: string | null;
  soldUnit: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  conversionFactor: number;
  quantityBase: number;
  maxStockBase: number;
};

// Represents a single cart tab
export type CartData = {
  id: string;
  name: string;
  items: CartItem[];
  customerId: string | null;
  customerName: string | null;
  customerDebt: number;
  totalAmount: number;
};

// The global root state holding multiple carts
export type GlobalCartState = {
  carts: CartData[];
  activeCartId: string;
};

type CartAction =
  | { type: "NEW_CART" }
  | { type: "SWITCH_CART"; payload: string }
  | { type: "REMOVE_CART"; payload: string }
  | { type: "ADD_ITEM"; payload: Omit<CartItem, "quantity" | "lineTotal" | "quantityBase"> }
  | { type: "REMOVE_ITEM"; productId: string; soldUnit: string }
  | { type: "UPDATE_QUANTITY"; productId: string; soldUnit: string; quantity: number }
  | { type: "SET_CUSTOMER"; customerId: string; customerName: string; customerDebt: number }
  | { type: "CLEAR_CUSTOMER" }
  | { type: "CLEAR_CART" }
  | { type: "INIT_STATE"; payload: GlobalCartState };

function calcTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.lineTotal, 0);
}

function createEmptyCart(index: number): CartData {
  return {
    id: Date.now().toString() + Math.random().toString(36).substring(7),
    name: `Giỏ hàng ${index + 1}`,
    items: [],
    customerId: null,
    customerName: null,
    customerDebt: 0,
    totalAmount: 0,
  };
}

const defaultCart = createEmptyCart(0);
defaultCart.name = "Giỏ hàng 1"; 

const initialGlobalState: GlobalCartState = {
  carts: [defaultCart],
  activeCartId: defaultCart.id,
};

function cartReducer(state: GlobalCartState, action: CartAction): GlobalCartState {
  switch (action.type) {
    case "INIT_STATE": {
      return action.payload;
    }
    case "NEW_CART": {
      if (state.carts.length >= 5) return state; // Hard limit 5 carts
      const nextIndex = state.carts.length;
      const newCart = createEmptyCart(nextIndex);
      return {
        ...state,
        carts: [...state.carts, newCart],
        activeCartId: newCart.id,
      };
    }
    case "SWITCH_CART": {
      if (!state.carts.find((c) => c.id === action.payload)) return state;
      return { ...state, activeCartId: action.payload };
    }
    case "REMOVE_CART": {
      const idx = state.carts.findIndex((c) => c.id === action.payload);
      if (idx === -1) return state;

      let newCarts = state.carts.filter((c) => c.id !== action.payload);
      let newActiveId = state.activeCartId;

      if (newCarts.length === 0) {
        const freshCart = createEmptyCart(0);
        freshCart.name = "Giỏ hàng 1";
        newCarts = [freshCart];
        newActiveId = freshCart.id;
      } else if (state.activeCartId === action.payload) {
        // Find next nearest active cart
        const nextIdx = Math.max(0, idx - 1);
        newActiveId = newCarts[nextIdx].id;
      }

      // Re-number carts purely for display logic
      newCarts = newCarts.map((c, i) => ({ ...c, name: `Giỏ hàng ${i + 1}` }));

      return { ...state, carts: newCarts, activeCartId: newActiveId };
    }

    // Proxy actions to the currently active cart
    default: {
      const activeIdx = state.carts.findIndex((c) => c.id === state.activeCartId);
      if (activeIdx === -1) return state;

      const activeCart = state.carts[activeIdx];
      let newActiveCart = { ...activeCart };

      switch (action.type) {
        case "ADD_ITEM": {
          const existingIndex = activeCart.items.findIndex(
            (i) => i.productId === action.payload.productId && i.soldUnit === action.payload.soldUnit
          );
          let newItems: CartItem[];
          if (existingIndex >= 0) {
            newItems = activeCart.items.map((item, idx) => {
              if (idx !== existingIndex) return item;
              const newQty = item.quantity + 1;
              return {
                ...item,
                quantity: newQty,
                lineTotal: newQty * item.unitPrice,
                quantityBase: newQty * item.conversionFactor,
              };
            });
          } else {
            const newItem: CartItem = {
              ...action.payload,
              quantity: 1,
              lineTotal: action.payload.unitPrice,
              quantityBase: action.payload.conversionFactor,
            };
            newItems = [...activeCart.items, newItem];
          }
          newActiveCart = { ...activeCart, items: newItems, totalAmount: calcTotal(newItems) };
          break;
        }

        case "UPDATE_QUANTITY": {
          const newItems = activeCart.items
            .map((item) => {
              if (item.productId !== action.productId || item.soldUnit !== action.soldUnit) return item;
              const newQty = Math.max(0, action.quantity);
              return {
                ...item,
                quantity: newQty,
                lineTotal: newQty * item.unitPrice,
                quantityBase: newQty * item.conversionFactor,
              };
            })
            .filter((item) => item.quantity > 0);
          newActiveCart = { ...activeCart, items: newItems, totalAmount: calcTotal(newItems) };
          break;
        }

        case "REMOVE_ITEM": {
          const newItems = activeCart.items.filter(
            (i) => !(i.productId === action.productId && i.soldUnit === action.soldUnit)
          );
          newActiveCart = { ...activeCart, items: newItems, totalAmount: calcTotal(newItems) };
          break;
        }

        case "SET_CUSTOMER":
          newActiveCart = {
            ...activeCart,
            customerId: action.customerId,
            customerName: action.customerName,
            customerDebt: action.customerDebt,
          };
          break;

        case "CLEAR_CUSTOMER":
          newActiveCart = { ...activeCart, customerId: null, customerName: null, customerDebt: 0 };
          break;

        case "CLEAR_CART":
          newActiveCart = { ...activeCart, items: [], customerId: null, customerName: null, customerDebt: 0, totalAmount: 0 };
          break;
      }

      const newCarts = [...state.carts];
      newCarts[activeIdx] = newActiveCart;
      return { ...state, carts: newCarts };
    }
  }
}

type CartContextType = {
  state: CartData; // Legacy reference points to activeCart purely for backward compatibility
  activeCart: CartData;
  globalState: GlobalCartState;
  dispatch: React.Dispatch<CartAction>;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [globalState, dispatch] = useReducer(cartReducer, initialGlobalState);
  const [mounted, setMounted] = useState(false);

  // Persistence: Load from F5
  useEffect(() => {
    const saved = localStorage.getItem("agrix_pos_carts");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.carts && parsed.activeCartId) {
          dispatch({ type: "INIT_STATE", payload: parsed });
        }
      } catch (e) {
        console.error("Failed to parse cart state from localStorage", e);
      }
    }
    setMounted(true);
  }, []);

  // Persistence: Save on change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("agrix_pos_carts", JSON.stringify(globalState));
    }
  }, [globalState, mounted]);

  // Exclude hydration mismatches
  if (!mounted) return null;

  const activeCart = globalState.carts.find((c) => c.id === globalState.activeCartId) || globalState.carts[0];

  return (
    <CartContext.Provider value={{ state: activeCart, activeCart, globalState, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
