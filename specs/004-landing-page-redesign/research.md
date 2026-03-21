# Research: Landing Page Redesign

**Feature**: 004-landing-page-redesign
**Date**: 2026-03-21

## R1: Existing Product Entity & API

**Decision**: Reuse existing `Product` entity from `apps/backend/src/inventory/entities/product.entity.ts`.
**Rationale**: Product data (name, baseSellPrice, baseUnit, category, image) already exists. The public products API endpoint (`GET /api/v1/products`) is already used by the current `/products` page. No new product entity needed.
**Alternatives considered**: Creating a separate "showcase product" entity → rejected because it duplicates data and adds maintenance burden.

## R2: Existing Blog Entity & API

**Decision**: Reuse existing `BlogPost` entity from `apps/backend/src/blog/entities/blog-post.entity.ts`.
**Rationale**: Blog posts are already managed via Admin and have a public listing page at `/blog`. The backend blog controller already exposes public GET endpoints.
**Alternatives considered**: None needed — blog infrastructure is complete.

## R3: Contact Submission Storage

**Decision**: Create new `ContactSubmission` entity in a new `contact` backend module.
**Rationale**: User chose Option A (save to DB) + Admin notification. A dedicated module keeps domain boundaries clean per Constitution III.
**Alternatives considered**: Storing in a generic "messages" table → rejected for lack of clear domain separation.

## R4: Admin Notification Mechanism

**Decision**: Implement in-app notification via a `Notification` system (badge count on Admin sidebar + list view). No external push (email/Telegram) in v1.
**Rationale**: Simplest path that satisfies "Admin biết" requirement. Can add email/Telegram later as enhancement.
**Alternatives considered**: Email notification → deferred to future iteration to avoid SMTP configuration complexity.

## R5: Store Contact Info Configuration

**Decision**: Add store info fields (storeName, address, phone, email) to a new `StoreSettings` entity or reuse an existing settings/config table if one exists.
**Rationale**: Contact info must be editable from Admin without code changes.
**Alternatives considered**: Hardcoding in frontend → violates dynamic management requirement.

## R6: FAQ & Testimonial Management

**Decision**: Create separate `faq` and `testimonial` NestJS modules with full CRUD.
**Rationale**: User confirmed both FAQ and Testimonials. Each needs Admin CRUD (Constitution rule: Sonner toast on all CUD ops).
**Alternatives considered**: Combined "content" module → rejected for violating modular monolith principle (Constitution III).

## R7: Product Detail Page

**Decision**: Create a new `/products/[id]` page that displays full product information (images, description, pricing, category) without cart/checkout functionality.
**Rationale**: User explicitly chose Option A (internal product detail page) but confirmed no cart/checkout needed.
**Alternatives considered**: Quick view popup → user preferred dedicated page.

## R8: Landing Page Architecture

**Decision**: Redesign `page.tsx` as a composition of section components, each fetching data via Next.js Server Components with ISR (revalidate: 300).
**Rationale**: Server-side rendering for SEO, ISR for performance, component composition for maintainability.
**Alternatives considered**: Client-side fetching → worse SEO, slower initial load.
