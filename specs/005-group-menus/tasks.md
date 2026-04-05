# Tasks: Group Sidebar Menus

**Input**: Design documents from `/specs/005-group-menus/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No specific tests tasks are included as this is a UI-only feature and tests were not explicitly requested in the spec.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `apps/web-base/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

There are no setup tasks required as this modifies an existing component.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

There are no foundational prerequisites required as `AdminSidebar` already exists and `lucide-react`, `shadcn/ui` are configured.

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Find and navigate to admin modules efficiently (Priority: P1) 🎯 MVP

**Goal**: Group related sidebar menus into submenus so that I can easily navigate the admin panel without being overwhelmed by a long list of options.

**Independent Test**: Can be fully tested by opening the admin panel, clicking on a parent menu item, and verifying that the correct submenus are revealed and navigable.

### Implementation for User Story 1

- [x] T001 [US1] Refactor `navItems` array structure in `apps/web-base/src/components/admin/sidebar.tsx` to support hierarchical groupings (Cửa hàng, Nội dung / Web, Hệ thống).
- [x] T002 [US1] Add `useState<string[]>` to `AdminSidebar` in `apps/web-base/src/components/admin/sidebar.tsx` to track currently expanded groups by label or module.
- [x] T003 [US1] Implement toggle function `toggleGroup` in `apps/web-base/src/components/admin/sidebar.tsx` that adds/removes a group label from the local state array.
- [x] T004 [US1] Update active UI mapping in `apps/web-base/src/components/admin/sidebar.tsx` so a parent group path matcher can automatically expand and visually highlight the parent when a child is active.
- [x] T005 [US1] Refactor the `navItems.map` rendering block in `apps/web-base/src/components/admin/sidebar.tsx` to recursively render groups and their child links with expand/collapse states (e.g. using Tailwind animations and `lucide-react` chevron icons).

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T006 Validate responsive behavior spacing inside off-canvas sidebar view in `apps/web-base/src/components/admin/sidebar.tsx`.
- [x] T007 Run quickstart.md steps to manually verify behavior in the local dev environment.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: N/A
- **Foundational (Phase 2)**: N/A
- **User Stories (Phase 3+)**: Can start immediately.
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start immediately.

### Within Each User Story

- Data structures (`navItems`) before logic (`useState`).
- Logic before rendering block updates.

### Parallel Opportunities

- Due to the nature of UI development concentrating entirely in one file (`apps/web-base/src/components/admin/sidebar.tsx`), all T001-T005 tasks must be done sequentially to avoid conflicts.
- T006 and T007 can be done after US1 completes.

---

## Parallel Example: User Story 1

None, tasks in this story exist in a single file and sequentially build upon each other.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 3: User Story 1 (Refactor `sidebar.tsx`).
2. **STOP and VALIDATE**: Test User Story 1 independently in the browser.
3. Deploy/demo if ready

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Watch out for React Server/Client boundaries since we are adding state. `sidebar.tsx` is already a `"use client"` component.
