"use client";

import React, { createContext, useContext, useReducer, ReactNode } from "react";

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

export type CartState = {
  items: CartItem[];
  customerId: string | null;
  customerName: string | null;
  customerDebt: number;
  totalAmount: number;
};

type CartAction =
  | { type: "ADD_ITEM"; payload: Omit<CartItem, "quantity" | "lineTotal" | "quantityBase"> }
  | { type: "REMOVE_ITEM"; productId: string; soldUnit: string }
  | { type: "UPDATE_QUANTITY"; productId: string; soldUnit: string; quantity: number }
  | { type: "SET_CUSTOMER"; customerId: string; customerName: string; customerDebt: number }
  | { type: "CLEAR_CUSTOMER" }
  | { type: "CLEAR_CART" };

function calcTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.lineTotal, 0);
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingIndex = state.items.findIndex(
        (i) => i.productId === action.payload.productId && i.soldUnit === action.payload.soldUnit
      );
      let newItems: CartItem[];
      if (existingIndex >= 0) {
        newItems = state.items.map((item, idx) => {
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
        newItems = [...state.items, newItem];
      }
      return { ...state, items: newItems, totalAmount: calcTotal(newItems) };
    }

    case "UPDATE_QUANTITY": {
      const newItems = state.items
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
      return { ...state, items: newItems, totalAmount: calcTotal(newItems) };
    }

    case "REMOVE_ITEM": {
      const newItems = state.items.filter(
        (i) => !(i.productId === action.productId && i.soldUnit === action.soldUnit)
      );
      return { ...state, items: newItems, totalAmount: calcTotal(newItems) };
    }

    case "SET_CUSTOMER":
      return {
        ...state,
        customerId: action.customerId,
        customerName: action.customerName,
        customerDebt: action.customerDebt,
      };

    case "CLEAR_CUSTOMER":
      return { ...state, customerId: null, customerName: null, customerDebt: 0 };

    case "CLEAR_CART":
      return initialCartState;

    default:
      return state;
  }
}

const initialCartState: CartState = {
  items: [],
  customerId: null,
  customerName: null,
  customerDebt: 0,
  totalAmount: 0,
};

type CartContextType = {
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialCartState);
  return <CartContext.Provider value={{ state, dispatch }}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
