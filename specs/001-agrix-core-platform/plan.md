# Implementation Plan: Agrix Core Platform

**Branch**: `001-agrix-core-platform` | **Date**: 2026-03-19 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-agrix-core-platform/spec.md`

## Summary

Build a full-stack agricultural retail management platform with **offline-first POS** on Flutter (Android/Tablet), a **modular monolith NestJS backend**, and a **Next.js public landing page**. The system supports dynamic unit conversions (Box→Bottle), AI-powered product consultation (RAG), thermal printing (ESC/POS via Bluetooth & Wi-Fi), and customer debt tracking — all within a single monorepo.

## Technical Context

**Language/Version**: Dart 3.x (Flutter 3.x), TypeScript 5.x (NestJS 10+, Next.js 14+)
**Primary Dependencies**:
- Flutter: `sqflite`, `drift`, `flutter_blue_plus`, `mobile_scanner`, `provider/riverpod`, `dio`, `connectivity_plus`
- NestJS: `@nestjs/typeorm`, `typeorm`, `@nestjs/jwt`, `@nestjs/passport`, `minio`, `langchain`
- Next.js: `next`, `react`, `tailwindcss`
**Storage**: PostgreSQL 15+ (server), SQLite via Drift (local app), MinIO (object storage)
**Testing**: `flutter_test` + `integration_test` (Flutter), `jest` + `supertest` (NestJS), `jest` (Next.js)
**Target Platform**: Android Tablet (primary), Android Phone, Web (Chrome/Firefox)
**Project Type**: Monorepo (mobile-app + web-service + web-app)
**Performance Goals**: POS barcode scan-to-cart <500ms, Background sync <5min after reconnect, AI response <3s
**Constraints**: Offline-capable (all POS operations), ESC/POS thermal printing, single monorepo
**Scale/Scope**: Single-store operation (1-5 concurrent tablets), ~500-2000 SKUs, ~50-200 daily transactions

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Mobile-First & Offline-First | ✅ PASS | SQLite via Drift for local storage, background sync with idempotency keys |
| II. Monorepo Architecture | ✅ PASS | Single repo: `apps/mobile`, `apps/backend`, `apps/web-admin`, `apps/web-base` |
| III. Scalable Core (Modular Monolith) | ✅ PASS | NestJS modules: AuthModule, InventoryModule, OrderModule, AIModule |
| IV. Traceability & Financial Accuracy | ✅ PASS | All inventory ops use base-unit arithmetic, RBAC via JWT+Guards |
| V. Simple & Intuitive UI | ✅ PASS | Material Design 3, Emerald Green palette, hardware peripheral support |

## Project Structure

### Documentation (this feature)

```text
specs/001-agrix-core-platform/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (API contracts)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
agrix/
├── apps/
│   ├── mobile/                  # Flutter App (Android/Tablet/Desktop)
│   │   ├── lib/
│   │   │   ├── core/            # Theme, constants, DI, routing
│   │   │   ├── data/            # Drift DB, repositories, API clients
│   │   │   ├── domain/          # Entities, use cases, repository interfaces
│   │   │   ├── presentation/    # Screens, widgets, state management
│   │   │   └── services/        # Sync engine, printer service, scanner
│   │   ├── test/
│   │   └── integration_test/
│   │
│   ├── backend/                 # NestJS API Server
│   │   ├── src/
│   │   │   ├── auth/            # AuthModule (JWT, RBAC, guards)
│   │   │   ├── inventory/       # InventoryModule (products, units, stock)
│   │   │   ├── orders/          # OrderModule (POS, sync, payments)
│   │   │   ├── customers/       # CustomerModule (profiles, debt ledger)
│   │   │   ├── ai/              # AIModule (chatbot, RAG, knowledge base)
│   │   │   ├── blog/            # BlogModule (content management)
│   │   │   ├── storage/         # StorageModule (MinIO integration)
│   │   │   └── common/          # Shared guards, pipes, interceptors
│   │   └── test/
│   │
│   ├── web-admin/               # Flutter Web (Admin Dashboard)
│   │   ├── lib/
│   │   └── test/
│   │
│   └── web-base/                # Next.js (Public Landing/Blog/SEO)
│       ├── src/
│       │   ├── app/             # App Router pages
│       │   ├── components/
│       │   └── lib/
│       └── __tests__/
│
├── packages/
│   └── shared/                  # Shared DTOs, constants, enums
│       ├── dart/                # Shared Dart code (mobile + web-admin)
│       └── typescript/          # Shared TS types (backend + web-base)
│
├── docker/
│   ├── docker-compose.yml       # PostgreSQL, MinIO, NestJS, Next.js
│   ├── Dockerfile.backend
│   ├── Dockerfile.web-base
│   └── .env.example
│
├── specs/                       # Speckit feature specs
└── .specify/                    # Speckit configuration
```

**Structure Decision**: Monorepo with `apps/` for deployable applications and `packages/` for shared code. This satisfies Constitution Principle II (Monorepo) while keeping each app independently buildable. Flutter's `melos` or manual `pubspec.yaml` path references can be used for Dart code sharing between `mobile` and `web-admin`.

## Complexity Tracking

> No constitution violations detected. No complexity justification needed.
