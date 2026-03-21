# Tasks: Landing Page Redesign

**Input**: Design documents from `/specs/004-landing-page-redesign/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api-endpoints.md, quickstart.md

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create new backend modules, entities, and register them in AppModule.

- [ ] T001 Create `StoreSettings` entity in `apps/backend/src/common/entities/store-settings.entity.ts` with fields: id, storeName, address, phoneNumber, email, description, heroTitle, heroSubtitle, heroImageUrl, createdAt, updatedAt
- [ ] T002 [P] Create `ContactSubmission` entity in `apps/backend/src/contact/entities/contact-submission.entity.ts` with fields: id, customerName, phoneNumber, email, message, status (NEW/READ/REPLIED), createdAt, updatedAt
- [ ] T003 [P] Create `FAQ` entity in `apps/backend/src/faq/entities/faq.entity.ts` with fields: id, question, answer, order, isActive, createdAt, updatedAt
- [ ] T004 [P] Create `Testimonial` entity in `apps/backend/src/testimonial/entities/testimonial.entity.ts` with fields: id, customerName, content, rating, avatarUrl, isActive, createdAt, updatedAt
- [ ] T005 Register all 4 new entities in TypeORM configuration in `apps/backend/src/app.module.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Backend services, controllers, and modules that ALL user stories depend on.

**⚠️ CRITICAL**: No frontend work can begin until these backend endpoints are available.

### Store Settings Module

- [ ] T006 Create `StoreSettingsService` in `apps/backend/src/common/store-settings.service.ts` with methods: getPublicSettings(), getFullSettings(), upsertSettings(dto)
- [ ] T007 Create `StoreSettingsController` in `apps/backend/src/common/store-settings.controller.ts` with endpoints: `GET /api/v1/settings/public` (public), `GET /api/v1/admin/settings` (auth), `PATCH /api/v1/admin/settings` (auth)
- [ ] T008 Register StoreSettings service/controller in `apps/backend/src/common/common.module.ts` (or create module if needed)

### Contact Module

- [ ] T009 [P] Create `ContactService` in `apps/backend/src/contact/contact.service.ts` with methods: create(dto), findAll(pagination, statusFilter), findOne(id), updateStatus(id, status), delete(id)
- [ ] T010 [P] Create `ContactController` in `apps/backend/src/contact/contact.controller.ts` with endpoints: `POST /api/v1/contact` (public, rate-limited 3/5min), `GET /api/v1/admin/contacts` (auth, paginated), `GET /api/v1/admin/contacts/:id` (auth), `PATCH /api/v1/admin/contacts/:id/status` (auth), `DELETE /api/v1/admin/contacts/:id` (auth)
- [ ] T011 Create `ContactModule` in `apps/backend/src/contact/contact.module.ts` and register in AppModule

### FAQ Module

- [ ] T012 [P] Create `FaqService` in `apps/backend/src/faq/faq.service.ts` with methods: findAllPublic(), findAll(), create(dto), update(id, dto), delete(id)
- [ ] T013 [P] Create `FaqController` in `apps/backend/src/faq/faq.controller.ts` with endpoints: `GET /api/v1/faq` (public, active only, ordered), `GET /api/v1/admin/faq` (auth), `POST /api/v1/admin/faq` (auth), `PATCH /api/v1/admin/faq/:id` (auth), `DELETE /api/v1/admin/faq/:id` (auth)
- [ ] T014 Create `FaqModule` in `apps/backend/src/faq/faq.module.ts` and register in AppModule

### Testimonial Module

