CREATE TABLE IF NOT EXISTS weather_baselines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID NOT NULL REFERENCES agricultural_zones(id) ON DELETE CASCADE,
  month SMALLINT NOT NULL,
  avg_temp_c DECIMAL(4, 1) NOT NULL,
  avg_rainfall_mm DECIMAL(6, 1) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_weather_baselines_zone_month UNIQUE (zone_id, month)
);

ALTER TABLE weather_baselines
  DROP CONSTRAINT IF EXISTS chk_weather_baselines_month;

ALTER TABLE weather_baselines
  ADD CONSTRAINT chk_weather_baselines_month
  CHECK (month BETWEEN 1 AND 12);

CREATE INDEX IF NOT EXISTS idx_weather_baselines_zone
  ON weather_baselines(zone_id);
