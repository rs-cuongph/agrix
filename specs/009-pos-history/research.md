# Research: POS History

**Branch**: `009-pos-history` | **Date**: 2026-04-05

## Research Tasks & Findings

### 1. Backend API Availability

**Task**: Kiểm tra API hiện có có đáp ứng đủ nhu cầu cho tính năng History không.

**Decision**: Backend đã có đầy đủ endpoint, chỉ cần bổ sung nhỏ.

**Rationale**: 
- `GET /orders` đã hỗ trợ filter by `from`, `to`, `search`, `page`, `limit` — covers 90% use case.
- `GET /orders/:id` trả về đầy đủ: items, product names, customer info, payment method, amounts.
- Search đã tìm theo `orderCode` và `customer.name`, chỉ thiếu `customer.phone`.

**Alternatives considered**:
- Tạo endpoint riêng `/pos/history` → Rejected vì code trùng lặp logic hoàn toàn giống `GET /orders`.

### 2. Tìm kiếm theo SĐT khách hàng

**Task**: Bổ sung tìm kiếm theo phone vào `findOrders()`.

**Decision**: Thêm `orWhere('customer.phone LIKE :search')` vào query builder hiện có.

**Rationale**: Chỉ thêm 1 dòng code, không phá vỡ logic hiện tại, cùng áp dụng cho Admin orders.

### 3. Receipt Print Approach

**Task**: Chọn cách in lại hoá đơn.

**Decision**: Sử dụng `window.print()` + CSS `@media print` với format receipt (80mm width).

**Rationale**: 
- Không cần thư viện ngoài (escpos, thermalprinter, etc.)
- Hoạt động trên mọi trình duyệt hiện đại
- Có thể target thermal printer hoặc in ra PDF tuỳ thiết lập máy in của hệ thống
- Dễ bảo trì, customize format qua HTML/CSS

**Alternatives considered**:
- ESC/POS raw commands → Rejected vì phụ thuộc loại máy in, cần server middleware.
- pdf-lib / jsPDF → Over-engineered cho use case receipt đơn giản.

### 4. UI Pattern cho Order List

**Task**: Chọn UI pattern phù hợp cho danh sách đơn hàng trên tablet POS.

**Decision**: Full-page list (không dùng table) + Dialog chi tiết khi bấm vào item.

**Rationale**:
- Touch-friendly card layout phù hợp với tablet hơn table rows nhỏ
- Consistent với POS design language hiện tại (cards, rounded corners, emerald theme)
- Dialog pattern đã proven trong codebase (CheckoutScreen, ProductDetailsDialog)

## All NEEDS CLARIFICATION: Resolved ✅
