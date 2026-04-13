# Tasks: Nâng cấp UX Lịch Mùa vụ

**Input**: Design documents from `/specs/017-calendar-ux-enhance/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/api.md ✅, quickstart.md ✅

**Tests**: Not explicitly requested — test tasks omitted.

**Organization**: Tasks grouped by user story (US1–US7) for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1–US7)
- Paths relative to monorepo root

## Path Conventions

- **Backend**: `apps/backend/src/season-calendar/`
- **Frontend**: `apps/web-base/src/app/admin/season-calendar/`
- **Frontend lib**: `apps/web-base/src/lib/admin/`
- **Migrations**: `apps/backend/src/database/migrations/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: New entities, migrations, and module registration for ALL user stories

- [X] T001 [P] Create `PestWarning` entity in `apps/backend/src/season-calendar/entities/pest-warning.entity.ts` — UUID PK, growthStageId (FK → growth_stages ON DELETE CASCADE), name (varchar 150), symptoms (text nullable), severity (enum: low/medium/high, default medium), preventionNote (text nullable), sortOrder (int default 0), timestamps. ManyToOne → GrowthStage. ManyToMany → Product via join table.
- [X] T002 [P] Create `PestWarningProduct` join entity or TypeORM ManyToMany with join table `pest_warning_products` — pest_warning_id (FK), product_id (FK → products), usageNote (text nullable). Composite PK.
- [X] T003 [P] Create `WeatherBaseline` entity in `apps/backend/src/season-calendar/entities/weather-baseline.entity.ts` — UUID PK, zoneId (FK → agricultural_zones ON DELETE CASCADE), month (smallint 1-12), avgTempC (decimal 4,1), avgRainfallMm (decimal 6,1), notes (text nullable), timestamps. ManyToOne → AgriculturalZone. Unique(zoneId, month).
- [X] T004 [P] Create `SeasonActivityLog` entity in `apps/backend/src/season-calendar/entities/season-activity-log.entity.ts` — UUID PK, actorId (UUID), actorName (varchar 100), action (enum: create/update/delete), entityType (varchar 30), entityId (UUID), entityName (varchar 200), metadata (jsonb nullable), createdAt (timestamptz). Index on (created_at DESC) and (entity_type, created_at DESC). No updatedAt — immutable.
- [X] T005 Modify `GrowthStage` entity in `apps/backend/src/season-calendar/entities/growth-stage.entity.ts` — add `careActivities` column (text[] nullable). Add OneToMany → PestWarning relation.
- [X] T006 Update barrel export `apps/backend/src/season-calendar/entities/index.ts` — add PestWarning, WeatherBaseline, SeasonActivityLog exports.
- [X] T007 Create migration `017-01-alter-growth-stages` — ALTER TABLE growth_stages ADD COLUMN care_activities TEXT[]
- [X] T008 Create migration `017-02-create-pest-warnings` — CREATE TABLE pest_warnings + pest_warning_products + indexes per data-model.md
- [X] T009 [P] Create migration `017-03-create-weather-baselines` — CREATE TABLE + UNIQUE(zone_id, month) + index per data-model.md
- [X] T010 [P] Create migration `017-04-create-activity-logs` — CREATE TABLE season_activity_logs + indexes per data-model.md
- [X] T011 Create seed migration `017-05-seed-weather-data` — INSERT 96 rows (8 vùng × 12 tháng) khí hậu trung bình VN per research.md
- [X] T012 Create seed migration `017-06-seed-pest-warnings` — INSERT sample pest warnings cho Lúa ĐBSCL: Rầy nâu (severity high), Đạo ôn (medium), Sâu cuốn lá (medium) với product links + careActivities samples cho existing growth stages
- [X] T013 Update `SeasonCalendarModule` in `apps/backend/src/season-calendar/season-calendar.module.ts` — register new entities (PestWarning, WeatherBaseline, SeasonActivityLog) in TypeOrmModule.forFeature, register new controllers + services.

**Checkpoint**: Database schema ready — new tables created, seed data loaded, module registers all new entities

