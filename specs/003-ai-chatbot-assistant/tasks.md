# Tasks: AI Chatbot Assistant

**Input**: Design documents from `/specs/003-ai-chatbot-assistant/`  
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/, research.md, quickstart.md

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US5)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies, enable pgvector, create base structure

- [x] T001 Install backend dependencies: `pdf-parse`, `mammoth`, `@google/generative-ai`, `pgvector` in `apps/backend/package.json`
- [x] T002 [P] Enable pgvector extension in Docker PostgreSQL init script `docker/init.sql`
- [x] T003 [P] Create DTO files: `apps/backend/src/ai/dto/ask.dto.ts` and `apps/backend/src/ai/dto/config.dto.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Entities, migrations, and core services that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Modify `KnowledgeDocument` entity — add `fileSize`, `status` enum (PROCESSING/READY/ERROR), `statusMessage`, `storageKey` fields in `apps/backend/src/ai/entities/knowledge-document.entity.ts`
- [x] T005 [P] Modify `KnowledgeEmbedding` entity — change `embedding` field from JSON array to pgvector `vector(1536)` column in `apps/backend/src/ai/entities/knowledge-embedding.entity.ts`
- [x] T006 [P] Create `ChatSession` entity with `id`, `productId`, `productContext`, `messageCount`, `ipAddress`, `createdAt` in `apps/backend/src/ai/entities/chat-session.entity.ts`
- [x] T007 [P] Create `ChatMessage` entity with `id`, `sessionId`, `role`, `content`, `sources` (jsonb), `createdAt` in `apps/backend/src/ai/entities/chat-message.entity.ts`
- [x] T008 [P] Create `ChatbotConfig` entity (singleton) with `systemPrompt`, `primaryProvider`, `primaryApiKey`, `secondaryProvider`, `secondaryApiKey`, `enabled`, `maxMessagesPerSession` in `apps/backend/src/ai/entities/chatbot-config.entity.ts`
- [x] T009 Run TypeORM migration to create/modify all tables in `apps/backend`
- [x] T010 Update `AIModule` to register new entities and services in `apps/backend/src/ai/ai.module.ts`
- [x] T011 Implement AI provider abstraction — create `AiProviderFactory` supporting OpenAI and Gemini with automatic fallback in `apps/backend/src/ai/chatbot.service.ts`

**Checkpoint**: All entities created, migration run, provider abstraction ready

---

## Phase 3: User Story 1 — Khách hàng hỏi chatbot về sản phẩm (Priority: P1) 🎯 MVP

**Goal**: Customer clicks "Hỏi Ngay" on product page → opens chat with product context → gets AI answer from RAG

**Independent Test**: Visit product detail page → click "Hỏi Ngay" → ask about the product → receive relevant answer with sources

### Implementation for User Story 1

- [ ] T012 [US1] Upgrade `KnowledgeService.searchRelevantChunks` to use pgvector cosine similarity instead of LIKE query in `apps/backend/src/ai/knowledge.service.ts`
- [ ] T013 [US1] Add embedding generation via OpenAI/Gemini in `KnowledgeService.uploadDocument` — call embeddings API and store vectors in `apps/backend/src/ai/knowledge.service.ts`
- [ ] T014 [US1] Refactor `ChatbotService.ask` — load system prompt from `ChatbotConfig` entity, use provider abstraction with fallback, support product context in `apps/backend/src/ai/chatbot.service.ts`
- [ ] T015 [US1] Create `ChatSessionService` — create session, add messages, enforce rate limit (10 msg/min) and session limit (configurable), return session history in `apps/backend/src/ai/chat-session.service.ts`
- [ ] T016 [US1] Add SSE streaming endpoint `POST /ai/public/chat` (no auth, rate-limited) — stream tokens via Server-Sent Events, save messages to session in `apps/backend/src/ai/ai.controller.ts`
- [ ] T017 [US1] Create Next.js API proxy route `POST /api/chat` for public chat SSE in `apps/web-base/src/app/api/chat/route.ts`
- [ ] T018 [P] [US1] Create `ChatMessage` component — render user/assistant bubbles with typing indicator and source citations in `apps/web-base/src/components/chat/chat-message.tsx`
- [ ] T019 [P] [US1] Create `ChatInput` component — text input with send button, character limit (2000), disabled state in `apps/web-base/src/components/chat/chat-input.tsx`
- [ ] T020 [US1] Create `ChatWidget` component — floating bubble button, expandable chat window, SSE streaming consumer, session state, product context detection in `apps/web-base/src/components/chat/chat-widget.tsx`
- [ ] T021 [US1] Create `ChatContext` provider — React context for chat state (session, messages, loading), persist across page navigation in `apps/web-base/src/lib/chat-context.tsx`
- [ ] T022 [US1] Integrate chat widget into Landing Page layout — add `ChatWidget` to root layout, detect product page context in `apps/web-base/src/app/layout.tsx`
- [ ] T023 [US1] Add "Hỏi Ngay" button on product detail page that opens chat with product context (if product pages exist, or placeholder)

**Checkpoint**: Customer can chat with AI on Landing Page with product context. MVP functional.

---

## Phase 4: User Story 2 — Hỏi đáp ngữ cảnh liên kết sản phẩm (Priority: P1)

**Goal**: Users ask cross-product questions (e.g., "Can I mix pesticide X with fertilizer Y?") and get answers referencing multiple products

**Independent Test**: Open chat → ask about combining 2 products → chatbot answers with references to both products from knowledge base

### Implementation for User Story 2

- [ ] T024 [US2] Enhance `ChatbotService` context building — include multiple product data when question mentions products, improve system prompt for cross-product queries in `apps/backend/src/ai/chatbot.service.ts`
- [ ] T025 [US2] Improve `KnowledgeService.searchRelevantChunks` — add product-aware search that matches product names/categories in query against product knowledge chunks in `apps/backend/src/ai/knowledge.service.ts`
- [ ] T026 [US2] Update chat widget to show product recommendation cards when chatbot suggests specific products in `apps/web-base/src/components/chat/chat-message.tsx`

**Checkpoint**: Cross-product consultation working. Both P1 stories complete.

---

## Phase 5: User Story 3 — Admin quản lý kho tài liệu kiến thức (Priority: P2)

**Goal**: Admin uploads PDF/DOCX/TXT documents, views status, deletes documents. Documents are indexed for RAG.

**Independent Test**: Admin → Trợ lý AI → upload PDF → status shows PROCESSING → READY → ask chatbot question related to PDF content → get accurate answer

### Implementation for User Story 3

- [ ] T027 [US3] Add document text extraction — `pdf-parse` for PDF, `mammoth` for DOCX, UTF-8 for TXT in `apps/backend/src/ai/knowledge.service.ts`
- [ ] T028 [US3] Update `POST /ai/admin/knowledge` — accept multipart upload, store original file in MinIO, extract text, chunk, generate embeddings, update status in `apps/backend/src/ai/ai.controller.ts`
- [ ] T029 [US3] Add `DELETE /ai/admin/knowledge/:id` — delete document, embeddings, and MinIO file in `apps/backend/src/ai/ai.controller.ts`
- [ ] T030 [US3] Add `POST /ai/admin/sync-products` — read all products from DB, generate text chunks with name/description/HDSD/category, create embeddings, store as knowledge in `apps/backend/src/ai/knowledge.service.ts`
- [ ] T031 [P] [US3] Create `KnowledgeManager` component — document list table (name, size, status, date), upload button, delete button, sync products button with status indicators in `apps/web-base/src/components/admin/knowledge-manager.tsx`
- [ ] T032 [US3] Create admin page `Trợ lý AI` with tabs: Tài liệu / Cấu hình / Lịch sử chat in `apps/web-base/src/app/admin/ai-assistant/page.tsx`
- [ ] T033 [US3] Create `AiAssistantPage` client component — tab layout hosting KnowledgeManager, ChatbotConfig, and SessionHistory in `apps/web-base/src/components/admin/ai-assistant-page.tsx`
- [ ] T034 [US3] Add "Trợ lý AI" item to admin sidebar navigation in `apps/web-base/src/components/admin/sidebar.tsx`

**Checkpoint**: Admin can upload/manage knowledge documents and sync products.

---

## Phase 6: User Story 4 — Admin cấu hình chatbot (Priority: P3)

**Goal**: Admin configures system prompt, AI providers (primary + secondary), API keys, enables/disables chatbot, sets session message limit

**Independent Test**: Admin → Trợ lý AI → Cấu hình tab → change system prompt + save → chat with bot → new prompt applied

### Implementation for User Story 4

- [ ] T035 [US4] Create `ChatConfigService` — singleton CRUD, get/update config, encrypt API keys, validate API key on save in `apps/backend/src/ai/chat-config.service.ts`
- [ ] T036 [US4] Add `GET /ai/admin/config` and `PUT /ai/admin/config` endpoints in `apps/backend/src/ai/ai.controller.ts`
- [ ] T037 [US4] Create `ChatbotConfig` admin component — form with system prompt textarea, provider dropdowns, API key inputs (masked), enable toggle, max messages slider in `apps/web-base/src/components/admin/chatbot-config.tsx`
- [ ] T038 [US4] Update `ChatWidget` — check `enabled` flag from config before showing widget, show 503 message if disabled in `apps/web-base/src/components/chat/chat-widget.tsx`

**Checkpoint**: Admin can fully configure chatbot behavior.

---

## Phase 7: User Story 5 — Chat widget floating trên Landing Page (Priority: P2)

**Goal**: Chat bubble visible on all Landing pages, fullscreen on mobile, preserves conversation across navigation

**Independent Test**: Navigate between multiple Landing pages → chat bubble always visible → open chat → type message → navigate to another page → conversation preserved

### Implementation for User Story 5

- [ ] T039 [US5] Polish chat widget responsive design — fullscreen on mobile (<768px), popup on desktop, smooth open/close animation in `apps/web-base/src/components/chat/chat-widget.tsx`
- [ ] T040 [US5] Add CSS styles for chat widget — floating bubble, fullscreen mobile overlay, message bubbles, typing animation in `apps/web-base/src/app/globals.css`
- [ ] T041 [US5] Verify chat context persists across page navigation via React context without remounting in `apps/web-base/src/lib/chat-context.tsx`

**Checkpoint**: Chat widget polished and responsive across all devices.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Session cleanup, admin analytics, final validation

- [ ] T042 [P] Add CRON job to auto-delete chat sessions older than 30 days in `apps/backend/src/ai/chat-session.service.ts`
- [ ] T043 [P] Add `GET /ai/admin/sessions` and `GET /ai/admin/sessions/:id` endpoints for admin chat history review in `apps/backend/src/ai/ai.controller.ts`
- [ ] T044 [P] Create `SessionHistory` admin component — session list with filters (date range, pagination), click to view full conversation in `apps/web-base/src/components/admin/session-history.tsx`
- [ ] T045 Add rate limiting middleware for public chat endpoint (10 msg/min by IP) in `apps/backend/src/ai/ai.controller.ts`
- [ ] T046 Add toast notifications for all admin AI CRUD operations (upload, delete, config save, sync) per constitution
- [ ] T047 Run quickstart.md validation — verify full setup flow works end-to-end

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 — MVP target
- **US2 (Phase 4)**: Depends on US1 (extends chatbot service)
- **US3 (Phase 5)**: Depends on Phase 2 — can run in parallel with US1/US2
- **US4 (Phase 6)**: Depends on Phase 2 — can run in parallel with US1/US2/US3
- **US5 (Phase 7)**: Depends on US1 (polishes chat widget created in US1)
- **Polish (Phase 8)**: Depends on all user stories

### Parallel Opportunities

```
Phase 2: T004, T005, T006, T007, T008 can all run in parallel (different entity files)
Phase 3: T018, T019 can run in parallel (different component files)
Phase 5: T031 can run in parallel with T027-T030 (frontend vs backend)
Phase 8: T042, T043, T044 can all run in parallel
```

After Phase 2, these story pairs can be parallelized:
- **US1 + US3**: Chat frontend + Admin knowledge management (different files)
- **US1 + US4**: Chat frontend + Admin config (different files)

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T011)
3. Complete Phase 3: User Story 1 (T012-T023)
4. **STOP and VALIDATE**: Test chat widget with product context
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1 → Chat works with product context (MVP!)
3. US2 → Cross-product queries work
4. US3 → Admin can manage knowledge documents
5. US4 → Admin can configure chatbot
6. US5 → Chat widget polished for mobile
7. Polish → Session cleanup, admin analytics

---

## Notes

- Total tasks: **47**
- Phase 1 (Setup): 3 tasks
- Phase 2 (Foundation): 8 tasks
- US1 (P1 MVP): 12 tasks
- US2 (P1): 3 tasks
- US3 (P2): 8 tasks
- US4 (P3): 4 tasks
- US5 (P2): 3 tasks
- Polish: 6 tasks
- Suggested MVP: Phase 1 + 2 + 3 = **23 tasks**
