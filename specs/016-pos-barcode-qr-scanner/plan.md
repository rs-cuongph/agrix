# Implementation Plan: Barcode/QR Scanner trên Web POS

**Branch**: `016-pos-barcode-qr-scanner` | **Date**: 2026-04-12 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/016-pos-barcode-qr-scanner/spec.md`

## Summary

Tích hợp tính năng quét mã vạch EAN-13 và QR Code nội bộ trực tiếp từ giao diện Web POS (`apps/web-base`) bằng camera trình duyệt (WebRTC/MediaDevices API), không cần thiết bị ngoại vi. Backend (`apps/backend`) đã có đủ trường `barcodeEan13` và `qrCodeInternal` trên entity `Product`. Cần bổ sung endpoint lookup theo mã và UI component quét mã cho giao diện POS.

## Technical Context

**Language/Version**: TypeScript 5.x / Node.js 20 (backend), TypeScript 5.x / React 18 (frontend)  
**Primary Dependencies**: NestJS 11 (backend), Next.js 14 + shadcn/ui (frontend), `@zxing/browser` hoặc `html5-qrcode` (barcode decoding trong browser)  
**Storage**: PostgreSQL (dữ liệu sản phẩm đã tồn tại với `barcode_ean13`, `qr_code_internal`)  
**Testing**: Jest (backend unit tests), Playwright (e2e nếu cần)  
**Target Platform**: Web browser (Chrome, Firefox, Safari, Edge) — Desktop và Mobile  
**Project Type**: Web application (monorepo — frontend + backend)  
**Performance Goals**: Quét và tra cứu sản phẩm hoàn tất trong dưới 2 giây  
**Constraints**: Không cài thêm native driver; chỉ dùng WebRTC/MediaDevices API tiêu chuẩn; hỗ trợ fallback HTTPS (camera yêu cầu HTTPS hoặc localhost)  
**Scale/Scope**: Dùng tại điểm POS (<50 phiên đồng thời); lookup theo mã là truy vấn đơn giản

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Mobile-First & Offline-First | ⚠️ Partial | Camera scan yêu cầu kết nối mạng để tra cứu sản phẩm. Fallback thủ công (nhập mã tay) đảm bảo không bị gián đoạn khi offline. |
| II. Monorepo Architecture | ✅ Pass | Tất cả code nằm trong `apps/backend` và `apps/web-base` trong repo hiện tại. |
| III. Scalable Core (Modular Monolith) | ✅ Pass | Endpoint lookup mã vạch thuộc `InventoryModule` — đúng domain boundary. |
| IV. Traceability & Financial Accuracy | ✅ Pass | Scan event ghi log mã đọc được, kết quả, timestamp. Không ảnh hưởng đến giao dịch tài chính trực tiếp. |
| V. Simple & Intuitive UI | ✅ Pass | Dùng shadcn/ui primitives; icon từ lucide-react; không dùng emoji; toast Sonner cho phản hồi quét. |

**Violations requiring justification**: Camera lookup yêu cầu mạng — đây là constraint hợp lý, không thể lookup sản phẩm offline vì DB không sync xuống POS web.

## Project Structure

### Documentation (this feature)

```text
specs/016-pos-barcode-qr-scanner/
├── plan.md              ← file này
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── contracts/           ← Phase 1 output
│   └── api.md
└── tasks.md             ← /speckit.tasks output (NOT created here)
```

### Source Code (repository root)

```text
apps/backend/src/inventory/
├── entities/
│   └── product.entity.ts          # [EXISTING] đã có barcodeEan13, qrCodeInternal
├── products.controller.ts         # [MODIFY] thêm GET /products/lookup-barcode?code=
├── inventory.service.ts           # [MODIFY] thêm findByBarcode(code: string)
└── dto/
    └── barcode-lookup.dto.ts      # [NEW] response DTO cho barcode lookup

apps/web-base/src/
├── app/pos/(app)/
│   ├── page.tsx                   # [MODIFY] tích hợp BarcodeScanner vào POS order flow
│   └── components/
│       ├── BarcodeScanner.tsx     # [NEW] camera scan UI component
│       ├── ScanOverlay.tsx        # [NEW] khung ngắm + hướng dẫn căn chỉnh
│       └── ManualBarcodeInput.tsx # [NEW] fallback nhập tay
├── hooks/
│   └── useBarcodeScan.ts          # [NEW] hook quản lý camera lifecycle + decode logic
└── lib/
    └── barcode.ts                 # [NEW] wrapper cho thư viện decode (zxing/browser)