---

## Phase 2: Foundational (Backend Services)

**Purpose**: Core services that multiple user stories depend on

**⚠️ CRITICAL**: No user story frontend can begin until backend APIs are ready

- [X] T014 [P] Create DTOs in `apps/backend/src/season-calendar/dto/create-pest-warning.dto.ts` — CreatePestWarningDto (name, symptoms?, severity?, preventionNote?, sortOrder?, treatmentProductIds[]?, usageNotes?: Record<string,string>), UpdatePestWarningDto (partial). Class-validator decorators.
- [X] T015 [P] Create DTOs in `apps/backend/src/season-calendar/dto/create-weather-baseline.dto.ts` — CreateWeatherBaselineDto (zoneId, month, avgTempC, avgRainfallMm, notes?). Class-validator decorators.
- [X] T016 [P] Create DTOs in `apps/backend/src/season-calendar/dto/activity-log-query.dto.ts` — ActivityLogQueryDto (page?, limit?, entityType?, fromDate?, toDate?). Class-validator + class-transformer.
- [X] T017 Create `PestWarningService` in `apps/backend/src/season-calendar/services/pest-warning.service.ts` — findByStageId(stageId), create(stageId, dto), update(id, dto), delete(id). Handle treatmentProductIds linking to pest_warning_products join table.
- [X] T018 [P] Create `WeatherBaselineService` in `apps/backend/src/season-calendar/services/weather-baseline.service.ts` — findByZone(zoneId), createOrUpsert(dto), delete(id), findAll(zoneId?).
- [X] T019 Create `ActivityLogService` in `apps/backend/src/season-calendar/services/activity-log.service.ts` — log(actorId, actorName, action, entityType, entityId, entityName, metadata?), findPaginated(query: ActivityLogQueryDto), purgeOlderThan(months: number). Include @Cron('0 3 * * *') daily purge job deleting entries > 6 months.
- [X] T020 Modify `SeasonCalendarService` in `apps/backend/src/season-calendar/services/season-calendar.service.ts` — update getCalendar() to include careActivities and pestWarnings (with treatmentProducts) in each stage's response. Add LEFT JOIN pest_warnings + pest_warning_products + products.

**Checkpoint**: All backend services ready — pest warnings, weather, activity log services functional

---

## Phase 3: User Story 1 — Year Timeline / Gantt View (Priority: P1) 🎯 MVP

**Goal**: Biểu đồ Gantt ngang 12 tháng + "Hôm nay" indicator + hover tooltip + click → Sheet detail

**Independent Test**: Chọn vùng ĐBSCL → chuyển sang Timeline view → thấy bars ngang cho gieo trồng/chăm sóc/thu hoạch, đường đỏ "Hôm nay" ở tháng hiện tại, hover bar → tooltip, click bar → Sheet.

### Backend for US1

- [X] T021 [US1] No new backend needed — calendar API already returns all data needed. Verify getCalendar response has stages with startMonth/endMonth for bar rendering.

### Frontend for US1

- [X] T022 [US1] Create `SeasonCalendarTimeline` component in `apps/web-base/src/app/admin/season-calendar/components/SeasonCalendarTimeline.tsx` — CSS Grid layout: `grid-template-columns: 180px repeat(12, 1fr)`. Header row (crop name | T1–T12). Per-crop row with bar cells using `gridColumn: startMonth / endMonth+1`. Color coding: planting=emerald, care=blue, harvest=amber. Hover tooltip (stage name, type, T?–T?, description). Click → callback to open Sheet. Handle cross-year bars (split into 2 segments with dashed border indicator).
- [X] T023 [US1] Add "Hôm nay" indicator to `SeasonCalendarTimeline` — absolute-positioned vertical line (2px solid red) at column = currentMonth. Label "Hôm nay" above the line. z-index above bars.
- [X] T024 [US1] Modify `apps/web-base/src/app/admin/season-calendar/page.tsx` — change view mode toggle from 2 to 3 options: Grid / Table / **Timeline**. When viewMode="timeline", render `SeasonCalendarTimeline` component instead of Grid/Table. Pass same props (items, month, zoneId, etc.).
- [X] T025 [US1] Extract StageDetailSheet from `SeasonCalendarGrid.tsx` into `apps/web-base/src/app/admin/season-calendar/components/StageDetailSheet.tsx` — reusable Sheet component accepting (calendar, stage, zoneId, month, open, onClose). Used by both SeasonCalendarGrid and SeasonCalendarTimeline on click.
- [X] T026 [US1] Update `SeasonCalendarGrid.tsx` — replace inline Sheet with the extracted `StageDetailSheet` component. No behavior change, just refactor.

