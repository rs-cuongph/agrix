# Tasks: POS Multi-Cart Management

**Input**: Design documents from `/specs/007-pos-multi-cart/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel
- **[Story]**: Which user story this task belongs to
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Prepare the feature branch environment (if needed, otherwise skip since branch is already present)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Redefine the `CartState` and context payload interfaces to include `carts: CartData[]` and `activeCartId: string` in `apps/web-base/src/components/pos/cart-context.tsx`
- [x] T003 Refactor existing base actions (`ADD_ITEM`, `REMOVE_ITEM`, `UPDATE_QUANTITY`, `SET_CUSTOMER`, `CLEAR_CART`) to target specifically `carts[activeCartId]` instead of the root state in `apps/web-base/src/components/pos/cart-context.tsx`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Manage Multiple Concurrent Carts (Priority: P1) 🎯 MVP

**Goal**: As a cashier, I want to be able to create and switch between multiple active carts.

**Independent Test**: Create multiple carts, add different items to each, and switch back and forth to verify that the items in each cart remain isolated.

### Implementation for User Story 1

- [x] T004 [US1] Add new reducer actions (`NEW_CART`, `SWITCH_CART`, `REMOVE_CART`) in `apps/web-base/src/components/pos/cart-context.tsx` ensuring max limit of 5 carts
- [x] T005 [P] [US1] Create the Cart Switcher UI component (e.g. scrollable tabs or a dropdown) in `apps/web-base/src/components/pos/cart-switcher.tsx`
- [x] T006 [US1] Integrate `CartSwitcher` into the main POS layout, specifically rendering above or inside `apps/web-base/src/components/pos/cart-panel.tsx`
- [x] T007 [US1] Connect `CartSwitcher` callbacks to `CartContext` to trigger tab switching and new cart creation.

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Cart Persistence Across Reloads (Priority: P1)

**Goal**: As a cashier, I want my active carts to persist if the browser is accidentally refreshed.

**Independent Test**: Load the active carts, hit F5, verify nothing is lost.

### Implementation for User Story 2

- [x] T008 [US2] Implement extraction logic in `apps/web-base/src/components/pos/cart-context.tsx` to read `localStorage.getItem('agrix_pos_carts')` for `initialState` seeding
- [x] T009 [US2] Implement a `useEffect` inside `CartProvider` that fires when `state` changes to sync the entire JSON state to `localStorage` in `apps/web-base/src/components/pos/cart-context.tsx`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T010 Resolve any TypeScript types issues caused by refactoring `CartState`.
- [x] T011 Handle Hydration Mismatch issues in Next.js if `localStorage` causes client-side renders to differ from SSR (add an `isMounted` wrap if necessary).
- [x] T012 Manually run test scenarios in `specs/007-pos-multi-cart/quickstart.md` to QA.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: US1 depends on Foundational. US2 depends on US1 finishing the new state shape.
- **Polish (Final Phase)**: Depends on all user stories being complete.

### Implementation Strategy

#### Incremental Delivery

1. Complete T002-T003 to migrate single cart into the array format. (Foundational)
2. Add US1 Switcher UI (T004-T007) so the user can easily invoke the multiple carts. Test manually.
3. Hook up LocalStorage syncing (T008-T009) so F5 doesn't wipe out the testing.
4. Clean up Next.js hydration issues (T011).
