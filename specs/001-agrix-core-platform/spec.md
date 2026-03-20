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
- **FR-013**: System MUST provide full-stack unit conversion management: Backend CRUD API at `/api/v1/unit-conversions` + Web Admin page at `/admin/units` for creating, editing, and deleting product unit conversions (e.g., 1 Thùng = 40 Chai) with target price per unit.
- **FR-014**: System MUST auto-generate internal QR codes for products and special lots for fast scanning identification.
- **FR-015**: Web Admin MUST provide full CRUD for: Products (Create/Edit/Detail/Toggle Active), Units (Create/Edit/Delete), Customers (Create/Edit/Detail/Delete), Blog (Create/Edit/Detail/Delete). Orders remain read-only with Detail view.
- **FR-016**: System MUST provide Admin Account Management with RBAC + Module ACL. Roles assign permissions per module (Products, Orders, Customers, Blog, Settings, Units). Each module supports Read/Create/Edit/Delete permissions. Managed via `/admin/accounts` page.
- **FR-017**: Web Admin MUST provide full Inventory Management at `/admin/inventory` with tabbed UI: (1) Tổng quan kho — stock overview with low-stock alerts, (2) Nhập kho — stock import form with per-batch cost price tracking, auto-generated batchNumber (format YYYYMMDD-SKU-HHMM), and import history, (3) Điều chỉnh kho — stock adjustment for damage/loss, supplier return, inventory audit; user enters total quantity, system auto-deducts using FIFO, (4) Lịch sử — full stock movement ledger.
- **FR-018**: System MUST track stock at batch level. Each IMPORT creates a batch with `remainingQuantity`. SALE/ADJUSTMENT entries are split per batch (one StockEntry per batch deducted), each carrying the batch's `costPricePerUnit` and `batchNumber`. `referenceId` links all entries to the source Order/adjustment. This enables per-order profit calculation.

### Key Entities

- **Product**: Core item. Attributes: SKU, Name, Base Unit, Expiration Date, Base Price.
- **ProductUnitConversion**: Conversion rules. Attributes: ProductID, TargetUnit, ConversionFactor, TargetPrice.
- **Order**: A sales transaction. Attributes: OrderID, CustomerID, TotalAmount, Status (Synced/Pending), PaymentMethod.
- **Customer**: Buyer profile. Attributes: CustomerID, Name, Phone, OutstandingDebt.
- **AdminUser**: Admin account. Attributes: ID, Username, PasswordHash, RoleID, IsActive.
- **Role**: Permission role. Attributes: ID, Name, Description.
- **RolePermission**: Module-level permission. Attributes: RoleID, Module (products|orders|customers|blog|settings|units), CanRead, CanCreate, CanEdit, CanDelete.
- **StockEntry**: Stock movement ledger. Attributes: ID, ProductID, QuantityBase, Type (IMPORT|SALE|DAMAGE|RETURN|ADJUSTMENT|SYNC), CostPricePerUnit (set on IMPORT; copied from source batch on SALE/ADJUSTMENT), BatchNumber (auto-generated YYYYMMDD-SKU-HHMM on IMPORT; references source batch on SALE/ADJUSTMENT), RemainingQuantity (only for IMPORT — tracks how many units remain in this batch), ReferenceID (Order ID for SALE, or adjustment group ID), CreatedBy, CreatedAt.

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

### Session 2026-03-20 — Unit Management Clarification

- Q: Web Admin cần CRUD unit conversions ở đâu trong UX flow? → A: Trang riêng `/admin/units` — quản lý tất cả đơn vị quy đổi tập trung.
- Q: Backend API cho Unit Conversions đã có hay cần tạo mới? → A: Chưa có — cần tạo cả CRUD endpoints `/api/v1/unit-conversions` + frontend `/admin/units` page.

### Session 2026-03-20 — CRUD & ACL Clarification

- Q: CRUD cho Products: cần full CRUD hay giới hạn? → A: Full CRUD + Soft-delete — Create, Edit, Detail, Toggle Active (ẩn/hiện) thay vì xóa cứng. Sản phẩm liên kết đơn hàng + tồn kho nên không xóa thật.
- Q: ACL cấu trúc phân quyền module cho admin? → A: RBAC + Module ACL — Roles gán permissions theo module (Products, Orders, Customers, Blog, Settings, Units). Mỗi module: Read/Create/Edit/Delete.
- Q: Backend auth hiện tại — tạo mới AdminUser hay extend user hiện có? → A: Tạo mới AdminUser entity riêng biệt, tách khỏi Customer. Auth login check AdminUser table.

### Session 2026-03-20 — Inventory Management Clarification