```

## Complexity Tracking

Không có violation cần justified — feature nằm gọn trong domain hiện tại, không thêm project mới hay pattern phức tạp.

---

## Phase 0: Research

*Output: [research.md](./research.md)*

### Câu hỏi cần giải quyết

1. **Thư viện decode mã vạch nào phù hợp nhất?** (`@zxing/browser` vs `html5-qrcode` vs `quagga2`)
2. **Cách xử lý camera permission và fallback** trên các trình duyệt khác nhau
3. **Debounce logic** để tránh quét trùng lặp khi camera liên tục nhận frame
4. **QR Code nội bộ format** — Agrix đã có format chuẩn chưa? (từ `qrCodeInternal` trong Product entity)

### Kết quả Research

#### Decision 1: Thư viện decode

- **Decision**: Dùng `@zxing/browser` v0.1.x
- **Rationale**: Hỗ trợ EAN-13, QR Code, Code 128. Nhẹ (~150KB gzip). Dùng MediaDevices API native. TypeScript types tốt. Được maintain tích cực. `html5-qrcode` bị abandoned một thời gian. `quagga2` mạnh về EAN nhưng không hỗ trợ QR tốt.
- **Alternatives considered**: `html5-qrcode` (không maintained tốt), `quagga2` (chỉ 1D barcodes), native BarcodeDetector API (không hỗ trợ Safari/Firefox đầy đủ)

#### Decision 2: Camera Permission Flow

- **Decision**: Dùng `navigator.mediaDevices.getUserMedia()` với explicit user gesture (nhấn nút "Quét")
- **Rationale**: Camera phải được user khởi tạo (user gesture requirement). Detect permission state trước với `navigator.permissions.query({name: 'camera'})` để show UI phù hợp.
- **Flow**: Prompt → Granted → Start stream → Denied → Show fallback manual input

#### Decision 3: Debounce & Duplicate Prevention

- **Decision**: Time-based debounce 1500ms sau mỗi lần quét thành công
- **Rationale**: Ngăn cùng mã được xử lý nhiều lần do camera liên tục read frames. 1.5s đủ để thu ngân "lấy sản phẩm ra khỏi vùng quét" và sẵn sàng quét tiếp.
- **Implementation**: `lastScannedCode + timestamp` trong component state, so sánh trước khi trigger lookup.

#### Decision 4: QR Code Nội bộ Format

- **Decision**: Format `AGRIX-{productId}` (UUID) — ví dụ: `AGRIX-550e8400-e29b-41d4-a716-446655440000`
- **Rationale**: Giá trị `qrCodeInternal` trong database đã có format này (xem product.entity.ts). Backend lookup theo exact match `qrCodeInternal = code`.
- **Alternatives**: Dùng SKU làm QR content — bị reject vì SKU có thể chứa ký tự đặc biệt xung đột với EAN-13 lookup chung.

#### Decision 5: Endpoint Strategy

- **Decision**: Một endpoint duy nhất `GET /products/lookup-barcode?code={value}` tự động detect loại mã
- **Rationale**: Đơn giản hóa client. Backend detect: nếu code match regex EAN-13 (13 chữ số) → query `barcodeEan13`; nếu bắt đầu bằng `AGRIX-` → query `qrCodeInternal`; nếu không khớp → 404.
- **Alternatives**: 2 endpoint riêng (`/lookup-ean13`, `/lookup-qr`) — reject vì phức tạp client không cần thiết.

---

## Phase 1: Design & Contracts

### Data Model

*Output: [data-model.md](./data-model.md)*

**Không cần thêm bảng mới** — `products` table đã có `barcode_ean13` và `qr_code_internal`. Cần thêm index nếu chưa có để đảm bảo lookup O(log n).

Xem chi tiết: [data-model.md](./data-model.md)

### API Contracts

*Output: [contracts/api.md](./contracts/api.md)*

#### `GET /products/lookup-barcode`

| Field      | Value                                                                 |
|------------|-----------------------------------------------------------------------|
| URL        | `GET /api/inventory/products/lookup-barcode?code={value}`            |
| Auth       | Bearer JWT (POS session token)                                       |
| Query      | `code` (string, required) — EAN-13 digits hoặc `AGRIX-{uuid}`       |
| Response   | `200 OK` → ProductLookupResponse                                     |
| Error      | `404` sản phẩm không tìm thấy / `400` code không hợp lệ             |

**ProductLookupResponse**:
```json
{
  "id": "uuid",
  "sku": "SP001",
  "name": "Phân bón DAP",
  "barcodeEan13": "1234567890128",
  "qrCodeInternal": "AGRIX-550e8400-...",
  "baseSellPrice": 150000,
  "baseUnit": "kg",
  "currentStockBase": 200,
  "isActive": true,
  "units": [
    { "unitName": "Bao 50kg", "conversionFactor": 50, "sellPrice": 7500000 }
  ]
}
```

Xem chi tiết: [contracts/api.md](./contracts/api.md)

### Component Architecture (Frontend)

```
POS Order Page (page.tsx)
├── <BarcodeScanner> — modal/drawer khi nhấn nút "Quét mã vạch"
│   ├── <ScanOverlay> — video stream + khung ngắm + đèn flash toggle
│   └── useBarcodeScan hook — camera lifecycle, decode, debounce
└── <ManualBarcodeInput> — input field fallback (hiện khi camera fail)
```

**State flow**:
1. User nhấn "Quét mã vạch" → BarcodeScanner mở
2. `useBarcodeScan` → request camera → stream video → ZXing decode per frame
3. Code detected → debounce check → API call `/lookup-barcode?code=...`
4. Success → thêm vào order items → camera tiếp tục ở chế độ chờ
5. Error (404) → toast.error → camera tiếp tục
6. Camera denied → BarcodeScanner đóng → ManualBarcodeInput hiện

### QR Code Generation (Admin)

Sản phẩm không có `qrCodeInternal` → admin có thể generate và download PDF label chứa QR Code. Logic:

- Backend: Nếu `product.qrCodeInternal` null → auto-generate `AGRIX-{product.id}` khi tạo sản phẩm mới
- Frontend admin: Nút "In QR Code" → gọi API → nhận SVG/PNG → print dialog

### Quickstart

*Xem: [quickstart.md](./quickstart.md)*
