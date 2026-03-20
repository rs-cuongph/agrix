# Tasks: Web Admin Next.js Migration

**Input**: Design documents from `/specs/001-agrix-core-platform/`
**Prerequisites**: plan.md, spec.md, research.md, quickstart.md

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[US-ADM]**: Admin migration user story (all tasks)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Tailwind + shadcn/ui)

**Purpose**: Install dependencies and configure Tailwind CSS + shadcn/ui in existing `apps/web-base/`

- [ ] T001 Install Tailwind CSS, PostCSS, Autoprefixer in `apps/web-base/`
- [ ] T002 Create Tailwind config at `apps/web-base/tailwind.config.ts` and PostCSS config at `apps/web-base/postcss.config.mjs`
- [ ] T003 Update `apps/web-base/src/app/globals.css` with Tailwind directives (`@tailwind base/components/utilities`)
- [ ] T004 Initialize shadcn/ui: run `npx shadcn@latest init` in `apps/web-base/`, create `components.json`
- [ ] T005 [P] Install shadcn/ui components: `button`, `input`, `card`, `table`, `dialog`, `badge`, `dropdown-menu`, `separator`

---

## Phase 2: Foundation (Auth + API Client + Middleware)

**Purpose**: Core auth infrastructure that MUST be complete before any admin page

**⚠️ CRITICAL**: No admin page work can begin until this phase is complete

- [ ] T006 [P] Create auth helpers at `apps/web-base/src/lib/auth.ts` — cookie read/write for JWT token, `getToken()`, `setToken()`, `clearToken()` using httpOnly cookies
- [ ] T007 [P] Create server-side API client at `apps/web-base/src/lib/api.ts` — `fetch` wrapper with JWT from cookie, base URL `http://localhost:3000/api/v1`, methods: `apiGet()`, `apiPost()`, `apiPut()`, `apiDelete()`
- [ ] T008 Create login API route at `apps/web-base/src/app/api/auth/login/route.ts` — proxy POST to backend `/auth/login`, set JWT as httpOnly cookie, return user info
- [ ] T009 [P] Create logout API route at `apps/web-base/src/app/api/auth/logout/route.ts` — clear JWT cookie
- [ ] T010 Create Next.js middleware at `apps/web-base/middleware.ts` — check JWT cookie for `/admin/*` paths (except `/admin/login`), redirect to `/admin/login` if missing

**Checkpoint**: Auth infrastructure ready — admin pages can now be built

---

## Phase 3: Admin UI (Layout + Login + All Pages)

**Goal**: Full admin dashboard with sidebar navigation and all data pages calling real backend API

**Independent Test**: Navigate to `http://localhost:3002/admin` → redirected to login → login with `admin/admin123` → see dashboard with real data (7 products, 3 customers)

### Layout & Login

- [ ] T011 [US-ADM] Create admin sidebar component at `apps/web-base/src/components/admin/sidebar.tsx` — navigation links: Dashboard, Sản phẩm, Đơn hàng, Khách hàng, Blog, Cài đặt. Use lucide-react icons
- [ ] T012 [US-ADM] Create admin layout at `apps/web-base/src/app/admin/layout.tsx` — sidebar + main content area, logout button, user display
- [ ] T013 [US-ADM] Create login page at `apps/web-base/src/app/admin/login/page.tsx` — username/password form, calls `/api/auth/login`, redirects to `/admin` on success

### Dashboard

- [ ] T014 [US-ADM] Create stat card component at `apps/web-base/src/components/admin/stat-card.tsx` — reusable metric card (icon, label, value, color)
- [ ] T015 [US-ADM] Create dashboard page at `apps/web-base/src/app/admin/page.tsx` — fetch `/dashboard/revenue`, `/dashboard/top-products`, `/dashboard/alerts`; display 4 stat cards + top products table + low stock alerts

### Data Pages

- [ ] T016 [P] [US-ADM] Create products page at `apps/web-base/src/app/admin/products/page.tsx` — data table with SKU, Name, Unit, Price, Stock, Status columns; fetch from `/products`
- [ ] T017 [P] [US-ADM] Create orders page at `apps/web-base/src/app/admin/orders/page.tsx` — read-only data table; fetch from `/orders`
- [ ] T018 [P] [US-ADM] Create customers page at `apps/web-base/src/app/admin/customers/page.tsx` — data table with Name, Phone, Address, Outstanding Debt; fetch from `/customers`
- [ ] T019 [P] [US-ADM] Create blog page at `apps/web-base/src/app/admin/blog/page.tsx` — data table with Title, Author, Status, Date; fetch from `/blog/admin/posts`
- [ ] T020 [P] [US-ADM] Create settings page at `apps/web-base/src/app/admin/settings/page.tsx` — store info, printer config, sync status, version info

**Checkpoint**: All admin pages functional with real backend data

---

## Phase 4: Polish & Verification

**Purpose**: Final validation and cleanup

- [ ] T021 Run `cd apps/web-base && npm run build` — verify zero build errors
- [ ] T022 Run `cd apps/web-base && npm run lint` — verify no lint errors
- [ ] T023 Add `DEPRECATED.md` to `apps/web-admin/` marking Flutter admin as deprecated
- [ ] T024 Run quickstart.md validation — manual browser test of all admin routes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundation (Phase 2)**: Depends on Setup completion — BLOCKS all admin pages
- **Admin UI (Phase 3)**: Depends on Foundation — login must work before data pages
- **Polish (Phase 4)**: Depends on Phase 3 completion

### Within Phase 3

- Layout + Login (T011-T013) MUST complete before data pages
- Dashboard (T014-T015) can parallel with data pages
- All data pages (T016-T020) can run in parallel (different files, no dependencies)

### Parallel Opportunities

```text
# Phase 2 parallel tasks:
T006 (auth.ts) || T007 (api.ts) || T009 (logout route)

# Phase 3 data pages parallel:
T016 (products) || T017 (orders) || T018 (customers) || T019 (blog) || T020 (settings)
```

---

## Implementation Strategy

### Sequential Delivery

1. Phase 1: Setup (T001-T005) → Tailwind + shadcn/ui ready
2. Phase 2: Foundation (T006-T010) → Auth + API client ready
3. Phase 3: Login + Layout (T011-T013) → Can login and see sidebar
4. Phase 3: Dashboard (T014-T015) → Real metrics visible
5. Phase 3: Data pages (T016-T020) → All admin features live
6. Phase 4: Polish (T021-T024) → Verified and documented

---

## Notes

- All admin pages use Server Components for initial data fetch (no client-side loading spinners for initial render)
- Client Components used only for interactive elements (forms, modals)
- API calls from server components go through `src/lib/api.ts` with JWT from cookie
- Login flow: browser → Next.js API route → backend → set cookie → redirect