- [ ] T015 [P] Create `TestimonialService` in `apps/backend/src/testimonial/testimonial.service.ts` with methods: findAllPublic(), findAll(), create(dto), update(id, dto), delete(id)
- [ ] T016 [P] Create `TestimonialController` in `apps/backend/src/testimonial/testimonial.controller.ts` with endpoints: `GET /api/v1/testimonials` (public, active only), `GET /api/v1/admin/testimonials` (auth), `POST /api/v1/admin/testimonials` (auth), `PATCH /api/v1/admin/testimonials/:id` (auth), `DELETE /api/v1/admin/testimonials/:id` (auth)
- [ ] T017 Create `TestimonialModule` in `apps/backend/src/testimonial/testimonial.module.ts` and register in AppModule

### Seed Data

- [ ] T018 Create seed script or migration to insert default `StoreSettings` row (storeName: "Agrix", heroTitle: "Nền tảng Nông nghiệp Thông minh", etc.)

**Checkpoint**: All backend APIs are ready. Frontend implementation can begin.

---

## Phase 3: User Story 1 — Khám phá và mua Sản phẩm (Priority: P1) 🎯 MVP

**Goal**: User can browse products on the landing page and click through to a Product Detail Page (no cart/checkout).

**Independent Test**: Load landing page → see product grid → click one → see Product Detail Page with full information.

### Implementation for User Story 1

- [ ] T019 [US1] Create `Navbar` component in `apps/web-base/src/components/landing/navbar.tsx` with sticky header, logo, navigation links (Sản phẩm / Blog / Liên hệ), mobile hamburger menu using shadcn Sheet
- [ ] T020 [P] [US1] Create `HeroSection` component in `apps/web-base/src/components/landing/hero-section.tsx` fetching heroTitle, heroSubtitle, heroImageUrl from `GET /api/v1/settings/public`, with CTA buttons (Xem sản phẩm / Liên hệ), use lucide-react icons (no emoji)
- [ ] T021 [P] [US1] Create `ProductsSection` component in `apps/web-base/src/components/landing/products-section.tsx` fetching active products from `GET /api/v1/products?limit=8`, displaying as responsive card grid (image, name, price, category), each card links to `/products/[id]`
- [ ] T022 [US1] Create Product Detail Page at `apps/web-base/src/app/products/[id]/page.tsx` — server component fetching `GET /api/v1/products/:id`, displaying: product image, name, description, price, category, unit, stock status. Include back button and CTA "Liên hệ tư vấn"
- [ ] T023 [US1] Update existing `apps/web-base/src/app/products/page.tsx` — redesign from table view to card-based grid layout matching the landing page style, each card links to `/products/[id]`
- [ ] T024 [US1] Redesign `apps/web-base/src/app/page.tsx` — replace current static content with composition of section components: Navbar + HeroSection + ProductsSection (more sections added in later phases)

**Checkpoint**: Landing page shows Hero Banner + Products grid. Clicking a product opens its detail page.

---

## Phase 4: User Story 2 — Đọc nội dung Blog (Priority: P2)

**Goal**: User can see latest blog posts on the landing page and navigate to full articles.

**Independent Test**: Load landing page → scroll to Blog section → see latest posts → click one → see full article.

### Implementation for User Story 2

- [ ] T025 [P] [US2] Create `BlogSection` component in `apps/web-base/src/components/landing/blog-section.tsx` fetching latest 4-6 published posts from `GET /api/v1/blog/posts?limit=6`, displaying as card grid (thumbnail, title, excerpt, date), each card links to `/blog/[slug]`
- [ ] T026 [US2] Update `apps/web-base/src/app/page.tsx` — add `BlogSection` to the landing page composition after ProductsSection
- [ ] T027 [US2] Review and update existing `apps/web-base/src/app/blog/page.tsx` — ensure consistent styling with the new landing page design

**Checkpoint**: Landing page now shows Hero + Products + Blog. Blog detail pages work.

---

## Phase 5: User Story 3 — Liên hệ Cửa hàng (Priority: P1)

**Goal**: User can see store contact info, submit contact form, and admin receives notification.

**Independent Test**: Load landing page → scroll to Contact → see store info → fill form → submit → see success toast. Admin dashboard → Quản lý Liên hệ → see new submission.

