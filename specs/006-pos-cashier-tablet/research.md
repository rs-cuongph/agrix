# Research: POS Cashier Tablet App

## Findings

### 1. Existing Backend APIs Available

The NestJS backend already provides all the APIs needed for POS:

| Domain | Entities | API Endpoints (assumed RESTful) |
|--------|----------|-------------------------------|
| Products | Product, Category, ProductUnitConversion | GET /products, GET /products?search=, GET /categories |
| Orders | Order, OrderItem | POST /orders, GET /orders |
| Customers | Customer, DebtLedgerEntry | GET /customers?search=, POST /customers |
| Auth | User, RolePermission | POST /auth/login, GET /auth/me |

**Decision**: Reuse all existing backend endpoints via the `adminApiCall` proxy pattern already established (`/api/admin/proxy`).
**Rationale**: No backend changes required for MVP. The proxy handles auth token injection server-side.

### 2. Client-Side API Pattern for POS

The admin panel uses `adminApiCall` which proxies through `/api/admin/proxy`. The POS will do the same, but we'll create a `posApiCall` wrapper in `lib/pos/pos-api.ts` for POS-specific concerns (offline queuing, error handling for tablet UX).

**Decision**: Use the same proxy route, wrapped in a POS-specific helper.
**Rationale**: Keeps cookie-based auth working, avoids CORS issues, and enables future offline queueing at the API layer.

### 3. Barcode Scanner on Web

USB/Bluetooth barcode scanners in "HID keyboard emulation" mode work seamlessly on web browsers. They emit rapid keystrokes followed by Enter.

**Decision**: Custom `useBarcodeListener` hook that detects rapid keystroke sequences (< 50ms between chars) ending with Enter and triggers product search by `barcodeEan13` field.
**Rationale**: No browser API needed (no camera scan). Works with any scanner in keyboard mode. Simpler and more reliable than camera-based scanning on web.
**Alternatives considered**: Web camera scan via `quagga.js` — rejected for tablet POS because USB/BT scanners are standard in retail.

### 4. Cart State Management

**Decision**: React Context + useReducer pattern.
**Rationale**: Cart state is ephemeral per session, max ~30 items typically. No need for zustand or redux. Context + reducer gives type-safe dispatch, easy to test, zero dependencies.
**Alternatives considered**: Zustand — good but overkill for single-component-tree cart. localStorage — problematic for real-time UI updates.

### 5. Offline Storage

**Decision**: IndexedDB via `idb` library (tiny wrapper, 1.4KB) for offline order persistence.
**Rationale**: IndexedDB is the only web storage API with enough capacity and async access for structured order data. `idb` provides a Promise-based API over the raw IndexedDB callbacks.
**Alternatives considered**: localStorage (5MB limit, synchronous, no indexing), Cache API (designed for HTTP responses, not structured data).

### 6. Thermal Printer

**Decision**: Phase 1 skips direct Bluetooth printing. Instead, offer "Print" via browser print dialog (CSS @media print optimized for 80mm thermal). Phase 2 can add LAN printer support via a small print-server API.
**Rationale**: Web Bluetooth API for ESC/POS is complex and printer-specific. Browser print dialog works immediately with network-connected printers and some Bluetooth printers configured as system printers.

### 7. VietQR Payment

**Decision**: Generate QR code client-side using a QR code library (e.g., `qrcode.react`) with VietQR format string.
**Rationale**: VietQR is a standard string format: `{bankBin}|{accountNo}|{amount}|{memo}`. No external API call needed. The store's bank info comes from StoreSettings entity (already exists in backend).

### 8. New shadcn/ui Components

Need to install via shadcn CLI:
- `sheet` — bottom sheet for order detail
- `badge` — stock status, offline indicator
- `separator` — visual dividers
- `scroll-area` — smooth scrolling in product grid
- `dialog` — already installed

All existing components (button, input, tabs, etc.) are already available.
