# Implementation Plan: Web Admin Migration to Next.js

**Branch**: `001-agrix-core-platform` | **Date**: 2026-03-20 | **Spec**: [spec.md](file:///Users/cuongph/Workspace/agrix/specs/001-agrix-core-platform/spec.md)
**Input**: Migrate Web Admin from Flutter Web to Next.js, integrated into `apps/web-base/` under `/admin/*` route.

## Summary

Migrate the admin dashboard from Flutter Web (`apps/web-admin/`) to Next.js pages within the existing `apps/web-base/` application. Admin pages live under `/admin/*` route with server-side middleware authentication (JWT in httpOnly cookie). UI uses shadcn/ui + Tailwind CSS. Flutter web-admin is deprecated but retained.

## Technical Context

**Language/Version**: TypeScript 5.x, React 18, Next.js 14 (App Router)
**Primary Dependencies**: next, react, shadcn/ui, tailwindcss, lucide-react
**Storage**: PostgreSQL (via NestJS backend REST API at `localhost:3000`)
**Testing**: Next.js build verification + manual browser testing
**Target Platform**: Web browser (desktop admin)
**Project Type**: Web application (admin panel extension)
**Constraints**: Must integrate into existing `apps/web-base/` Next.js app; backend API already exists; no new backend modules needed

## Constitution Check

| Gate | Status | Notes |
|------|--------|-------|
| II. Monorepo Architecture | ✅ PASS | Admin integrated into existing `apps/web-base/`, single repo |
| III. Scalable Core (Modular Monolith) | ✅ PASS | No backend changes, uses existing REST API |
| V. Simple & Intuitive UI | ✅ PASS | shadcn/ui provides clean, modern Material-like UI |
| Dev Workflow | ✅ PASS | Standard Next.js dev workflow, `npm run dev` |

## Project Structure

### Source Code

```text
apps/web-base/
├── src/app/
│   ├── page.tsx                     # Public landing (existing)
│   ├── blog/                        # Public blog (existing)
│   ├── products/                    # Public products (existing)
│   ├── contact/                     # Public contact (existing)
│   ├── admin/                       # 🆕 Admin section
│   │   ├── layout.tsx               # Admin layout (sidebar + content)
│   │   ├── page.tsx                 # Dashboard (/admin)
│   │   ├── login/
│   │   │   └── page.tsx             # Login page (/admin/login)
│   │   ├── products/
│   │   │   └── page.tsx             # Products CRUD (/admin/products)
│   │   ├── orders/
│   │   │   └── page.tsx             # Orders read-only (/admin/orders)
│   │   ├── customers/
│   │   │   └── page.tsx             # Customers + Debt (/admin/customers)
│   │   ├── blog/
│   │   │   └── page.tsx             # Blog management (/admin/blog)
│   │   └── settings/
│   │       └── page.tsx             # Settings (/admin/settings)
│   └── api/
│       └── auth/
│           ├── login/route.ts       # 🆕 Proxy login → sets httpOnly cookie
│           └── logout/route.ts      # 🆕 Clears cookie
├── src/components/
│   └── admin/                       # 🆕 Admin UI components
│       ├── sidebar.tsx
│       ├── stat-card.tsx
│       └── data-table.tsx
├── src/lib/
│   ├── api.ts                       # 🆕 Server-side API client (fetch)
│   └── auth.ts                      # 🆕 Cookie/JWT helpers
├── middleware.ts                     # 🆕 Auth guard for /admin/*
├── tailwind.config.ts               # 🆕 Tailwind configuration
├── components.json                  # 🆕 shadcn/ui config
└── postcss.config.mjs               # 🆕 PostCSS for Tailwind
```

## Phases

### Phase 1: Foundation (Tailwind + shadcn/ui + Auth)
1. Install Tailwind CSS + PostCSS + shadcn/ui in `apps/web-base/`
2. Create `middleware.ts` — check JWT cookie, redirect unauthorized `/admin/*` → `/admin/login`
3. Create `src/app/api/auth/login/route.ts` — proxy login to backend, set httpOnly cookie
4. Create `src/app/api/auth/logout/route.ts` — clear cookie
5. Create `src/lib/api.ts` — server-side fetch wrapper with JWT from cookie
6. Create `src/lib/auth.ts` — cookie read/write helpers

### Phase 2: Admin Layout + Login
7. Create `src/app/admin/layout.tsx` — sidebar navigation + top bar
8. Create `src/app/admin/login/page.tsx` — login form
9. Create `src/components/admin/sidebar.tsx` — navigation component

### Phase 3: Dashboard + Data Pages
10. Create `src/app/admin/page.tsx` — dashboard with metrics from `/dashboard/*` endpoints
11. Create `src/app/admin/products/page.tsx` — products data table with CRUD
12. Create `src/app/admin/orders/page.tsx` — orders history (read-only)
13. Create `src/app/admin/customers/page.tsx` — customers + debt info
14. Create `src/app/admin/blog/page.tsx` — blog management
15. Create `src/app/admin/settings/page.tsx` — settings page

### Phase 4: Polish + Verification
16. Verify all pages render with real backend data
17. Mark `apps/web-admin/` as deprecated (add DEPRECATED.md)

## Verification Plan

### Automated
- `cd apps/web-base && npm run build` — zero errors
- `cd apps/web-base && npm run lint` — no lint errors

### Manual
1. Navigate to `http://localhost:3002/admin` → redirects to `/admin/login`
2. Login with `admin/admin123` → redirected to dashboard
3. Dashboard shows real metrics (7 products, 3 customers)
4. Products page shows data table with 7 seeded products
5. All navigation links work correctly
