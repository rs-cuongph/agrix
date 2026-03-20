# Data Model: Batch-Based Stock System

**Date**: 2026-03-20

## Entity Changes

### StockEntry (MODIFY)

Current entity: `apps/backend/src/inventory/entities/stock-entry.entity.ts`

#### New Column

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `remaining_quantity` | `int` | Yes | `null` | Only set for IMPORT type. Starts equal to `quantityBase`. Decremented as batches are consumed via FIFO. |

#### Modified Columns

| Column | Current | New Behavior |
|--------|---------|-------------|
| `batch_number` | nullable, user-provided | **Auto-generated** on IMPORT (`YYYYMMDD-SKU-HHMM`). On SALE/ADJUSTMENT, set to source batch's `batchNumber`. |
| `cost_price_per_unit` | nullable, IMPORT only | On IMPORT: set by user. On SALE/ADJUSTMENT: **copied from source batch**. |

#### State Transitions

```
IMPORT entry lifecycle:
  Created → remainingQuantity = quantityBase (full batch)
  Deducted → remainingQuantity decremented (partial batch)
  Depleted → remainingQuantity = 0 (empty batch, skip in FIFO)
```

### Product (NO CHANGE)

`currentStockBase` continues to track total stock across all batches. It is updated via `increment`/`decrement` as before. The sum of all IMPORT `remainingQuantity` should equal `currentStockBase`.

## FIFO Deduction Algorithm

```
function deductFIFO(productId, totalQtyToDeduct, type, userId, referenceId):
  BEGIN TRANSACTION
  
  batches = SELECT * FROM stock_entries 
    WHERE product_id = productId 
      AND type = 'IMPORT' 
      AND remaining_quantity > 0 
    ORDER BY created_at ASC 
    FOR UPDATE  -- row lock for concurrency

  remaining = totalQtyToDeduct
  entries = []

  FOR batch IN batches:
    IF remaining <= 0: BREAK
    
    deduct = MIN(batch.remaining_quantity, remaining)
    batch.remaining_quantity -= deduct
    remaining -= deduct
    
    entries.push(StockEntry{
      productId, 
      quantityBase: -deduct, 
      type,
      batchNumber: batch.batchNumber,
      costPricePerUnit: batch.costPricePerUnit,
      referenceId,
      createdBy: userId
    })

  IF remaining > 0:
    ROLLBACK
    THROW "Insufficient stock"

  SAVE all entries
  UPDATE product SET currentStockBase -= totalQtyToDeduct
  
  COMMIT
  RETURN entries
```

## Migration

```sql
ALTER TABLE stock_entries ADD COLUMN remaining_quantity INT;

-- Backfill existing IMPORT entries
UPDATE stock_entries 
SET remaining_quantity = quantity_base 
WHERE type = 'IMPORT';
```

## Relationships

```
Product 1──* StockEntry (productId)
StockEntry(SALE).batchNumber ──> StockEntry(IMPORT).batchNumber
StockEntry(SALE).referenceId ──> Order.id
```
