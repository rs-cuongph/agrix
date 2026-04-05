# Implementation Plan: POS Enhancements — orderCode, PIN Management, Bank Config & Webhook

**Branch**: `006-pos-cashier-tablet` | **Date**: 2026-04-05 | **Spec**: [spec.md](file:///Users/cuongph/Workspace/agrix/specs/006-pos-cashier-tablet/spec.md)

## Summary

Implement 4 new sub-features decided during the clarification sessions:

1. **`orderCode` — Mã đơn hàng ngắn gọn**: Thêm cột `orderCode` (auto-generated, VD: `DH839124`) vào bảng `orders`. Dùng thay UUID trên VietQR memo, giao diện POS, và Admin Order Detail.
2. **PIN Management UI**: Thêm API endpoint và UI trên Admin Settings để Admin xem/cấp/đổi mã PIN cho nhân viên. (Entity `posPin` đã có sẵn trên User).
3. **Bank Config trong StoreSettings**: Thêm 3 cột bank info (`bankBin`, `bankAccountNo`, `bankAccountName`) vào entity `StoreSettings`. Cập nhật Admin Settings UI để nhập vào. VietQR component sẽ tự đọc từ DB thay vì `.env`.
4. **Webhook Bank Transfer**: Endpoint public `POST /api/v1/orders/webhook/bank-transfer` để Google App Script gọi khi phát hiện chuyển khoản thành công. Tự động cập nhật status Order → `COMPLETED`.

## Technical Context

**Language/Version**: TypeScript (Node.js 20+, React 19)
**Primary Dependencies**: NestJS 10, Next.js 15 (App Router), TypeORM, shadcn/ui, qrcode.react
**Storage**: PostgreSQL (UUID primary keys)
**Target Platform**: Web (PWA on Chrome Android tablet)
**Project Type**: Fullstack web application (monorepo)

## Constitution Check

| Gate | Status | Notes |
|------|--------|-------|
| Modular Monolith | ✅ PASS | Changes stay within existing `orders`, `auth`, `common` modules |
| No Emoji Icons | ✅ PASS | All icons from Lucide-react |
| CRUD Toast | ✅ PASS | PIN update & settings save show toasts |
| shadcn/ui Priority | ✅ PASS | PIN & bank settings UI use shadcn Input, Button, Dialog |
| Traceability | ✅ PASS | Webhook logs via `transactionRef` field |

## Project Structure

### Documentation (this feature)

```text
specs/006-pos-cashier-tablet/
├── plan.md              # This file
├── spec.md              # Feature spec with clarifications
├── research.md          # Phase 0 research
├── data-model.md        # Phase 1 data model (to be updated)
└── tasks.md             # Phase 2 task breakdown
```

### Source Code Changes

```text
apps/backend/src/
├── orders/
│   ├── entities/order.entity.ts        # [MODIFY] Add orderCode + status fields
│   ├── orders.service.ts               # [MODIFY] Auto-generate orderCode on create, add webhook handler
│   ├── orders.controller.ts            # [MODIFY] Add webhook endpoint
│   └── orders.module.ts                # [MODIFY] Import ConfigModule
├── auth/
│   ├── admin-users.controller.ts       # [MODIFY] Add PUT :id/pin endpoint
│   └── entities/user.entity.ts         # (no changes, posPin already exists)
└── common/
    ├── entities/store-settings.entity.ts  # [MODIFY] Add 3 bank columns
    └── store-settings.service.ts          # (no changes needed, upsert is generic)

apps/web-base/src/
├── components/
│   ├── admin/
│   │   ├── settings-client.tsx         # [MODIFY] Add PIN mgmt tab + Bank info tab
│   │   └── orders-client.tsx           # [MODIFY] Show orderCode instead of UUID
│   └── pos/
│       ├── payment-qr.tsx              # [MODIFY] Include orderCode in VietQR memo
│       └── checkout-screen.tsx         # [MODIFY] Pass orderCode to PaymentQR
└── lib/pos/pos-api.ts                  # [MODIFY] Accept orderCode in create order flow
```

---

## Proposed Changes

### Component 1: Order Entity — `orderCode` field

#### [MODIFY] [order.entity.ts](file:///Users/cuongph/Workspace/agrix/apps/backend/src/orders/entities/order.entity.ts)

- Add `orderCode` column: `VARCHAR(10)`, unique, NOT NULL
- Add `OrderStatus` enum: `PENDING`, `COMPLETED`, `CANCELLED`
- Add `status` column with default `COMPLETED` (Cash) or `PENDING` (Bank Transfer)
- Auto-generate `orderCode` format: `DH` + 6 random digits (e.g., `DH839124`)

#### [MODIFY] [orders.service.ts](file:///Users/cuongph/Workspace/agrix/apps/backend/src/orders/orders.service.ts)

- Generate `orderCode` in `createOrder()` before saving
- Set `status` based on `paymentMethod`: CASH → `COMPLETED`, BANK_TRANSFER → `PENDING`
- Add `confirmBankTransfer(orderCode, amountPaid, transactionRef)` method
- Update `findOrders()` search to also match on `orderCode`

#### [MODIFY] [orders.controller.ts](file:///Users/cuongph/Workspace/agrix/apps/backend/src/orders/orders.controller.ts)

- Add `POST webhook/bank-transfer` endpoint (NO AuthGuard — uses webhook secret instead)
- Validate `x-webhook-secret` header against env var `WEBHOOK_SECRET`
- Return structured response: `{ success: boolean, orderCode, newStatus }`

#### [MODIFY] [orders.module.ts](file:///Users/cuongph/Workspace/agrix/apps/backend/src/orders/orders.module.ts)

- Import `ConfigModule` for webhook secret env access

---

### Component 2: Admin PIN Management

#### [MODIFY] [admin-users.controller.ts](file:///Users/cuongph/Workspace/agrix/apps/backend/src/auth/admin-users.controller.ts)

- Add `PUT :id/pin` endpoint: accepts `{ pin: string }`, validates 4-6 digits, saves to `user.posPin`
- Add `DELETE :id/pin` endpoint: clears PIN (sets `posPin = null`)

#### [MODIFY] [settings-client.tsx](file:///Users/cuongph/Workspace/agrix/apps/web-base/src/components/admin/settings-client.tsx)

- In "Tài khoản" (Accounts) tab, add a "Set PIN" / "Change PIN" button per user row
- Dialog with PIN input (masked, 4-6 digits) + confirm button
- Show "Đã cấp PIN" badge on users who have one

---

### Component 3: Bank Config in StoreSettings

#### [MODIFY] [store-settings.entity.ts](file:///Users/cuongph/Workspace/agrix/apps/backend/src/common/entities/store-settings.entity.ts)

- Add 3 nullable columns:
  - `bankBin` (VARCHAR 20) — Mã BIN ngân hàng (VD: `970422` = MBBank)
  - `bankAccountNo` (VARCHAR 30)
  - `bankAccountName` (VARCHAR 100)

#### [MODIFY] [settings-client.tsx](file:///Users/cuongph/Workspace/agrix/apps/web-base/src/components/admin/settings-client.tsx)

- Add "Thanh toán" (Payment) tab or section in existing Settings page
- 3 input fields: Bank BIN, Số tài khoản, Tên chủ tài khoản
- Save via existing `PUT /admin/settings` endpoint (generic upsert)

---

### Component 4: Frontend Updates

#### [MODIFY] [payment-qr.tsx](file:///Users/cuongph/Workspace/agrix/apps/web-base/src/components/pos/payment-qr.tsx)

- Accept `orderCode` prop
- Use `orderCode` in VietQR memo: `addInfo=DH839124` instead of generic text

#### [MODIFY] [orders-client.tsx](file:///Users/cuongph/Workspace/agrix/apps/web-base/src/components/admin/orders-client.tsx)

- Display `orderCode` (e.g., `DH839124`) in "Mã đơn" column instead of truncated UUID
- Show Order `status` badge (PENDING/COMPLETED) alongside payment method badge

---

## Environment Variables (additions to `.env`)

```env
# Webhook Security
WEBHOOK_SECRET=change-this-to-a-random-secret-string
```

## Database Migration Summary

| Table | Column | Type | Notes |
|-------|--------|------|-------|
| `orders` | `order_code` | VARCHAR(10) UNIQUE NOT NULL | Auto-generated `DH` + 6 digits |
| `orders` | `status` | ENUM('PENDING','COMPLETED','CANCELLED') | Default: COMPLETED |
| `store_settings` | `bank_bin` | VARCHAR(20) NULL | VietQR bank BIN |
| `store_settings` | `bank_account_no` | VARCHAR(30) NULL | Số tài khoản |
| `store_settings` | `bank_account_name` | VARCHAR(100) NULL | Tên chủ TK |

## Webhook API Contract

```
POST /api/v1/orders/webhook/bank-transfer
Headers:
  x-webhook-secret: <WEBHOOK_SECRET from .env>
  Content-Type: application/json

Body:
{
  "orderCode": "DH839124",          // Required - parsed from transfer content
  "amountPaid": 120000,             // Required - actual amount received
  "transactionRef": "FT26040512345", // Optional - bank transaction ref
  "rawContent": "NGUYEN VAN A TT DH839124", // Optional - raw transfer memo
  "paymentDate": "2026-04-05T12:00:00Z"     // Optional
}

Response (200):
{
  "success": true,
  "orderCode": "DH839124",
  "newStatus": "COMPLETED"
}

Response (401): { "message": "Invalid webhook secret" }
Response (404): { "message": "Order not found" }
Response (409): { "message": "Order already completed" }
```

## Verification Plan

### Automated Tests
1. `curl` the webhook endpoint with valid/invalid secrets → verify 401 vs 200
2. Create a BANK_TRANSFER order → verify status is PENDING
3. Call webhook with matching orderCode → verify status changes to COMPLETED
4. Call webhook with duplicate transactionRef → verify 409

### Manual Verification
1. Open Admin Settings → verify PIN set/change works for each user
2. Open Admin Settings → verify Bank config saves and reflects on POS QR
3. Create an order with Bank Transfer on POS → verify QR shows orderCode in memo
4. Open Admin Orders → verify orderCode displayed and searchable
