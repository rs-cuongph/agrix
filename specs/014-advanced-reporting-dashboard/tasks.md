# Tasks: Advanced Reporting Dashboard

**Input**: Design documents from `/specs/014-advanced-reporting-dashboard/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Bao gồm test tasks vì implementation plan đã yêu cầu kiểm thử contract API, logic tổng hợp tài chính, và luồng UI/admin cho bộ lọc và export.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `apps/backend/src/`, `apps/backend/test/`
- **Web app**: `apps/web-base/src/`
- **Feature docs**: `specs/014-advanced-reporting-dashboard/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Chuẩn bị khung dữ liệu, hợp đồng kiểu, và cấu trúc file cho báo cáo nâng cao

- [x] T001 Create shared reporting type definitions in `packages/shared/typescript/src/reporting.ts`
- [x] T002 Create dashboard reporting DTO/query definitions in `apps/backend/src/dashboard/dto/reporting-filter.dto.ts`
- [x] T003 [P] Create frontend reporting types and mapper helpers in `apps/web-base/src/lib/admin/reporting-types.ts`
- [x] T004 [P] Create backend dashboard service/module file stubs in `apps/backend/src/dashboard/advanced-reporting.service.ts` and `apps/backend/src/dashboard/dashboard.module.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Hoàn thiện hạ tầng truy vấn, parsing filter, và API surface dùng chung cho mọi user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Implement shared reporting filter parsing and validation in `apps/backend/src/dashboard/dto/reporting-filter.dto.ts`
- [x] T006 [P] Add reusable bucket/date-range helper utilities in `apps/backend/src/dashboard/reporting-range.util.ts`
- [x] T007 [P] Add reusable ranking and empty-state response helpers in `apps/backend/src/dashboard/reporting-response.util.ts`
- [x] T008 Implement `AdvancedReportingService` query skeleton and shared repository wiring in `apps/backend/src/dashboard/advanced-reporting.service.ts`
- [x] T009 Extend `DashboardController` route skeletons for `revenue-series`, `gross-profit-by-category`, `top-customers`, and `exports` in `apps/backend/src/dashboard/dashboard.controller.ts`
- [x] T010 [P] Add frontend dashboard filter state utilities in `apps/web-base/src/lib/admin/reporting-filters.ts`
- [x] T011 [P] Add admin API helpers for advanced reporting endpoints in `apps/web-base/src/lib/admin/reporting-api.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Theo dõi hiệu quả kinh doanh theo thời gian (Priority: P1) 🎯 MVP

**Goal**: Hiển thị dashboard doanh thu theo ngày/tuần/tháng/năm với cùng bộ lọc thời gian và chỉ số nhất quán

**Independent Test**: Có thể kiểm thử độc lập bằng cách đổi `granularity` và khoảng thời gian trên dashboard admin, sau đó xác nhận biểu đồ doanh thu và phần tổng quan cập nhật đúng theo dữ liệu đơn hàng hoàn tất

### Tests for User Story 1

- [ ] T012 [P] [US1] Add revenue series contract test coverage in `apps/backend/test/dashboard/revenue-series.contract-spec.ts`
- [x] T013 [P] [US1] Add backend aggregation integration tests for day/week/month/year grouping in `apps/backend/test/dashboard/revenue-series.integration-spec.ts`
- [x] T014 [P] [US1] Add web admin interaction test for reporting filter changes in `apps/web-base/src/app/admin/page.test.tsx`

### Implementation for User Story 1

- [x] T015 [US1] Implement revenue series aggregation and summary queries in `apps/backend/src/dashboard/advanced-reporting.service.ts`
- [x] T016 [US1] Wire `GET /dashboard/revenue-series` and filtered `GET /dashboard/revenue` responses in `apps/backend/src/dashboard/dashboard.controller.ts`
- [x] T017 [P] [US1] Create reusable reporting filter toolbar component in `apps/web-base/src/components/admin/reporting-filter-toolbar.tsx`
- [x] T018 [P] [US1] Create revenue chart/card presentation components in `apps/web-base/src/components/admin/revenue-series-chart.tsx` and `apps/web-base/src/components/admin/revenue-summary-cards.tsx`
- [x] T019 [US1] Refactor admin dashboard page to load and render revenue reporting state in `apps/web-base/src/app/admin/page.tsx`
- [x] T020 [US1] Add empty-state and loading-state handling for revenue widgets in `apps/web-base/src/app/admin/page.tsx`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Phân tích sản phẩm, danh mục, và khách hàng trọng yếu (Priority: P1)

**Goal**: Hiển thị top sản phẩm, lợi nhuận gộp theo danh mục, top khách hàng mua nhiều, và top khách hàng nợ nhiều theo cùng bộ lọc báo cáo

