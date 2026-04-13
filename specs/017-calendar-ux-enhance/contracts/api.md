# API Contracts: Nâng cấp UX Lịch Mùa vụ

**Feature**: 017-calendar-ux-enhance  
**Date**: 2026-04-13  
**Base URL**: `/api`

> Only NEW and MODIFIED endpoints listed. Existing 015 endpoints remain unchanged.

---

## Public Endpoints (No Auth Required)

### GET `/season-calendar/calendar` [MODIFY]

Response now includes `pestWarnings` and `careActivities` in each stage.

**Modified response shape** (additions marked with `// NEW`):

```json
{
  "zone": { "id": "uuid", "name": "ĐBSCL", "code": "DBSCL" },
  "month": 4,
  "items": [
    {
      "id": "uuid",
      "seasonName": "Vụ Đông Xuân",
      "year": null,
      "notes": null,
      "crop": { "id": "uuid", "name": "Cây lúa", "category": "Lúa gạo", "localNames": ["lúa", "lúa nước"] },
      "currentStage": { "id": "uuid", "name": "Đẻ nhánh", "stageType": "care" },
      "stages": [
        {
          "id": "uuid",
          "name": "Đẻ nhánh",
          "stageType": "care",
          "startMonth": 2,
          "endMonth": 4,
          "description": "Giai đoạn cây lúa tạo nhánh mới...",
          "keywords": ["đẻ nhánh", "phân đạm"],
          "sortOrder": 2,
          "careActivities": ["Bón phân đạm 40kg/ha", "Tưới nước giữ 5cm"],    // NEW
          "pestWarnings": [                                                      // NEW
            {
              "id": "uuid",
              "name": "Rầy nâu",
              "symptoms": "Lá vàng úa, cây chết rạp từng đám",
              "severity": "high",
              "preventionNote": "Phun phòng sớm khi mật độ > 3 con/dảnh",
              "treatmentProducts": [
                {
                  "productId": "uuid",
                  "productName": "Thuốc trừ rầy Bassa 50EC",
                  "productSku": "BASSA50",
                  "usageNote": "Phun 2ml/L nước, sáng sớm"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

---

### GET `/season-calendar/weather?zoneId=` [NEW]

Trả về dữ liệu khí hậu trung bình 12 tháng cho 1 vùng.

**Query params**:
- `zoneId` (required, UUID)

**Response 200**:
```json
{
  "zoneId": "uuid",
  "zoneName": "ĐBSCL",
  "months": [
    { "month": 1, "avgTempC": 25.2, "avgRainfallMm": 10.5, "notes": null },
    { "month": 2, "avgTempC": 26.0, "avgRainfallMm": 5.3, "notes": null },
    ...
    { "month": 12, "avgTempC": 25.8, "avgRainfallMm": 30.0, "notes": "Mùa khô bắt đầu" }
  ]
}
```

**Response 404**: Zone not found  
**Response 200 (empty)**: `{ "zoneId": "uuid", "zoneName": "...", "months": [] }` — no weather data for zone

---

## Admin Endpoints (Auth Required)

### Pest Warnings CRUD

#### GET `/admin/season-calendar/stages/:stageId/pest-warnings` [NEW]

List pest warnings for a growth stage.

**Response 200**:
```json
[
  {
    "id": "uuid",
    "growthStageId": "uuid",
    "name": "Rầy nâu",
    "symptoms": "Lá vàng úa...",
    "severity": "high",
    "preventionNote": "Phun phòng sớm...",
    "sortOrder": 0,
    "treatmentProducts": [
      { "productId": "uuid", "productName": "Bassa 50EC", "usageNote": "..." }
    ]
  }
]
```

#### POST `/admin/season-calendar/stages/:stageId/pest-warnings` [NEW]

Create pest warning for a stage.

**Request body**:
```json
{
  "name": "Rầy nâu",
  "symptoms": "Lá vàng úa, cây chết rạp",
  "severity": "high",
  "preventionNote": "Phun phòng sớm khi mật độ > 3 con/dảnh",
  "sortOrder": 0,
  "treatmentProductIds": ["uuid1", "uuid2"],
  "usageNotes": { "uuid1": "Phun 2ml/L nước", "uuid2": "Rải hạt quanh gốc" }
}
```

**Response 201**: Created pest warning object

#### PATCH `/admin/season-calendar/pest-warnings/:id` [NEW]

Update pest warning.

**Request body**: Partial of POST body  
**Response 200**: Updated object

#### DELETE `/admin/season-calendar/pest-warnings/:id` [NEW]

**Response 204**: No content

---

### Weather Baselines CRUD

#### GET `/admin/season-calendar/weather` [NEW]

List all weather baselines, optionally filtered by zone.

**Query params**: `zoneId` (optional)  
**Response 200**: Array of `{ id, zoneId, month, avgTempC, avgRainfallMm, notes }`

#### POST `/admin/season-calendar/weather` [NEW]

Create or upsert weather baseline for zone + month.

**Request body**:
```json
{
  "zoneId": "uuid",
  "month": 4,
  "avgTempC": 28.5,
  "avgRainfallMm": 120.0,
  "notes": "Đầu mùa mưa"
}
```

**Response 201**: Created/upserted object  
**Conflict**: If (zoneId, month) already exists, upsert (update values).

#### DELETE `/admin/season-calendar/weather/:id` [NEW]

**Response 204**: No content

---

### Activity Log

#### GET `/admin/season-calendar/activity-log` [NEW]

List activity log entries with pagination and filters.

**Query params**:
- `page` (optional, default 1)
- `limit` (optional, default 20, max 50)
- `entityType` (optional, filter by: zone/crop/calendar/stage/recommendation/pest_warning/weather)
- `fromDate` (optional, ISO date — max 6 months back)
- `toDate` (optional, ISO date)

**Response 200**:
```json
{
  "items": [
    {
      "id": "uuid",
      "actorId": "uuid",
      "actorName": "Admin Cường",
      "action": "update",
      "entityType": "stage",
      "entityId": "uuid",
      "entityName": "Giai đoạn Đẻ nhánh — Cây lúa — ĐBSCL",
      "metadata": { "changes": { "description": ["old text", "new text"] } },
      "createdAt": "2026-04-13T20:15:00Z"
    }
  ],
  "total": 142,
  "page": 1,
  "limit": 20
}
```

---

## Admin Calendar Endpoint Modification

### PATCH `/admin/season-calendar/stages/:id` [MODIFY]

**Added field** in request body:
```json
{
  "careActivities": ["Bón phân đạm 40kg/ha", "Tưới nước giữ 5cm"]
}
```

Existing fields unchanged. `careActivities` is optional — omit to keep current value.
