# Implementation Plan: Professional Blog System

**Branch**: `002-professional-blog` | **Date**: 2026-03-20 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-professional-blog/spec.md`

## Summary

Nâng cấp hệ thống blog từ basic CRUD (textarea/dialog) thành hệ thống blog chuyên nghiệp với trình soạn thảo TipTap (rich text, tables, image upload), danh mục/tag riêng, gắn kết sản phẩm, SEO metadata, auto-save 30s, và full-page editor layout.

## Technical Context

**Language/Version**: TypeScript 5.x (NestJS backend, Next.js 14 frontend)  
**Primary Dependencies**: TipTap v2 (rich editor), MinIO (storage), TypeORM (ORM)  
**Storage**: PostgreSQL (primary), MinIO (images, bucket: `agrix-media`)  
**Testing**: Manual verification (admin flow, public blog)  
**Target Platform**: Web browser (admin: Next.js SSR, public: Next.js SSR)  
**Project Type**: Full-stack web application (monorepo)  
**Constraints**: Max 5MB image upload, JPEG/PNG/WebP/GIF only

## Constitution Check

*GATE: All gates pass ✅*

| Gate | Status | Notes |
|------|--------|-------|
| NestJS + PostgreSQL | ✅ | Backend extends existing blog module |
| Next.js Web Base | ✅ | Frontend extends existing admin + public blog |
| MinIO for storage | ✅ | Existing StorageModule reused |
| Sonner toast for CRUD | ✅ | All create/update/delete with toast |
| lucide-react icons | ✅ | No emoji icons |
| Modular monolith | ✅ | Blog module stays decoupled |

## Project Structure

### Documentation (this feature)

```text
specs/002-professional-blog/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0: TipTap research, MinIO upload flow
├── data-model.md        # Phase 1: Entity definitions
├── quickstart.md        # Phase 1: Development setup
├── contracts/api.md     # Phase 1: REST API contracts
└── tasks.md             # Phase 2: Task breakdown (via /speckit-tasks)
```

### Source Code (repository root)

```text
apps/backend/src/
├── blog/
│   ├── entities/
│   │   ├── blog-post.entity.ts      # MODIFY — add relations, SEO fields, soft delete
│   │   ├── blog-category.entity.ts  # NEW
│   │   ├── blog-tag.entity.ts       # NEW
│   │   └── blog-post-product.entity.ts # NEW
│   ├── blog.controller.ts           # MODIFY — add category/tag/upload/product endpoints
│   ├── blog.service.ts              # MODIFY — add relations, soft delete, tag queries
│   └── blog.module.ts               # MODIFY — register new entities, import StorageModule
├── storage/
│   ├── storage.module.ts            # EXISTS
│   └── storage.service.ts           # NEW — upload/delete file methods

apps/web-base/src/
├── components/admin/
│   ├── blog-client.tsx              # MODIFY — sub-tabs (Posts/Categories/Tags)
│   ├── blog-editor.tsx              # NEW — TipTap rich editor component
│   ├── blog-categories-client.tsx   # NEW — Blog category CRUD
│   └── blog-tags-client.tsx         # NEW — Blog tag CRUD
├── app/admin/blog/
│   ├── page.tsx                     # MODIFY — sub-tabs layout
│   ├── new/page.tsx                 # NEW — Full-page create editor
│   └── edit/[id]/page.tsx           # NEW — Full-page edit editor
├── app/blog/
│   ├── page.tsx                     # MODIFY — pagination, category/tag filter
│   └── [slug]/page.tsx              # MODIFY — SEO meta tags, linked products
```

**Structure Decision**: Extends existing monorepo structure. Backend blog module gets new entities and expanded service. Frontend gets TipTap editor component and full-page editor pages.

## Complexity Tracking

No constitution violations — no tracking needed.
