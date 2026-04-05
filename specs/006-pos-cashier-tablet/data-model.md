# Data Model: POS Cashier Tablet App (Updated 2026-04-05)

## Overview

This document defines the backend schema changes and client-side TypeScript interfaces for the POS system. Changes from the Session 2026-04-05 clarification include: `orderCode`, `status` on Order entity, bank config on StoreSettings, and webhook payload structures.

## Backend Entity Changes

### Order (Modified)

| Column | Type | Notes |
|--------|------|-------|
| `order_code` | VARCHAR(10) UNIQUE NOT NULL | Auto-generated: `DH` + 6 random digits. Used in VietQR memo, receipts, search. |
| `status` | ENUM('PENDING','COMPLETED','CANCELLED') DEFAULT 'COMPLETED' | CASH → COMPLETED immediately. BANK_TRANSFER → PENDING until webhook confirms. |

### StoreSettings (Modified)

| Column | Type | Notes |
|--------|------|-------|
| `bank_bin` | VARCHAR(20) NULL | Mã BIN ngân hàng VietQR (VD: 970422 = MBBank) |
| `bank_account_no` | VARCHAR(30) NULL | Số tài khoản ngân hàng |
| `bank_account_name` | VARCHAR(100) NULL | Tên chủ tài khoản |

### User (No changes needed)

The `posPin`, `pinFailedAttempts`, and `pinLockedUntil` columns already exist. Only need backend API + Admin UI for management.

## Existing Backend Entities (Reused, no changes)

| Entity | Table | Key Fields |
|--------|-------|------------|
| Product | products | id, sku, name, baseSellPrice, currentStockBase, baseUnit, barcodeEan13, imageUrls, isActive |
| Category | categories | id, name, parentId |
| ProductUnitConversion | product_unit_conversions | id, unitName, conversionFactor, sellPrice |
| OrderItem | order_items | id, orderId, productId, quantityBase, soldUnit, unitPrice, lineTotal |
| Customer | customers | id, name, phone, address, outstandingDebt |

## Client-Side Interfaces

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

// ---- Order with orderCode (returned from API) ----

interface PosOrder {
  id: string;
  orderCode: string;           // NEW: "DH839124"
  status: "PENDING" | "COMPLETED" | "CANCELLED";  // NEW
  customerId: string | null;
  totalAmount: number;
  paidAmount: number;
  paymentMethod: string;
  createdAt: string;
  items: Array<{
    productId: string;
    productName: string;
    quantityBase: number;
    soldUnit: string;
    unitPrice: number;
    lineTotal: number;
  }>;
}

// ---- Webhook Payload (sent by Google App Script → Backend) ----

interface BankTransferWebhookPayload {
  orderCode: string;          // Required: "DH839124"
  amountPaid: number;         // Required: 120000
  transactionRef?: string;    // Optional: "FT26040512345"
  rawContent?: string;        // Optional: "NGUYEN VAN A TT DH839124"
  paymentDate?: string;       // Optional: ISO 8601
}
```

## Relationships

```
CartState 1──* CartItem (in-memory)
CartState *──1 Customer (optional, via API)
PendingOrder → maps to → Order + OrderItem[] (backend, on sync)
PosProduct → maps from → Product + ProductUnitConversion[] (backend)
Order.orderCode → referenced by → BankTransferWebhookPayload.orderCode
StoreSettings.bankBin/bankAccountNo → used by → VietQR generation (client)
```
