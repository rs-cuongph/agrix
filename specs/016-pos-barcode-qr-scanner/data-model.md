# Data Model: Barcode/QR Scanner trên Web POS

**Feature**: 016-pos-barcode-qr-scanner  
**Phase**: 1 — Design  
**Date**: 2026-04-12

## Existing Schema (No Changes Required)

Bảng `products` đã có đủ các cột cần thiết:

```sql
-- Đã tồn tại trong products table
barcode_ean13    VARCHAR UNIQUE NULL  -- Mã EAN-13 thương mại (13 chữ số)
qr_code_internal VARCHAR UNIQUE NULL  -- Mã QR nội bộ Agrix (format: AGRIX-{uuid})
```

## Required Index (Performance)

Cần đảm bảo các cột lookup có index để tra cứu O(log n) thay vì full table scan:

```sql
-- Kiểm tra và tạo nếu chưa có
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_barcode_ean13 
    ON products(barcode_ean13) 
    WHERE barcode_ean13 IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_products_qr_code_internal 
    ON products(qr_code_internal) 
    WHERE qr_code_internal IS NOT NULL;
```

> Các index UNIQUE trong TypeORM entity (`unique: true`) thường tạo index tự động. Cần verify bằng `\d products` trong psql.

## Data Migration: Backfill QR Code Nội bộ

Sản phẩm hiện có chưa có `qrCodeInternal` cần được backfill:

```sql
-- Migration script (thực thi một lần)
UPDATE products 
SET qr_code_internal = 'AGRIX-' || id::text 
WHERE qr_code_internal IS NULL;
```

**Phạm vi**: Tất cả sản phẩm có `qr_code_internal IS NULL`  
**Timing**: Chạy trong TypeORM migration trước khi deploy feature

## Entity: Product (Unchanged)

```typescript
// apps/backend/src/inventory/entities/product.entity.ts
// Không thay đổi schema — chỉ thêm logic business ở service layer

@Column({ name: 'barcode_ean13', unique: true, nullable: true })
barcodeEan13: string;  // EAN-13: "1234567890128"

@Column({ name: 'qr_code_internal', unique: true, nullable: true })
qrCodeInternal: string;  // Internal QR: "AGRIX-550e8400-e29b-41d4-a716-446655440000"
```

## New DTO: BarcodeLookupResponseDto

```typescript
// apps/backend/src/inventory/dto/barcode-lookup.dto.ts

export class UnitConversionDto {
  unitName: string;
  conversionFactor: number;
  sellPrice: number;
}

export class BarcodeLookupResponseDto {
  id: string;
  sku: string;
  name: string;
  barcodeEan13: string | null;
  qrCodeInternal: string | null;
  baseSellPrice: number;
  baseUnit: string;
  currentStockBase: number;
  isActive: boolean;
  units: UnitConversionDto[];
}
```

## Scan Event Logging (Optional — Phase 2+)

Cân nhắc thêm bảng `scan_events` trong phiên bản tương lai để analytics:

```sql
-- Không implement trong MVP, chỉ document để reference
CREATE TABLE scan_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        VARCHAR NOT NULL,
  code_type   VARCHAR(10) NOT NULL,  -- 'EAN13' | 'QR_INTERNAL' | 'UNKNOWN'
  product_id  UUID REFERENCES products(id),
  result      VARCHAR(10) NOT NULL,  -- 'FOUND' | 'NOT_FOUND' | 'INVALID'
  duration_ms INT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```
