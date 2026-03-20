# Research: Batch-Based Stock System

**Date**: 2026-03-20 | **Status**: Complete — No unknowns

## Decisions

### 1. Batch Deduction Strategy
- **Decision**: Pure FIFO (First In, First Out)
- **Rationale**: Agricultural products (pesticides, fertilizers) have expiration dates — oldest stock should ship first. Simplifies UX (no manual batch selection).
- **Alternatives considered**: LIFO (not suitable for perishable goods), Manual selection (too complex for cashiers), FIFO + Manual override (unnecessary complexity per user feedback)

### 2. Batch Tracking Data Model
- **Decision**: Add `remainingQuantity` column to `StockEntry` (only meaningful for IMPORT type entries)
- **Rationale**: Simplest approach — no new tables. Query "available batches" = `WHERE type='IMPORT' AND remainingQuantity > 0 ORDER BY createdAt ASC`.
- **Alternatives considered**: Separate `StockBatch` table (normalized but adds complexity), realtime calculation from ledger (slow at scale)

### 3. Split Deduction Entries
- **Decision**: When SALE/ADJUSTMENT spans multiple batches, create one `StockEntry` per batch deducted
- **Rationale**: Each entry carries `batchNumber` + `costPricePerUnit` from the source batch. `referenceId` groups entries for the same Order. Enables precise profit calculation per order.
- **Alternatives considered**: Junction table (more complex), JSONB array (harder to query)

### 4. Batch Number Format
- **Decision**: `YYYYMMDD-SKU-HHMM` (auto-generated on import, not user-editable)
- **Rationale**: Human-readable, sortable, unique per import session. Example: `20260320-TB001-0900`

### 5. Transaction Safety
- **Decision**: Use TypeORM `QueryRunner` transaction for FIFO deduction
- **Rationale**: Lock IMPORT rows with `remainingQuantity > 0` during deduction to prevent race conditions. Essential for concurrent POS sales.