- Q: Phạm vi quản lý Nhập/Xuất kho cần thiết? → A: Full — Nhập kho (lịch sử, giá nhập) + Xuất/Hao hụt + Cảnh báo tồn kho thấp + Báo cáo hàng khó tiêu thụ.
- Q: Giá nhập kho theo dõi theo lô hay theo sản phẩm? → A: Theo lô — mỗi lần nhập kho ghi nhận giá nhập riêng (cost price per batch). Giá vốn trung bình tự tính.
- Q: Tiêu chí xác định "hàng khó tiêu thụ"? → A: Kết hợp — không bán được trong X ngày VÀ tồn kho trên Y đơn vị. Tránh cảnh báo nhầm sản phẩm mới nhập ít.
- Q: Loại xuất kho / điều chỉnh kho cần hỗ trợ? → A: Đầy đủ — Hao hụt/Hư hỏng + Trả hàng NCC + Điều chỉnh kiểm kê (chênh lệch thực tế vs hệ thống).
- Q: Bố trí trang quản lý kho trong Admin? → A: Một trang `/admin/inventory` với tabs: Tổng quan kho, Nhập kho, Điều chỉnh kho, Lịch sử. Báo cáo sẽ chuyển ra dashboard.

### Session 2026-03-20 — Inventory & Units Refinement

- Q: Tab "Xuất/Điều chỉnh" đổi tên? → A: Đổi thành "Điều chỉnh kho" — bán hàng qua POS, không phải xuất kho admin.
- Q: Tab "Báo cáo" trong Kho? → A: Xóa khỏi trang Kho, chuyển sang Dashboard sau.
- Q: Quản lý đơn vị gốc (base unit) thế nào? → A: Tạo entity Unit riêng (id, name, abbreviation). Tab 1: Đơn vị gốc (CRUD). Tab 2: Quy đổi đơn vị. Product.baseUnit liên kết tới Unit entity.

### Session 2026-03-20 — Product Simplification

- Q: Các trường ẩn trên Product entity? → A: Xóa baseCostPrice, usageInstructions, imageUrl khỏi entity. Giữ currentStockBase, minStockThreshold, expirationDate.
- Q: Form sản phẩm gồm những trường nào? → A: 7 trường: SKU, Tên, Danh mục, Đơn vị gốc (dropdown từ bảng Unit), Giá bán lẻ, Barcode EAN-13, Mô tả.
- Q: Giá nhập quản lý ở đâu? → A: Chỉ ở tab Nhập kho (per-batch cost price). Tách biệt giá nhập/giá bán để tính doanh thu/lợi nhuận.
- Q: Vị trí trang Sản phẩm? → A: Move vào /admin/inventory như tab đầu tiên. Kho hàng gồm 5 tabs: Tổng quan, Sản phẩm, Nhập kho, Điều chỉnh, Lịch sử.

### Session 2026-03-20 — UI Icons & Stock Consistency

- Q: Dùng icon gì trên web UI? → A: Chỉ dùng icon từ thư viện (lucide-react, shadcn). KHÔNG dùng emoji Unicode (📋, 📥...). Đã cập nhật constitution v1.1.0.
- Q: Tồn kho seed có nhất quán? → A: Seed phải tạo StockEntry IMPORT records tương ứng để lịch sử nhập kho khớp với tồn kho hiện tại.

### Session 2026-03-20 — Authentication & Logout

- Q: API trả 401? → A: Bug proxy cookie name (`token` vs `agrix_token`). Fixed: proxy nay đọc đúng `agrix_token`.
- Q: Nút đăng xuất? → A: Thêm nút "Đăng xuất" (LogOut icon) ở cuối sidebar. Gọi POST /api/auth/logout, clear cookie, redirect /admin/login.
- Q: Backend bảo vệ API? → A: Tất cả controllers đã có @UseGuards(AuthGuard('jwt'), RolesGuard). RBAC permissions đã seed.

### Session 2026-03-20 — Error Handling

- Q: Xử lý lỗi API? → A: 401→logout + redirect /admin/login. 403/404/500→Sonner toast (richColors, top-right) với message tiếng Việt. Package: sonner.

### Session 2026-03-20 — Batch-Based Stock Adjustment

- Q: Chiến lược trừ kho theo lô? → A: FIFO — luôn trừ lô nhập trước xuất trước. Không cho chọn lô thủ công (đơn giản hóa UX).
- Q: Tracking tồn kho theo lô? → A: Thêm `remainingQuantity` vào StockEntry IMPORT. Khi SALE/ADJUSTMENT, tách thành nhiều StockEntry (1 per batch), mỗi entry mang `batchNumber` + `costPricePerUnit` của lô gốc. `referenceId` nhóm entries cùng Order. Tính lợi nhuận chính xác từng đơn hàng.
- Q: UI điều chỉnh kho theo lô? → A: Auto FIFO only — người dùng chỉ nhập tổng SL điều chỉnh, hệ thống tự trừ theo FIFO. Không cần chọn lô trên form.
- Q: Manual override cho lô? → A: Bỏ manual override — toàn bộ FIFO, không cho chọn lô. Đơn giản nhất.

### Session 2026-03-20 — Settings Page Reorganization

- Q: Cấu trúc tabs trong Cài đặt? → A: 4 tabs: Danh mục → Đơn vị → Tài khoản → Khác. Xóa nội dung cũ (máy in, đồng bộ, phiên bản). Sidebar chỉ còn link Cài đặt (không còn Danh mục, Đơn vị, Tài khoản riêng).
- Q: Nội dung tab "Khác"? → A: Placeholder — "Chưa có cài đặt nào" + thông tin phiên bản nhỏ ở footer.