### Frontend Implementation

- [ ] T028 [US3] Create `ContactSection` component in `apps/web-base/src/components/landing/contact-section.tsx` — displays store info (name, address, phone, email from `GET /api/v1/settings/public`) + contact form (customerName, phoneNumber, email, message) using shadcn Input/Textarea/Button. Submit calls `POST /api/v1/contact` via Next.js API proxy
- [ ] T029 [P] [US3] Create Next.js API proxy route at `apps/web-base/src/app/api/contact/route.ts` — proxies POST requests to backend `POST /api/v1/contact`
- [ ] T030 [US3] Update `apps/web-base/src/app/page.tsx` — add `ContactSection` to landing page composition
- [ ] T031 [US3] Update `apps/web-base/src/app/contact/page.tsx` — full dedicated Contact page with same ContactSection component, more detailed info, embedded map placeholder

### Admin Implementation

- [ ] T032 [US3] Create `ContactManagement` admin page at `apps/web-base/src/components/admin/contact-management.tsx` — list all contact submissions (table: name, phone, message preview, status badge, date), click row to expand detail, mark as read, delete with AlertDialog confirmation. Use shadcn Table, Badge, AlertDialog. Toast on all CUD operations
- [ ] T033 [US3] Add "Liên hệ" navigation item to admin sidebar/menu in `apps/web-base/src/app/admin/` layout or navigation component, route to contact management page
- [ ] T034 [US3] Create admin route page at `apps/web-base/src/app/admin/contacts/page.tsx` importing ContactManagement component

**Checkpoint**: Contact info displays on landing page. Form submission works. Admin can view/manage contact submissions.

---

## Phase 6: Extensions — FAQ & Testimonials (Priority: P2)

**Goal**: Landing page includes FAQ accordion and customer testimonials. Both managed via Admin CRUD.

**Independent Test**: Landing page shows FAQ & Testimonials. Admin can create/edit/delete FAQ items and Testimonials.

### Frontend Landing Sections

- [ ] T035 [P] [US4] Create `FaqSection` component in `apps/web-base/src/components/landing/faq-section.tsx` fetching from `GET /api/v1/faq`, rendering using shadcn Accordion component
- [ ] T036 [P] [US4] Create `TestimonialsSection` component in `apps/web-base/src/components/landing/testimonials-section.tsx` fetching from `GET /api/v1/testimonials`, displaying as card grid (avatar, name, content, star rating using lucide Star icons)
- [ ] T037 [US4] Update `apps/web-base/src/app/page.tsx` — add TestimonialsSection (after Blog) and FaqSection (before Contact) to landing page composition

### Admin CRUD Pages

- [ ] T038 [P] [US4] Create `FaqManagement` admin component at `apps/web-base/src/components/admin/faq-management.tsx` — CRUD table (question, answer preview, order, active toggle), CrudDialog for create/edit, AlertDialog for delete. Sonner toast on all CUD ops
- [ ] T039 [P] [US4] Create `TestimonialManagement` admin component at `apps/web-base/src/components/admin/testimonial-management.tsx` — CRUD table (name, content preview, rating, active toggle), CrudDialog for create/edit, AlertDialog for delete. Sonner toast on all CUD ops
- [ ] T040 [US4] Create admin route pages: `apps/web-base/src/app/admin/faq/page.tsx` and `apps/web-base/src/app/admin/testimonials/page.tsx`
- [ ] T041 [US4] Add "FAQ" and "Đánh giá" navigation items to admin sidebar/menu

**Checkpoint**: Full landing page with all 6 sections. Admin can manage all dynamic content.

---

## Phase 7: Store Settings Admin

**Goal**: Admin can edit store info, hero banner title/subtitle/image, all reflected on landing page.

