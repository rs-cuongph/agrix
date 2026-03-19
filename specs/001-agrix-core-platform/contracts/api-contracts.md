# API Contracts — Agrix Core Platform

**Base URL**: `http://<host>:3000/api/v1`
**Auth**: Bearer JWT Token (except public blog endpoints)

## Authentication

### POST /auth/login

Request:
```json
{
  "username": "string",
  "password": "string"
}
```

Response (200):
```json
{
  "accessToken": "string (JWT)",
  "user": {
    "id": "uuid",
    "username": "string",
    "fullName": "string",
    "role": "ADMIN | CASHIER | INVENTORY"
  }
}
```

---

## Products

### GET /products

Query Params: `?search=<text>&category=<id>&page=1&limit=20`

Response (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "sku": "string",
      "name": "string",
      "category": { "id": "uuid", "name": "string" },
      "baseUnit": "string",
      "baseSellPrice": 50000,
      "currentStockBase": 400,
      "expirationDate": "2027-01-15",
      "imageUrl": "string | null",
      "barcodeEan13": "string | null",
      "units": [
        { "unitName": "Thùng", "conversionFactor": 40 }
      ]
    }
  ],
  "meta": { "total": 100, "page": 1, "limit": 20 }
}
```

### GET /products/:id

Response (200): Single product with full detail (includes `usageInstructions`, `description`).

### POST /products (Role: ADMIN, INVENTORY)

Request:
```json
{
  "sku": "string",
  "name": "string",
  "categoryId": "uuid",
  "baseUnit": "string",
  "baseCostPrice": 30000,
  "baseSellPrice": 50000,
  "minStockThreshold": 20,
  "expirationDate": "2027-01-15",
  "usageInstructions": "string",
  "description": "string",
  "barcodeEan13": "string | null",
  "units": [
    { "unitName": "Thùng", "conversionFactor": 40 }
  ]
}
```

### GET /products/lookup?barcode=<ean13>&qr=<internal_qr>

Fast product lookup by barcode or QR code. Returns single product or 404.

---

## Stock / Inventory

### POST /stock/import (Role: ADMIN, INVENTORY)

```json
{
  "productId": "uuid",
  "quantityBase": 400,
  "batchNumber": "LOT-2026-03",
  "note": "Nhập 10 thùng thuốc trừ sâu X"
}
```

### GET /stock/alerts

Returns products below `minStockThreshold` and within `expirationAlertDays`.

---

## Orders / POS

### POST /orders (Role: ADMIN, CASHIER)

```json
{
  "id": "uuid (client-generated)",
  "idempotencyKey": "uuid",
  "customerId": "uuid | null",
  "paymentMethod": "CASH | BANK_TRANSFER | MIXED",
  "paidAmount": 150000,
  "items": [
    {
      "productId": "uuid",
      "quantityBase": 3,
      "soldUnit": "Chai",
      "unitPrice": 50000
    }
  ]
}
```

### GET /orders

Query Params: `?from=<date>&to=<date>&page=1&limit=20`

---

## Sync (Offline)

### POST /sync/orders (Role: ADMIN, CASHIER)

Accepts an array of orders with `idempotencyKey`. Server processes each, skipping duplicates.

```json
{
  "orders": [
    { /* same as POST /orders body */ }
  ]
}
```

Response (200):
```json
{
  "processed": 5,
  "skipped": 1,
  "errors": []
}
```

---

## Customers & Debt

### GET /customers?search=<name_or_phone>

### POST /customers (Role: ADMIN, CASHIER)

### GET /customers/:id/debt-ledger

Returns all `DebtLedgerEntry` records for the customer.

### POST /customers/:id/payment (Role: ADMIN, CASHIER)

```json
{
  "amount": 500000,
  "note": "Trả tiền đợt 1"
}
```

---

## AI Chatbot

### POST /ai/ask (Role: ADMIN, CASHIER)

```json
{
  "question": "Thuốc trừ sâu X có pha chung với phân bón lá Y được không?",
  "productId": "uuid | null"
}
```

Response (200):
```json
{
  "answer": "string (AI-generated answer)",
  "sources": [
    { "documentTitle": "string", "chunkText": "string" }
  ]
}
```

### POST /ai/knowledge (Role: ADMIN)

Upload a knowledge document (multipart form or JSON with text).

---

## Blog (Public)

### GET /blog/posts?category=<slug>&page=1&limit=10

### GET /blog/posts/:slug

Public endpoints, no auth required. Used by Next.js web-base.
