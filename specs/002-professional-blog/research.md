# Research: Professional Blog System

## R1: Rich Text Editor for React/Next.js

**Decision**: TipTap v2 (based on ProseMirror)

**Rationale**:
- Free & open source (MIT license) — core is free, only "pro" extensions are paid
- Built for React with first-class support (`@tiptap/react`)
- Extensive extension ecosystem: `@tiptap/extension-table`, `@tiptap/extension-image`, `@tiptap/extension-link`, `@tiptap/extension-placeholder`
- Output as HTML (matches spec FR-004)
- Collaborative editing ready (future-proof)
- Active development & large community

**Alternatives Considered**:
- **Plate (Slate-based)**: More customizable but steeper learning curve, less extensions out-of-box
- **BlockNote**: Beautiful UI but limited table support, younger project
- **Quill**: Legacy, poor React integration, limited table support
- **CKEditor 5**: Excellent features but license cost for commercial use

**Required Packages**:
- `@tiptap/react` `@tiptap/starter-kit` `@tiptap/pm`
- `@tiptap/extension-table` `@tiptap/extension-table-row` `@tiptap/extension-table-cell` `@tiptap/extension-table-header`
- `@tiptap/extension-image` `@tiptap/extension-link` `@tiptap/extension-underline` `@tiptap/extension-placeholder`

## R2: Image Upload to MinIO

**Decision**: Reuse existing `StorageModule` (MINIO_CLIENT provider), create `StorageService` with `uploadFile()` method. Blog controller gets a `POST /blog/admin/upload` endpoint using `@nestjs/platform-express` Multer for file parsing.

**Rationale**:
- MinIO module already exists in the codebase
- Multer is NestJS's standard approach for file uploads (`@UseInterceptors(FileInterceptor)`)
- Images stored under `blog/` prefix in a single bucket (e.g., `agrix-media`)

**Upload Flow**:
1. Frontend: Editor image button → file picker → POST multipart to `/blog/admin/upload`
2. Backend: Multer parses file → validate type/size → upload to MinIO → return URL
3. Frontend: Insert `<img src="URL">` into TipTap editor

## R3: Vietnamese Slug Generation

**Decision**: Use a lightweight diacritics removal approach (no external lib). Custom utility function to romanize Vietnamese → kebab-case.

**Rationale**: Vietnamese romanization is well-defined (remove diacritics + lowercase + replace spaces). No heavy library needed.

**Implementation**: Utility function `slugify(text: string): string` in shared utils.

## R4: Soft Delete Strategy

**Decision**: TypeORM `@DeleteDateColumn()` with `deletedAt` field on BlogPost entity.

**Rationale**: TypeORM has built-in soft delete support with `.softDelete()` / `.restore()`. Queries automatically exclude soft-deleted records when using `find()`.

## R5: Auto-Save Implementation

**Decision**: Frontend debounced auto-save (30s interval) calling `PUT /blog/admin/posts/:id` with current content. Display "Đã lưu lúc HH:MM" status.

**Rationale**: Simple timer-based approach. No WebSocket needed — standard REST PUT every 30s if content changed. New posts auto-create as DRAFT on first save.
