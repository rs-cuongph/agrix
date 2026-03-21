# Implementation Plan: Landing Page Redesign & Product Gallery

**Branch**: `004-landing-page-redesign` | **Date**: 2026-03-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-landing-page-redesign/spec.md`

## Summary

The objective is to overhaul the public-facing Landing Page (`apps/web-base/src/app/page.tsx`) to serve as an attractive e-commerce storefront showcasing products, latest blogs, and a contact section. Additionally, the Admin panel will be updated to support uploading multiple images (a gallery) for Products, replacing the single image approach, allowing users to see richer product details.

## Technical Context

**Language/Version**: TypeScript (Node 20+)
**Primary Dependencies**: Next.js 14 (App Router), NestJS, TypeORM, Tailwind CSS v4, shadcn/ui.
**Storage**: PostgreSQL (via TypeORM), MinIO for image uploads.
**Testing**: Manual UI verification and API endpoint testing.
**Target Platform**: Web Browser (Responsive Desktop & Mobile).
**Project Type**: Fullstack Web Application (Next.js Frontend + NestJS Backend).
**Performance Goals**: Fast LCP for landing page (< 2s), optimized image delivery.
**Constraints**: Must adhere to Clean Material Design 3 and Agrix Constitution (shadcn components, clear Toasts for CRUD).
**Scale/Scope**: Updating 1 public page route, 1 admin page route, 1 backend controller/service, and modifying the Product database schema.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **II. Monorepo Architecture**: Changes will span `apps/backend` and `apps/web-base` within the single monorepo.
- **V. Simple & Intuitive UI**: We will strictly use `shadcn` components for the Admin gallery upload and `lucide-react` for icons. CRUD operations for saving the product gallery will trigger `toast.success` and handle standard frontend errors.

All gates PASSED.

## Project Structure

### Documentation (this feature)

```text
specs/004-landing-page-redesign/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
└── quickstart.md        # Phase 1 output
```

### Source Code (repository root)

```text
apps/backend/
├── src/
│   └── products/           # Update Product entity and controller for image gallery

apps/web-base/
├── src/
│   ├── app/
│   │   ├── page.tsx                           # Landing page redirect/structure
│   │   ├── products/                          # Public product catalog
│   │   └── admin/products/                    # Admin product manager
│   └── components/
│       ├── landing/                           # Landing page sections
│       └── admin/                             # Admin product editor (Image upload)
```

**Structure Decision**: Code changes are isolated to the `apps/web-base` presentation layer and `apps/backend/src/products` for the entity update.

## Complexity Tracking

*No violations of the constitution.*
