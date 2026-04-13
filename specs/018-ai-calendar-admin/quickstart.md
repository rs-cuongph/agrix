# Quickstart: Quản lý Mùa vụ & AI Sinh Lịch Canh tác

**Feature**: 018-ai-calendar-admin  
**Date**: 2026-04-13

## Prerequisites

1. Features 015 + 017 fully deployed — season-calendar entities, APIs, seed data, AI module
2. PostgreSQL running with season_calendars, growth_stages, pest_warnings tables
3. AI API keys configured (OpenAI or Gemini) — qua admin ChatBot Config page
4. `npm run backend:dev` and `npm run web:dev` running

## Verification Steps

### 1. Admin Calendar List API

```bash
ADMIN_TOKEN=<your-token>
curl -s "http://localhost:3001/api/admin/season-calendar/calendars" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" | jq '.total'
```

Expected: number ≥ 3 (seed data from 015)

### 2. Admin Calendar Detail API

```bash
CAL_ID=$(curl -s "http://localhost:3001/api/admin/season-calendar/calendars" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" | jq -r '.items[0].id')

curl -s "http://localhost:3001/api/admin/season-calendar/calendars/${CAL_ID}" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" | jq '{seasonName, stageCount: (.stages | length)}'
```

Expected: object with seasonName + stages array.

### 3. AI Generate API

```bash
ZONE_ID=$(curl -s http://localhost:3001/api/season-calendar/zones -H "Authorization: Bearer ${ADMIN_TOKEN}" | jq -r '.[0].id')
CROP_ID=$(curl -s http://localhost:3001/api/season-calendar/crops -H "Authorization: Bearer ${ADMIN_TOKEN}" | jq -r '.[-1].id')

curl -s -X POST "http://localhost:3001/api/admin/season-calendar/ai-generate" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"zoneId\": \"${ZONE_ID}\", \"cropId\": \"${CROP_ID}\"}" | jq '.seasons | length'
```

Expected: number ≥ 1 (AI generated at least 1 season). May take 5-15 seconds.

### 4. Bulk Create API

```bash
# Use AI result to bulk-create (simplified example)
curl -s -X POST "http://localhost:3001/api/admin/season-calendar/bulk-create" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"zoneId\": \"${ZONE_ID}\",
    \"cropId\": \"${CROP_ID}\",
    \"seasons\": [{
      \"seasonName\": \"Test Vụ 018\",
      \"stages\": [{
        \"name\": \"Test Stage\",
        \"stageType\": \"planting\",
        \"startMonth\": 1,
        \"endMonth\": 2,
        \"sortOrder\": 1
      }]
    }]
  }" | jq '.'
```

Expected: `{ "calendarsCreated": 1, "stagesCreated": 1, ... }`

### 5. Frontend — Manage Page Navigation

1. Navigate to `http://localhost:3000/admin/season-calendar`
2. Verify "Quản lý dữ liệu" navigation button visible
3. Click → navigates to `/admin/season-calendar/manage`

### 6. Frontend — Calendar List Table

1. On `/admin/season-calendar/manage`:
2. Verify table shows: tên vụ, vùng, cây trồng, số giai đoạn, trạng thái, ngày tạo
3. Filter by zone → table filters
4. Filter by crop → table filters

### 7. Frontend — Create Calendar (Manual CRUD)

1. Click "Thêm mùa vụ"
2. Select vùng, cây trồng, nhập tên "Test Vụ"
3. Click "Lưu" → toast success → row appears in table

### 8. Frontend — Calendar Detail (Stage Management)

1. Click vào row vừa tạo → navigate to `/manage/[id]`
2. Verify page shows calendar info + "Giai đoạn" section (empty)
3. Click "Thêm giai đoạn" → fill form → save → stage appears
4. Expand stage → verify recommendations + pest warnings sections

### 9. Frontend — AI Generate Flow

1. On `/admin/season-calendar/manage`, click "AI tạo lịch"
2. Select vùng "Tây Nguyên" + crop "Cà phê"
3. Click "Tạo lịch" → loading spinner 5-15s
4. Preview appears: accordion of seasons + stages
5. Edit a season name (inline edit works)
6. Remove a stage (click X)
7. Click "Lưu tất cả" → toast "Đã tạo X mùa vụ..."
8. Navigate back to manage page → new calendars in table

### 10. Frontend — Duplicate Warning

1. Re-run AI generate for same vùng + crop
2. Verify warning dialog: "Vùng này đã có X mùa vụ cho cây Y"
3. Choose "Tạo thêm" → generates additional seasons

## Cleanup

```bash
# Remove test calendar
curl -s -X DELETE "http://localhost:3001/api/admin/season-calendar/calendars/${TEST_CAL_ID}" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}"
```
