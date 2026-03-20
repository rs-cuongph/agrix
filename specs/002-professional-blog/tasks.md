# Tasks: Professional Blog System

**Input**: Design documents from `/specs/002-professional-blog/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1–US6) this task belongs to

---

## Phase 1: Setup

**Purpose**: Install dependencies and prepare infrastructure

- [x] T001 Install TipTap packages in `apps/web-base`: `@tiptap/react @tiptap/starter-kit @tiptap/pm @tiptap/extension-table @tiptap/extension-table-row @tiptap/extension-table-cell @tiptap/extension-table-header @tiptap/extension-image @tiptap/extension-link @tiptap/extension-underline @tiptap/extension-placeholder`
- [x] T002 Create `StorageService` in `apps/backend/src/storage/storage.service.ts` — methods: `uploadFile(bucket, key, buffer, mimetype)`, `deleteFile(bucket, key)`, `getPublicUrl(bucket, key)`. Use existing `MINIO_CLIENT` provider.
- [x] T003 Export `StorageService` from `StorageModule` in `apps/backend/src/storage/storage.module.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Entity definitions and shared utilities that all user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 [P] Create `BlogCategory` entity in `apps/backend/src/blog/entities/blog-category.entity.ts` — fields: id, name, slug, description, createdAt, updatedAt
- [x] T005 [P] Create `BlogTag` entity in `apps/backend/src/blog/entities/blog-tag.entity.ts` — fields: id, name, slug, createdAt
- [x] T006 [P] Create `BlogPostProduct` entity in `apps/backend/src/blog/entities/blog-post-product.entity.ts` — composite PK: blogPostId + productId, displayOrder field
- [x] T007 Modify `BlogPost` entity in `apps/backend/src/blog/entities/blog-post.entity.ts` — remove `category` string column; add: `categoryId` FK (ManyToOne → BlogCategory), ManyToMany → BlogTag (via join table `blog_posts_tags`), ManyToMany → Product (via BlogPostProduct), `metaTitle`, `metaDescription`, `ogImageUrl`, `deletedAt` (@DeleteDateColumn soft delete)
- [x] T008 Register new entities in `apps/backend/src/blog/blog.module.ts` — add BlogCategory, BlogTag, BlogPostProduct to TypeORM entities; import StorageModule
- [x] T009 Create slug utility function `slugify(text: string): string` in `apps/backend/src/common/utils/slugify.ts` — Vietnamese diacritics removal + kebab-case
- [x] T010 Run TypeORM migration or synchronize schema to apply entity changes

**Checkpoint**: All entities registered, database schema updated, StorageService available

---

## Phase 3: User Story 1 — Soạn thảo bài viết đa phương tiện (Priority: P1) 🎯 MVP

**Goal**: Admin can create/edit blog posts using rich text editor with images, tables, formatting

**Independent Test**: Create post with heading + image + table → Save draft → Reopen → Content displays correctly

### Implementation

- [x] T011 [US1] Create `POST /blog/admin/upload` endpoint in `apps/backend/src/blog/blog.controller.ts` — Multer FileInterceptor, validate type (JPEG/PNG/WebP/GIF) + size (max 5MB), upload via StorageService, return `{ url, key }`
- [x] T012 [US1] Update `BlogService.create()` in `apps/backend/src/blog/blog.service.ts` — use `slugify()` for auto-slug, set authorId, handle relations (tagIds, categoryId)
- [x] T013 [US1] Update `BlogService.update()` in `apps/backend/src/blog/blog.service.ts` — handle partial update of content/title/slug/status, set publishedAt on publish, handle tagIds sync
- [x] T014 [US1] Update `BlogService.delete()` to use soft delete (`softDelete()`) and add `restore()` method in `apps/backend/src/blog/blog.service.ts`
- [x] T015 [US1] Create TipTap rich editor component in `apps/web-base/src/components/admin/blog-editor.tsx` — toolbar: H2–H4, bold, italic, underline, strike, bullet list, numbered list, blockquote, code block, link, horizontal rule; image upload button (calls `/blog/admin/upload`); table insert/edit
- [x] T016 [US1] Create full-page new post page at `apps/web-base/src/app/admin/blog/new/page.tsx` — layout: 70% editor (left) + 30% sidebar (right) with title input, status select, save draft / publish buttons
- [x] T017 [US1] Create full-page edit post page at `apps/web-base/src/app/admin/blog/edit/[id]/page.tsx` — load existing post, populate editor + sidebar, auto-save every 30s with "Đã lưu lúc HH:MM" status
- [x] T018 [US1] Update blog list page `apps/web-base/src/components/admin/blog-client.tsx` — "Tạo bài viết" button navigates to `/admin/blog/new`; "Sửa" navigates to `/admin/blog/edit/:id`; delete uses soft delete with toast

