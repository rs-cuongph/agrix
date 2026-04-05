# Data Model: POS Cashier Tablet App

## Overview

No new database entities are needed. POS reuses all existing backend entities. This document defines the **client-side TypeScript interfaces** used by the POS frontend.

## Existing Backend Entities (Reused)

| Entity | Table | Key Fields |
|--------|-------|------------|
| Product | products | id, sku, name, baseSellPrice, currentStockBase, baseUnit, barcodeEan13, imageUrls, isActive |
| Category | categories | id, name, parentId |
| ProductUnitConversion | product_unit_conversions | id, unitName, conversionFactor, sellPrice |
| Order | orders | id, customerId, totalAmount, paidAmount, paymentMethod, syncStatus, idempotencyKey, createdBy |
| OrderItem | order_items | id, orderId, productId, quantityBase, soldUnit, unitPrice, lineTotal |
| Customer | customers | id, name, phone, address, outstandingDebt |
| StoreSettings | store_settings | (bank info for VietQR) |

## Client-Side Interfaces (New)

```typescript
// ---- Cart State (ephemeral, in-memory) ----

interface CartItem {
  productId: string;
  productName: string;
  imageUrl: string | null;
  soldUnit: string;           // "Chai", "Thùng", etc.
  unitPrice: number;          // Price per soldUnit
  quantity: number;            // Number of soldUnit
  lineTotal: number;           // unitPrice * quantity
  conversionFactor: number;    // How many baseUnits per soldUnit
  quantityBase: number;        // quantity * conversionFactor (for stock deduction)
  maxStockBase: number;        // Current stock in base units (for validation)
}

interface CartState {
  items: CartItem[];
  customerId: string | null;
  customerName: string | null;
  customerDebt: number;
  totalAmount: number;         // Sum of all lineTotal
}

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; productId: string; soldUnit: string }
  | { type: "UPDATE_QUANTITY"; productId: string; soldUnit: string; quantity: number }
  | { type: "SET_CUSTOMER"; customerId: string; name: string; debt: number }
  | { type: "CLEAR_CUSTOMER" }
  | { type: "CLEAR_CART" };

// ---- Offline Order (IndexedDB) ----

interface PendingOrder {
  id: string;                  // Client-generated UUID
  idempotencyKey: string;      // To prevent duplicates on sync
  items: Array<{
    productId: string;
    quantityBase: number;
    soldUnit: string;
    unitPrice: number;
    lineTotal: number;
  }>;
  customerId: string | null;
  totalAmount: number;
  paidAmount: number;
  paymentMethod: "CASH" | "BANK_TRANSFER" | "MIXED";
  createdAt: string;           // ISO timestamp
  syncStatus: "PENDING" | "SYNCED" | "FAILED";
  syncError?: string;
}

// ---- Product Search Result ----

interface PosProduct {
  id: string;
  sku: string;
  name: string;
  baseSellPrice: number;
  baseUnit: string;
  currentStockBase: number;
  imageUrls: string[] | null;
  barcodeEan13: string | null;
  categoryId: string;
  units: Array<{
    id: string;
    unitName: string;
    conversionFactor: number;
    sellPrice: number | null;
  }>;
}
```

## Relationships

```
CartState 1──* CartItem (in-memory)
CartState *──1 Customer (optional, via API)
PendingOrder → maps to → Order + OrderItem[] (backend, on sync)
PosProduct → maps from → Product + ProductUnitConversion[] (backend)
```
