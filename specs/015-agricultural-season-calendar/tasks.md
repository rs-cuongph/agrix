# Tasks: Lịch Mùa vụ Nông nghiệp

**Input**: Design documents from `/specs/015-agricultural-season-calendar/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/api.md ✅, quickstart.md ✅

**Tests**: Not explicitly requested — test tasks omitted.

**Organization**: Tasks grouped by user story (US1–US4) for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1, US2, US3, US4)
- Paths relative to monorepo root

## Path Conventions

- **Backend**: `apps/backend/src/season-calendar/`
- **Frontend**: `apps/web-base/src/app/admin/season-calendar/`
- **Migration**: `apps/backend/src/database/migrations/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the NestJS module skeleton and register it in the app

- [X] T001 Create module directory structure per plan.md: `apps/backend/src/season-calendar/{entities,dto,controllers,services}/`
- [X] T002 Create `SeasonCalendarModule` in `apps/backend/src/season-calendar/season-calendar.module.ts` — import TypeOrmModule.forFeature with all 5 entities, register all controllers and services
- [X] T003 Register `SeasonCalendarModule` in `apps/backend/src/app.module.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Entities, migration, and seed data that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 [P] Create `AgriculturalZone` entity in `apps/backend/src/season-calendar/entities/agricultural-zone.entity.ts` — UUID PK, name (unique), code (unique), description, provinces (text[]), isActive, timestamps. OneToMany → SeasonCalendar
- [X] T005 [P] Create `Crop` entity in `apps/backend/src/season-calendar/entities/crop.entity.ts` — UUID PK, name (unique), localNames (text[] with GIN index), category, description, imageUrl, isActive, timestamps. OneToMany → SeasonCalendar
- [X] T006 [P] Create `SeasonCalendar` entity in `apps/backend/src/season-calendar/entities/season-calendar.entity.ts` — UUID PK, zoneId (FK), cropId (FK), seasonName, year (nullable), notes, isActive, timestamps. ManyToOne → Zone, Crop. OneToMany → GrowthStage. Unique(zoneId, cropId, seasonName, year)
- [X] T007 [P] Create `GrowthStage` entity in `apps/backend/src/season-calendar/entities/growth-stage.entity.ts` — UUID PK, seasonCalendarId (FK), name, stageType ('planting'|'care'|'harvest'), startMonth (1-12), endMonth (1-12), description, keywords (text[] with GIN index), sortOrder, timestamps. ManyToOne → SeasonCalendar. OneToMany → ProductRecommendation
- [X] T008 [P] Create `ProductRecommendation` entity in `apps/backend/src/season-calendar/entities/product-recommendation.entity.ts` — UUID PK, growthStageId (FK), productId (FK → existing products table), reason, priority (1-5), dosageNote, timestamps. ManyToOne → GrowthStage, Product. Unique(growthStageId, productId)
- [X] T009 Create barrel export `apps/backend/src/season-calendar/entities/index.ts` exporting all 5 entities
- [X] T010 Generate and run TypeORM migration `apps/backend/src/database/migrations/015-season-calendar` — creates all 5 tables with indexes per data-model.md
- [X] T011 Create seed migration `apps/backend/src/database/migrations/015-season-calendar-seed` — inserts 8 agricultural zones (Tây Bắc, Đông Bắc, ĐBSH, Bắc Trung Bộ, Nam Trung Bộ, Tây Nguyên, Đông Nam Bộ, ĐBSCL with provinces), 10 crops (Lúa, Ngô, Đậu tương, Rau cải, Cà chua, Cà phê, Tiêu, Mía, Chuối, Lúa mì with localNames), sample season calendars for Lúa at ĐBSCL (3 vụ: Đông Xuân, Hè Thu, Thu Đông with growth stages), and sample product recommendations linking to existing products

**Checkpoint**: Database schema ready — all entities registered, migration applied, seed data loaded

---

## Phase 3: User Story 1 — Xem Lịch Mùa vụ Theo Vùng (Priority: P1) 🎯 MVP

**Goal**: Người dùng chọn vùng + tháng → xem danh sách cây trồng với giai đoạn sinh trưởng hiện tại dưới dạng calendar grid

**Independent Test**: Chọn vùng "ĐBSCL" + tháng 4 → thấy cây lúa trong giai đoạn "Đẻ nhánh". Click cây trồng → xem chi tiết lịch mùa vụ đầy đủ.

### Backend for US1

- [X] T012 [P] [US1] Create `ZonesService` in `apps/backend/src/season-calendar/services/zones.service.ts` — findAll(activeOnly), findOne(id). Query `agricultural_zones` with relations.
- [X] T013 [P] [US1] Create `CropsService` in `apps/backend/src/season-calendar/services/crops.service.ts` — findAll(zoneId?), findOne(id). When zoneId provided, filter crops that have season_calendars at that zone.
- [X] T014 [P] [US1] Create `SeasonCalendarService` in `apps/backend/src/season-calendar/services/season-calendar.service.ts` — getCalendar(zoneId, month?, cropId?). Query season_calendars + growth_stages, filter by month using startMonth/endMonth logic (handle cross-year: if endMonth < startMonth). Return grouped by crop with currentStage per contracts/api.md response shape.
- [X] T015 [P] [US1] Create `ZonesController` in `apps/backend/src/season-calendar/controllers/zones.controller.ts` — GET `/api/season-calendar/zones` returning active zones per contract
- [X] T016 [P] [US1] Create `CropsController` in `apps/backend/src/season-calendar/controllers/crops.controller.ts` — GET `/api/season-calendar/crops?zoneId=` returning crops list per contract
- [X] T017 [US1] Create `SeasonCalendarController` in `apps/backend/src/season-calendar/controllers/season-calendar.controller.ts` — GET `/api/season-calendar/calendar?zoneId=&month=&cropId=` returning calendar data per contract
- [X] T018 [P] [US1] Create DTOs: `apps/backend/src/season-calendar/dto/create-zone.dto.ts` (name, code, description?, provinces?), `apps/backend/src/season-calendar/dto/create-crop.dto.ts` (name, localNames?, category?, description?, imageUrl?) with class-validator decorators

### Frontend for US1

- [X] T019 [P] [US1] Create `ZoneSelector` component in `apps/web-base/src/app/admin/season-calendar/components/ZoneSelector.tsx` — shadcn Select dropdown fetching zones from API, emitting selected zone ID. Show zone name + province count.
- [X] T020 [P] [US1] Create API client functions in `apps/web-base/src/lib/admin/season-calendar-api.ts` — fetchZones(), fetchCrops(zoneId?), fetchCalendar(zoneId, month?, cropId?), fetchSuggestions(zoneId, month, cropId, stageId?)
- [X] T021 [US1] Create `SeasonCalendarGrid` component in `apps/web-base/src/app/admin/season-calendar/components/SeasonCalendarGrid.tsx` — CSS Grid: 12 columns (months) × N rows (crops). Cells show growth stage badges with color coding: planting=emerald, care=blue, harvest=amber. Click cell → detail dialog. Handle cross-year stages (startMonth > endMonth wraps).
- [X] T022 [US1] Create season calendar page `apps/web-base/src/app/admin/season-calendar/page.tsx` — layout with ZoneSelector + month filter (shadcn Select 1-12) + SeasonCalendarGrid. Fetch data on zone/month change. Include table view toggle (Table vs Grid). Add to admin sidebar navigation.
- [X] T023 [US1] Add "Lịch Mùa vụ" navigation item to admin sidebar in `apps/web-base/src/app/admin/` sidebar component — icon: CalendarDays from lucide-react, route: `/admin/season-calendar`

**Checkpoint**: US1 complete — user can browse season calendar by zone and month, see crop stages in grid/table view

---

## Phase 4: User Story 2 — AI Gợi ý Sản phẩm Theo Mùa vụ (Priority: P2)

**Goal**: Nhấn "Gợi ý sản phẩm" → hệ thống trả về danh sách sản phẩm Agrix phù hợp với giai đoạn mùa vụ, kèm lý do và tồn kho

**Independent Test**: Chọn ĐBSCL → tháng 3 → cây lúa → nhấn "Gợi ý sản phẩm" → thấy danh sách phân bón phù hợp giai đoạn đẻ nhánh với giá + tồn kho.

### Backend for US2

- [X] T024 [US2] Create `SeasonSuggestionService` in `apps/backend/src/season-calendar/services/season-suggestion.service.ts` — getSuggestions(zoneId, month, cropId, stageId?). Phase 1: query product_recommendations JOIN products (with stock, price from inventory module). Phase 2 (optional): call existing AI service to rank + explain results. Timeout 2500ms with fallback to Phase 1 results. Return response per contracts/api.md suggest endpoint shape.
- [X] T025 [P] [US2] Create `SeasonSuggestionDto` in `apps/backend/src/season-calendar/dto/season-suggestion.dto.ts` — response DTO matching contracts/api.md suggest response (context, explanation, products array with id, name, sku, baseSellPrice, baseUnit, currentStockBase, reason, dosageNote, priority)
- [X] T026 [US2] Create `SeasonSuggestionController` in `apps/backend/src/season-calendar/controllers/season-suggestion.controller.ts` — GET `/api/season-calendar/suggest?zoneId=&month=&cropId=&stageId=` calling SeasonSuggestionService

### Frontend for US2

- [X] T027 [US2] Create `ProductSuggestionPanel` component in `apps/web-base/src/app/admin/season-calendar/components/ProductSuggestionPanel.tsx` — shadcn Card list showing suggested products. Each card: product name, SKU, price (formatted VNĐ), stock badge (in stock = green, out of stock = red with "Hết hàng"), reason text, dosage note. Loading skeleton state. Empty state "Chưa có gợi ý". Product name links to product detail page.
- [X] T028 [US2] Integrate "Gợi ý sản phẩm" button into `SeasonCalendarGrid.tsx` — when user clicks a crop's growth stage cell, show a Sheet/Dialog with ProductSuggestionPanel fetching suggestions for that zone + month + crop + stage.

**Checkpoint**: US2 complete — user can get AI-powered product suggestions for any crop stage

---

## Phase 5: User Story 3 — Chatbot Tư vấn Mùa vụ Thông minh (Priority: P2)

**Goal**: Chatbot tự nhận diện câu hỏi mùa vụ, inject context sản phẩm gợi ý vào response

**Independent Test**: Gửi "Cây lúa đang ở giai đoạn đẻ nhánh, nên dùng phân gì?" → chatbot trả lời kèm sản phẩm phân bón cụ thể có trong hệ thống.

### Backend for US3

- [X] T029 [US3] Create `SeasonChatbotContextService` in `apps/backend/src/season-calendar/services/season-chatbot-context.service.ts` — buildContext(question: string): Promise<string|null>. Implementation: (1) normalize question (lowercase, remove diacritics for matching), (2) match crop keywords from crops.localNames (GIN index query), (3) match growth stage keywords from growth_stages.keywords, (4) if matches found: query season calendar + product recommendations, (5) build context string per contracts/api.md chatbot context format, (6) return null if no crop/stage detected (conservative matching).
- [X] T030 [P] [US3] Create `ChatbotSeasonContextDto` in `apps/backend/src/season-calendar/dto/chatbot-season-context.dto.ts` — internal DTO for buildContext result (detectedCrop, detectedStage, contextString, confidence)
- [X] T031 [US3] Modify `apps/backend/src/ai/ai.controller.ts` — inject `SeasonChatbotContextService`. Before calling `chatbotService.ask()`, call `seasonChatbotContextService.buildContext(question)`. If context returned, pass as productContext parameter. Preserve existing fallback behavior when no season context detected.

**Checkpoint**: US3 complete — chatbot automatically enriches answers with season-specific product suggestions

---

## Phase 6: User Story 4 — Quản lý Dữ liệu Mùa vụ (Priority: P3)

**Goal**: Admin có thể CRUD vùng, cây trồng, lịch mùa vụ, giai đoạn sinh trưởng, gợi ý sản phẩm qua web admin

**Independent Test**: Admin thêm lịch mùa vụ cho cây "Cà phê" tại "Tây Nguyên" → dữ liệu xuất hiện trong calendar grid. Chỉnh sửa giai đoạn → chatbot dùng dữ liệu mới.

### Backend for US4

- [X] T032 [P] [US4] Create `CreateSeasonCalendarDto` in `apps/backend/src/season-calendar/dto/create-season-calendar.dto.ts` — zoneId, cropId, seasonName, year?, notes?. Create `CreateGrowthStageDto` — seasonCalendarId, name, stageType, startMonth, endMonth, description?, keywords?, sortOrder?. Create `CreateProductRecommendationDto` — growthStageId, productId, reason?, priority?, dosageNote?.  All with class-validator decorators.
- [X] T033 [P] [US4] Add admin CRUD methods to `ZonesService` — create(dto), update(id, dto), softDelete(id). Add admin CRUD to `CropsService` — create(dto), update(id, dto), softDelete(id).
- [X] T034 [US4] Add admin CRUD methods to `SeasonCalendarService` — create(dto), update(id, dto), delete(id). Add methods for growth stages: addStage(calendarId, dto), updateStage(stageId, dto), deleteStage(stageId). Add methods for product recommendations: addRecommendation(stageId, dto), deleteRecommendation(id).
- [X] T035 [US4] Create admin controllers per contracts/api.md: `apps/backend/src/season-calendar/controllers/admin-zones.controller.ts` — POST/PATCH/DELETE `/api/admin/season-calendar/zones`. Guard with admin auth.
- [X] T036 [P] [US4] Create `apps/backend/src/season-calendar/controllers/admin-crops.controller.ts` — POST/PATCH/DELETE `/api/admin/season-calendar/crops`. Guard with admin auth.
- [X] T037 [US4] Create `apps/backend/src/season-calendar/controllers/admin-calendar.controller.ts` — POST/PATCH `/api/admin/season-calendar/calendars`, POST/PATCH/DELETE stages and recommendations per contracts/api.md. Guard with admin auth.

### Frontend for US4

- [X] T038 [P] [US4] Create admin API client functions in `apps/web-base/src/lib/admin/season-calendar-admin-api.ts` — createZone, updateZone, deleteZone, createCrop, updateCrop, deleteCrop, createCalendar, updateCalendar, addStage, updateStage, deleteStage, addRecommendation, deleteRecommendation
- [X] T039 [US4] Create zones management page `apps/web-base/src/app/admin/season-calendar/zones/page.tsx` — shadcn DataTable listing zones (name, code, provinces count, active status). Add/Edit via Dialog form. Soft delete with confirmation. Sonner toast for success/error.
- [X] T040 [US4] Create crops management page `apps/web-base/src/app/admin/season-calendar/crops/page.tsx` — shadcn DataTable listing crops (name, category, localNames tags, active status). Add/Edit via Dialog form. Soft delete with confirmation. Sonner toast.
- [X] T041 [US4] Create season calendar edit flow — when admin clicks "Edit" on a calendar entry in SeasonCalendarGrid, open Dialog/Sheet with: calendar metadata (seasonName, year, notes), nested list of growth stages (add/edit/delete inline), nested product recommendations per stage (add/delete). Use shadcn Accordion for stage sections.

**Checkpoint**: US4 complete — admin can fully manage all season calendar data through web interface

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: UX improvements, edge cases, performance

- [X] T042 [P] Add loading skeletons to SeasonCalendarGrid, ProductSuggestionPanel, zones/crops pages using shadcn Skeleton component
- [X] T043 [P] Add empty states for: no data for selected zone/month ("Chưa có dữ liệu mùa vụ cho vùng này"), no suggestions found, no zones/crops in admin
- [X] T044 [P] Add edge case handling: zone with no calendar data → suggest nearby zones (FR per spec.md edge cases). Product out of stock → badge "Hết hàng" + suggest alternatives.
- [X] T045 Implement calendar table view toggle in `SeasonCalendarGrid.tsx` — shadcn Table alternative to CSS Grid for data-dense view (FR-009)
- [X] T046 [P] Add filter controls per FR-010: filter by crop type (category), filter by stage type (planting/care/harvest) in calendar page
- [X] T047 Run quickstart.md validation — verify all API endpoints respond correctly, admin UI loads, chatbot integration works with sample question
- [X] T048 Code cleanup: ensure all new files have proper TypeScript types, remove any console.log, verify NestJS module imports are complete

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — **BLOCKS all user stories**
- **US1 (Phase 3)**: Depends on Phase 2 — MVP target
- **US2 (Phase 4)**: Depends on Phase 2 + partially US1 (shares ZoneSelector, calendar data flow)
- **US3 (Phase 5)**: Depends on Phase 2 only — independent of frontend
- **US4 (Phase 6)**: Depends on Phase 2 + US1 frontend components (reuses grid, selectors)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: Start after Phase 2 — no dependencies on other stories
- **US2 (P2)**: Backend can start after Phase 2. Frontend integrates into US1's grid → start frontend after T021 complete
- **US3 (P2)**: Fully independent — only modifies `ai.controller.ts`, can run in parallel with US1/US2
- **US4 (P3)**: Backend can start after Phase 2. Frontend reuses US1 components → start frontend after Phase 3 complete

### Within Each User Story

- DTOs and Entities before Services
- Services before Controllers
- Backend before Frontend (API must exist for frontend to consume)
- Core implementation before integration

### Parallel Opportunities

- T004–T008: All 5 entities can be created in parallel
- T012–T013, T014: ZonesService, CropsService, SeasonCalendarService in parallel
- T015–T016: ZonesController, CropsController in parallel
- T019–T020: ZoneSelector + API client in parallel
- US3 backend (T029–T031) can run entirely in parallel with US2 frontend (T027–T028)
- T032–T033: Admin DTOs + service methods in parallel
- T035–T036: Admin zone/crop controllers in parallel

---

## Parallel Example: Phase 2 (Entities)

```bash
# Launch all entity creation tasks together:
Task T004: "Create AgriculturalZone entity in entities/agricultural-zone.entity.ts"
Task T005: "Create Crop entity in entities/crop.entity.ts"
Task T006: "Create SeasonCalendar entity in entities/season-calendar.entity.ts"
Task T007: "Create GrowthStage entity in entities/growth-stage.entity.ts"
Task T008: "Create ProductRecommendation entity in entities/product-recommendation.entity.ts"
```

## Parallel Example: US1 Backend

```bash
# Launch services in parallel:
Task T012: "Create ZonesService"
Task T013: "Create CropsService"
Task T014: "Create SeasonCalendarService"

