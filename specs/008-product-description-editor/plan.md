# Implementation Plan: Rich Text Product Description

**Branch**: `008-product-description-editor` | **Date**: 2026-04-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-product-description-editor/spec.md`

## Summary

The admin product creation/edit form requires a Rich Text Editor capable of basic formatting (bold, italic, lists) for the `description` field, replacing the plain text area. This formatted text must be securely rendered on both the Landing Page and POS modal, preventing XSS vulnerabilities. We will use the existing `@tiptap/react` toolkit.

## Technical Context

**Language/Version**: TypeScript / React 18 / Next.js 14
**Primary Dependencies**: `@tiptap/react`, `@tiptap/starter-kit`, `lucide-react`, `shadcn/ui`
**Storage**: PostgreSQL (Prisma) - storing HTML payload in `Product.description` (currently mapped as String, usually boundless in Postgres).
**Target Platform**: Web (Admin Panel `/admin/*`, Landing, POS)
**Project Type**: Next.js Web App
**Scale/Scope**: Impacts Product creation/edit workflow and consumer viewing.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **V. Simple & Intuitive UI**: We will use a clean Tiptap toolbar using `lucide-react` icons (No emojis).
- [x] **CRUD Toast Notifications**: Not changing CRUD actions directly, just the payload, but standard toasts will be maintained on product save.
- [x] **shadcn/ui Priority**: Built on top of standard tailwind constraints, ensuring native look in `.admin-scope`.

## Project Structure

### Documentation (this feature)

```text
specs/008-product-description-editor/
├── plan.md              # This file
├── data-model.md        # Data constraints
└── quickstart.md        # Test scenario
```

### Source Code

```text
apps/web-base/
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   └── rich-text-editor.tsx      # [NEW] Reusable TipTap component
│   │   ├── pos/
│   │   │   └── product-details-dialog.tsx # [MODIFY] Render rich text safely
│   ├── app/
│   │   ├── admin/
│   │   │   └── products/
│   │   │       └── [id]/page.tsx         # [MODIFY] Replace textarea with Editor
```

**Structure Decision**: The rich text editor will be isolated as a reusable `RichTextEditor` component inside `components/admin` because it provides content administration functionality.
