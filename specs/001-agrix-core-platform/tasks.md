# Tasks: Batch-Based Stock System

**Input**: Design documents from `/specs/001-agrix-core-platform/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/stock-api.md, research.md, quickstart.md

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 = Batch Import, US2 = FIFO Deduction, US3 = Batch Visibility
- Include exact file paths in descriptions

---

## Phase 1: Foundational — Entity & Migration

- [x] T001 Add `remainingQuantity` column (int, nullable) to StockEntry entity in `apps/backend/src/inventory/entities/stock-entry.entity.ts`
- [x] T002 Update seed script to set `remainingQuantity = quantityBase` on all IMPORT entries in `apps/backend/src/database/seeds/seed.ts`
- [x] T003 Verify TypeORM auto-sync creates the column — restart backend and confirm no errors

---

## Phase 2: User Story 1 — Batch Import with Auto-Generated BatchNumber (Priority: P1) 🎯 MVP

- [x] T004 [US1] Add `generateBatchNumber(sku: string)` helper method in `apps/backend/src/inventory/stock-import.service.ts`
- [x] T005 [US1] Update `importStock()` to auto-generate `batchNumber`, set `remainingQuantity = baseQty` in `apps/backend/src/inventory/stock-import.service.ts`
- [x] T006 [US1] Remove `batchNumber` from `StockImportDto` interface in `apps/backend/src/inventory/stock-import.service.ts`
- [x] T007 [US1] Remove `batchNumber` input field from import form in `apps/web-base/src/components/admin/inventory-client.tsx`
- [x] T008 [US1] Display auto-generated `batchNumber` in import history table in `apps/web-base/src/components/admin/inventory-client.tsx`

---

## Phase 3: User Story 2 — FIFO Deduction Logic (Priority: P1)

- [x] T009 [US2] Create `deductFIFO` logic with transaction + `FOR UPDATE` row locking in `apps/backend/src/inventory/stock-import.service.ts`
- [x] T010 [US2] Update `adjustStock()` to use FIFO, return array of split entries in `apps/backend/src/inventory/stock-import.service.ts`
- [x] T011 [US2] Update `adjustStock` endpoint response type in `apps/backend/src/inventory/stock.controller.ts`
- [x] T012 [US2] Handle edge case: `BadRequestException` when insufficient stock in `apps/backend/src/inventory/stock-import.service.ts`

---

## Phase 4: User Story 3 — Batch Visibility (Priority: P2)

- [x] T013 [P] [US3] Add `getAvailableBatches(productId)` method in `apps/backend/src/inventory/stock-import.service.ts`
- [x] T014 [P] [US3] Add `GET /stock/batches` endpoint in `apps/backend/src/inventory/stock.controller.ts`
- [x] T015 [US3] Add `batchNumber` and `costPricePerUnit` columns to adjustment + full history tables in `apps/web-base/src/components/admin/inventory-client.tsx`
- [x] T016 [US3] Add `remainingQuantity` to StockEntry type in `apps/web-base/src/components/admin/inventory-client.tsx`

---

## Phase 5: Polish & Verification

- [x] T017 [P] Update seed with auto-generated batchNumbers in `apps/backend/src/database/seeds/seed.ts`
- [x] T018 [P] `remainingQuantity` included in history response via entity field
- [x] T019 Run `npx next build` — ✅ 0 errors
- [ ] T020 Run backend `npm run start:dev` — verify no TypeORM sync errors
- [ ] T021 Manual end-to-end test: Import → Adjust → Verify FIFO → Check history → Check batches API
