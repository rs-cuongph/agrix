# Data Model: Export Barcode to PDF

**Branch**: `012-export-barcode-pdf` | **Date**: 2026-04-05

## Schema Changes

**None**. This feature is purely client-side generation and visualization. No database schema changes are required.

## Client-Side Transient Models

### 1. Label Generation Specification

```typescript
interface LabelPrintSpec {
  pageWidthMm: number;    // default 50
  pageHeightMm: number;   // default 30
  marginMm: number;       // default 2
}
```

### 2. Product Barcode Payload

```typescript
interface ProductLabelData {
  id: string;
  name: string;
  price: number;
  barcode: string; // SKU or Barcode mapping
}
```