**Checkpoint**: US1 complete — user can view Gantt timeline with bars, "Hôm nay" indicator, tooltips, and click-to-detail

---

## Phase 4: User Story 2 — Enriched Stage Detail Panel (Priority: P1)

**Goal**: Sheet chi tiết với checklist chăm sóc, cảnh báo sâu bệnh (từ bảng riêng), product links

**Independent Test**: Click giai đoạn "Đẻ nhánh" → Sheet hiện: checklist hoạt động, cảnh báo Rầy nâu (severity high + sản phẩm trị), gợi ý sản phẩm.

### Backend for US2

- [X] T027 [P] [US2] Create `AdminPestWarningsController` in `apps/backend/src/season-calendar/controllers/admin-pest-warnings.controller.ts` — GET `/admin/season-calendar/stages/:stageId/pest-warnings`, POST same, PATCH `/admin/season-calendar/pest-warnings/:id`, DELETE same. Admin auth guard. Inject ActivityLogService for create/update/delete logging.
- [X] T028 [US2] Verify T020 (SeasonCalendarService modification) includes pestWarnings + careActivities in calendar response correctly.

### Frontend for US2

- [X] T029 [US2] Enhance `StageDetailSheet.tsx` — add sections: (a) Care Activities checklist (checkbox + text, client-only state via useState), (b) Pest Warnings section with severity badge (high=red, medium=amber, low=blue), symptom text, prevention note, treatment products as clickable links. (c) Existing ProductSuggestionPanel.
- [X] T030 [US2] Update `apps/web-base/src/lib/admin/season-calendar-admin-api.ts` — add pest warning CRUD functions: fetchPestWarnings(stageId), createPestWarning(stageId, dto), updatePestWarning(id, dto), deletePestWarning(id).
- [X] T031 [US2] Add pest warning management UI inside the edit calendar Dialog (admin-only) — within each stage's Accordion section, add Pest Warnings sub-section after recommendations: list existing warnings (name, severity badge, delete button), "Add pest warning" form (name, symptoms, severity select, preventionNote, product multi-select, usage notes).

**Checkpoint**: US2 complete — Stage detail Sheet shows enriched content, admin can CRUD pest warnings

---

## Phase 5: User Story 3 — Quick Stats & Mini Dashboard (Priority: P2)

**Goal**: Stats pills phía trên calendar: số cây gieo trồng / chăm sóc / thu hoạch, click filter

**Independent Test**: Chọn ĐBSCL, tháng 4 → stats hiện "2 gieo trồng • 3 chăm sóc • 1 thu hoạch". Click "Chăm sóc" → grid filter chỉ hiện cây chăm sóc.

### Frontend for US3

- [X] T032 [US3] Create `QuickStatsCards` component in `apps/web-base/src/app/admin/season-calendar/components/QuickStatsCards.tsx` — accepts calendar items + current month. Computes counts per stage type (planting/care/harvest) by checking stageForMonth(). Renders 3 cards: (planting count, emerald, Sprout icon), (care count, blue, Droplets icon), (harvest count, amber, Wheat icon). Each card clickable → calls onFilterStage(stageType).
- [X] T033 [US3] Integrate `QuickStatsCards` into `page.tsx` — place between filter toolbar and calendar view. Wire onFilterStage callback to set stageFilter state (already exists). Replace 3 existing generic stats cards with QuickStatsCards.

