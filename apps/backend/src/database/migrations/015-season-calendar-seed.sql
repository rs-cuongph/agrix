INSERT INTO agricultural_zones (id, name, code, description, provinces)
SELECT gen_random_uuid(), seed.name, seed.code, seed.description, seed.provinces
FROM (
  VALUES
    ('Tây Bắc', 'TBAC', 'Vùng núi phía Bắc', ARRAY['Sơn La', 'Điện Biên', 'Lai Châu']::text[]),
    ('Đông Bắc', 'DBAC', 'Vùng trung du và miền núi Đông Bắc', ARRAY['Lạng Sơn', 'Cao Bằng', 'Hà Giang']::text[]),
    ('Đồng bằng Sông Hồng', 'DBSH', 'Vùng lúa trọng điểm phía Bắc', ARRAY['Hà Nội', 'Nam Định', 'Thái Bình']::text[]),
    ('Bắc Trung Bộ', 'BTB', 'Khu vực Bắc Trung Bộ', ARRAY['Thanh Hóa', 'Nghệ An', 'Hà Tĩnh']::text[]),
    ('Nam Trung Bộ', 'NTB', 'Khu vực duyên hải Nam Trung Bộ', ARRAY['Đà Nẵng', 'Quảng Nam', 'Bình Định']::text[]),
    ('Tây Nguyên', 'TNG', 'Vùng cây công nghiệp', ARRAY['Đắk Lắk', 'Gia Lai', 'Lâm Đồng']::text[]),
    ('Đông Nam Bộ', 'DNB', 'Vùng công nghiệp và cây ăn trái', ARRAY['TP.HCM', 'Đồng Nai', 'Bình Dương']::text[]),
    ('Đồng bằng Sông Cửu Long', 'DBSCL', 'Vựa lúa lớn nhất cả nước', ARRAY['Cần Thơ', 'An Giang', 'Kiên Giang']::text[])
) AS seed(name, code, description, provinces)
WHERE NOT EXISTS (
  SELECT 1 FROM agricultural_zones az WHERE az.code = seed.code
);

INSERT INTO crops (id, name, local_names, category, description)
SELECT gen_random_uuid(), seed.name, seed.local_names, seed.category, seed.description
FROM (
  VALUES
    ('Lúa', ARRAY['lúa', 'lúa nước', 'lúa mùa']::text[], 'Lúa gạo', 'Cây lương thực chủ lực'),
    ('Ngô', ARRAY['ngô', 'bắp']::text[], 'Ngũ cốc', 'Cây lương thực ngắn ngày'),
    ('Đậu tương', ARRAY['đậu tương', 'đậu nành']::text[], 'Họ đậu', 'Cây họ đậu cung cấp đạm'),
    ('Rau cải', ARRAY['rau cải', 'cải xanh', 'cải bẹ']::text[], 'Rau màu', 'Nhóm rau ăn lá'),
    ('Cà chua', ARRAY['cà chua', 'tomato']::text[], 'Rau màu', 'Cây rau ăn quả'),
    ('Cà phê', ARRAY['cà phê', 'coffee', 'cafe']::text[], 'Cây công nghiệp', 'Cây công nghiệp dài ngày'),
    ('Tiêu', ARRAY['tiêu', 'hồ tiêu']::text[], 'Cây công nghiệp', 'Cây gia vị'),
    ('Mía', ARRAY['mía']::text[], 'Cây công nghiệp', 'Cây nguyên liệu đường'),
    ('Chuối', ARRAY['chuối']::text[], 'Cây ăn trái', 'Cây ăn trái nhiệt đới'),
    ('Lúa mì', ARRAY['lúa mì', 'wheat']::text[], 'Ngũ cốc', 'Cây lương thực ôn đới')
) AS seed(name, local_names, category, description)
WHERE NOT EXISTS (
  SELECT 1 FROM crops c WHERE c.name = seed.name
);

