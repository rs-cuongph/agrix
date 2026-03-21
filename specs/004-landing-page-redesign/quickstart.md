# Quickstart: Landing Page Redesign

**Feature**: 004-landing-page-redesign

## Prerequisites

- Node.js 20+
- PostgreSQL running
- Backend `.env` configured (see `apps/backend/.env.example`)

## Development Setup

```bash
# 1. Start backend (from repo root)
npm run backend:dev

# 2. Start frontend (from repo root)
npm run web:dev

# 3. Open in browser
open http://localhost:3001
```

## Implementation Order

### Phase 1: Backend Modules (do first)
1. **StoreSettings** entity + admin CRUD endpoint + seed data
2. **ContactSubmission** entity + public POST endpoint + admin list/read
3. **FAQ** entity + public GET + admin CRUD
4. **Testimonial** entity + public GET + admin CRUD

### Phase 2: Landing Page Frontend
1. **Navbar** component (sticky, sections: Products / Blog / Liên hệ)
2. **Hero Section** (dynamic from StoreSettings)
3. **Products Section** (grid cards from existing API, link to detail)
4. **Product Detail Page** (`/products/[id]`)
5. **Blog Section** (card grid from existing API)
6. **Testimonials Section** (carousel or grid)
7. **FAQ Section** (accordion using shadcn Accordion)
8. **Contact Section** (store info + form)

### Phase 3: Admin Pages
1. **Contact Management** page (list, mark as read)
2. **FAQ Management** page (CRUD)
3. **Testimonial Management** page (CRUD)
4. **Store Settings** page (edit contact info, hero banner)

## Key Files to Modify

| File | Change |
|------|--------|
| `apps/backend/src/app.module.ts` | Register new modules |
| `apps/web-base/src/app/page.tsx` | Complete redesign |
| `apps/web-base/src/app/admin/page.tsx` | Add nav links for new admin pages |

## Verification

- [ ] Landing page shows Products section with real data
- [ ] Click product → Product Detail Page loads
- [ ] Blog section shows latest posts
- [ ] Contact form submits successfully (check DB)
- [ ] Admin sees new contact submissions
- [ ] FAQ accordion works on landing page
- [ ] Testimonials display correctly
- [ ] Store info matches Admin settings
- [ ] Mobile responsive on all sections
