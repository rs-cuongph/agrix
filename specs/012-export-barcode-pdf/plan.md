# Implementation Plan: Export Barcode to PDF

**Branch**: `012-export-barcode-pdf` | **Date**: 2026-04-05 | **Spec**: [Link to Spec](./spec.md)
**Input**: Feature specification from `/specs/012-export-barcode-pdf/spec.md`

## Summary

This feature allows store administrators to export their entire product catalog as printable thermal labels via a downloadable PDF. The PDF is meticulously sized for thermal label importing systems (like Clable Trade) and will be generated completely client-side in the Web browser using `jspdf` and `jsbarcode`.

## Technical Context

**Language/Version**: TypeScript / Next.js 14  
**Primary Dependencies**: `jspdf` for document synthesis, `jsbarcode` for drawing accurate 1D barcodes.  
**Target Platform**: Next.js Web App (`web-base` package), specifically the Admin Inventory interface.  
**Project Type**: Full-stack Next.js Web App  
**Constraints**: Fully client-side execution to avoid Node.js buffer limitations and reduce backend burden.  
**Scale/Scope**: Minimal scope. 1 new UI button, 1 new client utility function. Tested up to ~1000 items gracefully via chunked rendering.  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Mobile-First & Offline-First**: Client-side PDF generation natively supports offline capability (provided the product data is already available/cached in the browser).
- [x] **II. Monorepo Architecture**: Logic stays strictly within `apps/web-base/src/lib` or `components`.
- [x] **V. Simple & Intuitive UI**: We will integrate the "Xuất Barcode" using shadcn/ui generic primitive Buttons fitting perfectly alongside existing data table controls.
- [x] **shadcn/ui Priority**: Using `Button` from `/components/ui/button`.
- [x] **No Emoji Icons**: All icons will strictly be imported from `lucide-react` (e.g., `Printer`, `Download`).

## Project Structure

### Documentation (this feature)

```text
specs/012-export-barcode-pdf/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output 
├── quickstart.md        # Phase 1 output 
└── contracts/           # Phase 1 output
```

### Source Code

```text
apps/web-base/
├── package.json
└── src/
    ├── lib/
    │   └── barcode-pdf-generator.ts            # [NEW] Utility to convert Products -> PDF via jsbarcode & jspdf
    └── components/
        └── admin/
            └── products-client.tsx             # [MODIFY] Add the "Export Barcodes" button 
```

**Structure Decision**: Keep the solution tightly coupled to the admin product view since it generates data specifically tailored to product properties (Price, Name, Barcode). `barcode-pdf-generator.ts` is placed in `lib` globally to allow potential re-usability (e.g., an export barcode feature from POS view).
