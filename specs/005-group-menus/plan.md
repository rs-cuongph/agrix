# Implementation Plan: Group Sidebar Menus

**Branch**: `005-group-menus` | **Date**: 2026-04-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-group-menus/spec.md`

## Summary

Group the admin sidebar menus into logical submenus (Cửa hàng, Nội dung / Web, Hệ thống) with expand/collapse functionality. The "Tổng quan" item will remain standalone. This will clean up the sidebar UI and improve navigation within the admin panel.

## Technical Context

**Language/Version**: Next.js (app router), React, TypeScript
**Primary Dependencies**: shadcn/ui, `lucide-react`
**Storage**: N/A
**Testing**: N/A
**Target Platform**: Web (Admin Panel)
**Project Type**: Next.js Web App
**Performance Goals**: N/A
**Constraints**: Must match existing `emerald-950` design tokens and preserve active state highlighting.
**Scale/Scope**: Modifying `AdminSidebar` component.

## Constitution Check

*GATE: Passed*
- **V. Simple & Intuitive UI**: We will use clear, straightforward UI paradigms (expandable sections) without overloading the views.
- **shadcn/ui Priority**: We will implement standard React state or shadcn/ui components (`Collapsible`) if applicable.

## Project Structure

### Documentation (this feature)

```text
specs/005-group-menus/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
apps/web-base/
└── src/
    └── components/
        └── admin/
            └── sidebar.tsx
```

**Structure Decision**: The implementation focuses on refactoring `apps/web-base/src/components/admin/sidebar.tsx` directly since it's an isolated UI change.

## Complexity Tracking

No constitution violations needing tracking.