**Checkpoint**: US3 complete — Quick stats display and click-to-filter working

---

## Phase 6: User Story 4 — Search / Filter Cây Trồng Nhanh (Priority: P2)

**Goal**: Ô tìm kiếm inline filter cây trồng theo name + localNames, match badge hiện keyword

**Independent Test**: Gõ "bắp" → Ngô hiện lên với badge "bắp". Xóa search → tất cả cây hiển thị lại.

### Frontend for US4

- [X] T034 [US4] Create `CropSearchInput` component in `apps/web-base/src/app/admin/season-calendar/components/CropSearchInput.tsx` — shadcn Input with Search icon (lucide), clear button (X icon). Debounce 200ms. Emits onChange(keyword). Placeholder "Tìm kiếm cây trồng..."
- [X] T035 [US4] Integrate `CropSearchInput` into `page.tsx` — add searchKeyword state. Place CropSearchInput in the filter toolbar row. Pass keyword to SeasonCalendarGrid/Table/Timeline as filterKeyword prop.
- [X] T036 [US4] Update filtering in `SeasonCalendarGrid.tsx` and `SeasonCalendarTimeline.tsx` — add filterKeyword prop. Filter items by: `crop.name.toLowerCase().includes(keyword) || crop.localNames?.some(n => n.toLowerCase().includes(keyword))`. When match via localNames, render Badge with matched localName text in crop row.

**Checkpoint**: US4 complete — Search filters crops across all view modes with match indicators

---

## Phase 7: User Story 5 — Multi-Season Overlay (Priority: P3)

**Goal**: Multi-select cây trồng, overlay tất cả trên cùng Gantt timeline, workload highlight

**Independent Test**: Bật overlay → chọn Lúa + Ngô + Cà phê → Timeline hiện 3 rows. Tháng có ≥3 cây cùng "chăm sóc" → highlight badge.

### Frontend for US5

- [X] T037 [US5] Add overlay mode toggle to `page.tsx` — new state `overlayMode: boolean`, `selectedCropIds: string[]`. When overlay ON, show shadcn multi-select (Combobox with checkboxes) cho crops. Pass selectedCropIds to Timeline.
- [X] T038 [US5] Update `SeasonCalendarTimeline.tsx` — accept overlayMode + selectedCropIds props. When overlay ON, filter items to only selected crops. Add workload summary row at bottom: per month, count how many selected crops share same stageType → if ≥3, show Badge "3 cây — Chăm sóc" in that month column with warning color.
- [X] T039 [US5] Handle UX details: when overlay is toggled OFF, clear selectedCropIds, revert to normal filter behavior. Ensure "Hôm nay" line still visible in overlay mode.

**Checkpoint**: US5 complete — Multi-crop overlay on timeline with workload highlighting

---

## Phase 8: User Story 6 — Weather Overlay (Priority: P3)

**Goal**: Mini chart nhiệt độ + lượng mưa phía dưới timeline, toggle on/off

**Independent Test**: Chọn ĐBSCL → bật "Thời tiết" → mini chart hiện 12 bars lượng mưa + line nhiệt độ. Hover T7 → tooltip "230mm, 28°C".

### Backend for US6

- [X] T040 [P] [US6] Create `WeatherController` in `apps/backend/src/season-calendar/controllers/weather.controller.ts` — GET `/season-calendar/weather?zoneId=` returning weather baselines for zone. No auth required (public).
- [X] T041 [P] [US6] Create `AdminWeatherController` in `apps/backend/src/season-calendar/controllers/admin-weather.controller.ts` — GET/POST/DELETE `/admin/season-calendar/weather`. POST upserts (zoneId, month). Admin auth guard. Inject ActivityLogService for logging.

### Frontend for US6

