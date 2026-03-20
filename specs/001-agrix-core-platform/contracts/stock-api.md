# Stock API Contract Updates

**Date**: 2026-03-20

## POST /api/v1/stock/import

### Request (Updated)

```json
{
  "productId": "uuid",
  "quantity": 10,
  "unitName": "Thùng",
  "costPricePerUnit": 15000,
  "note": "Nhập từ NCC ABC"
}
```

> **Change**: `batchNumber` removed from request body. Now auto-generated server-side as `YYYYMMDD-SKU-HHMM`.

### Response (Updated)

```json
{
  "id": "uuid",
  "productId": "uuid",
  "quantityBase": 400,
  "type": "IMPORT",
  "costPricePerUnit": 15000,
  "batchNumber": "20260320-TB001-0900",
  "remainingQuantity": 400,
  "note": "Nhập từ NCC ABC",
  "createdAt": "2026-03-20T09:00:00Z"
}
```

> **Change**: Response now includes `batchNumber` (auto-generated) and `remainingQuantity` (initially = quantityBase).

---

## POST /api/v1/stock/adjust

### Request (No change)

```json
{
  "productId": "uuid",
  "quantity": 5,
  "unitName": "Chai",
  "type": "DAMAGE",
  "note": "Hư hỏng do vận chuyển"
}
```

### Response (Updated)

```json
{
  "entries": [
    {
      "id": "uuid",
      "productId": "uuid",
      "quantityBase": -3,
      "type": "DAMAGE",
      "batchNumber": "20260320-TB001-0900",
      "costPricePerUnit": 15000,
      "createdAt": "2026-03-20T10:00:00Z"
    },
    {
      "id": "uuid",
      "productId": "uuid",
      "quantityBase": -2,
      "type": "DAMAGE",
      "batchNumber": "20260320-TB001-1430",
      "costPricePerUnit": 16000,
      "createdAt": "2026-03-20T10:00:00Z"
    }
  ],
  "totalDeducted": 5
}
```

> **Change**: Now returns array of entries (one per batch deducted via FIFO) instead of single entry. Each entry has `batchNumber` and `costPricePerUnit` from source batch.

---

## GET /api/v1/stock/batches (NEW)

List available batches (IMPORT entries with remainingQuantity > 0) for a product.

### Request

```
GET /api/v1/stock/batches?productId=uuid
```

### Response

```json
{
  "data": [
    {
      "id": "uuid",
      "batchNumber": "20260320-TB001-0900",
      "quantityBase": 400,
      "remainingQuantity": 350,
      "costPricePerUnit": 15000,
      "createdAt": "2026-03-20T09:00:00Z"
    }
  ]
}
```