# Then controllers in parallel:
Task T015: "Create ZonesController"
Task T016: "Create CropsController"
Task T017: "Create SeasonCalendarController"
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1: Setup (T001–T003)
2. Complete Phase 2: Foundational (T004–T011) — **CRITICAL GATE**
3. Complete Phase 3: US1 (T012–T023)
4. **STOP and VALIDATE**: Browse calendar at `/admin/season-calendar`, verify seed data
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Database and module ready
2. Add US1 → Calendar browsing works → **Deploy (MVP!)**
3. Add US2 → Product suggestions integrated → Deploy
4. Add US3 → Chatbot enhanced (can run parallel with US2) → Deploy
5. Add US4 → Admin CRUD complete → Deploy
6. Polish → Production-ready

### Parallel Team Strategy

With 2+ developers after Phase 2:
- **Dev A**: US1 (frontend-focused) → US4 frontend
- **Dev B**: US2 backend → US3 backend → US4 backend
- Stories integrate naturally via shared entities

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Cross-year month logic (`startMonth > endMonth`) is critical — test with Vụ Đông Xuân (tháng 11 → tháng 2)
- Chatbot keyword detection must be conservative — false positives worse than false negatives
- Admin auth guards must use existing auth middleware pattern from other admin controllers
- shadcn components: Select, Card, Badge, Table, Dialog, Sheet, Accordion, Skeleton, Sonner
- Commit after each task or logical group
