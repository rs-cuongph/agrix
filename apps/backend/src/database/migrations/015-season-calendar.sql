CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS agricultural_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(20) NOT NULL UNIQUE,
  description TEXT,
  provinces TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  local_names TEXT[],
  category VARCHAR(50),
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS season_calendars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID NOT NULL REFERENCES agricultural_zones(id) ON DELETE CASCADE,
  crop_id UUID NOT NULL REFERENCES crops(id) ON DELETE CASCADE,
  season_name VARCHAR(100) NOT NULL,
  year INTEGER,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE season_calendars
  DROP CONSTRAINT IF EXISTS uq_season_calendars_zone_crop_season_year;

ALTER TABLE season_calendars
  ADD CONSTRAINT uq_season_calendars_zone_crop_season_year
  UNIQUE NULLS NOT DISTINCT (zone_id, crop_id, season_name, year);

CREATE TABLE IF NOT EXISTS growth_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_calendar_id UUID NOT NULL REFERENCES season_calendars(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  stage_type VARCHAR(20) NOT NULL,
  start_month SMALLINT NOT NULL,
  end_month SMALLINT NOT NULL,
  description TEXT,
  keywords TEXT[],
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE growth_stages
  DROP CONSTRAINT IF EXISTS chk_growth_stages_stage_type;

ALTER TABLE growth_stages
  ADD CONSTRAINT chk_growth_stages_stage_type
  CHECK (stage_type IN ('planting', 'care', 'harvest'));

ALTER TABLE growth_stages
  DROP CONSTRAINT IF EXISTS chk_growth_stages_start_month;

ALTER TABLE growth_stages
  ADD CONSTRAINT chk_growth_stages_start_month
  CHECK (start_month BETWEEN 1 AND 12);

ALTER TABLE growth_stages
  DROP CONSTRAINT IF EXISTS chk_growth_stages_end_month;

ALTER TABLE growth_stages
  ADD CONSTRAINT chk_growth_stages_end_month
  CHECK (end_month BETWEEN 1 AND 12);

CREATE TABLE IF NOT EXISTS product_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  growth_stage_id UUID NOT NULL REFERENCES growth_stages(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  reason TEXT,
  priority SMALLINT NOT NULL DEFAULT 1,
  dosage_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE product_recommendations
  DROP CONSTRAINT IF EXISTS uq_product_recommendations_stage_product;

ALTER TABLE product_recommendations
  ADD CONSTRAINT uq_product_recommendations_stage_product
  UNIQUE (growth_stage_id, product_id);

ALTER TABLE product_recommendations
  DROP CONSTRAINT IF EXISTS chk_product_recommendations_priority;

ALTER TABLE product_recommendations
  ADD CONSTRAINT chk_product_recommendations_priority
  CHECK (priority BETWEEN 1 AND 5);

CREATE INDEX IF NOT EXISTS idx_crops_local_names
  ON crops USING GIN (local_names);

CREATE INDEX IF NOT EXISTS idx_season_calendars_zone_crop
  ON season_calendars(zone_id, crop_id);

CREATE INDEX IF NOT EXISTS idx_growth_stages_calendar
  ON growth_stages(season_calendar_id);

CREATE INDEX IF NOT EXISTS idx_growth_stages_keywords
  ON growth_stages USING GIN (keywords);

CREATE INDEX IF NOT EXISTS idx_growth_stages_months
  ON growth_stages(start_month, end_month);

CREATE INDEX IF NOT EXISTS idx_product_recommendations_stage
  ON product_recommendations(growth_stage_id);

CREATE INDEX IF NOT EXISTS idx_product_recommendations_product
  ON product_recommendations(product_id);
