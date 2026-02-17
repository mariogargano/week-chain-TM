-- UXAN Property - Complete Insert with 52 Weeks
-- Execute this script to add UXAN to the properties table

-- Step 1: Insert UXAN property and capture the ID
WITH inserted_property AS (
  INSERT INTO public.properties (
    id,
    name,
    description,
    location,
    location_group,
    image_url,
    status,
    estado,
    total_weeks,
    weeks_sold,
    presale_sold,
    presale_target,
    presale_progress,
    presale_deadline,
    unlock_status,
    unlock_order,
    price,
    valor_total_usd,
    property_duration_years,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    'UXAN - Eco-Architecture Resort',
    'Resort de lujo con arquitectura orgánica única en la Riviera Maya. Diseño sustentable que fusiona estructuras de celosía de madera con interiores bohemio-lujosos. Ubicación privilegiada a 15 minutos del Aeropuerto de Tulum y 20 minutos de la Estación Tren Maya. Espacios dramáticos con techos abovedados, ventanales geométricos y materiales naturales (ratán, madera, concreto pulido, jute). Experiencia exclusiva que conecta con la naturaleza en el corazón de la selva maya.',
    'Tulum, Quintana Roo',
    'MEXICO',
    '/images/12.jpeg',
    'available',
    'disponible',
    52,
    0,
    0,
    10,
    0,
    NOW() + INTERVAL '90 days',
    'presale',
    4,
    12500.00,
    650000.00,
    15,
    NOW(),
    NOW()
  )
  RETURNING id
),
-- Step 2: Generate seasonal pricing for 52 weeks
seasons AS (
  SELECT 
    week_num,
    CASE 
      WHEN week_num BETWEEN 1 AND 12 THEN 'Invierno'  -- Jan-Mar: High season
      WHEN week_num BETWEEN 13 AND 26 THEN 'Primavera' -- Apr-Jun: High season
      WHEN week_num BETWEEN 27 AND 39 THEN 'Verano'    -- Jul-Sep: Medium season
      ELSE 'Otoño'                                      -- Oct-Dec: Medium season
    END as season,
    CASE 
      WHEN week_num BETWEEN 1 AND 12 THEN 15000.00  -- Winter premium
      WHEN week_num BETWEEN 13 AND 26 THEN 14500.00 -- Spring premium
      WHEN week_num BETWEEN 27 AND 39 THEN 11500.00 -- Summer standard
      ELSE 12000.00                                  -- Fall standard
    END as price
  FROM generate_series(1, 52) AS week_num
)
-- Step 3: Insert all 52 weeks
INSERT INTO public.weeks (
  id,
  property_id,
  week_number,
  season,
  price,
  status,
  nft_minted,
  rental_enabled,
  start_date,
  end_date,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM inserted_property),
  week_num,
  season,
  price,
  'available',
  false,
  false,
  '2025-01-01'::date + (week_num - 1) * INTERVAL '7 days',
  '2025-01-01'::date + week_num * INTERVAL '7 days' - INTERVAL '1 day',
  NOW(),
  NOW()
FROM seasons;

-- Verify insert
SELECT 
  p.name,
  p.location,
  p.status,
  p.total_weeks,
  COUNT(w.id) as weeks_created,
  MIN(w.price) as min_price,
  MAX(w.price) as max_price
FROM properties p
LEFT JOIN weeks w ON w.property_id = p.id
WHERE p.name LIKE '%UXAN%'
GROUP BY p.id, p.name, p.location, p.status, p.total_weeks;
