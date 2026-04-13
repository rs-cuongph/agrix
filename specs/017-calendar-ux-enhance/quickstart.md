# Quickstart: Nâng cấp UX Lịch Mùa vụ

**Feature**: 017-calendar-ux-enhance  
**Date**: 2026-04-13

## Prerequisites

1. Module 015 fully deployed — all season-calendar entities, seed data, API endpoints working
2. PostgreSQL running with existing season_calendar database
3. `npm run backend:dev` and `npm run web:dev` running

## Verification Steps

### 1. Database Migrations

```bash
# Verify new tables and altered columns exist
psql -d agrix -c "\d growth_stages" | grep care_activities
psql -d agrix -c "\d pest_warnings"
psql -d agrix -c "\d pest_warning_products"
psql -d agrix -c "\d weather_baselines"
psql -d agrix -c "\d season_activity_logs"
```

Expected: all tables/columns exist without errors.

### 2. Weather API

```bash
# Get weather for first zone
ZONE_ID=$(curl -s http://localhost:3001/api/season-calendar/zones | jq -r '.[0].id')
curl -s "http://localhost:3001/api/season-calendar/weather?zoneId=${ZONE_ID}" | jq '.months | length'
```

Expected: `12` (all months seeded).

### 3. Calendar API (enriched response)

```bash
curl -s "http://localhost:3001/api/season-calendar/calendar?zoneId=${ZONE_ID}&month=4" | jq '.items[0].stages[0] | {careActivities, pestWarnings}'
```

Expected: `careActivities` array and `pestWarnings` array present in response.

### 4. Activity Log API

```bash
# Create a test zone to trigger activity log
curl -s -X POST http://localhost:3001/api/admin/season-calendar/zones \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -d '{"name": "Test Zone 017", "code": "TZ017"}'

# Check activity log
curl -s "http://localhost:3001/api/admin/season-calendar/activity-log" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" | jq '.items[0]'
```

Expected: Activity log entry with action="create", entityType="zone", entityName="Test Zone 017".

### 5. Frontend — Timeline View

1. Navigate to `http://localhost:3000/admin/season-calendar`
2. Select vùng "ĐBSCL"
3. Verify 3-mode toggle (Grid / Table / **Timeline**) visible
4. Click "Timeline" → Gantt chart renders with horizontal bars
5. Verify "Hôm nay" indicator at current month column
6. Hover bar → tooltip shows stage name, type, time range
7. Click bar → Sheet opens with enriched detail

### 6. Frontend — Quick Stats

1. Above the calendar grid, verify stats cards show:
   - Count of planting crops (emerald)
   - Count of care crops (blue)
   - Count of harvest crops (amber)
2. Click a stat card → calendar filters to that stage type
3. Change month → stats update accordingly

### 7. Frontend — Search

1. Type "lúa" in search input → calendar filters to lúa entries
2. Type "bắp" → calendar shows Ngô (matched via localNames), with "bắp" badge
3. Clear search → all crops return

### 8. Frontend — Stage Detail Sheet

1. Click any growth stage (from Grid, Table, or Timeline)
2. Verify Sheet contains:
   - Stage info (name, type, time range)
   - Care Activities checklist (checkboxes)
   - Pest Warnings section (if any) with product links
   - Product Suggestions (existing)

### 9. Frontend — Weather Overlay

1. On Timeline view, toggle "Thời tiết" on
2. Verify mini chart appears below month axis
3. Hover month → tooltip shows "T7 — ĐBSCL: 230mm mưa, 28°C"

### 10. Frontend — Activity Log

1. Navigate to `http://localhost:3000/admin/season-calendar/activity-log`
2. Verify timeline-style log entries visible
3. Filter by entity type → results filter
4. Scroll down → infinite scroll loads more entries

## Cleanup

```bash
# Remove test zone
curl -s -X DELETE "http://localhost:3001/api/admin/season-calendar/zones/${TEST_ZONE_ID}" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}"
```
