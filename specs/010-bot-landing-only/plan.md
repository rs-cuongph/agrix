# Implementation Plan: Chatbot Rate Limiting by Source

**Branch**: `010-bot-landing-only` | **Date**: 2026-04-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/010-bot-landing-only/spec.md`

## Summary

The AI chatbot currently enforces a hard session message limit (`maxMessagesPerSession`) for all users regardless of context. This feature adds a `source` field to the chat request payload that identifies where the message originates (`landing`, `pos`, or `admin`). The backend will bypass the session limit when the source is `pos` or `admin`, while continuing to enforce it for `landing` (or unspecified) sources. This is a thin, end-to-end change touching 4 files across 2 projects.

## Technical Context

**Language/Version**: TypeScript / Node.js 20 / NestJS (Backend), Next.js 14 (Frontend)
**Primary Dependencies**: `class-validator` (DTO), `typeorm` (session queries), React Context (chat state)
**Storage**: PostgreSQL (existing `chat_sessions` / `chat_messages` tables — no schema changes)
**Target Platform**: Web (all routes: Landing, POS, Admin)
**Project Type**: Full-stack Next.js + NestJS Web App
**Scale/Scope**: Minimal — 4 files modified, 0 new files, ~20 lines changed total

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Mobile-First & Offline-First**: N/A — chatbot requires online connectivity by design (calls OpenAI/Gemini APIs).
- [x] **II. Monorepo Architecture**: Changes stay within the existing monorepo structure (backend + web-base).
- [x] **III. Scalable Core (Modular Monolith)**: Change is isolated within the `ai` module. No cross-domain coupling.
- [x] **V. Simple & Intuitive UI**: No UI changes. The widget behaves identically; only the backend limit logic changes.
- [x] **shadcn/ui Priority**: N/A — no new UI components.
- [x] **No Emoji Icons**: N/A — no UI changes.
- [x] **CRUD Toast Notifications**: N/A — no CRUD operations involved.

## Project Structure

### Documentation (this feature)

```text
specs/010-bot-landing-only/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (no schema changes)
├── quickstart.md        # Phase 1 output
└── contracts/
    └── api-contracts.md # Updated request payload
```

### Source Code

```text
apps/
├── backend/
│   └── src/ai/
│       ├── dto/ask.dto.ts                  # [MODIFY] Add `source` optional field
│       └── chat-session.service.ts         # [MODIFY] Bypass limit when source is 'pos'|'admin'
└── web-base/
    └── src/
        ├── lib/chat-context.tsx            # [MODIFY] Send `source` derived from pathname
        └── app/api/chat/route.ts           # [MODIFY] Forward `source` field to backend
```

**Structure Decision**: No new files needed. The change threads a new optional `source` field through the existing request pipeline: `ChatContext → /api/chat proxy → /ai/public/chat → ChatSessionService.addUserMessage()`.
