# Tasks: Chatbot Rate Limiting by Source

**Input**: Design documents from `/specs/010-bot-landing-only/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Backend DTO preparation — the `source` field is shared by both user stories

- [x] T001 Add optional `source` field (`'landing' | 'pos' | 'admin'`) to `AskDto` in `apps/backend/src/ai/dto/ask.dto.ts`
- [x] T002 [P] Forward `source` field from request body to backend in `apps/web-base/src/app/api/chat/route.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Backend limit bypass logic — MUST be complete before testing either user story

**⚠️ CRITICAL**: No user story validation can happen until this phase is complete

- [x] T003 Update `addUserMessage()` in `apps/backend/src/ai/chat-session.service.ts` to accept `source` parameter and skip session message limit when source is `'pos'` or `'admin'`
- [x] T004 Update `publicChat()` in `apps/backend/src/ai/ai.controller.ts` to pass `body.source` to `addUserMessage()`

**Checkpoint**: Backend now accepts and processes the `source` field — frontend changes can begin

---

## Phase 3: User Story 1 — Bypass Chat Limit on POS/Admin (Priority: P1) 🎯 MVP

**Goal**: POS staff and admins can chat without session limits.

**Independent Test**: Open chatbot on POS (`/pos`), send 6+ messages in a single session, verify no limit error.

### Implementation for User Story 1

- [x] T005 [US1] Update `sendMessage()` in `apps/web-base/src/lib/chat-context.tsx` to derive `source` from `window.location.pathname` and include it in the POST body (`/pos*` → `'pos'`, `/admin*` → `'admin'`, otherwise → `'landing'`)

**Checkpoint**: POS and Admin chatbot sessions are now unlimited

---

## Phase 4: User Story 2 — Maintain Chat Limit on Landing Page (Priority: P1)

**Goal**: Anonymous landing page users remain limited to `maxMessagesPerSession` messages.

**Independent Test**: Open landing page in incognito, send 5 messages, verify the 6th is blocked with limit error.

### Implementation for User Story 2

- [x] T006 [US2] Verify that default/omitted `source` value results in `'landing'` behavior — the limit IS enforced (no code change expected, just validation)

**Checkpoint**: Both user stories independently functional — POS/Admin unlimited, Landing limited

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Validation and documentation

- [x] T007 Run quickstart.md test scenarios (Landing limit test + POS bypass test)
- [x] T008 Verify SSE streaming still works correctly for all sources

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — DTO + proxy can start immediately
- **Foundational (Phase 2)**: Depends on T001 (DTO must exist before service uses it)
- **User Story 1 (Phase 3)**: Depends on Phase 2 (backend must handle `source` before frontend sends it)
- **User Story 2 (Phase 4)**: Depends on Phase 2 (same backend logic handles both stories)
- **Polish (Phase 5)**: Depends on all user stories being complete

### Parallel Opportunities

- T001 and T002 can be done in parallel (different projects: backend vs frontend)
- T003 and T004 are sequential (T003 changes the function signature, T004 calls it)
- T005 and T006 are independent (different concerns, T006 is validation only)

---

## Implementation Strategy

### MVP First (All Stories — This feature is tiny)

1. Complete Phase 1: Setup (T001-T002) — ~5 min
2. Complete Phase 2: Foundational (T003-T004) — ~5 min
3. Complete Phase 3: User Story 1 (T005) — ~5 min
4. Complete Phase 4: User Story 2 (T006) — ~2 min (validation only)
5. Complete Phase 5: Polish (T007-T008) — ~5 min
6. **Total estimated time: ~20 minutes**

### Incremental Delivery

1. T001-T004 → Backend ready, accepts `source` field
2. T005 → Frontend sends correct `source` → POS/Admin bypass works (MVP!)
3. T006-T008 → Validation and polish

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Total: **8 tasks** (2 setup, 2 foundational, 1 US1, 1 US2, 2 polish)
- No test tasks — spec does not require TDD
- Extremely small feature: 4 files modified, ~20 lines of code total
- No database migrations needed
