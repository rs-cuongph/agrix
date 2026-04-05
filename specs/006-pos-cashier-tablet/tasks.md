# Tasks: POS Cashier Tablet App

**Input**: Design documents from `/specs/006-pos-cashier-tablet/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: No test tasks included — tests were not explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `apps/web-base/src/`
- **Backend**: `apps/backend/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies, create POS route group and layout, add missing shadcn/ui components.

- [x] T001 Install `qrcode.react` and `idb` npm packages in `apps/web-base/`
- [x] T002 [P] Add shadcn/ui `sheet` component via CLI in `apps/web-base/`
- [x] T003 [P] Add shadcn/ui `badge` component via CLI in `apps/web-base/`
- [x] T004 [P] Add shadcn/ui `separator` component via CLI in `apps/web-base/`
- [x] T005 [P] Add shadcn/ui `scroll-area` component via CLI in `apps/web-base/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: POS layout, auth, API layer, and cart state — ALL stories depend on these.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T006 Create POS layout at `apps/web-base/src/app/pos/layout.tsx`
- [x] T007 Create POS login page at `apps/web-base/src/app/pos/login/page.tsx`
- [x] T008 Create backend PIN auth endpoint: add `posPin` field to User entity, create `POST /auth/pos-login`
- [x] T009 [P] Create POS API proxy route at `apps/web-base/src/app/api/pos/proxy/route.ts`
- [x] T010 [P] Create POS API client helper at `apps/web-base/src/lib/pos/pos-api.ts`
- [x] T011 Create cart state management at `apps/web-base/src/lib/pos/cart-store.tsx`
- [x] T012 [P] Create barcode listener hook at `apps/web-base/src/lib/pos/barcode-listener.ts`
- [x] T013 [P] Create offline indicator component at `apps/web-base/src/components/pos/offline-indicator.tsx`

**Checkpoint**: POS is accessible via `/pos`, requires PIN login, has cart state ready, API calls working.

---

## Phase 3: User Story 1 - Tra cứu và thêm sản phẩm vào giỏ hàng (Priority: P1) 🎯 MVP

**Goal**: Thu ngân có thể tìm kiếm sản phẩm (tên, SKU, barcode) và thêm vào giỏ hàng.

**Independent Test**: Mở `/pos`, tìm kiếm sản phẩm, tap để thêm vào giỏ, quét barcode để thêm tự động.

### Implementation for User Story 1

- [x] T014 [US1] Create search bar component
- [x] T015 [US1] Create product card component
- [x] T016 [US1] Create unit picker dialog
- [x] T017 [US1] Create product grid component
- [x] T018 [US1] Create main POS page at `apps/web-base/src/app/pos/page.tsx`

**Checkpoint**: Thu ngân có thể tìm kiếm sản phẩm và thêm vào giỏ. Giỏ hàng hiển thị placeholder.

---

## Phase 4: User Story 2 - Quản lý giỏ hàng (Priority: P1)

**Goal**: Thu ngân có thể xem, tăng/giảm số lượng, xóa sản phẩm trong giỏ, tổng tiền cập nhật real-time.

**Independent Test**: Thêm nhiều SP, tap +/-, xóa SP, xác nhận tổng tiền luôn chính xác.

### Implementation for User Story 2

- [x] T019 [US2] Create cart item row component at `apps/web-base/src/components/pos/cart-item.tsx`
- [x] T020 [US2] Create cart panel component at `apps/web-base/src/components/pos/cart-panel.tsx`
- [x] T021 [US2] Integrate cart panel into POS main page

**Checkpoint**: Giỏ hàng hoàn chỉnh — thêm/xóa/sửa số lượng — tổng tiền realtime.

---

## Phase 5: User Story 3 - Thanh toán đơn hàng (Priority: P1)

**Goal**: Thu ngân thanh toán bằng tiền mặt (tính tiền thừa) hoặc chuyển khoản (QR VietQR), đơn hàng được lưu.

**Independent Test**: Thêm SP, bấm thanh toán, chọn tiền mặt → nhập tiền → xác nhận → thấy success screen.

### Implementation for User Story 3

- [x] T022 [US3] Create cash payment component at `apps/web-base/src/components/pos/payment-cash.tsx`
- [x] T023 [P] [US3] Create QR payment component at `apps/web-base/src/components/pos/payment-qr.tsx`
- [x] T024 [US3] Create checkout screen at `apps/web-base/src/components/pos/checkout-screen.tsx`
- [x] T025 [US3] Create success screen at `apps/web-base/src/components/pos/success-screen.tsx`
- [x] T026 [US3] Implement order submission logic in `apps/web-base/src/lib/pos/pos-api.ts`
- [x] T027 [US3] Integrate checkout flow into POS main page

**Checkpoint**: Luồng bán hàng hoàn chỉnh: tìm SP → thêm giỏ → thanh toán → success. MVP done!

---

## Phase 6: User Story 4 - Gắn khách hàng vào đơn hàng (Priority: P2)

**Goal**: Thu ngân có thể gắn/tạo khách hàng để ghi nợ hoặc theo dõi lịch sử mua.

**Independent Test**: Tap "Khách hàng" → tìm → gắn → thanh toán thiếu → xác nhận nợ ghi nhận.

### Implementation for User Story 4

- [x] T028 [US4] Create customer picker component at `apps/web-base/src/components/pos/customer-picker.tsx`
- [x] T029 [US4] Integrate customer picker into cart panel
- [x] T030 [US4] Update checkout screen with partial payment / debt logic

**Checkpoint**: Khách hàng có thể được gắn vào đơn, ghi nợ khi thanh toán thiếu.

---

## Phase 7: User Story 5 - Lọc sản phẩm theo danh mục (Priority: P2)

**Goal**: Thu ngân lọc sản phẩm theo danh mục bằng tab ngang.

**Independent Test**: Tap các tab danh mục → xác nhận danh sách lọc đúng. Kết hợp tìm kiếm text.

### Implementation for User Story 5

- [x] T031 [US5] Create category tabs component at `apps/web-base/src/components/pos/category-tabs.tsx`
- [x] T032 [US5] Integrate category tabs into POS main page

**Checkpoint**: Sản phẩm có thể lọc theo danh mục + kết hợp tìm kiếm.

---

## Phase 8: User Story 6 - In hóa đơn (Priority: P3)

**Goal**: In hóa đơn qua browser print dialog (Phase 1, no direct Bluetooth).

**Independent Test**: Thanh toán xong → bấm In → xác nhận print dialog mở với layout 80mm.

### Implementation for User Story 6

- [ ] T033 [US6] Create receipt print view at `apps/web-base/src/components/pos/receipt-print.tsx` — hidden printable div with CSS `@media print` optimized for 80mm thermal paper. Shows store name, date, items, totals, payment method, customer name if attached.
- [ ] T034 [US6] Add print button to success screen at `apps/web-base/src/components/pos/success-screen.tsx` — large "In hóa đơn" button, calls `window.print()` which triggers receipt-print layout.

**Checkpoint**: Hóa đơn có thể in qua browser print dialog.

---

## Phase 9: User Story 7 - Xem lịch sử đơn hàng trong ca (Priority: P3)

**Goal**: Thu ngân xem lại đơn hàng đã bán hôm nay, xem chi tiết, in lại.

**Independent Test**: Bán vài đơn → tap Lịch sử → xác nhận danh sách đúng → tap xem chi tiết.

### Implementation for User Story 7

- [ ] T035 [US7] Create order history page at `apps/web-base/src/app/pos/history/page.tsx` — fetches today's orders from API, displays list (time, total, items count, payment method). Navigatable from header history icon.
- [ ] T036 [US7] Create order detail sheet at `apps/web-base/src/components/pos/order-detail-sheet.tsx` — shadcn Sheet (bottom sheet style) showing full order detail: items, quantities, unit prices, totals, customer, payment method. "In lại" button for reprinting.

**Checkpoint**: Lịch sử đơn hàng hiển thị, chi tiết xem được, in lại được.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Offline support, responsive refinements, final QA.

- [ ] T037 Create offline order store at `apps/web-base/src/lib/pos/offline-store.ts` — IndexedDB wrapper using `idb` library for pending orders. Functions: `savePendingOrder()`, `getPendingOrders()`, `markSynced()`. Background sync on reconnect.
- [ ] T038 Integrate offline store into order submission in `apps/web-base/src/lib/pos/pos-api.ts` — on network failure, save order to IndexedDB; on reconnect, auto-sync pending orders.
- [ ] T039 [P] Add admin page for managing user PINs at `apps/web-base/src/components/admin/accounts-client.tsx` — add PIN column/field to user management table, allow admin to set/reset PIN per user.
- [ ] T040 Run quickstart.md validation steps in Chrome DevTools tablet emulator (1280x800 landscape).
- [ ] T041 Final pass: verify all touch targets ≥48px, text ≥16px, total amounts 28-36px across all POS components.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3-9)**: All depend on Foundational phase completion
  - US1 (Phase 3) → US2 (Phase 4) → US3 (Phase 5): Sequential (build on each other)
  - US4 (Phase 6): Depends on US2 (cart panel)
  - US5 (Phase 7): Depends on US1 (product grid)
  - US6 (Phase 8): Depends on US3 (success screen)
  - US7 (Phase 9): Can start after US3
- **Polish (Phase 10)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: Depends on Foundational phase
- **US2 (P1)**: Depends on US1 (needs product grid + cart store)
- **US3 (P1)**: Depends on US2 (needs cart panel)
- **US4 (P2)**: Depends on US2 (needs cart panel for customer slot)
- **US5 (P2)**: Depends on US1 (needs product grid to filter)
- **US6 (P3)**: Depends on US3 (needs success screen)
- **US7 (P3)**: Depends on US3 (needs completed orders to display)

### Within Each User Story

- Components before page integration
- API calls before UI binding
- Core before polish

### Parallel Opportunities

- T002-T005: All shadcn installs can run in parallel
- T009-T013: API proxy, API client, barcode hook, offline indicator — all different files
- T022-T023: Cash payment + QR payment — different files
- T039: Admin PIN management can be done in parallel with any POS phase

---

## Parallel Example: Phase 2 (Foundational)

```bash
# After T006 (layout) and T008 (backend PIN auth), these can run in parallel:
Task T009: "Create POS API proxy route at apps/web-base/src/app/api/pos/proxy/route.ts"
Task T010: "Create POS API client helper at apps/web-base/src/lib/pos/pos-api.ts"
Task T012: "Create barcode listener hook at apps/web-base/src/lib/pos/barcode-listener.ts"
Task T013: "Create offline indicator at apps/web-base/src/components/pos/offline-indicator.tsx"
```

---

## Implementation Strategy

### MVP First (US1 + US2 + US3)

1. Complete Phase 1: Setup (install deps, shadcn components)
2. Complete Phase 2: Foundational (layout, PIN auth, cart state, API)
3. Complete Phase 3: US1 — Search & add products
4. Complete Phase 4: US2 — Cart management
5. Complete Phase 5: US3 — Checkout
6. **STOP and VALIDATE**: Test full sales flow on tablet emulator
7. Deploy/demo if ready — this is the MVP!

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 + US2 + US3 → Full sales flow (MVP!)
3. Add US4 → Customer & debt management
4. Add US5 → Category filtering
5. Add US6 → Receipt printing
6. Add US7 → Order history
7. Polish → Offline, admin PIN mgmt, final QA

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Backend changes (T008) are minimal: only PIN field + 1 new endpoint
- Admin PIN management (T039) can be parallelized with POS development
- Offline support (T037-T038) is in Polish phase — MVP works online-only first
- All POS components must enforce 48px min touch targets and 16px min font