**Checkpoint**: Admin can create/edit blog posts with rich editor, images, tables. Auto-save works.

---

## Phase 4: User Story 2 — Quản lý danh mục blog (Priority: P1)

**Goal**: Admin manages blog categories; posts can be assigned a category; public blog filters by category

**Independent Test**: Create 3 categories → Assign to posts → Public blog filter by category

### Implementation

- [x] T019 [US2] Add category CRUD endpoints in `apps/backend/src/blog/blog.controller.ts` — `GET/POST/PUT/DELETE /blog/admin/categories`; public `GET /blog/categories`
- [x] T020 [US2] Add category CRUD methods in `apps/backend/src/blog/blog.service.ts` — findAllCategories, createCategory, updateCategory, deleteCategory (nullify posts)
- [x] T021 [US2] Create blog categories tab component in `apps/web-base/src/components/admin/blog-categories-client.tsx` — CRUD table with CrudDialog, toast notifications
- [x] T022 [US2] Refactor blog admin page to sub-tabs in `apps/web-base/src/app/admin/blog/page.tsx` — tabs: "Bài viết" / "Danh mục" / "Tags"; server component fetches data for active tab
- [x] T023 [US2] Add category dropdown to editor sidebar in `apps/web-base/src/components/admin/blog-editor.tsx` (or the new/edit page sidebar)

**Checkpoint**: Categories manageable via Blog tab, posts assignable to categories

---

## Phase 5: User Story 6 — Trang soạn bài full-page (Priority: P1)

**Goal**: Full-page editor with sidebar settings panel (replaces dialog-based editing)

**Independent Test**: Click "Tạo bài viết" → Full-page opens → Write content + configure sidebar → Publish → Redirect to list

### Implementation

- [x] T024 [US6] Add cover image upload to editor sidebar in `apps/web-base/src/app/admin/blog/new/page.tsx` and `edit/[id]/page.tsx` — upload to MinIO, display preview
- [x] T025 [US6] Implement auto-save logic in editor pages — debounced PUT every 30s when content changes, display "Đã lưu lúc HH:MM" badge
- [x] T026 [US6] Add publish/unpublish toggle to sidebar — status switch with confirmation, sets publishedAt

**Checkpoint**: Full-page editor complete with all sidebar settings, auto-save, publish flow

---

## Phase 6: User Story 3 — Quản lý thẻ tag (Priority: P2)

**Goal**: Admin manages tags; posts can have multiple tags; public blog filters by tag

**Independent Test**: Create tags → Assign 3 tags to a post → Public blog filter by tag

### Implementation

- [x] T027 [P] [US3] Add tag CRUD endpoints in `apps/backend/src/blog/blog.controller.ts` — `GET/POST/PUT/DELETE /blog/admin/tags`; public `GET /blog/tags`
- [x] T028 [P] [US3] Add tag CRUD methods in `apps/backend/src/blog/blog.service.ts` — findAllTags, createTag (auto-slug), updateTag, deleteTag (remove from posts)
- [x] T029 [US3] Create blog tags tab component in `apps/web-base/src/components/admin/blog-tags-client.tsx` — CRUD table with CrudDialog, toast notifications
- [x] T030 [US3] Add tag input with autocomplete to editor sidebar in editor pages — multi-select, create-on-type, display as chips

**Checkpoint**: Tags manageable via Blog tab, posts can have multiple tags with autocomplete input

---

## Phase 7: User Story 4 — Gắn kết sản phẩm (Priority: P2)

**Goal**: Admin links products to posts; linked products display as cards on public blog post

**Independent Test**: Create post → Link 2 products → Public post page shows product cards with name/price

### Implementation

