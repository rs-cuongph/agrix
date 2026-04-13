# Implementation Plan: Quản lý Mùa vụ & AI Sinh Lịch Canh tác

**Branch**: `018-ai-calendar-admin` | **Date**: 2026-04-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/018-ai-calendar-admin/spec.md`

## Summary

Tạo trang admin quản lý mùa vụ (`/admin/season-calendar/manage`) với full CRUD cho season calendars + growth stages + product recommendations + pest warnings, kèm tính năng **AI sinh lịch mùa vụ tự động** (gọi OpenAI/Gemini → structured JSON → editable preview → batch save trong 1 transaction).

Đặc điểm: **Backend CRUD API đã có sẵn** từ feature 015/017 — chỉ cần tạo UI + 1 endpoint AI generate mới + 1 endpoint admin list calendars mới.

## Technical Context

**Language/Version**: TypeScript 5.x (Node.js 20 backend, React 18 frontend)  
**Primary Dependencies**: NestJS 11, TypeORM 0.3, Next.js 14, React 18, shadcn/ui, lucide-react, Sonner  
**Storage**: PostgreSQL 15 (existing)  
**AI Provider**: OpenAI (GPT-4o-mini) / Gemini (gemini-2.0-flash) — existing `ChatbotService` pattern  
**Testing**: Manual verification via quickstart.md  
**Target Platform**: Web browser (admin dashboard)  
**Project Type**: Monorepo web application (NestJS + Next.js)  
**Performance Goals**: AI generate ≤ 15s, CRUD < 500ms  
**Constraints**: Feature 015 + 017 must be complete; AI API keys must be configured

## Constitution Check

| Gate | Status | Notes |
|------|--------|-------|
| Monorepo Architecture | ✅ Pass | All code in `apps/backend` + `apps/web-base` |
| Modular Monolith | ✅ Pass | Extends existing `season-calendar` module + reuses `ai` module |
| shadcn/ui Priority | ✅ Pass | Table, Dialog, Select, Input, Accordion, Badge |
| No Emoji Icons | ✅ Pass | lucide-react icons only |
| CRUD Toast Notifications | ✅ Pass | Sonner toasts for all ops |
| Simple & Intuitive UI | ✅ Pass | Separate manage page, clear CRUD flows |
| PostgreSQL Storage | ✅ Pass | Existing tables, no new schema |

## Project Structure

### Documentation (this feature)

```text
specs/018-ai-calendar-admin/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (no new tables — references existing)
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── api.md           # New endpoints only
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
apps/backend/src/
├── season-calendar/
│   ├── controllers/
│   │   └── admin-calendar.controller.ts    [MODIFY: add GET list endpoint]
│   ├── services/
│   │   ├── season-calendar.service.ts      [MODIFY: add listCalendars + bulkCreate methods]
│   │   └── ai-calendar-generator.service.ts [NEW: AI generate logic]
│   ├── dto/
│   │   └── ai-generate-calendar.dto.ts     [NEW: AI request/response DTOs]
│   └── season-calendar.module.ts           [MODIFY: register new service]
└── ai/
    └── chatbot.service.ts                  [UNCHANGED: reuse callWithFallback pattern]

apps/web-base/src/
├── app/admin/season-calendar/
│   ├── manage/
│   │   ├── page.tsx                        [NEW: manage page — calendar list + CRUD]
│   │   └── [id]/
│   │       └── page.tsx                    [NEW: calendar detail — stages CRUD]
│   ├── components/
│   │   ├── CalendarManageTable.tsx          [NEW: calendars table with filters]
│   │   ├── CalendarFormDialog.tsx           [NEW: create/edit calendar dialog]
│   │   ├── StageFormDialog.tsx              [NEW: create/edit stage dialog]
│   │   ├── StageListAccordion.tsx           [NEW: stages list with accordion]
│   │   ├── AiGenerateDialog.tsx             [NEW: AI generate flow — form + preview + save]
│   │   ├── AiPreviewEditor.tsx              [NEW: editable preview for AI results]
│   │   ├── RecommendationFormDialog.tsx     [NEW: product recommendation CRUD]
│   │   └── PestWarningFormDialog.tsx        [NEW: pest warning CRUD]
│   └── page.tsx                            [MODIFY: add nav link to /manage]
└── lib/admin/
    ├── season-calendar-admin-api.ts        [MODIFY: add listCalendars, aiGenerate, bulkCreate]
    └── season-calendar-api.ts              [UNCHANGED]
```

**Structure Decision**: Extends existing `season-calendar` module. The AI generation service is a new service within the same module that reuses the `ChatbotService` pattern (callWithFallback for OpenAI/Gemini). Frontend uses Next.js file-based routing with `/manage` and `/manage/[id]` for the management pages.
