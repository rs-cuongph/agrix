# API Contracts: POS History

**Branch**: `009-pos-history` | **Date**: 2026-04-05

## Endpoints Used (Existing — No New Endpoints)

### 1. List Orders (with search & pagination)

```
GET /api/v1/orders?search={query}&from={date}&to={date}&page={n}&limit={n}
Authorization: Bearer <pos_token>
```

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": "uuid",
      "orderCode": "DH123456",
      "status": "COMPLETED",
      "customerId": "uuid | null",
      "customer": { "id": "uuid", "name": "Nguyễn Văn A", "phone": "0901234567" },
      "totalAmount": 150000,
      "paidAmount": 150000,
      "paymentMethod": "CASH",
      "syncStatus": "SYNCED",
      "createdBy": "uuid",
      "createdAt": "2026-04-05T10:30:00Z",
      "items": [
        {
          "id": "uuid",
          "productId": "uuid",
          "product": { "name": "Sản phẩm A" },
          "quantityBase": 2,
          "soldUnit": "Cái",
          "unitPrice": 75000,
          "lineTotal": 150000
        }
      ]
    }
  ],
  "meta": { "total": 42, "page": 1, "limit": 20 }
}
```

**Search fields**: `orderCode`, `customer.name`, `customer.phone` (phone mới bổ sung)

### 2. Get Order Detail

```
GET /api/v1/orders/:id
Authorization: Bearer <pos_token>
```

**Response** (200 OK): Single Order object (same structure as list item above)

## Frontend API Client Functions (New)

```typescript
// In pos-api.ts — new functions

export async function getOrderHistory(
  search?: string,
  page?: number,
  limit?: number
): Promise<{ data: PosOrder[]; meta: { total: number; page: number; limit: number } }>

export async function getOrderDetail(id: string): Promise<PosOrder>
```

## POS Proxy Route

Cả hai function trên đều đi qua POS Proxy (`/api/pos/proxy`) sẵn có, không cần thay đổi proxy route.
