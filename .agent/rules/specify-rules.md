# agrix Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-04-05

## Active Technologies
- TypeScript 5.x, React 18, Next.js 14 (App Router) + next, react, shadcn/ui, tailwindcss, lucide-reac (001-agrix-core-platform)
- PostgreSQL (via NestJS backend REST API at `localhost:3000`) (001-agrix-core-platform)
- TypeScript 5.x (NestJS 10 backend, Next.js 14 frontend) + TypeORM, PostgreSQL, sonner (toasts), lucide-reac (001-agrix-core-platform)
- PostgreSQL (existing) — migration needed for new column (001-agrix-core-platform)
- TypeScript 5.x (NestJS backend, Next.js 14 frontend) + TipTap v2 (rich editor), MinIO (storage), TypeORM (ORM) (002-professional-blog)
- PostgreSQL (primary), MinIO (images, bucket: `agrix-media`) (002-professional-blog)
- TypeScript (Node.js 18+) + NestJS (backend), Next.js 14 (web), OpenAI SDK, Google Generative AI SDK, pgvector (003-ai-chatbot-assistant)
- PostgreSQL with pgvector extension, MinIO (documents) (003-ai-chatbot-assistant)
- TypeScript 5.x (Node.js 20+) + Next.js 15 (App Router, RSC), NestJS, shadcn/ui, Tailwind CSS v4, TypeORM, lucide-reac (004-landing-page-redesign)
- PostgreSQL (via TypeORM) (004-landing-page-redesign)
- TypeScript (Node 20+) + Next.js 14 (App Router), NestJS, TypeORM, Tailwind CSS v4, shadcn/ui. (004-landing-page-redesign)
- PostgreSQL (via TypeORM), MinIO for image uploads. (004-landing-page-redesign)
- Next.js (app router), React, TypeScrip + shadcn/ui, `lucide-react` (005-group-menus)
- Next.js 15 (App Router), React 19, TypeScrip + shadcn/ui, lucide-react, sonner (toast), existing `adminApiCall` proxy pattern (006-pos-cashier-tablet)
- IndexedDB (offline cart/orders), Service Worker (caching) (006-pos-cashier-tablet)
- TypeScript (Node.js 20+, React 19) + NestJS 10, Next.js 15 (App Router), TypeORM, shadcn/ui, qrcode.reac (006-pos-cashier-tablet)
- PostgreSQL (UUID primary keys) (006-pos-cashier-tablet)
- TypeScript / React 18 / Next.js 14 + `@tiptap/react`, `@tiptap/starter-kit`, `lucide-react`, `shadcn/ui` (008-product-description-editor)
- PostgreSQL (Prisma) - storing HTML payload in `Product.description` (currently mapped as String, usually boundless in Postgres). (008-product-description-editor)
- TypeScript (Next.js 15 + React 19) + Next.js App Router, shadcn/ui, Lucide React, Sonner (009-pos-history)
- PostgreSQL (qua NestJS backend, sử dụng TypeORM) (009-pos-history)
- TypeScript / Node.js 20 / NestJS (Backend), Next.js 14 (Frontend) + `class-validator` (DTO), `typeorm` (session queries), React Context (chat state) (010-bot-landing-only)
- PostgreSQL (existing `chat_sessions` / `chat_messages` tables — no schema changes) (010-bot-landing-only)
- TypeScript / React (Next.js 15) + Web Bluetooth API (`navigator.bluetooth`), `esc-pos-encoder` (or similar package to generate ESC/POS byte arrays), `sonner` (for toasts), `lucide-react` (for icons) (011-bluetooth-device-setting)
- `localStorage` (Zustand with persist middleware) (011-bluetooth-device-setting)
- TypeScript / Next.js 14 + `jspdf` for document synthesis, `jsbarcode` for drawing accurate 1D barcodes. (012-export-barcode-pdf)

- Dart 3.x (Flutter 3.x), TypeScript 5.x (NestJS 10+, Next.js 14+) (001-agrix-core-platform)

## Project Structure

```text
backend/
frontend/
tests/
```

## Commands

npm test && npm run lint

## Code Style

Dart 3.x (Flutter 3.x), TypeScript 5.x (NestJS 10+, Next.js 14+): Follow standard conventions

## Recent Changes
- 012-export-barcode-pdf: Added TypeScript / Next.js 14 + `jspdf` for document synthesis, `jsbarcode` for drawing accurate 1D barcodes.
- 011-bluetooth-device-setting: Added TypeScript / React (Next.js 15) + Web Bluetooth API (`navigator.bluetooth`), `esc-pos-encoder` (or similar package to generate ESC/POS byte arrays), `sonner` (for toasts), `lucide-react` (for icons)
- 010-bot-landing-only: Added TypeScript / Node.js 20 / NestJS (Backend), Next.js 14 (Frontend) + `class-validator` (DTO), `typeorm` (session queries), React Context (chat state)


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
