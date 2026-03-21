# API Contracts: Landing Page Redesign

**Feature**: 004-landing-page-redesign
**Date**: 2026-03-21

All endpoints are prefixed with `/api/v1`.

---

## Public Endpoints (No Auth)

### Products

| Method | Path | Description | Response |
|--------|------|-------------|----------|
| GET | `/products` | List active products (paginated) | `{ items: Product[], total: number }` |
| GET | `/products/:id` | Get single product detail | `Product` |

> Already exists. No changes needed.

### Blog

| Method | Path | Description | Response |
|--------|------|-------------|----------|
| GET | `/blog/posts` | List published posts (paginated) | `{ items: BlogPost[], total: number }` |
| GET | `/blog/posts/:slug` | Get single post by slug | `BlogPost` |

> Already exists. No changes needed.

### Contact

| Method | Path | Description | Request Body | Response |
|--------|------|-------------|--------------|----------|
| POST | `/contact` | Submit contact form | `{ customerName, phoneNumber, email?, message }` | `{ success: true, id: string }` |

**Validation Rules**:
- `customerName`: required, string, max 255 chars
- `phoneNumber`: required, string, VN phone format (10-11 digits starting with 0)
- `email`: optional, valid email format
- `message`: required, string, max 2000 chars

**Rate Limiting**: 3 submissions per IP per 5 minutes

### Store Settings (Public)

| Method | Path | Description | Response |
|--------|------|-------------|----------|
| GET | `/settings/public` | Get public store info | `{ storeName, address, phoneNumber, email, description, heroTitle, heroSubtitle, heroImageUrl }` |

### FAQ (Public)

| Method | Path | Description | Response |
|--------|------|-------------|----------|
| GET | `/faq` | List active FAQs (ordered) | `FAQ[]` |

### Testimonials (Public)

| Method | Path | Description | Response |
|--------|------|-------------|----------|
| GET | `/testimonials` | List active testimonials | `Testimonial[]` |

---

## Admin Endpoints (Auth Required)

### Contact Management

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/contacts` | List all contact submissions (paginated, filterable by status) |
| GET | `/admin/contacts/:id` | Get single contact detail |
| PATCH | `/admin/contacts/:id/status` | Update status (NEW → READ → REPLIED) |
| DELETE | `/admin/contacts/:id` | Delete a contact submission |

### FAQ Management

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/faq` | List all FAQs |
| POST | `/admin/faq` | Create new FAQ |
| PATCH | `/admin/faq/:id` | Update FAQ |
| DELETE | `/admin/faq/:id` | Delete FAQ |

### Testimonial Management

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/testimonials` | List all testimonials |
| POST | `/admin/testimonials` | Create new testimonial |
| PATCH | `/admin/testimonials/:id` | Update testimonial |
| DELETE | `/admin/testimonials/:id` | Delete testimonial |

### Store Settings

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/settings` | Get full store settings |
| PATCH | `/admin/settings` | Update store settings (upsert single row) |
