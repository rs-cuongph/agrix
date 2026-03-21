# Research & Tech Decisions

## Decision 1: Database storage for Product Gallery
**Decision**: Use PostgreSQL `simple-array` or `text[]` (string array) for `imageUrls` in the `Product` entity (replacing `coverImageUrl`).
**Rationale**: The Agrix constitution stresses simplicity. For the MVP of a product gallery where we just need an array of S3/MinIO URLs, storing them as a simple array column avoids unnecessary JOINs and extra CRUD endpoints.

## Decision 2: Admin Direct Image Upload
**Decision**: Reuse the existing backend MinIO multi-part or single-part upload endpoint, exposing a `/products/admin/upload` POST route that returns an array of URLs, then storing those URLs in `product.imageUrls`.
**Rationale**: Matches the proven pattern used in the Blog Admin editor (`/blog/admin/upload`), keeping consistency.

## Decision 3: Landing Page Redesign
**Decision**: The landing page sections (Hero, FAQ, Products, Blogs) are separated into individual pages as requested by user feedback during development, with `/` redirecting to `/products`. The "Landing Page Redesign" functionally acts as a polished layout across `/products` and `/blog`.
**Rationale**: The user explicitly requested auto-redirect from `/` to `/products` and separating the blocks.
