# Quickstart: Professional Blog System

## Prerequisites

- Node.js 18+
- PostgreSQL running
- MinIO running (docker-compose)
- Backend: `cd apps/backend && npm run start:dev`
- Frontend: `cd apps/web-base && npm run dev`

## Key Packages to Install

### Frontend (apps/web-base)
```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/pm \
  @tiptap/extension-table @tiptap/extension-table-row \
  @tiptap/extension-table-cell @tiptap/extension-table-header \
  @tiptap/extension-image @tiptap/extension-link \
  @tiptap/extension-underline @tiptap/extension-placeholder
```

### Backend (apps/backend)
No new packages needed — `minio` and `multer` already available via NestJS platform.

## Development Order

1. **Backend entities** → BlogCategory, BlogTag, modify BlogPost, BlogPostProduct
2. **StorageService** → Upload endpoint using existing MinIO module
3. **Blog CRUD endpoints** → Categories, Tags, Posts (with relations)
4. **Frontend TipTap editor** → Rich editor component with image upload
5. **Full-page editor page** → `/admin/blog/new` and `/admin/blog/edit/:id`
6. **Blog page sub-tabs** → Bài viết / Danh mục / Tags
7. **Public blog pages** → Pagination, category/tag filter, SEO meta
