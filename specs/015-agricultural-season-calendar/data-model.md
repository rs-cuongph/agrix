# Data Model: Lịch Mùa vụ Nông nghiệp

**Feature**: 015-agricultural-season-calendar  
**Phase**: 1 — Design  
**Date**: 2026-04-12

## Schema Overview

```
agricultural_zones  ──────────┐
                               │ (1:N)
crops ─────────────────────────┤
                               │ (N:N via season_calendars)
season_calendars ◄─────────────┘
       │ (1:N)
growth_stages
       │ (1:N)
product_recommendations ──► products (existing)
```

## Table: agricultural_zones

```sql
CREATE TABLE agricultural_zones (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(100) NOT NULL UNIQUE,  -- "Đồng bằng Sông Cửu Long"
  code        VARCHAR(20) NOT NULL UNIQUE,    -- "DBSCL"
  description TEXT,
  provinces   TEXT[],     -- ["Cần Thơ", "An Giang", "Kiên Giang", ...]
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
```

## Table: crops

```sql
CREATE TABLE crops (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(100) NOT NULL UNIQUE,  -- "Cây lúa"
  local_names TEXT[],     -- ["lúa", "lúa nước", "lúa mùa"] cho keyword matching
  category    VARCHAR(50),  -- "Lúa gạo" | "Rau màu" | "Cây công nghiệp" | ...
  description TEXT,
  image_url   TEXT,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_crops_local_names ON crops USING GIN(local_names);
```

## Table: season_calendars

```sql
CREATE TABLE season_calendars (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id     UUID NOT NULL REFERENCES agricultural_zones(id) ON DELETE CASCADE,
  crop_id     UUID NOT NULL REFERENCES crops(id) ON DELETE CASCADE,
  season_name VARCHAR(100) NOT NULL,  -- "Vụ Đông Xuân", "Vụ Hè Thu"
  year        INTEGER DEFAULT NULL,   -- NULL = áp dụng mọi năm
  notes       TEXT,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(zone_id, crop_id, season_name, year)
);

CREATE INDEX idx_season_calendars_zone_crop ON season_calendars(zone_id, crop_id);
```

## Table: growth_stages

```sql
CREATE TABLE growth_stages (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_calendar_id UUID NOT NULL REFERENCES season_calendars(id) ON DELETE CASCADE,
  name              VARCHAR(100) NOT NULL,  -- "Đẻ nhánh", "Trổ bông", "Thu hoạch"
  stage_type        VARCHAR(20) NOT NULL,   -- 'planting' | 'care' | 'harvest'
  start_month       SMALLINT NOT NULL CHECK(start_month BETWEEN 1 AND 12),
  end_month         SMALLINT NOT NULL CHECK(end_month BETWEEN 1 AND 12),
  description       TEXT,  -- Hoạt động khuyến nghị trong giai đoạn
  keywords          TEXT[], -- ["đẻ nhánh", "đẻ chồi"] cho chatbot detection
  sort_order        INTEGER DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_growth_stages_calendar ON growth_stages(season_calendar_id);
CREATE INDEX idx_growth_stages_keywords ON growth_stages USING GIN(keywords);
CREATE INDEX idx_growth_stages_months ON growth_stages(start_month, end_month);
```

## Table: product_recommendations

```sql
CREATE TABLE product_recommendations (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  growth_stage_id  UUID NOT NULL REFERENCES growth_stages(id) ON DELETE CASCADE,
  product_id       UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  reason           TEXT,     -- Lý do gợi ý: "Bón thúc đẻ nhánh cần đạm cao"
  priority         SMALLINT DEFAULT 1 CHECK(priority BETWEEN 1 AND 5),  -- 1=highest
  dosage_note      TEXT,     -- Ghi chú liều lượng: "25-30kg/ha"
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(growth_stage_id, product_id)
);

CREATE INDEX idx_product_recs_stage ON product_recommendations(growth_stage_id);
CREATE INDEX idx_product_recs_product ON product_recommendations(product_id);
```

## TypeORM Entities

### AgriculturalZone Entity
```typescript
// apps/backend/src/season-calendar/entities/agricultural-zone.entity.ts
@Entity('agricultural_zones')
export class AgriculturalZone {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true }) name: string;
  @Column({ unique: true }) code: string;
  @Column({ nullable: true }) description: string;
  @Column({ type: 'text', array: true, nullable: true }) provinces: string[];
  @Column({ name: 'is_active', default: true }) isActive: boolean;
  @OneToMany(() => SeasonCalendar, sc => sc.zone) seasonCalendars: SeasonCalendar[];
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
```

### Crop Entity
```typescript
@Entity('crops')
export class Crop {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true }) name: string;
  @Column({ name: 'local_names', type: 'text', array: true, nullable: true }) localNames: string[];
  @Column({ nullable: true }) category: string;
  @Column({ nullable: true }) description: string;
  @Column({ name: 'image_url', nullable: true }) imageUrl: string;
  @Column({ name: 'is_active', default: true }) isActive: boolean;
  @OneToMany(() => SeasonCalendar, sc => sc.crop) seasonCalendars: SeasonCalendar[];
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
```

*(SeasonCalendar, GrowthStage, ProductRecommendation entities follow same pattern)*

## Seed Data Plan

MVP seed data thực hiện qua TypeORM migration:
- **8 vùng** nông nghiệp với provinces
- **10 cây trồng** MVP với local_names keywords
- **Lịch lúa ĐBSCL** — 3 vụ (Đông Xuân, Hè Thu, Thu Đông) với đầy đủ growth stages
- **Gợi ý sản phẩm mẫu** cho vụ Đông Xuân (gắn với products có `category.name = 'Phân bón'`)
