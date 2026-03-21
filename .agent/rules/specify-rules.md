# agrix Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-03-21

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
- 004-landing-page-redesign: Added TypeScript (Node 20+) + Next.js 14 (App Router), NestJS, TypeORM, Tailwind CSS v4, shadcn/ui.
- 004-landing-page-redesign: Added TypeScript 5.x (Node.js 20+) + Next.js 15 (App Router, RSC), NestJS, shadcn/ui, Tailwind CSS v4, TypeORM, lucide-reac
- 003-ai-chatbot-assistant: Added TypeScript (Node.js 18+) + NestJS (backend), Next.js 14 (web), OpenAI SDK, Google Generative AI SDK, pgvector


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
