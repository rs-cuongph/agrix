WITH zone_weather AS (
  SELECT *
  FROM (
    VALUES
      ('TBAC', 18.0, 22.0, 35.0, 120.0),
      ('DBAC', 17.5, 22.5, 28.0, 140.0),
      ('DBSH', 18.5, 22.8, 24.0, 150.0),
      ('BTB', 20.0, 24.0, 35.0, 180.0),
      ('NTB', 22.0, 27.0, 12.0, 220.0),
      ('TNG', 19.0, 23.5, 8.0, 260.0),
      ('DNB', 25.0, 28.5, 5.0, 180.0),
      ('DBSCL', 25.5, 28.5, 10.0, 240.0)
  ) AS seed(code, temp_min, temp_max, rain_min, rain_max)
),
months AS (
  SELECT generate_series(1, 12) AS month
)
INSERT INTO weather_baselines (
  id,
  zone_id,
  month,
  avg_temp_c,
  avg_rainfall_mm,
  notes
)
SELECT
  gen_random_uuid(),
  zone.id,
  months.month,
  ROUND(
    (
      zone_weather.temp_min
      + ((zone_weather.temp_max - zone_weather.temp_min) / 11.0) * (months.month - 1)
    )::numeric,
    1
  ),
  ROUND(
    (
      CASE
        WHEN months.month BETWEEN 5 AND 10 THEN zone_weather.rain_max
        ELSE zone_weather.rain_min
      END
    )::numeric,
    1
  ),
  CASE
    WHEN months.month IN (5, 6) THEN 'Đầu mùa mưa'
    WHEN months.month IN (11, 12) THEN 'Chuyển mùa khô'
    ELSE NULL
  END
FROM zone_weather
JOIN agricultural_zones zone
  ON zone.code = zone_weather.code
CROSS JOIN months
WHERE NOT EXISTS (
  SELECT 1
  FROM weather_baselines current
  WHERE current.zone_id = zone.id
    AND current.month = months.month
);
