# API Contracts: Export Barcode to PDF

**Branch**: `012-export-barcode-pdf` | **Date**: 2026-04-05

## Modified Endpoints

**None**.

This feature relies entirely on fetching the existing paginated or infinite list of products from the `/api/v1/products` API (or its proxy in Next.js). Once the product data is retrieved, the processing (barcode generation and PDF formatting) happens entirely in the browser memory using client-side JavaScript. No new endpoints or modifications to existing API payloads are necessary.
