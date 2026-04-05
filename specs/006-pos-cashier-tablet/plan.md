# Implementation Plan: POS Cashier Tablet App

**Branch**: `006-pos-cashier-tablet` | **Date**: 2026-04-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-pos-cashier-tablet/spec.md`

## Summary

Build a tablet-optimized POS (Point of Sale) cashier interface as a PWA within the existing Next.js `apps/web-base` codebase. The app features a split-view layout (product grid | cart + checkout), large touch targets for elderly users, barcode scanner support, VietQR payment, offline-first capability, and thermal printer integration. Leverages existing backend APIs, shadcn/ui, and Agrix Emerald design system.

## Technical Context

**Language/Version**: Next.js 15 (App Router), React 19, TypeScript
**Primary Dependencies**: shadcn/ui, lucide-react, sonner (toast), existing `adminApiCall` proxy pattern
**Storage**: IndexedDB (offline cart/orders), Service Worker (caching)
**Testing**: Manual browser testing on tablet Chrome
**Target Platform**: PWA on Chrome Android tablet (≥ 10 inch, landscape)
**Project Type**: Next.js Web App (new route group within existing `apps/web-base`)
**Performance Goals**: Search results < 0.5s, checkout flow < 30s for 3-item order
**Constraints**: Min touch target 48x48px, min text 16px, offline-capable
**Scale/Scope**: ~10 new pages/components, reusing existing API infrastructure

## Constitution Check

*GATE: Passed*

| Gate | Status | Notes |
|------|--------|-------|
| V. Simple & Intuitive UI | ✅ | Tablet POS with large targets, Emerald palette, no emoji |
| shadcn/ui Priority | ✅ | Using shadcn Button, Input, Dialog, Tabs as base primitives |
| CRUD Toast Notifications | ✅ | Sonner toast on every add-to-cart, checkout, error |
| No Emoji Icons | ✅ | Lucide-react icons only |
| I. Offline-First | ✅ | IndexedDB + Service Worker for offline checkout |
| III. Modular Monolith | ✅ | POS routes scoped to `/pos/*`, decoupled from admin |

## Project Structure

### Documentation (this feature)

```text
specs/006-pos-cashier-tablet/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
apps/web-base/src/
├── app/
│   └── pos/                        # NEW: POS route group
│       ├── layout.tsx              # POS layout (full-screen, no admin sidebar)
│       ├── page.tsx                # Main POS sale screen (split-view)
│       ├── login/
│       │   └── page.tsx            # POS login (PIN-based or simple auth)
│       └── history/
│           └── page.tsx            # Order history within shift
├── components/
│   ├── pos/                        # NEW: POS-specific components
│   │   ├── product-grid.tsx        # Left panel: product grid/list with category tabs
│   │   ├── product-card.tsx        # Single product card (large, touchable)
│   │   ├── search-bar.tsx          # Top search bar with barcode listener
│   │   ├── category-tabs.tsx       # Horizontal category filter tabs
│   │   ├── cart-panel.tsx          # Right panel: cart + totals
│   │   ├── cart-item.tsx           # Single cart item row (+/- buttons)
│   │   ├── customer-picker.tsx     # Customer search/attach popup
│   │   ├── unit-picker-dialog.tsx  # Unit selection dialog (Thùng/Chai)
│   │   ├── checkout-screen.tsx     # Full-screen checkout overlay
│   │   ├── payment-cash.tsx        # Cash payment: numpad + change calc
│   │   ├── payment-qr.tsx          # Bank transfer: VietQR display
│   │   ├── success-screen.tsx      # Order success animation
│   │   ├── offline-indicator.tsx   # Header offline status badge
│   │   └── order-detail-sheet.tsx  # Bottom sheet for order history detail
│   └── ui/                         # Existing shadcn/ui (may add Dialog, Sheet, Badge)
├── lib/
│   ├── pos/                        # NEW: POS business logic
│   │   ├── cart-store.ts           # Cart state management (React context or zustand)
│   │   ├── offline-store.ts        # IndexedDB wrapper for offline orders
│   │   ├── barcode-listener.ts     # Keyboard-emulation barcode hook
│   │   └── pos-api.ts             # POS-specific API calls (via adminApiCall proxy)
│   └── api.ts                     # Existing (reuse)
└── public/
    └── manifest.json              # PWA manifest (update if needed)
```

**Structure Decision**: POS lives as a separate route group (`/pos/*`) within web-base, sharing shadcn/ui components and API infrastructure but having its own layout (no admin sidebar — full-screen POS interface). POS components are isolated in `components/pos/` to avoid polluting admin components.

## Key Design Decisions

### 1. Cart State Management
Use **React Context + useReducer** for cart state (no additional library needed). Cart is ephemeral — lives only in memory during the sale session. If offline, pending orders are persisted to IndexedDB.

### 2. Barcode Scanner Integration
A custom React hook `useBarcodeListener` that listens for rapid keyboard input (scanner emits characters quickly) and auto-triggers product search when a complete barcode is detected (terminated by Enter key).

### 3. Offline Strategy (Phase 2+)
- **Product catalog**: Cached via Service Worker on first load, refreshed when online.
- **Pending orders**: Stored in IndexedDB with idempotency key.
- **Background sync**: When online, iterate pending orders and POST to backend API.
- **Indicator**: `offline-indicator.tsx` shows real-time connection status in header.

### 4. Layout: Split-View
- CSS Grid: `grid-template-columns: 1fr 400px` (product area flexible, cart fixed width).
- Cart panel sticks to viewport height with `overflow-y-auto` for scrollable items.
- Total amount pinned at bottom of cart panel (always visible).

### 5. New shadcn/ui Components Needed
- **Dialog** (already have) — for unit picker, customer picker
- **Sheet** (need to add) — for order history detail bottom sheet
- **Badge** (need to add) — for stock status, offline indicator
- **Separator** (nice to have) — visual dividers

## Complexity Tracking

No constitution violations needing tracking.
