# Feature Specification: Export Barcode to PDF

**Feature Branch**: `012-export-barcode-pdf`  
**Created**: 2026-04-05  
**Status**: Draft  
**Input**: User description: "tôi muốn có 1 chức năng export các mã barcode của tất cả các sản phẩm vào nhãn để đưa ra file pdf => đưa vào hệ thống Clable Trade"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Export All Product Barcodes to PDF (Priority: P1)

As a store admin/manager, I want to export the barcodes of all products into a generated PDF file so that I can directly import it into or print it using the Clable Trade system.

**Why this priority**: Core requirement. Without this, users cannot easily print labels for their products in bulk.

**Independent Test**: Can be fully tested by clicking the "Export Barcodes" button in the admin products page and verifying that a valid `.pdf` file is downloaded, containing readable barcodes mapping to the existing products.

**Acceptance Scenarios**:

1. **Given** I am on the Admin Products list page, **When** I click "Xuất Barcode (PDF)", **Then** the system gathers all products with valid barcodes, generates a PDF layout (e.g., standard label sizes like 50x30mm or A4 grid), and prompts a file download.
2. **Given** a product does not have a barcode defined, **When** exporting, **Then** that product is skipped or a warning is displayed, ensuring the PDF only contains valid printable labels.

---

### Edge Cases

- What happens when a product has a missing or invalid barcode string? (Should skip or use product ID as fallback).
- What happens when the product list is extremely large (e.g., 5000+ items)? System should handle pagination or background generation to prevent browser crash.
- Does the label need to contain Product Name and Price alongside the barcode? (Assumption: Yes, standard retail labels contain Name, Price, and Barcode).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a button in the Admin Products view to trigger the "Export Barcode PDF" action.
- **FR-002**: System MUST fetch the list of products (name, price, barcode/SKU).
- **FR-003**: System MUST generate a PDF file containing standard barcode visualizations (e.g., Code128) corresponding to the product code.
- **FR-004**: System MUST format the PDF pages so each page/section matches standard label printer dimensions (e.g., 50x30mm) or a multi-label grid, optimizing for the Clable Trade software importing flow.
- **FR-005**: System MUST include the Product Name and Price on the label for easy identification.

### Key Entities

- **Product**: Contains `name`, `price`, `barcode` (or SKU/ID fallback).
- **PDF Document**: A generated binary BLOB triggered for download in the browser.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admin can trigger the PDF generation and the file downloads in less than 3 seconds for catalogs up to 1000 products.
- **SC-002**: The generated PDF barcodes can be successfully scanned by a standard hardware barcode scanner.
- **SC-003**: The PDF layout imports cleanly into Clable Trade without clipping or distortion of the barcode.
