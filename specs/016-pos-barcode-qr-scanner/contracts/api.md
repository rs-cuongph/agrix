# API Contracts: Barcode/QR Scanner trên Web POS

**Feature**: 016-pos-barcode-qr-scanner  
**Phase**: 1 — Design  
**Date**: 2026-04-12

## Endpoint: Lookup Product by Barcode/QR

### Request

```
GET /api/inventory/products/lookup-barcode?code={value}
Authorization: Bearer {jwt_token}
```

| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| `code`    | string | Yes      | EAN-13 (13 chữ số) hoặc `AGRIX-{uuid}` |

### Response 200 — Tìm thấy sản phẩm

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "sku": "SP-DAP-50KG",
  "name": "Phân bón DAP 18-46-0",
  "barcodeEan13": "1234567890128",
  "qrCodeInternal": "AGRIX-550e8400-e29b-41d4-a716-446655440000",
  "baseSellPrice": 850000,
  "baseUnit": "kg",
  "currentStockBase": 1000,
  "isActive": true,
  "units": [
    {
      "unitName": "Bao 50kg",
      "conversionFactor": 50,
      "sellPrice": 42500000
    },
    {
      "unitName": "Bao 25kg",
      "conversionFactor": 25,
      "sellPrice": 21250000
    }
  ]
}
```

### Response 404 — Không tìm thấy

```json
{
  "statusCode": 404,
  "message": "Sản phẩm không tìm thấy với mã: 1234567890128",
  "error": "Not Found"
}
```

### Response 400 — Định dạng mã không hợp lệ

```json
{
  "statusCode": 400,
  "message": "Định dạng mã không hợp lệ. Hỗ trợ: EAN-13 (13 chữ số) hoặc mã QR nội bộ AGRIX-{uuid}",
  "error": "Bad Request"
}
```

### Detection Logic

```
code = "1234567890128"     → /^\d{13}$/ matches → lookup barcodeEan13
code = "AGRIX-550e8400..." → startsWith('AGRIX-') → lookup qrCodeInternal
code = "INVALID"           → 400 Bad Request
```

---

## Endpoint: Generate/Print QR Code (Admin)

### Request

```
GET /api/inventory/products/{id}/qr-code
Authorization: Bearer {jwt_token}
Accept: image/svg+xml | image/png
```

### Response 200 — SVG hoặc PNG của QR Code

```
Content-Type: image/svg+xml
Content-Disposition: attachment; filename="qr-AGRIX-{id}.svg"

<svg>...</svg>
```

> **Note**: QR nội bộ được auto-generate (`AGRIX-{id}`) khi tạo sản phẩm mới. Endpoint này dùng để export/print.

---

## Existing Endpoints (Unchanged)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/inventory/products` | Danh sách sản phẩm (có phân trang) |
| GET | `/api/inventory/products/:id` | Chi tiết sản phẩm |
| POST | `/api/inventory/products` | Tạo sản phẩm (sẽ auto-generate `qrCodeInternal`) |
| PATCH | `/api/inventory/products/:id` | Cập nhật thông tin sản phẩm |

---

## Frontend Service Contract

```typescript
// apps/web-base/src/lib/barcode.ts

export interface ProductLookupResult {
  id: string;
  sku: string;
  name: string;
  barcodeEan13: string | null;
  baseSellPrice: number;
  baseUnit: string;
  currentStockBase: number;
  isActive: boolean;
  units: Array<{
    unitName: string;
    conversionFactor: number;
    sellPrice: number;
  }>;
}

export async function lookupByBarcode(code: string): Promise<ProductLookupResult | null> {
  // Returns null on 404, throws on network/5xx errors
}
```