- [ ] T042 Create `StoreSettingsPage` admin component at `apps/web-base/src/components/admin/store-settings.tsx` — form with shadcn Input/Textarea for all fields (storeName, address, phone, email, description, heroTitle, heroSubtitle, heroImageUrl). Sonner toast on save
- [ ] T043 Create admin route at `apps/web-base/src/app/admin/settings/page.tsx` importing StoreSettingsPage
- [ ] T044 Add "Cài đặt" navigation item to admin sidebar/menu

**Checkpoint**: Admin can configure store info and hero banner content dynamically.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Responsive design, performance, SEO, and final quality pass.

- [ ] T045 [P] Ensure all landing page sections are fully responsive (test on 320px, 768px, 1024px, 1440px breakpoints)
- [ ] T046 [P] Add proper SEO metadata to all new pages: `page.tsx` (home), `products/[id]/page.tsx`, `contact/page.tsx`. Use Next.js `generateMetadata` for dynamic pages
- [ ] T047 [P] Add smooth scroll navigation from Navbar links to landing page sections (anchor links with scroll-behavior: smooth)
- [ ] T048 Update `apps/web-base/src/app/layout.tsx` to include Navbar on all public pages (not admin pages)
- [ ] T049 Validate that existing Chatbot widget (`ChatWrapper` / `ChatWidget`) renders correctly alongside new landing page layout
- [ ] T050 Final visual QA: verify all sections use lucide-react icons (no emoji), Sonner toasts on all admin CUD operations, shadcn components used consistently

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 entity creation
- **Phase 3 (Products/US1)**: Depends on Phase 2 backend APIs — 🎯 MVP
- **Phase 4 (Blog/US2)**: Depends on Phase 2 — can run parallel with Phase 3
- **Phase 5 (Contact/US3)**: Depends on Phase 2 — can run parallel with Phase 3/4
- **Phase 6 (FAQ+Testimonials/US4)**: Depends on Phase 2 — can run parallel with Phase 3-5
- **Phase 7 (Settings Admin)**: Depends on Phase 2
- **Phase 8 (Polish)**: Depends on Phases 3-7

### User Story Dependencies

- **US1 (Products)**: Independent after Phase 2
- **US2 (Blog)**: Independent after Phase 2 (existing backend)
- **US3 (Contact)**: Independent after Phase 2
- **US4 (FAQ+Testimonials)**: Independent after Phase 2

### Parallel Opportunities

- T002, T003, T004 can all run in parallel (different entity files)
- T009+T010, T012+T013, T015+T016 can run in parallel (different modules)
- T020+T021 can run in parallel (different section components)
- T025, T028, T035, T036 can all run in parallel (different section components)
- T038+T039 can run in parallel (different admin pages)

---

## Parallel Example: Phase 2 (Backend Modules)

```bash
# Launch all entity tasks together:
Task T002: ContactSubmission entity
Task T003: FAQ entity
Task T004: Testimonial entity

# Then launch all service+controller pairs together:
Task T009+T010: Contact service + controller
Task T012+T013: FAQ service + controller
Task T015+T016: Testimonial service + controller
```

## Parallel Example: Phase 3-6 (Frontend Sections)

```bash
# Once backend is ready, launch all section components:
Task T020: HeroSection
Task T021: ProductsSection
Task T025: BlogSection
Task T028: ContactSection
Task T035: FaqSection
Task T036: TestimonialsSection
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Entities setup
2. Complete Phase 2: Backend modules
3. Complete Phase 3: Products on landing page + Product Detail
4. **STOP and VALIDATE**: Landing page shows products, detail page works
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Backend ready
2. Add Products (US1) → MVP Landing Page
3. Add Blog (US2) → Richer content
4. Add Contact (US3) → Customer engagement
5. Add FAQ+Testimonials (US4) → Professional look
6. Add Store Settings → Full admin control
7. Polish → Production ready

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story can be independently completed and tested
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Constitution rules: no emoji icons → use lucide-react, Sonner toast on all CUD ops, shadcn/ui priority
