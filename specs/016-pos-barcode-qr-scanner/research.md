# Research: Barcode/QR Scanner trên Web POS

**Feature**: 016-pos-barcode-qr-scanner  
**Phase**: 0 — Research & Unknowns Resolution  
**Date**: 2026-04-12

## Q1: Thư viện decode mã vạch

| | `@zxing/browser` | `html5-qrcode` | `quagga2` | BarcodeDetector API |
|---|---|---|---|---|
| EAN-13 | ✅ | ✅ | ✅ | ✅ |
| QR Code | ✅ | ✅ | ❌ | ✅ |
| TypeScript | ✅ Native | Partial | Partial | Browser native |
| Bundle size | ~150KB gz | ~200KB gz | ~180KB gz | 0KB |
| Browser support | Chrome, FF, Safari, Edge | Chrome, FF, Safari | Chrome, FF | Chrome only (cơ bản) |
| Maintenance | Active | Sporadic | Active | N/A |

**Decision**: `@zxing/browser` v0.1.x  
**Rationale**: Hỗ trợ đầy đủ EAN-13 + QR Code, TypeScript native, maintained tốt.

## Q2: Camera Permission & Browser Compatibility

```
iOS Safari: yêu cầu HTTPS + user gesture
Android Chrome: yêu cầu HTTPS (localhost được phép)
Desktop Chrome: HTTPS hoặc localhost
Desktop Firefox: HTTPS
Desktop Safari: HTTPS

Permission flow:
navigator.permissions.query({ name: 'camera' })
  → 'granted'  : start camera immediately
  → 'prompt'   : show UI instruction → request camera
  → 'denied'   : show manual input fallback + instructions to unblock
```

**Decision**: Progressive enhancement — detect → request → fallback  
**Key constraint**: POS web phải chạy trên HTTPS (đã deployed với Nginx + Let's Encrypt)

## Q3: Debounce Strategy

```
Naïve approach (rejected): setTimeout reset — bị phá vỡ nếu timer bị garbage collected

Adopted approach:
const lastScan = useRef<{ code: string; time: number } | null>(null);

onDecode(code) {
  const now = Date.now();
  if (lastScan.current?.code === code && 
      now - lastScan.current.time < 1500) return; // debounce
  lastScan.current = { code, time: now };
  handleLookup(code);
}
```

**Decision**: Ref-based debounce với 1500ms window  
**Rationale**: Không tạo timer phụ, không bị memory leak, hoạt động đúng trong closure.

## Q4: QR Code Nội bộ Format

Từ `product.entity.ts`:
```typescript
@Column({ name: 'qr_code_internal', unique: true, nullable: true })
qrCodeInternal: string;
```

**Decision**: Format `AGRIX-{uuid}` — e.g., `AGRIX-550e8400-e29b-41d4-a716-446655440000`  
**Auto-generation**: Khi tạo sản phẩm mới (POST /products), nếu `qrCodeInternal` không được truyền vào, backend tự-generate `AGRIX-{product.id}` sau khi insert.

## Q5: Lookup Endpoint Strategy

```
Single endpoint: GET /inventory/products/lookup-barcode?code=VALUE

Detection logic (backend):
if (/^\d{13}$/.test(code))   → query WHERE barcode_ean13 = code
if (code.startsWith('AGRIX-')) → query WHERE qr_code_internal = code  
else → 400 Bad Request ("Định dạng mã không hợp lệ")
```

**Decision**: Single unified endpoint  
**Rationale**: Client không cần biết loại mã, backenddetect tự động; dễ test và dễ extend sau.

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
|------|------------|-----------|
| Camera bị block bởi browser security | Medium | Hướng dẫn user enable, fallback manual input |
| ZXing không decode được mã in xấu | Low | UI guideline (khoảng cách, ánh sáng) + torch toggle |
| Safari iOS quirks với getUserMedia | Medium | Test trên iOS Safari sớm, dùng `facingMode: 'environment'` |
| QR Code nội bộ chưa được generate cho sản phẩm cũ | High | Migration script tự-backfill `AGRIX-{id}` cho tất cả sản phẩm hiện có |
