CREATE TABLE IF NOT EXISTS pest_warnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  growth_stage_id UUID NOT NULL REFERENCES growth_stages(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  symptoms TEXT,
  severity VARCHAR(10) NOT NULL DEFAULT 'medium',
  prevention_note TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE pest_warnings
  DROP CONSTRAINT IF EXISTS chk_pest_warnings_severity;

ALTER TABLE pest_warnings
  ADD CONSTRAINT chk_pest_warnings_severity
  CHECK (severity IN ('low', 'medium', 'high'));

CREATE INDEX IF NOT EXISTS idx_pest_warnings_stage
  ON pest_warnings(growth_stage_id);

CREATE TABLE IF NOT EXISTS pest_warning_products (
  pest_warning_id UUID NOT NULL REFERENCES pest_warnings(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  usage_note TEXT,
  PRIMARY KEY (pest_warning_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_pest_warning_products_product
  ON pest_warning_products(product_id);