**Independent Test**: Có thể kiểm thử độc lập bằng cách chọn một khoảng thời gian cụ thể và xác nhận các bảng xếp hạng cùng chỉ số lợi nhuận gộp khớp với dữ liệu orders, order_items, stock_entries, customers

### Tests for User Story 2

- [ ] T021 [P] [US2] Add top products contract and ranking tests in `apps/backend/test/dashboard/top-products.contract-spec.ts`
- [x] T022 [P] [US2] Add gross profit by category integration tests including missing-cost cases in `apps/backend/test/dashboard/gross-profit.integration-spec.ts`
- [x] T023 [P] [US2] Add top customers integration tests for purchase and debt rankings in `apps/backend/test/dashboard/top-customers.integration-spec.ts`
- [x] T024 [P] [US2] Add web admin rendering test for ranking widgets and incomplete-cost badges in `apps/web-base/src/app/admin/page.rankings.test.tsx`

### Implementation for User Story 2

- [x] T025 [US2] Implement top products aggregation with stable ranking in `apps/backend/src/dashboard/advanced-reporting.service.ts`
- [x] T026 [US2] Implement gross profit by category aggregation from `orders`, `order_items`, and `stock_entries` in `apps/backend/src/dashboard/advanced-reporting.service.ts`
- [x] T027 [US2] Implement top customers by purchase and debt aggregation in `apps/backend/src/dashboard/advanced-reporting.service.ts`
- [x] T028 [US2] Wire filtered `GET /dashboard/top-products`, `GET /dashboard/gross-profit-by-category`, and `GET /dashboard/top-customers` in `apps/backend/src/dashboard/dashboard.controller.ts`
- [x] T029 [P] [US2] Create top products and customer ranking table components in `apps/web-base/src/components/admin/top-products-table.tsx` and `apps/web-base/src/components/admin/top-customers-panel.tsx`
- [x] T030 [P] [US2] Create gross profit by category component with incomplete-cost state in `apps/web-base/src/components/admin/gross-profit-category-table.tsx`
- [x] T031 [US2] Integrate ranking and profit widgets into `apps/web-base/src/app/admin/page.tsx`
- [x] T032 [US2] Add empty-state handling and tie-order display rules in `apps/web-base/src/components/admin/top-products-table.tsx`, `apps/web-base/src/components/admin/top-customers-panel.tsx`, and `apps/web-base/src/components/admin/gross-profit-category-table.tsx`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Xuất báo cáo để lưu trữ và in sổ sách (Priority: P2)

**Goal**: Cho phép xuất snapshot báo cáo hiện tại sang PDF và Excel, giữ nguyên bộ lọc và số liệu đang xem

**Independent Test**: Có thể kiểm thử độc lập bằng cách áp dụng bộ lọc thời gian, export PDF/Excel, rồi xác nhận metadata kỳ báo cáo và số liệu trong file khớp với dashboard hiện tại

### Tests for User Story 3

- [ ] T033 [P] [US3] Add export contract tests for `POST /dashboard/exports` in `apps/backend/test/dashboard/exports.contract-spec.ts`
- [x] T034 [P] [US3] Add backend export integration tests for PDF/Excel payload consistency in `apps/backend/test/dashboard/exports.integration-spec.ts`
- [x] T035 [P] [US3] Add web admin interaction test for export actions and toast states in `apps/web-base/src/app/admin/page.export.test.tsx`

### Implementation for User Story 3

- [x] T036 [US3] Implement export snapshot assembly from shared reporting service data in `apps/backend/src/dashboard/advanced-reporting.service.ts`
- [x] T037 [US3] Implement export response endpoint and file metadata handling in `apps/backend/src/dashboard/dashboard.controller.ts`
- [x] T038 [P] [US3] Create PDF/Excel export helpers in `apps/web-base/src/lib/admin/reporting-export.ts`
- [x] T039 [P] [US3] Create export action component with Sonner feedback in `apps/web-base/src/components/admin/reporting-export-actions.tsx`
- [x] T040 [US3] Integrate export actions into `apps/web-base/src/app/admin/page.tsx`
- [x] T041 [US3] Add report metadata rendering for exported period and generation timestamp in `apps/web-base/src/components/admin/reporting-export-actions.tsx`

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Hoàn thiện tính nhất quán, tài liệu, và xác minh cuối cho toàn feature