INSERT INTO season_calendars (id, zone_id, crop_id, season_name, year, notes, is_active)
SELECT
  gen_random_uuid(),
  zone.id,
  crop.id,
  seed.season_name,
  NULL,
  seed.notes,
  true
FROM (
  VALUES
    ('Đông Xuân', 'Gieo sạ cuối năm và thu hoạch đầu năm sau tại ĐBSCL'),
    ('Hè Thu', 'Vụ chính trong mùa mưa, cần chú ý dinh dưỡng và sâu bệnh'),
    ('Thu Đông', 'Vụ cuối năm với rủi ro ngập úng cao hơn')
) AS seed(season_name, notes)
JOIN agricultural_zones zone ON zone.code = 'DBSCL'
JOIN crops crop ON crop.name = 'Lúa'
WHERE NOT EXISTS (
  SELECT 1
  FROM season_calendars sc
  WHERE sc.zone_id = zone.id
    AND sc.crop_id = crop.id
    AND sc.season_name = seed.season_name
    AND sc.year IS NULL
);

UPDATE season_calendars sc
SET notes = seed.notes,
    is_active = true
FROM (
  VALUES
    ('Đông Xuân', 'Gieo sạ cuối năm và chăm sóc kéo dài sang đầu năm sau tại ĐBSCL'),
    ('Hè Thu', 'Vụ giữa năm, ưu tiên quản lý nước và dinh dưỡng trong mùa mưa'),
    ('Thu Đông', 'Vụ cuối năm với yêu cầu tiêu úng và kiểm soát sâu bệnh chặt chẽ')
) AS seed(season_name, notes)
JOIN agricultural_zones zone ON zone.code = 'DBSCL'
JOIN crops crop ON crop.name = 'Lúa'
WHERE sc.zone_id = zone.id
  AND sc.crop_id = crop.id
  AND sc.season_name = seed.season_name
  AND sc.year IS NULL;

UPDATE growth_stages gs
SET stage_type = seed.stage_type,
    start_month = seed.start_month,
    end_month = seed.end_month,
    description = seed.description,
    keywords = seed.keywords,
    sort_order = seed.sort_order
FROM (
  VALUES
    ('Đông Xuân', 'Làm đất và gieo sạ', 'planting', 11, 12, 'Chuẩn bị ruộng, xử lý giống và gieo sạ đồng đều.', ARRAY['gieo sạ', 'xuống giống', 'làm đất']::text[], 1),
    ('Đông Xuân', 'Đẻ nhánh', 'care', 3, 4, 'Bón thúc đẻ nhánh, giữ mực nước 5-10cm và theo dõi sâu bệnh.', ARRAY['đẻ nhánh', 'đẻ chồi']::text[], 2),
    ('Đông Xuân', 'Làm đòng và trổ', 'care', 5, 6, 'Tăng cường kali, quản lý nước và sâu cuốn lá.', ARRAY['làm đòng', 'trổ', 'trổ bông']::text[], 3),
    ('Đông Xuân', 'Thu hoạch', 'harvest', 7, 8, 'Thu hoạch khi hạt chín vàng và giảm ẩm hạt sau thu hoạch.', ARRAY['thu hoạch', 'chín']::text[], 4),
    ('Hè Thu', 'Làm đất và gieo sạ', 'planting', 5, 6, 'Xuống giống giữa năm, ưu tiên chủ động thoát nước.', ARRAY['gieo sạ', 'xuống giống', 'làm đất']::text[], 1),
    ('Hè Thu', 'Đẻ nhánh', 'care', 6, 7, 'Bón thúc đẻ nhánh và kiểm tra ốc bươu vàng, sâu cuốn lá.', ARRAY['đẻ nhánh', 'đẻ chồi']::text[], 2),
    ('Hè Thu', 'Làm đòng và trổ', 'care', 8, 9, 'Bổ sung dinh dưỡng cân đối, giữ nước ổn định.', ARRAY['làm đòng', 'trổ', 'trổ bông']::text[], 3),
    ('Hè Thu', 'Thu hoạch', 'harvest', 9, 10, 'Thu hoạch khi ruộng ráo nước, hạn chế đổ ngã.', ARRAY['thu hoạch', 'chín']::text[], 4),
    ('Thu Đông', 'Làm đất và gieo sạ', 'planting', 9, 10, 'Chuẩn bị ruộng cao, chủ động tiêu úng sớm.', ARRAY['gieo sạ', 'xuống giống', 'làm đất']::text[], 1),
    ('Thu Đông', 'Đẻ nhánh', 'care', 10, 11, 'Duy trì mật độ hợp lý và bón thúc sớm.', ARRAY['đẻ nhánh', 'đẻ chồi']::text[], 2),
    ('Thu Đông', 'Làm đòng và trổ', 'care', 11, 12, 'Theo dõi bệnh đạo ôn và sâu hại cuối vụ.', ARRAY['làm đòng', 'trổ', 'trổ bông']::text[], 3),
    ('Thu Đông', 'Thu hoạch', 'harvest', 1, 2, 'Thu hoạch dứt điểm trước khi triều cường, ưu tiên phơi sấy nhanh.', ARRAY['thu hoạch', 'chín']::text[], 4)
) AS seed(season_name, name, stage_type, start_month, end_month, description, keywords, sort_order)
JOIN agricultural_zones zone ON zone.code = 'DBSCL'
JOIN crops crop ON crop.name = 'Lúa'
JOIN season_calendars sc
  ON sc.zone_id = zone.id
 AND sc.crop_id = crop.id
 AND sc.season_name = seed.season_name
 AND sc.year IS NULL
