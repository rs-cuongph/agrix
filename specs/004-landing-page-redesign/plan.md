# Implementation Plan: Landing Page Redesign

**Branch**: `004-landing-page-redesign` | **Date**: 2026-03-21 | **Spec**: [spec.md](file:///Users/cuongph/Workspace/agrix/specs/004-landing-page-redesign/spec.md)
**Input**: Feature specification from `/specs/004-landing-page-redesign/spec.md`

## Summary

Redesign the Landing Page from a static intro page to a fully functional e-commerce storefront. The page will showcase Products (linking to a dedicated Product Detail Page), display Blog posts from Admin, show store Contact Info with a submission form (saving to DB + Admin notification), and include FAQ & Testimonials sections managed via Admin Dashboard.

## Technical Context

**Language/Version**: TypeScript 5.x (Node.js 20+)
**Primary Dependencies**: Next.js 15 (App Router, RSC), NestJS, shadcn/ui, Tailwind CSS v4, TypeORM, lucide-react
**Storage**: PostgreSQL (via TypeORM)
**Testing**: Manual browser verification + API endpoint testing
**Target Platform**: Web (Desktop + Mobile responsive)
**Project Type**: Monorepo web application (Next.js frontend + NestJS backend)
**Performance Goals**: Landing Page load < 2s, ISR with 5-minute revalidation
**Constraints**: Must use shadcn primitives where available (Constitution V), no emoji icons (use lucide-react), CRUD toast notifications via Sonner
**Scale/Scope**: ~8 new/modified frontend pages, ~4 new backend modules, ~4 new DB entities

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Rule | Status | Notes |
|---|------|--------|-------|
| I | Mobile-First & Offline-First | ✅ N/A | Landing page is server-rendered, no offline requirement |
| II | Monorepo Architecture | ✅ Pass | All code in `apps/backend` and `apps/web-base` |
| III | Scalable Core (Modular Monolith) | ✅ Pass | New modules (Contact, FAQ, Testimonial) follow existing NestJS module pattern |
| IV | Traceability | ✅ N/A | No financial transactions involved |
| V | Simple & Intuitive UI | ✅ Pass | Using shadcn/ui + lucide-react, no emoji, Sonner toasts |

## Project Structure

### Documentation (this feature)

```text
specs/004-landing-page-redesign/
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
apps/backend/src/
├── contact/                    # [NEW] Contact module
│   ├── contact.module.ts
│   ├── contact.controller.ts
│   ├── contact.service.ts
│   └── entities/
│       └── contact-submission.entity.ts
├── faq/                        # [NEW] FAQ module
│   ├── faq.module.ts
│   ├── faq.controller.ts
│   ├── faq.service.ts
│   └── entities/
│       └── faq.entity.ts
├── testimonial/                # [NEW] Testimonial module
│   ├── testimonial.module.ts
│   ├── testimonial.controller.ts
│   ├── testimonial.service.ts
│   └── entities/
│       └── testimonial.entity.ts
├── common/
│   └── entities/
│       └── store-settings.entity.ts  # [NEW] or extend existing settings

apps/web-base/src/
├── app/
│   ├── page.tsx                    # [MODIFY] Complete redesign
│   ├── products/
│   │   ├── page.tsx                # [MODIFY] Product grid/card view
│   │   └── [id]/
│   │       └── page.tsx            # [NEW] Product Detail Page
│   ├── blog/
│   │   ├── page.tsx                # [MODIFY] Blog listing
│   │   └── [slug]/page.tsx         # [EXISTS] Blog detail
│   ├── contact/
│   │   └── page.tsx                # [MODIFY] Contact info + form
│   └── api/
│       └── contact/
│           └── route.ts            # [NEW] API proxy for contact form
├── components/
│   ├── landing/                    # [NEW] Landing page sections
│   │   ├── hero-section.tsx
│   │   ├── products-section.tsx
│   │   ├── blog-section.tsx
│   │   ├── testimonials-section.tsx
│   │   ├── faq-section.tsx
│   │   ├── contact-section.tsx
│   │   └── navbar.tsx
│   └── admin/
│       ├── contact-management.tsx  # [NEW] Admin contact submissions
│       ├── faq-management.tsx      # [NEW] Admin FAQ CRUD
│       └── testimonial-management.tsx # [NEW] Admin Testimonial CRUD
```

**Structure Decision**: Follows existing monorepo pattern — NestJS modules under `apps/backend/src/`, Next.js pages under `apps/web-base/src/app/`, Admin components under `apps/web-base/src/components/admin/`.

## Complexity Tracking

No constitution violations detected. No justification needed.
