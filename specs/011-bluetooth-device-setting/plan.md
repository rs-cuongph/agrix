# Implementation Plan: Bluetooth Device Setting

**Branch**: `011-bluetooth-device-setting` | **Date**: 2026-04-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/011-bluetooth-device-setting/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Add a Bluetooth settings drawer to the POS interface that allows cashiers to scan, connect, and manage Bluetooth thermal printers. Implement manual receipt printing using the Web Bluetooth API and ESC/POS protocol, along with managing the device list locally in the browser per user.

## Technical Context

**Language/Version**: TypeScript / React (Next.js 15)  
**Primary Dependencies**: Web Bluetooth API (`navigator.bluetooth`), `esc-pos-encoder` (or similar package to generate ESC/POS byte arrays), `sonner` (for toasts), `lucide-react` (for icons)  
**Storage**: `localStorage` (Zustand with persist middleware)  
**Testing**: Manual testing with Web Bluetooth compatible browsers
**Target Platform**: Web Browser on Desktop/Android (Chrome/Edge/Opera)
**Project Type**: Next.js App Router UI Component / POS Module  
**Performance Goals**: Fast scanning and near-instant command dispatching  
**Constraints**: Web Bluetooth API requires HTTPS context (or localhost) and must be triggered by explicit user interaction (click). No iOS Safari support.  
**Scale/Scope**: Local state management per-user for device pairing and defaults.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Simple & Intuitive UI**: Use shadcn/ui components (`Drawer`, `Button`, `Card`, `Badge` etc.) for the settings.
- [x] **No Emoji Icons**: Use `lucide-react` icons (e.g., `Bluetooth`, `Printer`, `Settings`, `Trash2`).
- [x] **CRUD Toast Notifications**: Operations like renaming or deleting a saved printer MUST show `toast.success` using `sonner`. Printer connection drops or Web Bluetooth unsupported MUST use `toast.error` / `toast.warning`.

## Project Structure

### Documentation (this feature)

```text
specs/011-bluetooth-device-setting/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md
```

### Source Code (repository root)

```text
apps/web-base/src/
├── app/pos/(app)/
│   └── layout.tsx            # (Existing) Add gear icon to header to open drawer
├── components/pos/
│   ├── pos-settings-drawer.tsx # Drawer containing POS settings
│   ├── bluetooth-printer-settings.tsx # Main bluetooth scanner & device list UI
│   └── receipt-printer.tsx   # Component/Hook wrapper for initiating the print job
└── stores/
    └── use-bluetooth-printer-store.ts # Zustand store (persisted) for saved devices & default device ID per user
```

**Structure Decision**: Integrated fully within the existing `apps/web-base` under `pos` folder, adhering to the monorepo web app structure.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

*No violations.*