WHERE gs.season_calendar_id = sc.id
  AND gs.name = seed.name;

INSERT INTO growth_stages (
  id,
  season_calendar_id,
  name,
  stage_type,
  start_month,
  end_month,
  description,
  keywords,
  sort_order
)
SELECT
  gen_random_uuid(),
  sc.id,
  seed.name,
  seed.stage_type,
  seed.start_month,
  seed.end_month,
  seed.description,
  seed.keywords,
  seed.sort_order
FROM (
  VALUES
    ('Đông Xuân', 'Làm đất và gieo sạ', 'planting', 11, 12, 'Chuẩn bị ruộng, xử lý giống và gieo sạ đồng đều.', ARRAY['gieo sạ', 'xuống giống', 'làm đất']::text[], 1),
    ('Đông Xuân', 'Đẻ nhánh', 'care', 3, 4, 'Bón thúc đẻ nhánh, giữ mực nước 5-10cm và theo dõi sâu bệnh.', ARRAY['đẻ nhánh', 'đẻ chồi']::text[], 2),
    ('Đông Xuân', 'Làm đòng và trổ', 'care', 5, 6, 'Tăng cường kali, quản lý nước và sâu cuốn lá.', ARRAY['làm đòng', 'trổ', 'trổ bông']::text[], 3),
    ('Đông Xuân', 'Thu hoạch', 'harvest', 7, 8, 'Thu hoạch khi hạt chín vàng và giảm ẩm hạt sau thu hoạch.', ARRAY['thu hoạch', 'chín']::text[], 4),
    ('Hè Thu', 'Làm đất và gieo sạ', 'planting', 5, 6, 'Xuống giống giữa năm, ưu tiên chủ động thoát nước.', ARRAY['gieo sạ', 'xuống giống', 'làm đất']::text[], 1),
    ('Hè Thu', 'Đẻ nhánh', 'care', 6, 7, 'Bón thúc đẻ nhánh và kiểm tra ốc bươu vàng, sâu cuốn lá.', ARRAY['đẻ nhánh', 'đẻ chồi']::text[], 2),
    ('Hè Thu', 'Làm đòng và trổ', 'care', 8, 9, 'Bổ sung dinh dưỡng cân đối, giữ nước ổn định.', ARRAY['làm đòng', 'trổ', 'trổ bông']::text[], 3),
    ('Hè Thu', 'Thu hoạch', 'harvest', 9, 10, 'Thu hoạch khi ruộng ráo nước, hạn chế đổ ngã.', ARRAY['thu hoạch', 'chín']::text[], 4),
    ('Thu Đông', 'Làm đất và gieo sạ', 'planting', 9, 10, 'Chuẩn bị ruộng cao, chủ động tiêu úng sớm.', ARRAY['gieo sạ', 'xuống giống', 'làm đất']::text[], 1),
    ('Thu Đông', 'Đẻ nhánh', 'care', 10, 11, 'Duy trì mật độ hợp lý và bón thúc sớm.', ARRAY['đẻ nhánh', 'đẻ chồi']::text[], 2),
    ('Thu Đông', 'Làm đòng và trổ', 'care', 11, 12, 'Theo dõi bệnh đạo ôn và sâu hại cuối vụ.', ARRAY['làm đòng', 'trổ', 'trổ bông']::text[], 3),
    ('Thu Đông', 'Thu hoạch', 'harvest', 1, 2, 'Thu hoạch dứt điểm trước khi triều cường, ưu tiên phơi sấy nhanh.', ARRAY['thu hoạch', 'chín']::text[], 4)
) AS seed(season_name, name, stage_type, start_month, end_month, description, keywords, sort_order)
JOIN agricultural_zones zone ON zone.code = 'DBSCL'
JOIN crops crop ON crop.name = 'Lúa'
JOIN season_calendars sc
  ON sc.zone_id = zone.id
 AND sc.crop_id = crop.id
 AND sc.season_name = seed.season_name
 AND sc.year IS NULL
