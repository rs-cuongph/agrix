# Tasks: Export Barcode to PDF

**Input**: Design documents from `/specs/012-export-barcode-pdf/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and required dependencies

- [x] T001 Install `jspdf`, `jsbarcode`, and `@types/jsbarcode` dependencies in `apps/web-base/package.json` and install via npm.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core logic for PDF generation which MUST be complete before UI integration

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Implement PDF rendering logic in `apps/web-base/src/lib/barcode-pdf-generator.ts`. This exports a function `generateProductBarcodesPdf(products)`, formats the PDF page loop, renders `JsBarcode` onto a hidden canvas, and dumps the resulting image + Text (Name/Price) into the jsPDF instance.

**Checkpoint**: Foundation ready - PDF generation is fully capable of processing an array of products.

---

## Phase 3: User Story 1 - Export All Product Barcodes to PDF (Priority: P1) 🎯 MVP

**Goal**: Admin users can securely fetch all product data and initiate the PDF generation.

**Independent Test**: Can be fully tested by clicking the "Xuất Barcode (PDF)" button in the admin products page and verifying that a valid `.pdf` file is downloaded.

### Implementation for User Story 1

- [x] T003 [P] [US1] Create a standalone generic component `apps/web-base/src/components/admin/export-barcode-button.tsx` handles fetching the full list of products (bypassing pagination with limits) and orchestrates the call to `generateProductBarcodesPdf()`, while showing appropriate disabled/loading states.
- [x] T004 [US1] Integrate `<ExportBarcodeButton />` inside `apps/web-base/src/components/admin/products-client.tsx` adjacent to the "Thêm sản phẩm" functionality.

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Improvements and validations

- [x] T005 Validate the PDF export size and ensure the barcode is scannable (or properly visually formatted without cropping) as defined in quickstart.md.
- [x] T006 Ensure error states (e.g., product has no barcode) are safely skipped or defaulted to Product ID inside the generator logic.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Phase 1 (NPM libraries)
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion
- **Polish (Final Phase)**: Depends on User Story 1 being complete

### Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 & 2: Setup PDF utility.
2. Complete Phase 3: Wire up UI button.
3. **STOP and VALIDATE**: Test User Story 1 independently by downloading PDF.
4. Complete Phase 4.

## Notes

- Total task count: 6
- Task count per user story: US1 (2 tasks)
- The entire feature boils down to writing one generator script and one button wrapper. Highly isolated, zero side-effects.
