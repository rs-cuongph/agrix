# Implementation Plan: Nâng cấp UX Lịch Mùa vụ

**Branch**: `017-calendar-ux-enhance` | **Date**: 2026-04-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/017-calendar-ux-enhance/spec.md`

## Summary

Nâng cấp giao diện Lịch Mùa vụ từ card-based grid/table sang bổ sung thêm **Gantt Timeline view** (view mode thứ 3), làm giàu **Stage Detail Panel** với checklist chăm sóc và cảnh báo sâu bệnh (bảng riêng), thêm **Quick Stats dashboard**, **search cây trồng nhanh**, **multi-season overlay**, **weather overlay** (dữ liệu tĩnh), và **Activity Log** với 6-month retention.

Tiếp cận: mở rộng module `season-calendar` hiện có — thêm 2 entity mới (PestWarning, WeatherBaseline, SeasonActivityLog), ALTER TABLE growth_stages, frontend-only Gantt component bằng CSS Grid, tất cả tính toán stats thực hiện client-side từ data có sẵn.

## Technical Context

**Language/Version**: TypeScript 5.x (Node.js 20 backend, React 18 frontend)  
**Primary Dependencies**: NestJS 11, TypeORM 0.3, Next.js 14, React 18, shadcn/ui, lucide-react  
**Storage**: PostgreSQL 15 (existing)  
**Testing**: Manual verification via quickstart.md  
**Target Platform**: Web browser (admin dashboard)  
**Project Type**: Monorepo web application (NestJS + Next.js)  
**Performance Goals**: Gantt render < 3s, search < 500ms  
**Constraints**: Module 015 must be complete; no external API dependencies (weather = static seed)  
**Scale/Scope**: 8 zones × 10+ crops × 3 seasons × 4-6 stages each

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| Monorepo Architecture | ✅ Pass | All code stays in `apps/backend` + `apps/web-base` |
| Modular Monolith | ✅ Pass | Extends existing `season-calendar` module, no new module |
| shadcn/ui Priority | ✅ Pass | All UI components use shadcn primitives |
| No Emoji Icons | ✅ Pass | lucide-react icons only |
| CRUD Toast Notifications | ✅ Pass | Sonner toasts for all CRUD ops |
| Simple & Intuitive UI | ✅ Pass | Gantt view improves readability |
| PostgreSQL Storage | ✅ Pass | New tables in existing DB |

## Project Structure

### Documentation (this feature)

```text
specs/017-calendar-ux-enhance/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── api.md           # New/modified API endpoints
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
apps/backend/src/season-calendar/
├── entities/
│   ├── pest-warning.entity.ts          [NEW]
│   ├── weather-baseline.entity.ts      [NEW]
│   ├── season-activity-log.entity.ts   [NEW]
│   ├── growth-stage.entity.ts          [MODIFY: add careActivities]
│   └── index.ts                        [MODIFY: export new entities]
├── dto/
│   ├── create-pest-warning.dto.ts      [NEW]
│   ├── create-weather-baseline.dto.ts  [NEW]
│   └── activity-log-query.dto.ts       [NEW]
├── controllers/
│   ├── admin-pest-warnings.controller.ts  [NEW]
│   ├── admin-weather.controller.ts        [NEW]
│   ├── activity-log.controller.ts         [NEW]
│   ├── weather.controller.ts              [NEW]
│   └── admin-calendar.controller.ts       [MODIFY: pest-warning CRUD nested routes]
├── services/
│   ├── pest-warning.service.ts            [NEW]
│   ├── weather-baseline.service.ts        [NEW]
│   ├── activity-log.service.ts            [NEW]
│   └── season-calendar.service.ts         [MODIFY: include pestWarnings in calendar response]
└── season-calendar.module.ts              [MODIFY: register new entities/controllers/services]

apps/web-base/src/
├── app/admin/season-calendar/
│   ├── components/
│   │   ├── SeasonCalendarTimeline.tsx      [NEW: Gantt view]
│   │   ├── StageDetailSheet.tsx            [NEW: enriched stage detail]
│   │   ├── QuickStatsCards.tsx             [NEW: stats dashboard]
│   │   ├── CropSearchInput.tsx            [NEW: inline search]
│   │   ├── WeatherOverlay.tsx             [NEW: weather mini chart]
│   │   ├── SeasonCalendarGrid.tsx         [MODIFY: extract Sheet → StageDetailSheet]
│   │   └── ProductSuggestionPanel.tsx     [UNCHANGED]
│   ├── activity-log/page.tsx              [NEW: activity log page]
│   └── page.tsx                           [MODIFY: add Timeline toggle, stats, search]
└── lib/admin/
    ├── season-calendar-api.ts             [MODIFY: add weather, activity-log endpoints]
    └── season-calendar-admin-api.ts       [MODIFY: add pest-warning CRUD, weather CRUD]
```

**Structure Decision**: Extends the existing `season-calendar` module. No new NestJS modules — pest warnings, weather baseline, and activity log are part of the same domain. Frontend components are colocated in the existing `season-calendar/components/` directory.