- [X] T042 [US6] Update `apps/web-base/src/lib/admin/season-calendar-api.ts` — add fetchWeather(zoneId) function returning weather baselines array.
- [X] T043 [US6] Create `WeatherOverlay` component in `apps/web-base/src/app/admin/season-calendar/components/WeatherOverlay.tsx` — accepts weatherData array (12 months). Renders Recharts `<ComposedChart>` inside `<ResponsiveContainer height={80}>`: Bar series for rainfall (mm, blue fill), Line series for temperature (°C, red stroke). Custom tooltip: "T7 — ĐBSCL: 230mm mưa, 28°C". Handle empty data: show "Chưa có dữ liệu khí hậu cho vùng này."
- [X] T044 [US6] Integrate `WeatherOverlay` into `page.tsx` — add weatherEnabled toggle (Switch component). When ON, fetch weather data for selected zone. Render WeatherOverlay below Timeline/Grid. Pass zoneId to fetch on zone change.

**Checkpoint**: US6 complete — Weather overlay toggleable with mini chart below calendar

---

## Phase 9: User Story 7 — Activity Log (Priority: P3)

**Goal**: Trang Activity Log với timeline UI, filter theo entity type và thời gian, infinite scroll, 6-month retention

**Independent Test**: Admin sửa giai đoạn → vào Activity Log → thấy entry "Admin Cường đã cập nhật giai đoạn 'Đẻ nhánh'". Filter entity type "stage" → chỉ hiện stage actions.

### Backend for US7

- [X] T045 [US7] Create `ActivityLogController` in `apps/backend/src/season-calendar/controllers/activity-log.controller.ts` — GET `/admin/season-calendar/activity-log` with query params (page, limit, entityType, fromDate, toDate). Admin auth guard. Calls ActivityLogService.findPaginated().
- [X] T046 [US7] Integrate ActivityLogService into ALL existing admin controllers — inject ActivityLogService into AdminZonesController, AdminCropsController, AdminCalendarController, AdminPestWarningsController, AdminWeatherController. After each create/update/delete, call `activityLogService.log(actor, action, entityType, entityId, entityName, metadata)`. Extract actor from request (req.user).
- [X] T047 [US7] Add CRON job in `ActivityLogService` — `@Cron('0 3 * * *')` daily at 3AM, call `purgeOlderThan(6)` to DELETE entries > 6 months.

### Frontend for US7

- [X] T048 [US7] Update `apps/web-base/src/lib/admin/season-calendar-api.ts` — add fetchActivityLog(params: {page, limit, entityType?, fromDate?, toDate?}) function.
- [X] T049 [US7] Create activity log page `apps/web-base/src/app/admin/season-calendar/activity-log/page.tsx` — layout with: (a) Header "Nhật ký hoạt động", (b) Filter row: entity type Select (tất cả / zone / crop / calendar / stage / recommendation / pest_warning / weather), date range (shadcn DatePicker from/to, max 6 months back), (c) Timeline-style list: each entry shows lucide icon per action (Plus=create, Pencil=update, Trash2=delete), actor name, action text, entity name, relative time (date-fns formatDistanceToNow). (d) Infinite scroll: load 20 at a time, IntersectionObserver for next page.
- [X] T050 [US7] Add "Nhật ký" link to season calendar page header — navigation button alongside "Quản lý vùng" and "Quản lý cây trồng". Icon: Activity from lucide-react. Route: `/admin/season-calendar/activity-log`.

**Checkpoint**: US7 complete — Activity log page shows CRUD history, filterable, infinite scroll, 6-month auto-purge

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: UX improvements, edge cases, code quality

