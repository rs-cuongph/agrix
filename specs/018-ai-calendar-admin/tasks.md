# Tasks: Quản lý Mùa vụ & AI Sinh Lịch Canh tác

**Input**: Design documents from `/specs/018-ai-calendar-admin/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/api.md ✅, quickstart.md ✅

**Tests**: Not explicitly requested — test tasks omitted.

**Organization**: Tasks grouped by user story (US1–US5) for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1–US5)
- Paths relative to monorepo root

## Path Conventions

- **Backend**: `apps/backend/src/season-calendar/`
- **Frontend**: `apps/web-base/src/app/admin/season-calendar/`
- **Frontend lib**: `apps/web-base/src/lib/admin/`

---

## Phase 1: Setup (Shared Backend)

**Purpose**: New service, DTOs, and endpoints that multiple user stories depend on

- [X] T001 [P] Create `AiGenerateCalendarDto` in `apps/backend/src/season-calendar/dto/ai-generate-calendar.dto.ts` — request: zoneId (UUID required), cropId (UUID required), userNotes (string optional). Class-validator decorators.
- [X] T002 [P] Create `BulkCreateCalendarDto` in `apps/backend/src/season-calendar/dto/bulk-create-calendar.dto.ts` — zoneId (UUID), cropId (UUID), replaceExisting (boolean optional default false), seasons array with nested stages and pestWarnings. Use class-validator @ValidateNested + @Type decorators for nested validation.
- [X] T003 Create `AiCalendarGeneratorService` in `apps/backend/src/season-calendar/services/ai-calendar-generator.service.ts` — inject `ChatConfigService` (from ai module) + `ConfigService` + zone/crop repos. Method `generate(dto)`: (1) load zone (with provinces) + crop info, (2) build system prompt with agricultural context, (3) call AI with JSON mode (OpenAI: response_format json_object / Gemini: responseMimeType application/json), (4) parse JSON response into AiGenerateResult type, (5) validate months 1-12 + stageType enum, (6) handle errors: timeout 30s, invalid JSON → retry 1x, re-throw with friendly message. Reuse `callOpenAI`/`callGemini` pattern from ChatbotService but with JSON mode and max_tokens=4096.
- [X] T004 Add `listCalendars` method to `SeasonCalendarService` in `apps/backend/src/season-calendar/services/season-calendar.service.ts` — accept optional filters (zoneId, cropId). Query season_calendars with LEFT JOIN zone + crop, select stageCount via subquery or loadRelationCountAndMap. Return `{ items: CalendarListItem[], total: number }`.
- [X] T005 Add `getCalendarDetail` method to `SeasonCalendarService` — accept calendarId. Load 1 calendar with ALL relations: zone, crop, growthStages (ordered by sortOrder), growthStages.recommendations.product, growthStages.pestWarnings.treatmentLinks.product. Return full object per contracts/api.md GET detail spec.
- [X] T006 Add `bulkCreate` method to `SeasonCalendarService` — accept (zoneId, cropId, seasons[], replaceExisting). Use `this.dataSource.transaction(async (manager) => { ... })`. If replaceExisting=true, DELETE existing calendars for zone+crop first. For each season: create SeasonCalendar → for each stage: create GrowthStage → for each pestWarning: create PestWarning. Return counts { calendarsCreated, stagesCreated, pestWarningsCreated }.
- [X] T007 Add `checkExistingCalendars` method to `SeasonCalendarService` — accept (zoneId, cropId). Return count of existing active calendars for this zone+crop pair. Used by AI generate flow to show duplicate warning.
- [X] T008 Add new endpoints to `AdminCalendarController` in `apps/backend/src/season-calendar/controllers/admin-calendar.controller.ts` — (a) GET `calendars` → listCalendars with query filters, (b) GET `calendars/:id` → getCalendarDetail, (c) POST `ai-generate` → call AiCalendarGeneratorService.generate (inject service), (d) POST `bulk-create` → call SeasonCalendarService.bulkCreate + log activity for each calendar created.
- [X] T009 Update `SeasonCalendarModule` in `apps/backend/src/season-calendar/season-calendar.module.ts` — import `AiModule` (for ChatConfigService), register `AiCalendarGeneratorService` as provider.
- [X] T010 Update `apps/web-base/src/lib/admin/season-calendar-admin-api.ts` — add functions: (a) `listCalendars(filters?)` → GET proxy, (b) `getCalendarDetail(id)` → GET proxy, (c) `aiGenerateCalendar(dto)` → POST proxy, (d) `bulkCreateCalendars(dto)` → POST proxy, (e) `checkExistingCalendars(zoneId, cropId)` → GET proxy.

**Checkpoint**: All backend APIs ready — list, detail, AI generate, bulk create all functional. Frontend API client ready.

---

## Phase 2: User Story 1 — Quản lý Mùa vụ CRUD (Priority: P1) 🎯 MVP

**Goal**: Trang `/admin/season-calendar/manage` hiển thị bảng danh sách mùa vụ, thêm/sửa/xóa via Dialog

**Independent Test**: Admin mở `/admin/season-calendar/manage` → bảng hiện danh sách mùa vụ → nhấn "Thêm mùa vụ" → chọn ĐBSCL + Ngô + tên → lưu → xuất hiện trong bảng. Edit/delete hoạt động.

- [X] T011 [US1] Create `CalendarManageTable` component in `apps/web-base/src/app/admin/season-calendar/components/CalendarManageTable.tsx` — shadcn Table hiển thị: tên vụ, vùng (badge), cây trồng, số giai đoạn, trạng thái (active badge green/gray), ngày tạo. Header row có filter dropdowns: Select chọn vùng (load từ zones API), Select chọn cây trồng (load từ crops API). Each row: Edit button (Pencil icon), Delete button (Trash2 icon), row click → navigate to `/manage/[id]`.
- [X] T012 [US1] Create `CalendarFormDialog` component in `apps/web-base/src/app/admin/season-calendar/components/CalendarFormDialog.tsx` — shadcn Dialog dùng cho cả create + edit. Form fields: Select vùng (load zones), Select cây trồng (load crops), Input tên mùa vụ, Textarea ghi chú, Switch active/inactive (edit only). On submit: call createCalendar or updateCalendar from admin API. Toast success/error (Sonner). Loading state on submit button.
- [X] T013 [US1] Create manage page `apps/web-base/src/app/admin/season-calendar/manage/page.tsx` — layout with: (a) Header "Quản lý Mùa vụ" + breadcrumb, (b) Button row: "Thêm mùa vụ" (Plus icon → opens CalendarFormDialog), "AI tạo lịch" (Sparkles icon → placeholder for US3), (c) CalendarManageTable fetching data via listCalendars(). Refresh on CRUD success. (d) Delete confirmation AlertDialog: hiện tên mùa vụ, cảnh báo cascade delete stages.
- [X] T014 [US1] Modify `apps/web-base/src/app/admin/season-calendar/page.tsx` — add navigation button "Quản lý dữ liệu" (Database icon from lucide) alongside existing "Quản lý vùng" and "Quản lý cây trồng" buttons. Link to `/admin/season-calendar/manage`.

**Checkpoint**: US1 complete — manage page shows calendar list, CRUD fully functional

---

## Phase 3: User Story 2 — Quản lý Giai đoạn Sinh trưởng (Priority: P1)

**Goal**: Trang detail `/manage/[id]` hiển thị thông tin mùa vụ + danh sách giai đoạn (Accordion), thêm/sửa/xóa stages

**Independent Test**: Admin click vào mùa vụ → trang detail hiện info + stages accordion → "Thêm giai đoạn" → điền form → lưu → stage xuất hiện. Edit/delete stage hoạt động. Quay lại trang lịch → timeline cập nhật.

- [X] T015 [US2] Create `StageListAccordion` component in `apps/web-base/src/app/admin/season-calendar/components/StageListAccordion.tsx` — shadcn Accordion hiển thị danh sách stages sorted by sortOrder. Each AccordionItem: trigger shows stage name + stageType badge (planting=emerald, care=blue, harvest=amber) + "T{startMonth}–T{endMonth}". Content shows: description, keywords (Badge list), careActivities (checklist text), Edit/Delete buttons. Empty state: "Chưa có giai đoạn nào. Thêm giai đoạn đầu tiên."
- [X] T016 [US2] Create `StageFormDialog` component in `apps/web-base/src/app/admin/season-calendar/components/StageFormDialog.tsx` — shadcn Dialog for create/edit stage. Form: Input tên, Select stageType (planting/care/harvest), Select startMonth (1-12, Vietnamese labels: "Tháng 1"..."Tháng 12"), Select endMonth (1-12), Textarea description, Input keywords (comma-separated → parse to string[]), dynamic careActivities list (each item: Input + remove button, "Thêm hoạt động" button to add row), Input sortOrder (number). On submit: call addStage(calendarId, dto) or updateStage(stageId, dto). Toast.
- [X] T017 [US2] Create calendar detail page `apps/web-base/src/app/admin/season-calendar/manage/[id]/page.tsx` — layout: (a) Breadcrumb: Quản lý Mùa vụ > {seasonName}, (b) Calendar info card: tên vụ, vùng, cây trồng, trạng thái, ghi chú (editable inline or Edit button → CalendarFormDialog), (c) Section "Giai đoạn sinh trưởng": StageListAccordion + "Thêm giai đoạn" button (Plus icon → opens StageFormDialog). Fetch data via getCalendarDetail(id). Refresh on stage CRUD. Delete stage confirmation AlertDialog.

**Checkpoint**: US2 complete — calendar detail page with full stage CRUD

---

## Phase 4: User Story 3 — AI Sinh Lịch Mùa vụ Tự động (Priority: P1)

**Goal**: Dialog "AI tạo lịch" → chọn vùng+crop → AI generate → editable preview → confirm → batch save

**Independent Test**: Admin nhấn "AI tạo lịch" → chọn Tây Nguyên + Cà phê → chờ → preview hiện 2+ mùa vụ → edit tên → xóa 1 stage → "Lưu tất cả" → data trong DB → manage page cập nhật.

- [X] T018 [US3] Create `AiPreviewEditor` component in `apps/web-base/src/app/admin/season-calendar/components/AiPreviewEditor.tsx` — renders AI result as editable form. Structure: Accordion per season (collapsible). Each season: editable Input for seasonName, "Xóa mùa vụ" button (X icon). Inside each season: list of stages — each stage editable: Input name, Select stageType, Select startMonth, Select endMonth, Textarea description. careActivities: dynamic list with add/remove. pestWarnings: list with name, severity badge, removable. Disclaimer banner at top: "Kết quả AI mang tính tham khảo, vui lòng kiểm tra lại với chuyên gia nông nghiệp." (lucide Info icon). State: useState managing full AiGenerateResult object. Expose onChange callback to parent.
- [X] T019 [US3] Create `AiGenerateDialog` component in `apps/web-base/src/app/admin/season-calendar/components/AiGenerateDialog.tsx` — multi-step Dialog: **Step 1 (Form)**: Select vùng (load zones), Select cây trồng (load crops), Textarea "Ghi chú thêm" (placeholder: "VD: giống robusta, có tưới nhỏ giọt..."), Button "Tạo lịch" (Sparkles icon). **Step 2 (Loading)**: Spinner + text "AI đang phân tích dữ liệu nông nghiệp..." (5-15s). **Step 3 (Preview)**: AiPreviewEditor with the result + footer: "Lưu tất cả" button + "Hủy" button. **Error state**: friendly message + "Thử lại" + "Nhập thủ công" buttons. **Duplicate check**: before calling AI, call checkExistingCalendars(). If count>0, show AlertDialog: "Vùng này đã có {count} mùa vụ cho cây {cropName}. (a) Tạo thêm, (b) Thay thế toàn bộ, (c) Hủy." Set replaceExisting flag accordingly. On "Lưu tất cả": call bulkCreateCalendars(editedData). Toast success with counts. Close dialog + trigger parent refresh.
- [X] T020 [US3] Wire `AiGenerateDialog` into manage page `apps/web-base/src/app/admin/season-calendar/manage/page.tsx` — replace placeholder "AI tạo lịch" button with actual dialog trigger. Pass onSuccess callback to refresh calendar list.

**Checkpoint**: US3 complete — full AI generate → preview → edit → save flow working

---

## Phase 5: User Story 4 — Quản lý Gợi ý Sản phẩm (Priority: P2)

**Goal**: Trong trang detail, mỗi stage có section "Sản phẩm gợi ý" với thêm/xóa recommendations

**Independent Test**: Admin mở giai đoạn → section Sản phẩm → "Thêm" → search "NPK" → chọn → ghi liều lượng → lưu → sản phẩm hiện trong danh sách.

- [X] T021 [US4] Create `RecommendationFormDialog` component in `apps/web-base/src/app/admin/season-calendar/components/RecommendationFormDialog.tsx` — shadcn Dialog. Form: Combobox search sản phẩm (load from fetchAdminProducts, search by name/SKU, show name + SKU in options), Textarea lý do gợi ý, Input liều lượng (dosageNote), Number input ưu tiên (1-5, default 1). On submit: call addRecommendation(stageId, dto). Toast.
- [X] T022 [US4] Add recommendations section to `StageListAccordion.tsx` — inside each stage's AccordionContent, add sub-section "Sản phẩm gợi ý" below careActivities. List existing recommendations: product name, SKU badge, reason (truncated), dosageNote, priority. Delete button per item (call deleteRecommendation). "Thêm sản phẩm" button → opens RecommendationFormDialog.

**Checkpoint**: US4 complete — product recommendations manageable per stage

---

## Phase 6: User Story 5 — Quản lý Cảnh báo Sâu bệnh (Priority: P2)

**Goal**: Trong trang detail, mỗi stage có section "Sâu bệnh" với thêm/sửa/xóa pest warnings

**Independent Test**: Admin mở giai đoạn → section Sâu bệnh → "Thêm" → điền Rầy nâu / high / symptoms → chọn sản phẩm trị → lưu → warning hiện với badge đỏ.

- [X] T023 [US5] Create `PestWarningFormDialog` component in `apps/web-base/src/app/admin/season-calendar/components/PestWarningFormDialog.tsx` — shadcn Dialog. Form: Input tên sâu bệnh, Select severity (low/medium/high with color indicators), Textarea triệu chứng, Textarea phòng ngừa, Multi-select sản phẩm phòng trị (Combobox checkbox mode, load from fetchAdminProducts), per selected product: Input ghi chú liều (usageNote). On submit: call createPestWarning(stageId, dto) or updatePestWarning(id, dto). Toast.
- [X] T024 [US5] Add pest warnings section to `StageListAccordion.tsx` — inside each stage's AccordionContent, add sub-section "Cảnh báo sâu bệnh" after recommendations. List existing pest warnings: name, severity Badge (high=destructive, medium=amber, low=blue), symptoms (truncated), treatment products count. Edit button → opens PestWarningFormDialog. Delete button (call deletePestWarning). "Thêm sâu bệnh" button → opens PestWarningFormDialog.

**Checkpoint**: US5 complete — pest warnings fully manageable per stage

---

## Phase 7: Polish & Cross-Cutting Concerns

- [X] T025 [P] Add loading skeletons: manage page table (Skeleton rows), detail page accordion (Skeleton cards), AI generate preview (Skeleton blocks)
- [X] T026 [P] Add empty states: manage page table "Chưa có mùa vụ nào. Tạo mùa vụ đầu tiên hoặc dùng AI tạo lịch tự động.", detail page stages "Chưa có giai đoạn nào.", recommendations empty "Chưa có sản phẩm gợi ý.", pest warnings empty "Chưa có cảnh báo sâu bệnh."
- [X] T027 Verify all Sonner toasts: create/update/delete calendar → toast, create/update/delete stage → toast, add/delete recommendation → toast, create/update/delete pest warning → toast, AI generate success → toast with counts, AI generate fail → toast.error, bulk create success → toast with counts, bulk create fail (rollback) → toast.error
- [ ] T028 Run quickstart.md validation — verify all 10 verification steps pass (list API, detail API, AI generate API, bulk create API, manage page nav, table with filters, manual CRUD, detail page, AI generate flow, duplicate warning)
- [X] T029 Code cleanup: verify TypeScript strict types on all new files, remove console.logs, ensure proper error boundaries in manage + detail pages, check module imports complete

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (US1)**: Depends on Phase 1 (T004 listCalendars, T008 GET endpoint, T010 API client) — **MVP target**
- **Phase 3 (US2)**: Depends on Phase 1 (T005 getCalendarDetail, T008 GET detail endpoint)
- **Phase 4 (US3)**: Depends on Phase 1 (T003 AI service, T006 bulkCreate, T007 checkExisting, T008 endpoints, T010 API client)
- **Phase 5 (US4)**: Depends on US2 (StageListAccordion must exist to add section)
- **Phase 6 (US5)**: Depends on US2 (StageListAccordion must exist to add section)
- **Phase 7 (Polish)**: Depends on all desired stories complete

### User Story Dependencies

```
US1 (Calendar CRUD)  ──────────────────────> Phase 1
US2 (Stage CRUD)     ──────────────────────> Phase 1
US3 (AI Generate)    ──────────────────────> Phase 1
US4 (Recommendations) ────────────────────> US2 (needs StageListAccordion)
US5 (Pest Warnings)  ─────────────────────> US2 (needs StageListAccordion)
```

- US1, US2, US3 can start in parallel after Phase 1 (different pages/components)
- US4 + US5 can start in parallel after US2

### Parallel Opportunities

- T001 + T002: Both DTOs in parallel
- T004 + T005 + T006 + T007: Service methods in parallel (different methods in same file, but logically independent)
- T011 + T012: Table + Dialog in parallel (different components)
- T015 + T016: Accordion + StageForm in parallel
- T018 + T019: PreviewEditor + GenerateDialog can be built together but sequentially
- US1 (T011-T014) + US2 (T015-T017): Different pages, can be built in parallel
- US4 (T021-T022) + US5 (T023-T024): Different sections, in parallel after US2
- T025 + T026: Skeletons + empty states in parallel

---

## Implementation Strategy

### MVP First (US1 + US2)

1. Complete Phase 1: Backend setup (T001–T010)
2. Complete Phase 2: US1 — Manage page with calendar CRUD (T011–T014)
3. Complete Phase 3: US2 — Detail page with stage CRUD (T015–T017)
4. **STOP and VALIDATE**: Admin can create/manage calendars + stages via UI
5. Deploy if ready

### Incremental Delivery

1. Phase 1 → Backend APIs all ready
2. US1 → Manage page works → **Deploy (MVP!)**
3. US2 → Detail + stage CRUD → Deploy
4. US3 → AI generate → Deploy (key feature!)
5. US4 + US5 (parallel) → Recommendations + Pest warnings → Deploy
6. Polish → Production-ready

### Parallel Team Strategy

With 2 developers after Phase 1:
- **Dev A**: US1 → US3 (manage page → AI dialog, same page context)
- **Dev B**: US2 → US4 + US5 (detail page → sections, same page context)

---

## Notes

- Backend CRUD APIs (POST/PATCH/DELETE) cho calendar, stage, recommendation, pest warning đã có sẵn từ 015/017 — feature này chỉ thêm GET list + GET detail + AI generate + bulk create
- AI service reuse ChatConfigService (existing) cho API keys — không cần env var mới
- AiCalendarGeneratorService là service riêng (không phải ChatbotService) vì: (a) không cần RAG, (b) dùng JSON mode, (c) prompt khác hoàn toàn
- Batch save dùng `DataSource.transaction()` — atomic, rollback nếu lỗi
- Preview state chỉ client-side (useState) — đóng dialog = mất preview
- Duplicate warning check TRƯỚC khi gọi AI (tránh lãng phí API call)
- Không rate limit per clarification Q3
- shadcn components: Table, Dialog, AlertDialog, Accordion, Select, Combobox, Input, Textarea, Switch, Badge, Skeleton, Button
- Sonner toast cho TẤT CẢ CRUD ops per constitution
