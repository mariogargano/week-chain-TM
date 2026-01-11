-- Add UXAN - Luxury Eco-Architecture Resort in Riviera Maya
-- Location: Near Tulum, Quintana Roo (15 min from Tulum airport, 20 min from Tren Maya station)

-- Insert the property
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
  'México',
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
RETURNING id;

-- Note: After running this, save the property ID and use it to create 52 weeks
-- You can run the following to generate weeks (replace <property_id> with actual UUID):

/*
-- Generate 52 weeks for UXAN with seasonal pricing
WITH seasons AS (
  SELECT 
    CASE 
      WHEN week_num BETWEEN 1 AND 12 THEN 'Invierno'  -- Jan-Mar: High season
      WHEN week_num BETWEEN 13 AND 26 THEN 'Primavera' -- Apr-Jun: High season
      WHEN week_num BETWEEN 27 AND 39 THEN 'Verano'    -- Jul-Sep: Medium season
      ELSE 'Otoño'                                      -- Oct-Dec: Medium season
    END as season,
    CASE 
      WHEN week_num BETWEEN 1 AND 12 THEN 15000  -- Winter premium
      WHEN week_num BETWEEN 13 AND 26 THEN 14500 -- Spring premium
      WHEN week_num BETWEEN 27 AND 39 THEN 11500 -- Summer standard
      ELSE 12000                                  -- Fall standard
    END as price,
    week_num
  FROM generate_series(1, 52) AS week_num
)
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
  '<property_id>'::uuid,  -- Replace with actual UXAN property_id
  week_num,
  season,
  price,
  'available',
  false,
  '2025-01-01'::date + (week_num - 1) * INTERVAL '7 days',
  '2025-01-01'::date + week_num * INTERVAL '7 days' - INTERVAL '1 day',
  NOW(),
  NOW()
FROM seasons;
*/

-- Add UXAN property images gallery (for property detail page)
/*
Gallery images:
1. /images/11.jpeg (Living room)
2. /images/9.jpeg (Dining room)
3. /images/12.jpeg (Exterior aerial)
4. /images/16.jpg (Interior detail)
5. /images/3-20-281-29.jpeg (Exterior front)
6. /images/2-20-282-29.jpeg (Bedroom)
7. /images/10.jpeg (Living/dining open concept)
8. /images/1-20-281-29.jpeg (Dining with geometric windows)
9. /images/4.jpeg (Bedroom detail with lighting)
*/

-- Location details from map:
-- - 15 min to Tulum Airport
-- - 20 min to Tren Maya Station
-- - 10 min to Tulum Pueblo
-- - 15 min to Boann, Club de Laguna
-- - 5 min to Laguna Kaan Lum
-- - 20 min to Ammos, Club de Playa
-- - 15 min to Biosfera de Sian Ka'an
