WITH stage_seed AS (
  SELECT
    gs.id AS growth_stage_id,
    gs.name AS stage_name
  FROM growth_stages gs
  JOIN season_calendars sc
    ON sc.id = gs.season_calendar_id
  JOIN agricultural_zones zone
    ON zone.id = sc.zone_id
  JOIN crops crop
    ON crop.id = sc.crop_id
  WHERE zone.code = 'DBSCL'
    AND crop.name = 'Lúa'
    AND gs.name IN ('Đẻ nhánh', 'Làm đòng và trổ')
),
warning_seed AS (
  SELECT *
  FROM (
    VALUES
      ('Đẻ nhánh', 'Rầy nâu', 'Lá vàng úa, cây lúa chậm phát triển và xuất hiện từng chòm rầy quanh gốc.', 'high', 'Giữ mật độ gieo sạ hợp lý và thăm đồng định kỳ 3 ngày/lần.', 0, ARRAY['Bón phân đạm 40kg/ha', 'Giữ mực nước 3-5cm', 'Theo dõi mật độ rầy cuối chiều']::text[]),
      ('Làm đòng và trổ', 'Đạo ôn', 'Vết cháy hình thoi trên lá, cổ bông dễ khô và lép.', 'medium', 'Giữ ruộng thông thoáng, hạn chế bón thừa đạm khi thời tiết ẩm.', 1, ARRAY['Bổ sung kali trước trổ', 'Thăm đồng sau mưa 24 giờ', 'Tỉa bớt lá già sát gốc']::text[]),
      ('Đẻ nhánh', 'Sâu cuốn lá', 'Lá non bị cuốn, giảm diện tích quang hợp.', 'medium', 'Theo dõi mật độ sâu non và giữ thiên địch trong ruộng.', 2, ARRAY['Quan sát lá non buổi sáng', 'Luân phiên thuốc nếu mật độ cao']::text[])
  ) AS seed(stage_name, name, symptoms, severity, prevention_note, sort_order, care_activities)
)
UPDATE growth_stages gs
SET care_activities = seed.care_activities
FROM warning_seed seed
WHERE gs.id IN (SELECT growth_stage_id FROM stage_seed)
  AND gs.name = seed.stage_name
  AND gs.care_activities IS NULL;

INSERT INTO pest_warnings (
  id,
  growth_stage_id,
  name,
  symptoms,
  severity,
  prevention_note,
  sort_order
)
SELECT
  gen_random_uuid(),
  stage_seed.growth_stage_id,
  seed.name,
  seed.symptoms,
  seed.severity,
  seed.prevention_note,
  seed.sort_order
FROM warning_seed seed
JOIN stage_seed
  ON stage_seed.stage_name = seed.stage_name
WHERE NOT EXISTS (
  SELECT 1
  FROM pest_warnings existing
  WHERE existing.growth_stage_id = stage_seed.growth_stage_id
    AND existing.name = seed.name
);

INSERT INTO pest_warning_products (pest_warning_id, product_id, usage_note)
SELECT
  warning.id,
  product.id,
  seed.usage_note
FROM (
  VALUES
    ('Rầy nâu', 'TTS-001', 'Phun sáng sớm hoặc chiều mát theo liều trên bao bì.'),
    ('Đạo ôn', 'PB-001', 'Kết hợp dinh dưỡng cân đối để tăng sức chống chịu.'),
    ('Sâu cuốn lá', 'TTS-002', 'Phun khi sâu tuổi nhỏ, lặp lại sau 5-7 ngày nếu cần.')
) AS seed(warning_name, product_sku, usage_note)
JOIN pest_warnings warning
  ON warning.name = seed.warning_name
JOIN products product
  ON product.sku = seed.product_sku
WHERE NOT EXISTS (
  SELECT 1
  FROM pest_warning_products current
  WHERE current.pest_warning_id = warning.id
    AND current.product_id = product.id
);
