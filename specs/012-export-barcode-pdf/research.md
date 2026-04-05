# Research: Export Barcode to PDF

**Branch**: `012-export-barcode-pdf` | **Date**: 2026-04-05

## Research Tasks & Findings

### 1. How to generate the PDF file client-side?

**Task**: Find the most appropriate library to generate a PDF containing barcode visuals completely within the Next.js frontend to avoid backend load.

**Decision**: Use `jspdf` along with `jsbarcode` (or an equivalent canvas-based barcode generator). 
**Rationale**: `jspdf` is lightweight and well-supported for generating simple layouts like a grid of labels. `jsbarcode` can render highly accurate Code128 barcodes to a hidden `<canvas>`, which `jspdf` can then easily capture and embed into the PDF document as an image. This avoids complex DOM-to-PDF serialization and provides pixel-perfect barcode output.
**Alternatives considered**: 
- `@react-pdf/renderer`: Excellent for documents but overkill for simple repetitive label grids, and embedding external canvas-based barcodes involves extra steps.
- Server-side generation (e.g. Puppeteer or `pdfkit` in NestJS): Rejected because it adds unnecessary backend load and latency. Client-side is sufficient and faster for this use case.

### 2. Standard Label Dimensions for Thermal Printers

**Task**: Determine the layout dimensions for the PDF to ensure it is compatible with Clable Trade and generic thermal printers.

**Decision**: Default to a standard layout (e.g., A4 page with a grid of labels, or a specific thermal dimension like 50x30mm). Since Clable Trade usually imports generic PDF sheets or singular label pages to map into their software, creating a document where each page is exactly 50x30mm (or standard thermal sizes) is ideal. 
**Rationale**: By making each page of the PDF correspond to exactly one label dimension (e.g., 50x30mm), label printer software like Clable Trade can import the multi-page PDF natively as individual labels.

### 3. Handling Large Product Catalogs

**Task**: How to handle generating a PDF for thousands of products without freezing the browser?

**Decision**: Process the generation in batches (chunks) using `requestAnimationFrame` or `setTimeout` to unblock the UI thread, and show a progressive loading state (e.g. "Generating 250 / 1000...").
**Rationale**: Drawing hundreds of canvases and embedding them into `jspdf` is CPU intensive. Chunking prevents the "Page Unresponsive" browser crash.
