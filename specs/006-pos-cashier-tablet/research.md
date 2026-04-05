# Research: POS Cashier Tablet App (Updated 2026-04-05)

## Findings

### 1. Existing Backend APIs Available

The NestJS backend already provides all the APIs needed for POS:

| Domain | Entities | API Endpoints (assumed RESTful) |
|--------|----------|-------------------------------|
| Products | Product, Category, ProductUnitConversion | GET /products, GET /products?search=, GET /categories |
| Orders | Order, OrderItem | POST /orders, GET /orders, DELETE /orders/:id |
| Customers | Customer, DebtLedgerEntry | GET /customers?search=, POST /customers |
| Auth | User, RolePermission | POST /auth/login, POST /auth/pos-login, GET /auth/me |
| Settings | StoreSettings | GET /settings, PUT /admin/settings |
| Admin Users | User | GET /admin-users, POST /admin-users, PUT /admin-users/:id |

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

**Decision**: Generate QR code client-side using VietQR image URL format. Bank info stored in `StoreSettings` entity (DB, managed via Admin Settings page). VietQR memo uses `orderCode` (e.g., `DH839124`) instead of UUID.
**Rationale**: VietQR image URL format: `https://img.vietqr.io/image/{bankBin}-{accountNo}-compact2.png?amount={amount}&addInfo={orderCode}`. `orderCode` is short alphanumeric (no dashes) compatible with bank transfer content restrictions.
**Alternatives considered**: `.env` for bank config — user chose DB-based via StoreSettings for easier admin management. Sepay/external webhook service — rejected in favor of self-hosted Google Apps Script approach.

### 8. Order Code Generation

**Decision**: `DH` prefix + 6 random digits (e.g., `DH839124`). Generated server-side at order creation.
**Rationale**: Short, memorable, no special characters. `DH` prefix identifies it as a Đơn Hàng (order) code. 6 digits = 1M possible codes, sufficient for years of operation at a single store. Collision check with retry loop ensures uniqueness.
**Alternatives considered**: Sequential integer (1, 2, 3...) — rejected because it leaks business volume. UUID without dashes — still too long for bank transfers.

### 9. Bank Transfer Webhook

**Decision**: Self-hosted webhook endpoint `POST /api/v1/orders/webhook/bank-transfer` secured with `x-webhook-secret` header. Called by Google Apps Script that monitors bank notification emails.
**Rationale**: Zero cost (no Sepay subscription), full control, simple implementation. GAS reads bank email → extracts orderCode & amount → POSTs to webhook → Backend confirms payment.
**Alternatives considered**: Sepay.vn (paid, adds external dependency), manual admin confirmation (too slow, error-prone).

### 10. Order Status Lifecycle

**Decision**: Add `status` enum to Order: `PENDING` → `COMPLETED` (or `CANCELLED`).
**Rationale**: CASH orders are immediately `COMPLETED`. BANK_TRANSFER orders start as `PENDING` and transition to `COMPLETED` when webhook confirms payment. This enables real-time tracking of unpaid transfer orders.

### 11. New shadcn/ui Components

Need to install via shadcn CLI:
- `sheet` — bottom sheet for order detail
- `badge` — stock status, offline indicator, order status
- `separator` — visual dividers
- `scroll-area` — smooth scrolling in product grid
- `dialog` — already installed
- `alert-dialog` — already installed

All existing components (button, input, tabs, etc.) are already available.
