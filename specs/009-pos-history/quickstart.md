# Quickstart: POS History

**Branch**: `009-pos-history` | **Date**: 2026-04-05

## Prerequisites

- Backend đang chạy: `npm run backend:dev`
- Frontend đang chạy: `npm run web:dev`
- Có ít nhất 1 đơn hàng đã thanh toán trong database

## Quick Test

1. Mở POS: `http://localhost:3001/pos`
2. Đăng nhập bằng PIN
3. Click nút **"Lịch sử"** (biểu tượng đồng hồ) trên header bar
4. Xem danh sách đơn hàng
5. Thử tìm kiếm theo mã đơn hoặc SĐT
6. Click vào một đơn để xem chi tiết
7. Bấm "In lại" để test in receipt
8. Bấm "Hoàn Trả" để xem toast placeholder

## Files Modified

| File | Action | Description |
|------|--------|-------------|
| `apps/backend/src/orders/orders.service.ts` | MODIFY | Thêm search theo customer.phone |
| `apps/web-base/src/lib/pos/pos-api.ts` | MODIFY | Thêm getOrderHistory(), getOrderDetail() |
| `apps/web-base/src/app/pos/(app)/history/page.tsx` | NEW | Trang History |
| `apps/web-base/src/components/pos/order-history-list.tsx` | NEW | List component |
| `apps/web-base/src/components/pos/order-detail-dialog.tsx` | NEW | Detail + reprint dialog |