- [x] T031 [US4] Add product linking endpoints in `apps/backend/src/blog/blog.controller.ts` — `POST /blog/admin/posts/:id/products`, `DELETE /blog/admin/posts/:id/products/:productId`
- [x] T032 [US4] Add product linking methods in `apps/backend/src/blog/blog.service.ts` — linkProducts, unlinkProduct; return linked products by displayOrder
- [x] T033 [US4] Add product search + link UI to editor sidebar — search products by name, display linked products list with remove button
- [x] T034 [US4] Update `findBySlug()` in `apps/backend/src/blog/blog.service.ts` — include linked products with product details (name, price, image)
- [x] T035 [US4] Update public blog post page `apps/web-base/src/app/blog/[slug]/page.tsx` — render linked products as cards at bottom (image, name, price)

**Checkpoint**: Products linkable to posts, displayed on public blog post page

---

## Phase 8: User Story 5 — SEO & Metadata (Priority: P2)

**Goal**: Admin sets meta title, meta description, OG image per post; public blog renders correct meta tags

**Independent Test**: Set meta title + description → View page source → See correct `<title>`, `<meta>`, OG tags

### Implementation

- [x] T036 [P] [US5] Add SEO fields section to editor sidebar — metaTitle, metaDescription, ogImageUrl inputs with character counters
- [x] T037 [US5] Update public blog post page `apps/web-base/src/app/blog/[slug]/page.tsx` — export `generateMetadata()` with metaTitle (fallback to title), metaDescription (fallback to excerpt), og:image
- [x] T038 [US5] Update public blog list page `apps/web-base/src/app/blog/page.tsx` — add `generateMetadata()` for blog index SEO

**Checkpoint**: SEO metadata renders correctly on all public blog pages

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements across all user stories

- [ ] T039 Update `findPublished()` in `apps/backend/src/blog/blog.service.ts` — support tag filter query param; include category + tags in response; exclude soft-deleted
- [ ] T040 Update public blog list page `apps/web-base/src/app/blog/page.tsx` — pagination UI (page 1, 2, 3..., 10 posts/page), category sidebar filter, tag filter
- [ ] T041 Add slug duplicate handling in `apps/backend/src/blog/blog.service.ts` — auto-append `-1`, `-2` suffix when slug conflicts
- [ ] T042 Add edge case handling — image upload validation errors (toast), MinIO unavailable (graceful fallback), category delete (nullify posts)
- [ ] T043 Verify build: `cd apps/web-base && npx next build` — fix any TypeScript/build errors
- [ ] T044 Run end-to-end manual test: create post with full features → publish → view on public blog → verify SEO

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 — core editor, MVP
- **US2 (Phase 4)**: Depends on Phase 2 — can parallel with US1
- **US6 (Phase 5)**: Depends on US1 (editor pages created in US1)
- **US3 (Phase 6)**: Depends on Phase 2 — can parallel with US1/US2
- **US4 (Phase 7)**: Depends on Phase 2 — can parallel
- **US5 (Phase 8)**: Depends on Phase 2 — can parallel
- **Polish (Phase 9)**: Depends on all stories complete

### Recommended Sequential Order

```
Phase 1 → Phase 2 → Phase 3 (US1) → Phase 5 (US6) → Phase 4 (US2) → Phase 6 (US3) → Phase 7 (US4) → Phase 8 (US5) → Phase 9
```

### Parallel Opportunities

```bash
# After Phase 2, these can run in parallel:
Task T004 + T005 + T006  # Entities (different files)
Task T027 + T028          # Tag endpoints (different from category work)
Task T036                 # SEO sidebar (different file from editor)
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. Phase 1: Setup (install TipTap, StorageService)
2. Phase 2: Foundational (entities, schema)
3. Phase 3: US1 — Rich editor + post CRUD
4. **STOP & VALIDATE**: Create post with images, tables → Save → Reopen

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1 (rich editor) → MVP blog ✅
3. US6 (full-page editor) → Professional UX ✅
4. US2 (categories) → Organized content ✅
5. US3 (tags) → Flexible taxonomy ✅
6. US4 (product linking) → Marketing channel ✅
7. US5 (SEO) → Search engine optimized ✅
8. Polish → Production ready ✅

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps to user stories from spec.md
- Commit after each task or logical group
- All CRUD must include Sonner toast notifications
- All icons from lucide-react (no emoji)
- Stop at any checkpoint to verify independently
