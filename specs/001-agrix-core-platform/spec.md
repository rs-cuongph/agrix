# Feature Specification: Agrix Core Platform

**Feature Branch**: `001-agrix-core-platform`  
**Created**: 2026-03-19  
**Status**: Draft  
**Input**: User description: "let read @[/Users/cuongph/Workspace/agrix/SPEC.md]"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Offline-First Sales Execution (Priority: P1)

A cashier working at a rural storefront loses internet connectivity. They need to continue searching for products via barcode, adding them to the cart, processing cash payments, and printing thermal receipts without interruption. The system must queue these transactions and auto-sync when network returns.

**Why this priority**: Core revenue-generating activity. Failure to sell offline stops business operations.

**Independent Test**: Can be fully tested by disabling network connectivity, completing a transaction, restoring connectivity, and verifying the transaction safely appears in the central database.

**Acceptance Scenarios**:
1. **Given** the tablet has no internet connection, **When** the cashier scans an EAN-13 barcode, **Then** the local SQLite database returns the product details instantly.
2. **Given** a completed offline order, **When** network connectivity is restored, **Then** the background sync pushes the order to the server and deducts central database inventory without duplicate entries.

---

### User Story 2 - Dynamic Unit Inventory Management (Priority: P2)

A warehouse worker receives 10 "Thùng" (Boxes) of pesticide, where each box contains 40 "Chai" (Bottles). A retail customer wants to buy 3 Bottles. The cashier selects the "Bottle" unit and the system accurately calculates the price and deducts 3 bottles from the inventory (leaving 9 Boxes and 37 Bottles).

**Why this priority**: Crucial for agricultural retail where bulk breaking is standard practice.

**Independent Test**: Can be fully tested by creating a product with a conversion ratio and performing fractional sales.

**Acceptance Scenarios**:
1. **Given** an inventory of 10 Boxes (40 Bottles/Box), **When** 3 Bottles are sold, **Then** the inventory precisely tracks "9 Boxes, 37 Bottles" (or 397 Bottles total).

---

### User Story 3 - AI-Assisted Agricultural Consultation (Priority: P3)

A cashier needs to advise a customer whether Pesticide X can be mixed with Fertilizer Y. They click "Hỏi Ngay" (Ask Now) on the product page and query the AI Chatbot. The Chatbot uses the store's custom knowledge base to provide a safe, accurate answer.

**Why this priority**: Differentiates the product by upskilling retail staff instantly.

**Independent Test**: Can be fully tested by uploading a test PDF to the knowledge base and asking a query that can only be answered using that PDF.

**Acceptance Scenarios**:
1. **Given** the internal knowledge base contains mixing rules for Pesticide X, **When** the cashier asks about mixing it with Fertilizer Y, **Then** the AI returns specific safety guidelines from the uploaded document.

### Edge Cases

- What happens when a user attempts an offline sale for a product that was already out of stock before disconnecting?
- How does the system handle concurrent sync collisions (e.g., two tablets come back online simultaneously selling the last available unit)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST process point-of-sale transactions completely offline and sync them to the server when online.
- **FR-002**: System MUST support EAN-13 barcode scanning via camera or dedicated hardware.
- **FR-003**: System MUST support hierarchical unit conversions (e.g., Box to Bottle) for pricing and inventory deduction.
- **FR-004**: System MUST provide Role-Based Access Control (Admin, Cashier, Inventory).
- **FR-005**: System MUST maintain a customer debt ledger (Sổ Công nợ) to track partial payments and outstanding balances.
- **FR-006**: System MUST generate a dynamic bank transfer QR code (VietQR) matching the exact order total.
- **FR-007**: System MUST alert users when inventory falls below minimum thresholds or approaches expiration dates.
- **FR-008**: System MUST integrate an AI Chatbot capable of answering questions based on admin-provided documents.
- **FR-009**: System MUST interface with thermal printers using standard ESC/POS (POS58/POS80) protocols over both Bluetooth and Wi-Fi/LAN connections.
- **FR-010**: Web Admin MUST be implemented as Next.js pages under `/admin/*` route in `apps/web-base/`, using shadcn/ui + Tailwind CSS, with server-side middleware auth (JWT in httpOnly cookie). Flutter `apps/web-admin/` is deprecated.
- **FR-011**: Backend MUST enable CORS (allow `*` in dev, whitelist specific origins in production) to support Web Admin browser requests.
- **FR-012**: Backend MUST expose separate dashboard endpoints (`/dashboard/revenue`, `/dashboard/top-products`, `/dashboard/alerts`) for flexible, independently-cacheable metric loading.

### Key Entities

- **Product**: Core item. Attributes: SKU, Name, Base Unit, Expiration Date, Base Price.
- **ProductUnitConversion**: Conversion rules. Attributes: ProductID, TargetUnit, ConversionFactor, TargetPrice.
- **Order**: A sales transaction. Attributes: OrderID, CustomerID, TotalAmount, Status (Synced/Pending), PaymentMethod.
- **Customer**: Buyer profile. Attributes: CustomerID, Name, Phone, OutstandingDebt.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of offline transactions are successfully synchronized to the master database within 5 minutes of network restoration without duplication.
- **SC-002**: The POS interface can parse and add a scanned EAN-13 barcode to the cart in under 500ms.
- **SC-003**: Inventory deductions involving unit conversions maintain absolute precision with zero arithmetic errors.
- **SC-004**: The AI Chatbot returns contextually accurate advice based exclusively on provided documents in under 3 seconds per query.

## Clarifications

### Session 2026-03-20

- Q: Web Admin ↔ Backend API: Mức độ tích hợp cần thiết là gì? → A: Dùng shared API client package (`packages/shared/dart/`) để reuse code giữa mobile và web-admin. Full REST API integration.
- Q: Web Admin cần CORS hay proxy để gọi backend từ browser? → A: Bật CORS trên NestJS backend (cho phép `*` trong dev, whitelist origins trong production).
- Q: Web Admin phạm vi tính năng? → A: Admin-only — Dashboard, Products CRUD, Orders history (read-only), Customers + Debt, Blog management, Settings. Không có POS.
- Q: Dashboard metrics API design? → A: Nhiều endpoint riêng biệt (`/dashboard/revenue`, `/dashboard/top-products`, `/dashboard/alerts`) — flexible và có thể cache/load independently.

### Session 2026-03-20 — Web Admin Migration to Next.js

- Q: Admin route authentication approach? → A: Server-side middleware — JWT lưu trong httpOnly cookie, Next.js middleware validate trước khi render `/admin/*` pages. Redirect về `/admin/login` nếu chưa auth.
- Q: UI component library cho admin? → A: shadcn/ui + Tailwind CSS — modern, lightweight, copy-paste components, dễ customize.
- Q: Xử lý Flutter web-admin hiện tại? → A: Giữ nguyên, đánh dấu deprecated. Focus development chuyển sang Next.js admin.