- [X] T051 [P] Add loading skeletons to SeasonCalendarTimeline (Gantt bars skeleton), WeatherOverlay (chart placeholder), QuickStatsCards (3 skeleton cards), activity log page (skeleton list)
- [X] T052 [P] Add empty states: Timeline with no data ("Chưa có dữ liệu mùa vụ cho vùng này"), search no results ("Không tìm thấy cây trồng phù hợp — thử từ khóa khác"), activity log empty ("Chưa có hoạt động nào được ghi nhận"), weather no data ("Chưa có dữ liệu khí hậu")
- [X] T053 Add responsive handling for SeasonCalendarTimeline — on screens < 768px, switch to horizontal scroll mode for the 12-month grid. Ensure touch interactions work for mobile.
- [ ] T054 Run quickstart.md validation — verify all 10 verification steps pass (DB migrations, weather API, enriched calendar, activity log, timeline view, stats, search, stage detail, weather overlay, log page)
- [X] T055 Code cleanup: ensure all new files have proper TypeScript types, remove console.logs, verify module imports complete, ensure Sonner toast on all CRUD operations per constitution

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — **BLOCKS all user stories**
- **Phase 3 (US1)**: Depends on Phase 2 — MVP target
- **Phase 4 (US2)**: Depends on Phase 2 + T025 (StageDetailSheet extraction from US1)
- **Phase 5 (US3)**: Depends on Phase 2 only — frontend-only, independent of US1/US2
- **Phase 6 (US4)**: Depends on Phase 2 only — frontend-only, independent
- **Phase 7 (US5)**: Depends on US1 (needs SeasonCalendarTimeline component to exist)
- **Phase 8 (US6)**: Depends on Phase 2 backend (weather endpoints)
- **Phase 9 (US7)**: Depends on Phase 2 backend (ActivityLogService must be integrated into all controllers)
- **Phase 10 (Polish)**: Depends on all desired stories being complete

### User Story Dependencies

- **US1 (P1)**: Start after Phase 2 — no dependencies on other stories
- **US2 (P1)**: Backend independent. Frontend needs T025 (StageDetailSheet) from US1
- **US3 (P2)**: Fully independent from US1/US2 — frontend-only
- **US4 (P2)**: Fully independent — frontend-only
- **US5 (P3)**: Needs US1's SeasonCalendarTimeline component
- **US6 (P3)**: Backend + frontend, independent of other stories
- **US7 (P3)**: Backend needs T046 (integrate into ALL existing controllers) — best done late

### Within Each User Story

- Entities before DTOs
- DTOs before Services
- Services before Controllers
- Backend before Frontend
- Component extraction before enhancement

### Parallel Opportunities

- T001–T004: All 4 new entities in parallel
- T007–T010: All 4 migrations in parallel (after entities)
- T014–T016: All 3 DTOs in parallel
- T017–T019: PestWarning, Weather, ActivityLog services in parallel
- T027 + T040–T041: Pest warning controller + Weather controllers in parallel
- US3 (T032–T033) + US4 (T034–T036): Both are frontend-only, independent
- US6 backend (T040–T041) can run in parallel with US3/US4 frontend

---

## Implementation Strategy

### MVP First (US1 + US2)

1. Complete Phase 1: Setup (T001–T013)
2. Complete Phase 2: Foundational services (T014–T020)
3. Complete Phase 3: US1 — Gantt Timeline (T021–T026)
4. Complete Phase 4: US2 — Enriched Detail (T027–T031)
5. **STOP and VALIDATE**: Gantt view works, pest warnings display in Sheet
6. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → DB + services ready
2. Add US1 → Gantt Timeline works → **Deploy (MVP!)**
3. Add US2 → Enriched detail → Deploy
4. Add US3 + US4 (parallel) → Stats + Search → Deploy
5. Add US5 → Overlay → Deploy
6. Add US6 + US7 (parallel) → Weather + Log → Deploy
7. Polish → Production-ready

### Parallel Team Strategy

With 2 developers after Phase 2:
- **Dev A**: US1 → US5 (timeline-focused, needs same component)
- **Dev B**: US2 → US3 → US4 (detail + stats + search, independent)
- Then both: US6 + US7 → Polish

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Cross-year bars in Gantt (startMonth > endMonth) — critical visual edge case, test with Vụ Đông Xuân (T11–T2)
- Checklist state (careActivities) is client-only — no backend persistence needed
- Activity log retention 6 months — CRON job at 3AM daily
- Weather data is seed-only — 96 rows for 8 zones
- All new admin controllers must inject ActivityLogService for audit
- shadcn components used: Tabs/ToggleGroup, Badge, Card, Sheet, Input, Switch, Select, Skeleton, Sonner
- Sonner toast required for ALL CRUD ops per constitution
