# Implementation Plan: POS History

**Branch**: `009-pos-history` | **Date**: 2026-04-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-pos-history/spec.md`

## Summary

Xây dựng trang "Lịch sử đơn hàng" trong hệ thống POS, cho phép thu ngân xem lại danh sách các bill đã thanh toán, tìm kiếm theo mã hoá đơn / SĐT khách hàng, xem chi tiết bill, in lại bill, và hiển thị nút Hoàn Trả (UI placeholder).

Hệ thống backend **đã có sẵn** toàn bộ API cần thiết (GET /orders, GET /orders/:id với khả năng tìm kiếm, phân trang). Phạm vi công việc chủ yếu tập trung ở **Frontend** (Next.js page + components).

## Technical Context

**Language/Version**: TypeScript (Next.js 15 + React 19)  
**Primary Dependencies**: Next.js App Router, shadcn/ui, Lucide React, Sonner  
**Storage**: PostgreSQL (qua NestJS backend, sử dụng TypeORM)  
**Testing**: Manual verification qua browser  
**Target Platform**: Web (Tablet-optimized POS interface)  
**Project Type**: Web application (monorepo)  
**Performance Goals**: Trang danh sách tải < 1.5 giây, tìm kiếm phản hồi tức thì  
**Constraints**: Touch-friendly, offline-aware (hiển thị thông báo khi mất kết nối)  
**Scale/Scope**: Hàng trăm đơn/ngày, phân trang 20 đơn/trang

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Note |
|-----------|--------|------|
| I. Mobile-First & Offline-First | ✅ PASS | Trang history tải qua API, hiển thị OfflineIndicator khi mất kết nối (đã có sẵn trong layout) |
| II. Monorepo Architecture | ✅ PASS | Code nằm hoàn toàn trong monorepo `apps/web-base` |
| III. Scalable Core (Modular Monolith) | ✅ PASS | Sử dụng API backend orders module hiện có, không thêm module mới |
| IV. Traceability & Financial Accuracy | ✅ PASS | Chỉ đọc dữ liệu (read-only), không thay đổi dữ liệu tài chính |
| V. Simple & Intuitive UI | ✅ PASS | Sử dụng shadcn/ui + Lucide icons, emerald color scheme, touch-first layout |
| No Emoji Icons | ✅ PASS | Chỉ dùng Lucide React icons |
| CRUD Toast Notifications | ✅ PASS | Feature chỉ đọc, refund button là placeholder, không cần toast |
| shadcn/ui Priority | ✅ PASS | Sử dụng Dialog, Input, Button từ shadcn/ui |

## Project Structure

### Documentation (this feature)

```text
specs/009-pos-history/
├── spec.md
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── api-contracts.md
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
apps/web-base/src/
├── app/pos/(app)/
│   └── history/
│       └── page.tsx             # [NEW] History page (client component)
├── components/pos/
│   ├── order-history-list.tsx   # [NEW] Order list with search & pagination
│   ├── order-detail-dialog.tsx  # [NEW] Bill detail modal with reprint/refund buttons
│   └── ...existing components
└── lib/pos/
    └── pos-api.ts               # [MODIFY] Add getOrderHistory() + getOrderById()
```

**Structure Decision**: Gia nhập vào hệ thống POS hiện có với cùng pattern: Client Component page → Component con → API client functions qua POS Proxy.

## Design Decisions

### 1. Không cần thay đổi Backend

Backend OrdersController đã có sẵn:
- `GET /orders?search=...&from=...&to=...&page=...&limit=...` — Tìm kiếm + phân trang
- `GET /orders/:id` — Chi tiết đơn hàng + items + product names + customer

Tìm kiếm đã hỗ trợ: orderCode, customer name. Chỉ cần thêm tìm kiếm theo SĐT khách hàng ở backend.

### 2. Search Flow

Sử dụng debounced search input (300ms) gọi `GET /orders?search=<query>`. Query sẽ tìm theo:
- Mã hoá đơn (orderCode) — đã có
- Tên khách hàng — đã có  
- SĐT khách hàng — **cần bổ sung** thêm điều kiện `orWhere` trong `findOrders()`

### 3. Receipt Reprinting

Sử dụng `window.print()` với CSS print media queries để format khung in giống receipt 80mm. Đây là cách tiếp cận đơn giản nhất, không cần thư viện bên ngoài, hoạt động trên mọi trình duyệt.

### 4. Refund Button (Placeholder)

Nút "Hoàn Trả" hiển thị trong dialog chi tiết, nhưng khi bấm chỉ `toast.info("Tính năng hoàn trả đang được phát triển")`.

## Complexity Tracking

Không có vi phạm Constitution nào cần phải giải trình.
