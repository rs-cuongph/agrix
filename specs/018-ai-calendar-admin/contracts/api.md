# API Contracts: Quản lý Mùa vụ & AI Sinh Lịch Canh tác

**Feature**: 018-ai-calendar-admin  
**Date**: 2026-04-13  
**Base URL**: `/api`

> Chỉ liệt kê endpoint MỚI. Existing CRUD endpoints (POST/PATCH/DELETE calendars, stages, recommendations, pest-warnings) từ feature 015/017 không thay đổi.

---

## Admin Endpoints (Auth Required)

### GET `/admin/season-calendar/calendars` [NEW]

Danh sách tất cả mùa vụ cho trang manage.

**Query params**:
- `zoneId` (optional, UUID) — filter theo vùng
- `cropId` (optional, UUID) — filter theo cây trồng

**Response 200**:
```json
{
  "items": [
    {
      "id": "uuid",
      "seasonName": "Vụ Đông Xuân",
      "year": null,
      "notes": "Gieo sạ cuối năm...",
      "isActive": true,
      "zone": {
        "id": "uuid",
        "name": "Đồng bằng Sông Cửu Long",
        "code": "DBSCL"
      },
      "crop": {
        "id": "uuid",
        "name": "Lúa",
        "category": "Lúa gạo"
      },
      "stageCount": 4,
      "createdAt": "2026-04-13T00:00:00Z"
    }
  ],
  "total": 12
}
```

---

### POST `/admin/season-calendar/ai-generate` [NEW]

AI sinh lịch mùa vụ cho cặp vùng + cây trồng.

**Request body**:
```json
{
  "zoneId": "uuid",
  "cropId": "uuid",
  "userNotes": "Giống robusta Đắk Lắk, có tưới nhỏ giọt"
}
```

- `zoneId` (required) — UUID vùng nông nghiệp
- `cropId` (required) — UUID cây trồng
- `userNotes` (optional) — Ghi chú thêm cho AI context

**Response 200** (success — AI kết quả):
```json
{
  "seasons": [
    {
      "seasonName": "Mùa thu hoạch",
      "notes": "Thu hái cà phê chín đỏ...",
      "stages": [
        {
          "name": "Thu hái",
          "stageType": "harvest",
          "startMonth": 10,
          "endMonth": 12,
          "description": "Thu hái quả cà phê khi chín đỏ trên 80%",
          "keywords": ["thu hái", "hái cà phê"],
          "careActivities": [
            "Hái chọn quả chín đỏ",
            "Phơi ngay sau hái, tránh đống ủ"
          ],
          "sortOrder": 1,
          "pestWarnings": [
            {
              "name": "Mọt đục quả",
              "severity": "medium",
              "symptoms": "Quả bị lỗ nhỏ, bột trắng trong quả",
              "preventionNote": "Phun phòng trước khi quả chín"
            }
          ]
        }
      ]
    }
  ]
}
```

**Response 500** (AI failure):
```json
{
  "statusCode": 500,
  "message": "Không thể tạo lịch tự động. Vui lòng thử lại hoặc nhập thủ công.",
  "error": "AI_GENERATION_FAILED"
}
```

**Timeout**: 30 seconds

**No rate limiting** per clarification.

---

### POST `/admin/season-calendar/bulk-create` [NEW]

Batch save data từ AI preview (sau khi admin review + edit).

**Request body**:
```json
{
  "zoneId": "uuid",
  "cropId": "uuid",
  "replaceExisting": false,
  "seasons": [
    {
      "seasonName": "Vụ Đông Xuân",
      "notes": "...",
      "stages": [
        {
          "name": "Gieo sạ",
          "stageType": "planting",
          "startMonth": 11,
          "endMonth": 12,
          "description": "...",
          "keywords": ["gieo sạ"],
          "careActivities": ["Xử lý giống", "Bón lót"],
          "sortOrder": 1,
          "pestWarnings": [
            {
              "name": "Rầy nâu",
              "severity": "high",
              "symptoms": "Lá vàng úa...",
              "preventionNote": "Phun phòng sớm..."
            }
          ]
        }
      ]
    }
  ]
}
```

- `zoneId` (required) — UUID vùng
- `cropId` (required) — UUID cây trồng
- `replaceExisting` (optional, default false) — nếu true, xóa tất cả calendar cũ của zone+crop trước khi tạo mới
- `seasons` (required) — array mùa vụ với stages

**Response 201** (success):
```json
{
  "calendarsCreated": 3,
  "stagesCreated": 12,
  "pestWarningsCreated": 8,
  "message": "Đã tạo 3 mùa vụ, 12 giai đoạn thành công"
}
```

**Response 400**: Validation error  
**Response 500**: Transaction rollback — không có data nào được tạo

**Transaction**: Atomic — tất cả hoặc không gì cả.

---

### GET `/admin/season-calendar/calendars/:id` [NEW]

Lấy chi tiết 1 mùa vụ với tất cả stages, recommendations, pest warnings.

**Response 200**:
```json
{
  "id": "uuid",
  "seasonName": "Vụ Đông Xuân",
  "year": null,
  "notes": "...",
  "isActive": true,
  "zone": { "id": "uuid", "name": "ĐBSCL", "code": "DBSCL" },
  "crop": { "id": "uuid", "name": "Lúa", "category": "Lúa gạo" },
  "stages": [
    {
      "id": "uuid",
      "name": "Đẻ nhánh",
      "stageType": "care",
      "startMonth": 3,
      "endMonth": 4,
      "description": "...",
      "keywords": ["đẻ nhánh"],
      "careActivities": ["Bón phân đạm 40kg/ha"],
      "sortOrder": 2,
      "recommendations": [
        {
          "id": "uuid",
          "productId": "uuid",
          "product": { "id": "uuid", "name": "Phân NPK", "sku": "PB-001" },
          "reason": "...",
          "priority": 1,
          "dosageNote": "25kg/ha"
        }
      ],
      "pestWarnings": [
        {
          "id": "uuid",
          "name": "Rầy nâu",
          "severity": "high",
          "symptoms": "...",
          "preventionNote": "...",
          "treatmentProducts": [
            { "productId": "uuid", "productName": "Bassa 50EC", "usageNote": "..." }
          ]
        }
      ]
    }
  ],
  "createdAt": "2026-04-13T00:00:00Z"
}
```

**Response 404**: Calendar not found
