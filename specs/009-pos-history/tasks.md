# Tasks: POS History

**Input**: Design documents from `/specs/009-pos-history/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: API client functions and backend search enhancement

- [x] T001 Bổ sung search theo customer.phone vào `apps/backend/src/orders/orders.service.ts` (thêm orWhere vào findOrders)
- [x] T002 [P] Thêm function `getOrderHistory()` vào `apps/web-base/src/lib/pos/pos-api.ts`
- [x] T003 [P] Thêm function `getOrderDetail(id)` vào `apps/web-base/src/lib/pos/pos-api.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Tạo page route cho History

**⚠️ CRITICAL**: Trang history phải tồn tại trước khi xây dựng các component bên trong

- [x] T004 Tạo page route `apps/web-base/src/app/pos/(app)/history/page.tsx` (client component, import OrderHistoryList)

**Checkpoint**: Truy cập `/pos/history` không còn 404, hiển thị placeholder

---

## Phase 3: User Story 1 - Xem danh sách đơn hàng đã thanh toán (Priority: P1) 🎯 MVP

**Goal**: Thu ngân nhấn "Lịch sử" và thấy danh sách đơn hàng gần nhất, có thể tìm kiếm và phân trang.

**Independent Test**: Vào `/pos/history`, thấy danh sách đơn hàng sắp xếp từ mới → cũ, gõ tìm kiếm thấy kết quả lọc đúng.

### Implementation for User Story 1

- [x] T005 [US1] Tạo component `apps/web-base/src/components/pos/order-history-list.tsx` — gồm: ô tìm kiếm (debounced 300ms), danh sách card đơn hàng (orderCode, thời gian, tổng tiền, badge trạng thái, tên KH), nút phân trang
- [x] T006 [US1] Tích hợp `OrderHistoryList` vào `apps/web-base/src/app/pos/(app)/history/page.tsx` với layout full-height, nút quay lại POS
- [x] T007 [US1] Style badge trạng thái: COMPLETED → emerald, PENDING → amber, CANCELLED → red trong `order-history-list.tsx`

**Checkpoint**: User Story 1 hoàn chỉnh — danh sách hiển thị, tìm kiếm hoạt động, phân trang hoạt động

---

## Phase 4: User Story 2 - Xem chi tiết bill (Priority: P2)

**Goal**: Thu ngân bấm vào một đơn hàng để xem modal chi tiết gồm: items, giá, thu ngân, phương thức thanh toán.

**Independent Test**: Click vào bất kỳ đơn hàng nào trong danh sách, thấy modal hiện đầy đủ thông tin.

### Implementation for User Story 2

- [x] T008 [US2] Tạo component `apps/web-base/src/components/pos/order-detail-dialog.tsx` — Dialog hiển thị: header (orderCode + thời gian), bảng items (tên SP, ĐVT, SL, đơn giá, thành tiền), thông tin khách hàng, tổng tiền, phương thức thanh toán
- [x] T009 [US2] Kết nối OrderDetailDialog vào OrderHistoryList — click card mở dialog, gọi `getOrderDetail(id)` fetch data

**Checkpoint**: User Story 2 hoàn chỉnh — bấm vào đơn hàng thấy chi tiết đầy đủ

---

## Phase 5: User Story 3 - In lại hóa đơn + Nút Hoàn Trả (Priority: P2)

**Goal**: Thu ngân có thể in lại receipt từ modal chi tiết. Nút "Hoàn Trả" hiển thị nhưng chỉ là placeholder.

**Independent Test**: Click "In lại" mở cửa sổ print browser với format receipt. Click "Hoàn Trả" hiện toast thông báo.

### Implementation for User Story 3

- [x] T010 [US3] Thêm nút "In lại" và nút "Hoàn Trả" vào footer của `order-detail-dialog.tsx`
- [x] T011 [US3] Implement logic in lại receipt: tạo hidden printable div (format 80mm) với CSS `@media print`, gọi `window.print()` khi bấm "In lại"
- [x] T012 [US3] Implement nút "Hoàn Trả" placeholder: `toast.info("Tính năng hoàn trả đang được phát triển")` trong `order-detail-dialog.tsx`

**Checkpoint**: Tất cả User Stories hoàn chỉnh — xem danh sách, xem chi tiết, in lại, nút hoàn trả placeholder

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T013 Responsive check: đảm bảo trang history hiển thị tốt trên tablet (1024px) và desktop
- [x] T014 Kiểm tra end-to-end flow: tạo đơn hàng mới từ POS → vào History → tìm kiếm → xem chi tiết → in lại
- [x] T015 Run quickstart.md validation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on T002, T003 (API functions phải có trước)
- **User Story 1 (Phase 3)**: Depends on Phase 2 (page route phải có trước)
- **User Story 2 (Phase 4)**: Depends on Phase 3 (cần danh sách để click vào)
- **User Story 3 (Phase 5)**: Depends on Phase 4 (cần dialog chi tiết để thêm nút)
- **Polish (Phase 6)**: Depends on all user stories being complete

### Within Each User Story

- API functions → Page route → List component → Detail dialog → Print/Refund actions

### Parallel Opportunities

- T002 và T003 có thể làm song song (cùng file nhưng functions độc lập)
- T001 có thể làm song song với T002/T003 (khác project backend vs frontend)

---

## Parallel Example: Setup Phase

```bash
# Backend + Frontend can be done in parallel:
Task T001: Backend - add phone search to orders.service.ts
Task T002: Frontend - add getOrderHistory() to pos-api.ts   # [P]
Task T003: Frontend - add getOrderDetail() to pos-api.ts    # [P]
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004)
3. Complete Phase 3: User Story 1 (T005-T007)
4. **STOP and VALIDATE**: Test danh sách đơn hàng + tìm kiếm
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → API ready, page route exists
2. Add User Story 1 → Danh sách đơn hàng hoạt động → Deploy (MVP!)
3. Add User Story 2 → Xem chi tiết bill → Deploy
4. Add User Story 3 → In lại + Hoàn trả placeholder → Deploy
5. Each story adds value without breaking previous stories

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Total: **15 tasks** (3 setup, 1 foundational, 3 US1, 2 US2, 3 US3, 3 polish)
- Không có test tasks vì spec không yêu cầu TDD
- Backend thay đổi cực nhỏ (1 dòng), phần lớn công việc là Frontend
