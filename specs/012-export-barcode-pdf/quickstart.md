# Quickstart: Export Barcode to PDF

**Branch**: `012-export-barcode-pdf` | **Date**: 2026-04-05

## Prerequisites

- Frontend server running: `npm run web:dev`
- Backend server running: `npm run backend:dev`

## Local Test Flow

1. Log into the local instance.
2. Navigate to the Admin Dashboard > Products section (`http://localhost:3002/admin/inventory`).
3. Identify the new button "Xuất Barcode (PDF)" near the existing product management actions.
4. Click the "Xuất Barcode (PDF)" button.
5. The UI should display a transient loading state (e.g., "Đang tạo PDF...").
6. The file `product-barcodes.pdf` should automatically trigger for download within a few seconds.
7. Open the downloaded PDF in any standard viewer. Each page must correspond exactly to one thermal label (e.g., 50x30mm) containing the Product Name, Price, and Barcode.
