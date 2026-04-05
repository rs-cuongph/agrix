# Tasks: Rich Text Product Description

**Input**: Design documents from `/specs/008-product-description-editor/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure / React components that MUST be complete before ANY user story can be implemented

- [x] T001 Create `RichTextEditor` component wrapping Tiptap in `apps/web-base/src/components/admin/rich-text-editor.tsx`
- [x] T002 Integrate `rich-text` field type handling into `CrudDialog` in `apps/web-base/src/components/admin/crud-dialog.tsx`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 2: User Story 1 - Create Rich Text Product Description in Admin (Priority: P1) 🎯 MVP

**Goal**: Admins can format product descriptions natively without writing HTML tags.

**Independent Test**: Can be fully tested by creating a product in the admin panel and verifying that formatting (bold, italic, list) is saved correctly.

### Implementation for User Story 1

- [x] T003 [US1] Switch `description` field from `textarea` to `rich-text` in `apps/web-base/src/components/admin/products-client.tsx`
- [x] T004 [US1] Verify saving Product sends correctly serialized payload over `/api/products` proxy.

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 3: User Story 2 - View Rich Text Description on Landing Page (Priority: P1)

**Goal**: Rich HTML descriptions rendered visually on consumer pages.

**Independent Test**: Verify product detail page renders elements like lists and bolds natively.

### Implementation for User Story 2

- [x] T005 [P] [US2] Update `apps/web-base/src/app/products/[id]/page.tsx` to safely render rich-text HTML string using `dangerouslySetInnerHTML` combined with basic Tailwind prose styling (e.g., `prose prose-sm text-muted-foreground`).

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently.

---

## Phase 4: User Story 3 - View Rich Text Description in POS System (Priority: P2)

**Goal**: Store staff can see the rich text formatting when dealing with product attributes or usage instructions.

**Independent Test**: Check the Info modal on POS screen for formatted HTML.

### Implementation for User Story 3

- [x] T006 [P] [US3] Update `apps/web-base/src/components/pos/product-details-dialog.tsx` to safely render HTML description under the "Thông tin bổ sung" section.

**Checkpoint**: All user stories should now be independently functional.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: Must be completed first to provide the new editor widget.
- **User Story 1 (US1)**: Admin must be able to input the content to test the downstream flows with real data.
- **User Story 2 & 3**: Can be done in parallel after US1 (or even earlier with mock HTML payloads).

### Parallel Opportunities
- T005 (US2/Landing) and T006 (US3/POS) touch different files and can be executed at the same time in any order.
