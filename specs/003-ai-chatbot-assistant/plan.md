# Implementation Plan: AI Chatbot Assistant

**Branch**: `003-ai-chatbot-assistant` | **Date**: 2026-03-20 | **Spec**: [spec.md](file:///Users/cuongph/Workspace/agrix/specs/003-ai-chatbot-assistant/spec.md)

## Summary

Build an AI-powered agricultural product consultation chatbot using RAG (Retrieval-Augmented Generation). The backend already has a basic `ai` module with `ChatbotService`, `KnowledgeService`, and entities. This plan extends it with: pgvector for real vector search, dual-provider fallback (OpenAI/Gemini), streaming responses, admin knowledge management UI, admin chatbot configuration, chat history persistence (30 days), and a floating chat widget on the Landing Page.

## Technical Context

**Language/Version**: TypeScript (Node.js 18+)  
**Primary Dependencies**: NestJS (backend), Next.js 14 (web), OpenAI SDK, Google Generative AI SDK, pgvector  
**Storage**: PostgreSQL with pgvector extension, MinIO (documents)  
**Testing**: Jest (backend), manual browser testing (frontend)  
**Target Platform**: Web (Desktop + Mobile responsive)  
**Project Type**: Web application (monorepo: `apps/backend` + `apps/web-base`)  
**Performance Goals**: Chat response <5s, 50 concurrent sessions  
**Constraints**: Soft limit 20 msg/session (configurable), 10 msg/min rate limit, 2000 char max per message  
**Scale/Scope**: Single store deployment, <1000 sessions/day

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| Monorepo Architecture | ✅ PASS | All code in existing `apps/backend` + `apps/web-base` |
| Modular Monolith | ✅ PASS | `AIModule` already exists as separate NestJS module with clear boundaries |
| No Emoji Icons | ✅ PASS | Will use lucide-react icons only |
| CRUD Toast Notifications | ✅ PASS | All admin CRUD ops will use Sonner toast |
| Docker/MinIO | ✅ PASS | Documents stored in MinIO, pgvector via Docker |
| AI Integration Pattern | ✅ PASS | RAG with encrypted API keys per constitution |
| RBAC | ✅ PASS | Admin-only for knowledge/config management, public chat rate-limited |

## Project Structure

### Documentation (this feature)

```text
specs/003-ai-chatbot-assistant/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── api-endpoints.md
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
apps/backend/src/ai/
├── ai.module.ts                   # [MODIFY] Add new entities, services
├── ai.controller.ts               # [MODIFY] Add admin endpoints, streaming, config
├── chatbot.service.ts             # [MODIFY] Dual-provider, streaming, system prompt
├── knowledge.service.ts           # [MODIFY] pgvector search, document processing, product sync
├── chat-config.service.ts         # [NEW] Chatbot configuration CRUD
├── chat-session.service.ts        # [NEW] Session persistence & history
├── entities/
│   ├── knowledge-document.entity.ts  # [MODIFY] Add fileSize, status enum
│   ├── knowledge-embedding.entity.ts # [MODIFY] pgvector column
│   ├── chat-session.entity.ts        # [NEW]
│   ├── chat-message.entity.ts        # [NEW]
│   └── chatbot-config.entity.ts      # [NEW]
└── dto/
    ├── ask.dto.ts                    # [NEW] Validation
    └── config.dto.ts                 # [NEW] Config update DTO

apps/web-base/src/
├── components/
│   ├── chat/
│   │   ├── chat-widget.tsx           # [NEW] Floating bubble + chat window
│   │   ├── chat-message.tsx          # [NEW] Message bubble component
│   │   └── chat-input.tsx            # [NEW] Input with send button
│   └── admin/
│       ├── ai-assistant-page.tsx     # [NEW] Admin AI management page
│       ├── knowledge-manager.tsx     # [NEW] Document upload/list/delete
│       └── chatbot-config.tsx        # [NEW] Config form (prompt, provider, limits)
├── app/
│   ├── admin/ai-assistant/
│   │   └── page.tsx                  # [NEW] Admin route
│   └── api/chat/
│       └── route.ts                  # [NEW] Public chat API proxy (no auth)
└── lib/
    └── chat-context.tsx              # [NEW] React context for chat state
```

**Structure Decision**: Extends the existing `apps/backend/src/ai/` module and adds new frontend components under `apps/web-base/src/components/chat/` (public) and `admin/` (admin panel). Follows the established monorepo pattern.

## Complexity Tracking

No constitution violations — no tracking needed.
