# Quickstart: Barcode/QR Scanner trên Web POS

**Feature**: 016-pos-barcode-qr-scanner  
**Date**: 2026-04-12

## Prerequisites

- Node.js 20+, pnpm/npm
- PostgreSQL đang chạy (local hoặc Docker)
- Backend đang chạy tại `http://localhost:3001`
- Web dev server đang chạy tại `http://localhost:3000`

## Install Dependencies

```bash
# Frontend: thêm thư viện decode mã vạch
cd apps/web-base
npm install @zxing/browser @zxing/library
```

## Database Migration

```bash
# Backfill qr_code_internal cho sản phẩm hiện có
cd apps/backend
npm run migration:run
# Hoặc chạy trực tiếp SQL:
# UPDATE products SET qr_code_internal = 'AGRIX-' || id::text WHERE qr_code_internal IS NULL;
```

## Development Flow

```bash
# Terminal 1: Backend
npm run backend:dev

# Terminal 2: Web
npm run web:dev
```

## Kiểm tra Feature

1. Mở `http://localhost:3000/pos` → Đăng nhập
2. Tạo đơn hàng mới → Click nút "Quét mã vạch"
3. Cho phép quyền camera khi trình duyệt hỏi
4. Hướng camera vào mã vạch EAN-13 trên sản phẩm
5. Sản phẩm tự động thêm vào đơn hàng

## Test API Lookup Thủ công

```bash
# Lookup theo EAN-13
curl -H "Authorization: Bearer {token}" \
  "http://localhost:3001/inventory/products/lookup-barcode?code=1234567890128"

# Lookup theo QR Code nội bộ
curl -H "Authorization: Bearer {token}" \
  "http://localhost:3001/inventory/products/lookup-barcode?code=AGRIX-550e8400-e29b-41d4-a716-446655440000"
```

## HTTPS Requirement (Camera)

Camera API yêu cầu HTTPS hoặc localhost. Trong development, `localhost:3000` hoạt động bình thường. Trên môi trường staging/production, đảm bảo SSL đã cấu hình.
