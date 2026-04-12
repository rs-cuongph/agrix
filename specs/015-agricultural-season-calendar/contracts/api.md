# API Contracts: Lịch Mùa vụ Nông nghiệp

**Feature**: 015-agricultural-season-calendar  
**Phase**: 1 — Design  
**Date**: 2026-04-12

## Public/POS Endpoints

### GET /season-calendar/zones — Danh sách vùng nông nghiệp

```
GET /api/season-calendar/zones
Authorization: Bearer {jwt_token}
```

**Response 200:**
```json
[
  {
    "id": "uuid",
    "name": "Đồng bằng Sông Cửu Long",
    "code": "DBSCL",
    "provinces": ["Cần Thơ", "An Giang", "Kiên Giang"]
  }
]
```

---

### GET /season-calendar/crops — Danh sách cây trồng

```
GET /api/season-calendar/crops?zoneId={uuid}
Authorization: Bearer {jwt_token}
```

**Query params**: `zoneId` (optional) — lọc cây có lịch mùa vụ tại vùng đó

**Response 200:**
```json
[
  { "id": "uuid", "name": "Cây lúa", "category": "Lúa gạo", "imageUrl": "..." }
]
```

---

### GET /season-calendar/calendar — Lịch mùa vụ

```
GET /api/season-calendar/calendar?zoneId={uuid}&month={1-12}&cropId={uuid?}
Authorization: Bearer {jwt_token}
```

**Response 200:**
```json
{
  "zone": { "id": "uuid", "name": "Đồng bằng Sông Cửu Long" },
  "month": 4,
  "items": [
    {
      "crop": { "id": "uuid", "name": "Cây lúa" },
      "seasonName": "Vụ Hè Thu",
      "currentStage": {
        "id": "uuid",
        "name": "Đẻ nhánh",
        "stageType": "care",
        "description": "Bón phân để thúc đẻ nhánh, giữ mực nước 5-10cm"
      }
    }
  ]
}
```

---

### GET /season-calendar/suggest — AI Gợi ý Sản phẩm

```
GET /api/season-calendar/suggest?zoneId={uuid}&month={1-12}&cropId={uuid}&stageId={uuid?}
Authorization: Bearer {jwt_token}
```

**Response 200:**
```json
{
  "context": {
    "zone": "Đồng bằng Sông Cửu Long",
    "crop": "Cây lúa",
    "stage": "Đẻ nhánh",
    "month": 4
  },
  "explanation": "Giai đoạn đẻ nhánh cây lúa cần bổ sung đạm (N) để kích thích đẻ nhánh mạnh...",
  "products": [
    {
      "id": "uuid",
      "name": "Phân bón DAP 18-46-0",
      "sku": "SP-DAP",
      "baseSellPrice": 850000,
      "baseUnit": "kg",
      "currentStockBase": 1000,
      "reason": "Giàu đạm và lân, phù hợp giai đoạn đẻ nhánh",
      "dosageNote": "25-30 kg/ha",
      "priority": 1
    }
  ]
}
```

---

## Admin CRUD Endpoints

### Zones

```
POST   /api/admin/season-calendar/zones          # Tạo vùng mới
PATCH  /api/admin/season-calendar/zones/:id      # Cập nhật vùng
DELETE /api/admin/season-calendar/zones/:id      # Xóa vùng (soft delete)
```

### Crops

```
POST   /api/admin/season-calendar/crops          # Tạo cây trồng mới
PATCH  /api/admin/season-calendar/crops/:id      # Cập nhật
DELETE /api/admin/season-calendar/crops/:id      # Xóa (soft delete)
```

### Season Calendars & Growth Stages

```
POST   /api/admin/season-calendar/calendars                      # Tạo lịch mùa vụ
PATCH  /api/admin/season-calendar/calendars/:id                  # Cập nhật
POST   /api/admin/season-calendar/calendars/:id/stages           # Thêm giai đoạn
PATCH  /api/admin/season-calendar/stages/:id                     # Cập nhật giai đoạn
DELETE /api/admin/season-calendar/stages/:id                     # Xóa giai đoạn
```

### Product Recommendations

```
POST   /api/admin/season-calendar/stages/:stageId/recommendations  # Thêm gợi ý
DELETE /api/admin/season-calendar/recommendations/:id              # Xóa gợi ý
```

---

## Chatbot Integration Contract

Không phải HTTP endpoint. Là service-level injection trong `ai.controller.ts`:

```typescript
// Existing: chatbotService.ask(question, productContext?)
// New: SeasonChatbotContextService.buildContext(question) → string | null

// Modified flow in ai.controller.ts:
const seasonContext = await this.seasonChatbotContextService.buildContext(question);
const response = await this.chatbotService.ask(question, seasonContext ?? productContext);
```

**Context format** (string injected vào productContext):
```
[MÙA VỤ] Cây lúa - Giai đoạn Đẻ nhánh (Vụ Hè Thu - ĐBSCL, Tháng 4):
Hoạt động: Bón phân thúc, giữ mực nước 5-10cm
Sản phẩm phù hợp:
- Phân bón DAP 18-46-0 (SKU: SP-DAP) - 850.000đ/kg - Còn 1000kg - Lý do: Giàu đạm và lân
- Phân Urê 46% (SKU: SP-URE) - 12.000đ/kg - Còn 500kg - Lý do: Bổ sung đạm đơn
```