WHERE NOT EXISTS (
  SELECT 1
  FROM growth_stages gs
  WHERE gs.season_calendar_id = sc.id
    AND gs.name = seed.name
);

INSERT INTO product_recommendations (
  id,
  growth_stage_id,
  product_id,
  reason,
  priority,
  dosage_note
)
SELECT
  gen_random_uuid(),
  gs.id,
  product.id,
  seed.reason,
  seed.priority,
  seed.dosage_note
FROM (
  VALUES
    ('Đẻ nhánh', 'PB-001', 'Hàm lượng dinh dưỡng cân đối, phù hợp bón thúc để lúa đẻ nhánh khỏe.', 1, '25-30 kg/ha'),
    ('Đẻ nhánh', 'PB-002', 'Bổ sung hữu cơ giúp cải tạo đất và duy trì bộ rễ khỏe trong giai đoạn sinh trưởng mạnh.', 2, '200-300 kg/ha'),
    ('Làm đòng và trổ', 'PB-001', 'Hỗ trợ nuôi đòng và giữ bông khỏe trong giai đoạn làm đòng - trổ.', 1, '20-25 kg/ha'),
    ('Làm đòng và trổ', 'TTS-001', 'Kiểm soát sâu hại phổ biến trên lúa giai đoạn làm đòng và trổ.', 2, 'Theo hướng dẫn trên bao bì'),
    ('Thu hoạch', 'TTS-002', 'Hỗ trợ quản lý cỏ dại bờ ruộng và chuẩn bị mặt ruộng sau thu hoạch.', 3, 'Theo hướng dẫn trên bao bì')
) AS seed(stage_name, product_sku, reason, priority, dosage_note)
JOIN agricultural_zones zone ON zone.code = 'DBSCL'
JOIN crops crop ON crop.name = 'Lúa'
JOIN season_calendars sc
  ON sc.zone_id = zone.id
 AND sc.crop_id = crop.id
 AND sc.year IS NULL
JOIN growth_stages gs
  ON gs.season_calendar_id = sc.id
 AND gs.name = seed.stage_name
JOIN products product
  ON product.sku = seed.product_sku
WHERE NOT EXISTS (
  SELECT 1
  FROM product_recommendations pr
  WHERE pr.growth_stage_id = gs.id
    AND pr.product_id = product.id
);
