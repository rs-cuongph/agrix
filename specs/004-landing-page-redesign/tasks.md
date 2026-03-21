# Tasks: Landing Page Redesign (Product Gallery)

**Input**: Design documents from `/specs/004-landing-page-redesign/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Phase 1: Setup (Shared Infrastructure)
**Purpose**: Project initialization and basic structure

*(No setup tasks required. Project and UI frameworks are already initialized.)*

---

## Phase 2: Foundational (Blocking Prerequisites)
**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

*(No new foundational features required. MinIO S3 and database are already configured.)*

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Khám phá và mua Sản phẩm (Product Gallery Feature)

**Goal**: Implement the multiple-image gallery functionality for products in the Admin panel so that rich visual data can be displayed on the Landing and Product Detail pages.

**Independent Test**: Upload 3 images for a single product via the Admin UI, save it, and verify that the MinIO URLs are safely stored in the database `imageUrls` array.

### Implementation for User Story 1

- [ ] T001 [P] [US1] Update `Product` entity to replace `coverImageUrl` with `imageUrls` (`text[]` column) in `apps/backend/src/inventory/entities/product.entity.ts`
- [ ] T002 [P] [US1] Update `UpdateProductDto` and `CreateProductDto` to accept `imageUrls` string array in `apps/backend/src/inventory/dto/update-product.dto.ts` and `create-product.dto.ts`
- [ ] T003 [US1] Create the MinIO multipart upload endpoint `POST /api/v1/products/admin/upload` in `apps/backend/src/inventory/products.controller.ts`
- [ ] T004 [US1] Implement a multi-file uploader component in the frontend admin UI `apps/web-base/src/components/admin/products-client.tsx`
- [ ] T005 [US1] Update the public Product Detail page `apps/web-base/src/app/products/[id]/page.tsx` to display the new image gallery grid

**Checkpoint**: At this point, the Admin can successfully upload and manage product galleries, and users can view them.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T006 [P] Verify that `toast.success` and error handling is correctly implemented in the Admin UI for product updates.
- [ ] T007 Run Quickstart validation to ensure local database schema syncs properly with TypeORM synchronize.

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup & Foundational**: Already completed.
- **User Stories**: US1 can start immediately.
- **Polish**: Depends on US1.

### Parallel Opportunities
- T001, T002, and T003 (Backend) can run entirely in parallel with T004 and T005 (Frontend - Mocked).

### Implementation Strategy
1. **Database & API**: Expand the NextJS DTOs and NestJS entities so `imageUrls` is supported seamlessly.
2. **Backend Upload Route**: Wire the controller so `/upload` receives `FileInterceptor('files')` and shoots it to MinIO.
3. **Frontend Admin**: Build the Shadcn drag-and-drop or multi-select file input component.
4. **Public Display**: Transform the product detail page from a single static image constraint to a beautiful dynamic masonry/grid format.
