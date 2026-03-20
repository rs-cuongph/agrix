# Implementation Plan: Batch-Based Stock System

**Branch**: `001-agrix-core-platform` | **Date**: 2026-03-20 | **Spec**: [spec.md](file:///Users/cuongph/Workspace/agrix/specs/001-agrix-core-platform/spec.md)
**Input**: FR-017, FR-018 — Batch-level inventory tracking with FIFO deduction

## Summary

Implement batch-level stock tracking where each import creates a numbered batch (YYYYMMDD-SKU-HHMM) with `remainingQuantity`. All stock deductions (SALE, ADJUSTMENT, DAMAGE, RETURN) use **FIFO** — splitting into multiple StockEntry records per batch deducted. This enables **per-order profit calculation** by preserving `costPricePerUnit` from the source batch on each deduction entry.

## Technical Context

**Language/Version**: TypeScript 5.x (NestJS 10 backend, Next.js 14 frontend)
**Primary Dependencies**: TypeORM, PostgreSQL, sonner (toasts), lucide-react
**Storage**: PostgreSQL (existing) — migration needed for new column
**Testing**: Manual verification + build check
**Target Platform**: Web (admin dashboard)
**Project Type**: Monorepo web application (apps/backend + apps/web-base)
**Constraints**: Offline-first POS sync must not break; FIFO logic must be transaction-safe

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Offline-First | ✅ PASS | Backend-only change; POS sync untouched |
| II. Monorepo | ✅ PASS | Changes within existing apps/ structure |
| III. Modular Monolith | ✅ PASS | Changes scoped to `inventory` module |
| IV. Traceability | ✅ PASS | Core goal — batch tracking enhances traceability |
| V. Simple UI | ✅ PASS | FIFO auto-deduction simplifies UX (no batch selection) |
| CRUD Toasts | ✅ PASS | Already implemented globally |
| No Emoji Icons | ✅ PASS | Using lucide-react |

## Project Structure

### Documentation (this feature)

```text
specs/001-agrix-core-platform/
├── plan.md              # This file
├── research.md          # Phase 0 — no unknowns, decisions documented
├── data-model.md        # Phase 1 — entity changes
├── contracts/           # Phase 1 — API contract updates
│   └── stock-api.md
└── tasks.md             # Phase 2 — task breakdown (speckit.tasks)
```

### Source Code (changes)

```text
apps/backend/src/inventory/
├── entities/
│   └── stock-entry.entity.ts     # [MODIFY] Add remainingQuantity, make batchNumber required for IMPORT
├── stock-import.service.ts        # [MODIFY] FIFO logic, auto-generate batchNumber, split deductions
├── stock.controller.ts            # [MODIFY] Add batch-listing endpoint
└── inventory.module.ts            # [NO CHANGE]

apps/web-base/src/
├── components/admin/
│   └── inventory-client.tsx       # [MODIFY] Update import form (auto batchNumber), adjust form UX
└── app/admin/inventory/
    └── page.tsx                   # [MODIFY] Pass batch data to client

apps/backend/src/database/seeds/
└── seed.ts                        # [MODIFY] Set remainingQuantity on IMPORT entries
```

**Structure Decision**: All changes within existing modules. No new modules needed.

## Complexity Tracking

No constitution violations. No complexity justification needed.
