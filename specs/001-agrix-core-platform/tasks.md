# Tasks: Agrix Core Platform

**Input**: Design documents from `/specs/001-agrix-core-platform/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Monorepo initialization and project scaffolding

- [x] T001 Create monorepo root structure with `apps/`, `packages/`, `docker/`, `specs/` directories
- [x] T002 [P] Initialize Flutter project in `apps/mobile/` with dependencies: `drift`, `dio`, `connectivity_plus`, `provider`, `mobile_scanner`, `flutter_blue_plus`, `qr_flutter`
- [x] T003 [P] Initialize NestJS project in `apps/backend/` with dependencies: `@nestjs/typeorm`, `typeorm`, `@nestjs/jwt`, `@nestjs/passport`, `pg`, `minio`, `langchain`
- [x] T004 [P] Initialize Next.js 14+ project in `apps/web-base/` with App Router
- [x] T005 [P] Initialize Flutter Web project in `apps/web-admin/` (shared packages with mobile)
- [x] T006 [P] Create shared Dart package in `packages/shared/dart/` for DTOs, enums, constants
- [x] T007 [P] Create shared TypeScript package in `packages/shared/typescript/` for API types
- [x] T008 [P] Create Docker Compose config in `docker/docker-compose.yml` (PostgreSQL 15, MinIO, NestJS, Next.js)
- [x] T009 [P] Create `docker/.env.example` with all required environment variables (DATABASE_URL, MINIO keys, JWT_SECRET, OPENAI_API_KEY)
- [x] T010 [P] Setup Melos for Flutter monorepo management with `melos.yaml` at project root
- [x] T011 [P] Setup npm workspaces in root `package.json` for `apps/backend` and `apps/web-base`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T012 Create PostgreSQL database schema and TypeORM migration framework in `apps/backend/src/database/`
- [x] T013 [P] Create User entity with RBAC (ADMIN, CASHIER, INVENTORY) in `apps/backend/src/auth/entities/user.entity.ts`
- [x] T014 [P] Create Category entity with self-referencing parent in `apps/backend/src/inventory/entities/category.entity.ts`
- [x] T015 [P] Create Product entity with all fields (SKU, base_unit, prices, stock, expiry, barcode) in `apps/backend/src/inventory/entities/product.entity.ts`
- [x] T016 [P] Create ProductUnitConversion entity in `apps/backend/src/inventory/entities/product-unit-conversion.entity.ts`
- [x] T017 [P] Create Customer entity in `apps/backend/src/customers/entities/customer.entity.ts`
- [x] T018 [P] Create StockEntry ledger entity in `apps/backend/src/inventory/entities/stock-entry.entity.ts`
- [x] T019 Implement AuthModule with JWT strategy, login endpoint, and RBAC guards in `apps/backend/src/auth/`
- [x] T020 [P] Configure MinIO StorageModule for image uploads in `apps/backend/src/storage/storage.module.ts`
- [x] T021 [P] Setup global error handling interceptor in `apps/backend/src/common/interceptors/`
- [x] T022 [P] Setup logging infrastructure in `apps/backend/src/common/logger/`
- [x] T023 [P] Create Drift (SQLite) database schema in `apps/mobile/lib/data/local/database.dart` mirroring core server entities (Product, Order, Customer, StockEntry)
- [x] T024 [P] Implement DI and routing setup in `apps/mobile/lib/core/` (theme with Emerald Green palette, Material Design 3)
- [x] T025 [P] Implement API client with Dio + JWT interceptor in `apps/mobile/lib/data/remote/api_client.dart`
- [x] T026 [P] Implement connectivity monitoring service in `apps/mobile/lib/services/connectivity_service.dart`
- [x] T027 Run initial TypeORM migration to create all tables in `apps/backend/`

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 — Offline-First Sales Execution (Priority: P1) 🎯 MVP

**Goal**: Enable cashiers to search products (barcode/QR), create orders, process payments (cash + VietQR), print thermal receipts, and work fully offline with background sync.

**Independent Test**: Disable network → complete a full sale → restore network → verify the order appears on the server with no duplicates.

### Backend Implementation

- [x] T028 [P] [US1] Create Order entity with idempotencyKey and syncStatus in `apps/backend/src/orders/entities/order.entity.ts`
- [x] T029 [P] [US1] Create OrderItem entity in `apps/backend/src/orders/entities/order-item.entity.ts`
- [x] T030 [US1] Implement InventoryService (product lookup by barcode/QR/name, stock deduction with base-unit arithmetic) in `apps/backend/src/inventory/inventory.service.ts`
- [x] T031 [US1] Implement OrderService (create order, validate stock, generate ledger entries) in `apps/backend/src/orders/orders.service.ts`
- [x] T032 [US1] Implement SyncController with idempotent `POST /sync/orders` endpoint in `apps/backend/src/orders/sync.controller.ts`
- [x] T033 [P] [US1] Implement ProductsController (GET /products, GET /products/:id, GET /products/lookup) in `apps/backend/src/inventory/products.controller.ts`
- [x] T034 [P] [US1] Implement OrdersController (POST /orders, GET /orders) in `apps/backend/src/orders/orders.controller.ts`

### Mobile App Implementation

- [x] T035 [P] [US1] Implement Product repository (local Drift + remote API fallback) in `apps/mobile/lib/data/repositories/product_repository.dart`
- [x] T036 [P] [US1] Implement Order repository (local-first, queue for sync) in `apps/mobile/lib/data/repositories/order_repository.dart`
- [x] T037 [US1] Implement SyncEngine service (background sync with idempotency keys, retry, conflict resolution) in `apps/mobile/lib/services/sync_engine.dart`
- [x] T038 [US1] Implement barcode/QR scanner service using `mobile_scanner` in `apps/mobile/lib/services/scanner_service.dart`
- [x] T039 [US1] Implement ESC/POS thermal printer service (Bluetooth + Wi-Fi/TCP) in `apps/mobile/lib/services/printer_service.dart`
- [x] T040 [US1] Implement VietQR generator service (EMV QR Code) in `apps/mobile/lib/services/vietqr_service.dart`
- [x] T041 [US1] Build POS main screen (product search bar, barcode scan button, product grid) in `apps/mobile/lib/presentation/screens/pos_screen.dart`
- [x] T042 [US1] Build Cart/Checkout widget (item list, unit selector, total, payment method toggle) in `apps/mobile/lib/presentation/widgets/cart_widget.dart`
- [x] T043 [US1] Build Payment dialog (cash input, VietQR display, print bill button) in `apps/mobile/lib/presentation/widgets/payment_dialog.dart`
- [x] T044 [US1] Build offline status indicator (sync icon ☁️) in `apps/mobile/lib/presentation/widgets/sync_status_indicator.dart`
- [x] T045 [US1] Build order history screen in `apps/mobile/lib/presentation/screens/order_history_screen.dart`

**Checkpoint**: At this point, the core POS flow (search → cart → pay → print → offline sync) should be fully functional

---

## Phase 4: User Story 2 — Dynamic Unit Inventory Management (Priority: P2)

**Goal**: Enable warehouse workers to import stock in bulk units (Thùng/Box) and cashiers to sell in any defined sub-unit (Chai/Bottle) with automatic price calculation and precise stock deduction.

**Independent Test**: Import 10 Boxes (40 Bottles each) → sell 3 Bottles → verify inventory shows 397 Bottles total.

### Backend Implementation

- [ ] T046 [US2] Implement StockImportService (import by any unit, convert to base units, create StockEntry) in `apps/backend/src/inventory/stock-import.service.ts`
- [ ] T047 [US2] Implement StockController with `POST /stock/import` and `GET /stock/alerts` in `apps/backend/src/inventory/stock.controller.ts`
- [ ] T048 [US2] Implement unit conversion logic in InventoryService (derive price per unit, validate conversion factors) in `apps/backend/src/inventory/unit-conversion.service.ts`
- [ ] T049 [P] [US2] Implement Categories CRUD controller in `apps/backend/src/inventory/categories.controller.ts`
- [ ] T050 [P] [US2] Implement Products CRUD (create/update with unit conversions) in `apps/backend/src/inventory/products.controller.ts`

### Mobile App Implementation

- [ ] T051 [US2] Build Stock Import screen (select product, enter quantity per unit, batch number) in `apps/mobile/lib/presentation/screens/stock_import_screen.dart`
- [ ] T052 [US2] Build Product Management screen (CRUD, unit conversions editor, QR generation) in `apps/mobile/lib/presentation/screens/product_management_screen.dart`
- [ ] T053 [US2] Build unit selector widget (dropdown showing all available units with calculated prices) in `apps/mobile/lib/presentation/widgets/unit_selector_widget.dart`
- [ ] T054 [US2] Build stock alerts widget (low stock + expiring items) in `apps/mobile/lib/presentation/widgets/stock_alerts_widget.dart`
- [ ] T055 [US2] Build Dashboard screen (revenue summary, top products, low stock alerts) in `apps/mobile/lib/presentation/screens/dashboard_screen.dart`

**Checkpoint**: At this point, full inventory lifecycle (import → manage → sell with unit conversion) should work independently

---

## Phase 5: User Story 3 — AI-Assisted Agricultural Consultation (Priority: P3)

**Goal**: Provide an AI Chatbot that answers agricultural questions using admin-uploaded documents and product-specific context (RAG).

**Independent Test**: Upload a test PDF with mixing rules → ask "Can Pesticide X be mixed with Fertilizer Y?" → verify the AI answers using the uploaded document.

### Backend Implementation

- [ ] T056 [P] [US3] Enable `pgvector` extension and create KnowledgeDocument + KnowledgeEmbedding entities in `apps/backend/src/ai/entities/`
- [ ] T057 [US3] Implement KnowledgeService (upload document, chunk text, generate embeddings, store in pgvector) in `apps/backend/src/ai/knowledge.service.ts`
- [ ] T058 [US3] Implement ChatbotService (query embeddings, build RAG context, call OpenAI/Gemini, return answer with sources) in `apps/backend/src/ai/chatbot.service.ts`
- [ ] T059 [US3] Implement AIController (`POST /ai/ask`, `POST /ai/knowledge`) in `apps/backend/src/ai/ai.controller.ts`

### Mobile App Implementation

- [ ] T060 [US3] Build "Hỏi Ngay" (Ask Now) button on product detail screen in `apps/mobile/lib/presentation/widgets/ask_ai_button.dart`
- [ ] T061 [US3] Build AI Chat dialog (message history, typing indicator, source citations) in `apps/mobile/lib/presentation/screens/ai_chat_screen.dart`

**Checkpoint**: AI chatbot should answer product-specific agricultural questions accurately

---

## Phase 6: Customer Debt Management (Priority: P4)

**Goal**: Enable tracking of customer purchases on credit and partial debt repayment — essential for agricultural retail.

### Backend Implementation

- [ ] T062 [P] [US4] Create DebtLedgerEntry entity in `apps/backend/src/customers/entities/debt-ledger-entry.entity.ts`
- [ ] T063 [US4] Implement CustomerService (CRUD, debt calculation, payment recording) in `apps/backend/src/customers/customers.service.ts`
- [ ] T064 [US4] Implement CustomersController (GET/POST customers, GET debt-ledger, POST payment) in `apps/backend/src/customers/customers.controller.ts`

### Mobile App Implementation

- [ ] T065 [US4] Build Customer list/search screen in `apps/mobile/lib/presentation/screens/customer_list_screen.dart`
- [ ] T066 [US4] Build Customer detail screen (info, outstanding debt, ledger history) in `apps/mobile/lib/presentation/screens/customer_detail_screen.dart`
- [ ] T067 [US4] Build Payment recording dialog in `apps/mobile/lib/presentation/widgets/payment_dialog_debt.dart`
- [ ] T068 [US4] Integrate customer selection into POS checkout flow (optional link to existing customer) in `apps/mobile/lib/presentation/widgets/cart_widget.dart`

**Checkpoint**: Full debt lifecycle (create debt on sale → view ledger → record payment) should work

---

## Phase 7: Web Platforms

**Goal**: Web Admin (Flutter Web) for management access and Web Base (Next.js) for public landing page, blog, and product pricing.

### Web Admin (Flutter Web)

- [ ] T069 [P] [WEB] Setup shared code between mobile and web-admin via `packages/shared/dart/` in `apps/web-admin/`
- [ ] T070 [P] [WEB] Build Web Admin login page in `apps/web-admin/lib/presentation/screens/login_screen.dart`
- [ ] T071 [P] [WEB] Build Web Admin dashboard (reuse dashboard widgets from mobile) in `apps/web-admin/lib/presentation/screens/dashboard_screen.dart`
- [ ] T072 [P] [WEB] Build Web Admin product management page in `apps/web-admin/lib/presentation/screens/products_screen.dart`
- [ ] T073 [P] [WEB] Build Web Admin order history page in `apps/web-admin/lib/presentation/screens/orders_screen.dart`

### Web Base (Next.js — Public)

- [ ] T074 [P] [WEB] Implement BlogModule (CRUD for admin, public read) in `apps/backend/src/blog/`
- [ ] T075 [P] [WEB] Create BlogPost entity in `apps/backend/src/blog/entities/blog-post.entity.ts`
- [ ] T076 [P] [WEB] Build landing page with hero section and product highlights in `apps/web-base/src/app/page.tsx`
- [ ] T077 [P] [WEB] Build blog listing page (by category) in `apps/web-base/src/app/blog/page.tsx`
- [ ] T078 [P] [WEB] Build blog post detail page (SSR for SEO) in `apps/web-base/src/app/blog/[slug]/page.tsx`
- [ ] T079 [P] [WEB] Build product pricing page (current prices, trends) in `apps/web-base/src/app/products/page.tsx`
- [ ] T080 [P] [WEB] Build contact page in `apps/web-base/src/app/contact/page.tsx`
- [ ] T081 [WEB] Implement Blog CRUD in Web Admin in `apps/web-admin/lib/presentation/screens/blog_management_screen.dart`

**Checkpoint**: Web admin mirrors core app functions, public website is SEO-ready with blog and product info

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T082 [P] Add comprehensive API documentation (Swagger/OpenAPI) in `apps/backend/`
- [ ] T083 [P] Add product image upload flow (MinIO integration) across mobile + web-admin
- [ ] T084 [P] Add QR code generation and printing for internal product labels in `apps/mobile/lib/services/qr_label_service.dart`
- [ ] T085 Implement data seeding script for demo/testing in `apps/backend/src/database/seeds/`
- [ ] T086 [P] Add comprehensive error handling and user-friendly error messages across all Flutter apps
- [ ] T087 [P] Performance optimization: add pagination, caching, and lazy loading across all list screens
- [ ] T088 Security audit: validate all RBAC guards, SQL injection prevention, JWT expiry handling
- [ ] T089 Run quickstart.md validation end-to-end (Docker up → migrate → seed → test all flows)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - US1 (P1): Can start first, establishes core POS flow
  - US2 (P2): Can start after Phase 2, extends inventory management
  - US3 (P3): Can start after Phase 2, independent AI module
  - US4 (P4): Can start after Phase 2, uses Customer entity from Phase 2
- **Web (Phase 7)**: Depends on backend endpoints from Phases 3-6 being available
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### Within Each User Story

- Models before services
- Services before controllers/endpoints
- Backend endpoints before mobile screens that consume them
- Core implementation before integration

### Parallel Opportunities

- T002-T011 can all run in parallel (project scaffolding)
- T013-T018 can all run in parallel (entity creation)
- T028-T029 and T033-T034 can run in parallel (order entities + product controllers)
- T035-T036 can run in parallel (mobile repositories)
- All Phase 7 Web tasks marked [P] can run in parallel
- US2, US3, and US4 can be worked on in parallel by different developers after Phase 2

---

## Parallel Example: User Story 1

```bash
# Launch backend entity creation in parallel:
Task: "T028 Create Order entity in apps/backend/src/orders/entities/order.entity.ts"
Task: "T029 Create OrderItem entity in apps/backend/src/orders/entities/order-item.entity.ts"

# Launch mobile repositories in parallel:
Task: "T035 Implement Product repository in apps/mobile/lib/data/repositories/product_repository.dart"
Task: "T036 Implement Order repository in apps/mobile/lib/data/repositories/order_repository.dart"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (Offline POS)
4. **STOP and VALIDATE**: Test offline sale → sync → no duplicates
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (POS) → Test independently → Deploy/Demo (**MVP!**)
3. Add US2 (Inventory) → Test independently → Deploy/Demo
4. Add US3 (AI Chatbot) → Test independently → Deploy/Demo
5. Add US4 (Debt) → Test independently → Deploy/Demo
6. Add Web platforms → Deploy/Demo
7. Each story adds value without breaking previous stories

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All quantities in code MUST use base unit (integer) arithmetic per Constitution Principle IV
