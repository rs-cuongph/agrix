# Quickstart: Landing Page Redesign & Product Gallery

## Frontend Development
1. Start the Next.js dev server:
   ```bash
   cd apps/web-base
   npm run dev
   ```
2. Navigate to `http://localhost:3002`. Notice that `/` automatically redirects to `/products`.
3. To test the blog section, navigate to `http://localhost:3002/blog` and click on any article to see the fully redesigned detail page.

## Backend Development (Product Gallery)
1. Start the NestJS dev server:
   ```bash
   cd apps/backend
   npm run start:dev
   ```
2. Admin Product Endpoint updates will be available at `http://localhost:3000/api/v1/products/admin/...`.
3. You can upload test images to `http://localhost:3000/api/v1/products/admin/upload` (multipart form-data).
