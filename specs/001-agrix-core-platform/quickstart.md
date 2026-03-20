# Quickstart: Batch-Based Stock System

## Prerequisites

- PostgreSQL running with existing agrix database
- Node.js 18+, npm installed
- Backend and web-base apps functional

## Implementation Order

### Step 1: Database Migration
```bash
# Add remaining_quantity column to stock_entries
cd apps/backend
# TypeORM will auto-sync in dev mode, or run migration manually
```

### Step 2: Backend Changes (apps/backend)
1. **stock-entry.entity.ts** — Add `remainingQuantity` column
2. **stock-import.service.ts** — Implement:
   - Auto-generate `batchNumber` (YYYYMMDD-SKU-HHMM)
   - Set `remainingQuantity = quantityBase` on import
   - FIFO deduction logic with transaction + row locking
   - Return array of entries on adjust (split per batch)
3. **stock.controller.ts** — Add `GET /stock/batches` endpoint

### Step 3: Frontend Changes (apps/web-base)
1. **inventory-client.tsx** — Remove batchNumber input from import form (auto-generated)
2. **inventory page** — Show batchNumber in import history

### Step 4: Seed Update
1. **seed.ts** — Set `remainingQuantity` on existing IMPORT entries

## Verification
```bash
# Build check
cd apps/web-base && npx next build

# Backend start
cd apps/backend && npm run start:dev

# Test flow:
# 1. Import stock → verify batchNumber auto-generated + remainingQuantity set
# 2. Adjust stock (DAMAGE) → verify FIFO split entries created
# 3. Check remaining batches via GET /stock/batches
```
