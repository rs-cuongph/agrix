ALTER TABLE growth_stages
  ADD COLUMN IF NOT EXISTS care_activities TEXT[];

COMMENT ON COLUMN growth_stages.care_activities
  IS 'Danh sách hoạt động chăm sóc dạng checklist theo từng giai đoạn.';
