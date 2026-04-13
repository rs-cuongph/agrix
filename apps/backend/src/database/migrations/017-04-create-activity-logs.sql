CREATE TABLE IF NOT EXISTS season_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL,
  actor_name VARCHAR(100) NOT NULL,
  action VARCHAR(10) NOT NULL,
  entity_type VARCHAR(30) NOT NULL,
  entity_id UUID NOT NULL,
  entity_name VARCHAR(200) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE season_activity_logs
  DROP CONSTRAINT IF EXISTS chk_activity_logs_action;

ALTER TABLE season_activity_logs
  ADD CONSTRAINT chk_activity_logs_action
  CHECK (action IN ('create', 'update', 'delete'));

CREATE INDEX IF NOT EXISTS idx_activity_logs_created
  ON season_activity_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activity_logs_entity
  ON season_activity_logs(entity_type, created_at DESC);