- [x] T042 [P] Document advanced reporting API usage and filter behavior in `specs/014-advanced-reporting-dashboard/quickstart.md`
- [x] T043 Align OpenAPI contract details with final implementation in `specs/014-advanced-reporting-dashboard/contracts/advanced-reporting.yaml`
- [x] T044 [P] Add performance-focused query/index review notes in `specs/014-advanced-reporting-dashboard/research.md`
- [x] T045 Run end-to-end quickstart validation and record outcomes in `specs/014-advanced-reporting-dashboard/tasks.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion - MVP slice
- **User Story 2 (Phase 4)**: Depends on Foundational completion and can proceed in parallel with late-stage US1 UI work if staffed, but simplest order is after US1
- **User Story 3 (Phase 5)**: Depends on Foundational completion and reuses reporting service outputs from US1/US2
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Reuses shared reporting filter and service scaffolding, but remains independently testable
- **User Story 3 (P2)**: Depends on shared reporting outputs from US1 and US2 so export can use the same snapshot logic

### Within Each User Story

- Tests should be written before implementation and fail first
- Backend aggregation logic before controller wiring
- API wiring before frontend integration
- Shared UI components before final page integration
- Story checkpoint must pass before moving to dependent work

### Parallel Opportunities

- `T003` and `T004` can run in parallel after shared type decisions are clear
- `T006`, `T007`, `T010`, and `T011` can run in parallel in Foundational phase
- In US1, `T012`-`T014` can run in parallel; `T017` and `T018` can also run in parallel after API shape is stable
- In US2, `T021`-`T024` can run in parallel; `T029` and `T030` can run in parallel
- In US3, `T033`-`T035` can run in parallel; `T038` and `T039` can run in parallel
- In Polish, `T042` and `T044` can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch User Story 1 tests together:
Task: "Add revenue series contract test coverage in apps/backend/test/dashboard/revenue-series.contract-spec.ts"
Task: "Add backend aggregation integration tests for day/week/month/year grouping in apps/backend/test/dashboard/revenue-series.integration-spec.ts"
Task: "Add web admin interaction test for reporting filter changes in apps/web-base/src/app/admin/page.test.tsx"

# Launch User Story 1 UI components together:
Task: "Create reusable reporting filter toolbar component in apps/web-base/src/components/admin/reporting-filter-toolbar.tsx"
Task: "Create revenue chart/card presentation components in apps/web-base/src/components/admin/revenue-series-chart.tsx and apps/web-base/src/components/admin/revenue-summary-cards.tsx"
```

## Parallel Example: User Story 2

```bash
# Launch User Story 2 backend tests together:
Task: "Add top products contract and ranking tests in apps/backend/test/dashboard/top-products.contract-spec.ts"
Task: "Add gross profit by category integration tests including missing-cost cases in apps/backend/test/dashboard/gross-profit.integration-spec.ts"
Task: "Add top customers integration tests for purchase and debt rankings in apps/backend/test/dashboard/top-customers.integration-spec.ts"

# Launch User Story 2 UI widgets together:
Task: "Create top products and customer ranking table components in apps/web-base/src/components/admin/top-products-table.tsx and apps/web-base/src/components/admin/top-customers-panel.tsx"
Task: "Create gross profit by category component with incomplete-cost state in apps/web-base/src/components/admin/gross-profit-category-table.tsx"
```

## Parallel Example: User Story 3

```bash
# Launch User Story 3 tests together:
Task: "Add export contract tests for POST /dashboard/exports in apps/backend/test/dashboard/exports.contract-spec.ts"
Task: "Add backend export integration tests for PDF/Excel payload consistency in apps/backend/test/dashboard/exports.integration-spec.ts"
Task: "Add web admin interaction test for export actions and toast states in apps/web-base/src/app/admin/page.export.test.tsx"

# Launch User Story 3 frontend work together:
Task: "Create PDF/Excel export helpers in apps/web-base/src/lib/admin/reporting-export.ts"
Task: "Create export action component with Sonner feedback in apps/web-base/src/components/admin/reporting-export-actions.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate revenue filtering and chart behavior independently
5. Demo the advanced revenue dashboard before adding deeper analytics

### Incremental Delivery

1. Complete Setup + Foundational → reporting foundation ready
2. Add User Story 1 → test independently → MVP demo
3. Add User Story 2 → test independently → analytics dashboard demo
4. Add User Story 3 → test independently → export workflow demo
5. Finish Polish tasks and re-run quickstart validation

### Parallel Team Strategy

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: US1 revenue API + revenue UI
   - Developer B: US2 analytics aggregations + ranking widgets
   - Developer C: US3 export flow after shared snapshot contract stabilizes
3. Merge by story checkpoint, not by file batch

---

## Notes

- All tasks follow the required checklist format with task ID and exact file paths
- `[P]` is used only where the file set is disjoint enough for parallel work
- Each user story has explicit independent test criteria
- Suggested MVP scope is **User Story 1** only
- User Story task counts: `US1 = 9`, `US2 = 12`, `US3 = 9`
