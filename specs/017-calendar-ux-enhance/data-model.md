# Data Model: Nâng cấp UX Lịch Mùa vụ

**Feature**: 017-calendar-ux-enhance  
**Phase**: 1 — Design  
**Date**: 2026-04-13  
**Prerequisite**: Module 015 schema (agricultural_zones, crops, season_calendars, growth_stages, product_recommendations) must exist.

## Schema Overview (Changes Only)

```
[EXISTING]                                    [NEW / MODIFIED]
growth_stages ◄──── pest_warnings             [NEW TABLE]
     │  └── FK → products (treatment)
     │
     │ (ALTER TABLE: +care_activities text[])  [MODIFY]
     │
weather_baselines ──► agricultural_zones       [NEW TABLE]

season_activity_logs                           [NEW TABLE, standalone]
```

## ALTER TABLE: growth_stages

```sql
-- Add careActivities column to existing growth_stages table
ALTER TABLE growth_stages
  ADD COLUMN care_activities TEXT[];

-- No index needed — only used for display, not filtering
COMMENT ON COLUMN growth_stages.care_activities IS 'Danh sách hoạt động chăm sóc dạng checklist, VD: ["Bón phân đạm 40kg/ha", "Tưới nước giữ 5cm"]';
```

## NEW TABLE: pest_warnings

```sql
CREATE TABLE pest_warnings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  growth_stage_id   UUID NOT NULL REFERENCES growth_stages(id) ON DELETE CASCADE,
  name              VARCHAR(150) NOT NULL,       -- "Rầy nâu", "Bệnh đạo ôn"
  symptoms          TEXT,                        -- "Lá vàng úa, cây chết rạp"
  severity          VARCHAR(10) NOT NULL DEFAULT 'medium'
                    CHECK (severity IN ('low', 'medium', 'high')),
  prevention_note   TEXT,                        -- "Phun phòng sớm khi thấy rầy bay"
  sort_order        INT DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pest_warnings_stage ON pest_warnings(growth_stage_id);
```

### Relationship: pest_warnings ↔ products (N:N)

```sql
CREATE TABLE pest_warning_products (
  pest_warning_id   UUID NOT NULL REFERENCES pest_warnings(id) ON DELETE CASCADE,
  product_id        UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  usage_note        TEXT,         -- "Phun 2ml/L nước, sáng sớm"
  PRIMARY KEY (pest_warning_id, product_id)
);
```

**Reasoning**: Một pest warning có thể gợi ý nhiều sản phẩm phòng trị. Một sản phẩm có thể trị nhiều loại sâu bệnh. Join table `pest_warning_products` là N:N thuần.

## NEW TABLE: weather_baselines

```sql
CREATE TABLE weather_baselines (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id        UUID NOT NULL REFERENCES agricultural_zones(id) ON DELETE CASCADE,
  month          SMALLINT NOT NULL CHECK (month BETWEEN 1 AND 12),
  avg_temp_c     DECIMAL(4,1) NOT NULL,    -- VD: 27.5
  avg_rainfall_mm DECIMAL(6,1) NOT NULL,   -- VD: 230.0
  notes          TEXT,                      -- "Mùa mưa bắt đầu"
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (zone_id, month)
);

CREATE INDEX idx_weather_baselines_zone ON weather_baselines(zone_id);
```

**Seed data**: 8 vùng × 12 tháng = 96 rows. Nguồn: Trung bình khí hậu Việt Nam (Wikipedia/Tổng cục KTTV).

## NEW TABLE: season_activity_logs

```sql
CREATE TABLE season_activity_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id     UUID NOT NULL,               -- FK conceptual → users table
  actor_name   VARCHAR(100) NOT NULL,        -- Denormalized for display
  action       VARCHAR(10) NOT NULL CHECK (action IN ('create', 'update', 'delete')),
  entity_type  VARCHAR(30) NOT NULL,         -- 'zone'|'crop'|'calendar'|'stage'|'recommendation'|'pest_warning'|'weather'
  entity_id    UUID NOT NULL,
  entity_name  VARCHAR(200) NOT NULL,        -- "Cây lúa", "Giai đoạn Đẻ nhánh"
  metadata     JSONB,                        -- { "changes": {"name": ["old", "new"]} }
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_created ON season_activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_entity  ON season_activity_logs(entity_type, created_at DESC);
```

**Retention**: Scheduled CRON job purge entries WHERE `created_at < NOW() - INTERVAL '6 months'`.

**No updated_at**: Logs are immutable — write-once, never updated.

## Entity Relationships Summary

```
growth_stages              pest_warnings           pest_warning_products       products
┌──────────────┐    1:N   ┌──────────────┐   N:N   ┌──────────────────┐   N:1  ┌──────────┐
│ id           │◄─────────│ growth_stage_id│────────│ pest_warning_id  │───────►│ id       │
│ ...          │          │ name          │        │ product_id       │       │ name     │
│ care_activities [NEW]   │ symptoms      │        │ usage_note       │       │ ...      │
│              │          │ severity      │        └──────────────────┘       └──────────┘
└──────────────┘          │ prevention_note│
                          └──────────────┘

agricultural_zones         weather_baselines
┌──────────────┐    1:N   ┌──────────────┐
│ id           │◄─────────│ zone_id       │
│ name         │          │ month         │
│ ...          │          │ avg_temp_c    │
└──────────────┘          │ avg_rainfall_mm│
                          └──────────────┘

season_activity_logs (standalone — no FK constraints for performance)
┌──────────────┐
│ actor_id     │
│ actor_name   │
│ action       │
│ entity_type  │
│ entity_id    │
│ entity_name  │
│ metadata     │
│ created_at   │
└──────────────┘
```

## Migration Plan

1. **017-01-alter-growth-stages**: `ALTER TABLE growth_stages ADD COLUMN care_activities TEXT[]`
2. **017-02-create-pest-warnings**: CREATE TABLE pest_warnings + pest_warning_products + indexes
3. **017-03-create-weather-baselines**: CREATE TABLE + UNIQUE constraint + index
4. **017-04-create-activity-logs**: CREATE TABLE + indexes
5. **017-05-seed-weather-data**: INSERT 96 rows (8 vùng × 12 tháng) khí hậu trung bình
6. **017-06-seed-pest-warnings**: INSERT sample pest warnings cho growth stages lúa ĐBSCL (Rầy nâu, Đạo ôn, Sâu cuốn lá) với product links
