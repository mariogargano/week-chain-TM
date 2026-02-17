-- Seed real properties for WEEK-CHAIN platform
-- This script adds attractive vacation properties in Mexico

-- First, clean up any demo properties
DELETE FROM weeks WHERE property_id IN (
  SELECT id FROM properties WHERE name LIKE '%DEMO%' OR name LIKE '%Demo%'
);
DELETE FROM properties WHERE name LIKE '%DEMO%' OR name LIKE '%Demo%';

-- Insert real properties
INSERT INTO properties (
  id,
  name,
  location,
  description,
  valor_total_usd,
  price,
  image_url,
  status,
  recaudado_actual,
  presale_target,
  presale_sold,
  presale_progress,
  estado,
  created_at,
  updated_at
) VALUES 
-- Property 1: Aflora Tulum
(
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Aflora Tulum',
  'Tulum, Quintana Roo, México',
  'Exclusivo desarrollo eco-chic en Tulum con acceso a playa privada. Diseño contemporáneo que fusiona lujo y naturaleza. Amenidades de clase mundial incluyendo beach club, spa, y restaurante gourmet.',
  210000.00,
  4038.46,
  'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200&q=80',
  'active',
  0,
  48,
  0,
  0,
  'activo',
  NOW(),
  NOW()
),
-- Property 2: Villa Paraíso Cancún
(
  '22222222-2222-2222-2222-222222222222'::uuid,
  'Villa Paraíso Cancún',
  'Cancún, Quintana Roo, México',
  'Lujosa villa frente al mar Caribe con piscina infinity y jacuzzi. Vista panorámica al océano, acabados de lujo, y acceso directo a playa de arena blanca. Perfecta para familias y grupos.',
  2400000.00,
  50000.00,
  'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1200&q=80',
  'active',
  0,
  48,
  0,
  0,
  'activo',
  NOW(),
  NOW()
),
-- Property 3: Penthouse Polanco
(
  '33333333-3333-3333-3333-333333333333'::uuid,
  'Penthouse Polanco',
  'Polanco, Ciudad de México',
  'Elegante penthouse en el corazón de Polanco con terraza panorámica de 360°. Acabados de lujo, cocina gourmet, y vistas espectaculares de la ciudad. A pasos de Masaryk y los mejores restaurantes.',
  1872000.00,
  39000.00,
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80',
  'active',
  0,
  48,
  0,
  0,
  'activo',
  NOW(),
  NOW()
),
-- Property 4: Casa Colonial San Miguel
(
  '44444444-4444-4444-4444-444444444444'::uuid,
  'Casa Colonial San Miguel',
  'San Miguel de Allende, Guanajuato',
  'Hermosa casa colonial restaurada en el centro histórico. Arquitectura tradicional mexicana con comodidades modernas. Patio central con fuente, terraza en azotea con vistas al Parroquia.',
  936000.00,
  19500.00,
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80',
  'active',
  0,
  48,
  0,
  0,
  'activo',
  NOW(),
  NOW()
),
-- Property 5: Cabaña Valle de Bravo
(
  '55555555-5555-5555-5555-555555555555'::uuid,
  'Cabaña Valle de Bravo',
  'Valle de Bravo, Estado de México',
  'Acogedora cabaña de montaña con vista al lago. Chimenea, terraza privada, y acceso a deportes acuáticos. Ideal para escapadas de fin de semana y actividades al aire libre.',
  624000.00,
  13000.00,
  'https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=1200&q=80',
  'active',
  0,
  48,
  0,
  0,
  'activo',
  NOW(),
  NOW()
),
-- Property 6: Loft Condesa
(
  '66666666-6666-6666-6666-666666666666'::uuid,
  'Loft Condesa',
  'Condesa, Ciudad de México',
  'Moderno loft en el barrio más trendy de la ciudad. Diseño industrial-chic, techos altos, y ubicación privilegiada cerca de parques, cafés, y vida nocturna.',
  780000.00,
  16250.00,
  'https://images.unsplash.com/photo-1502672260066-6bc35f0a1f80?w=1200&q=80',
  'active',
  0,
  48,
  0,
  0,
  'activo',
  NOW(),
  NOW()
);

-- Create 52 weeks for each property
DO $$
DECLARE
  prop_record RECORD;
  week_num integer;
  week_start date;
  week_end date;
  season_name text;
  week_price decimal;
  season_multiplier decimal;
BEGIN
  -- Loop through all active properties
  FOR prop_record IN 
    SELECT id, price, name FROM properties WHERE status = 'active'
  LOOP
    -- Create 52 weeks for this property
    FOR week_num IN 1..52
    LOOP
      -- Calculate week dates (starting from 2025)
      week_start := DATE '2025-01-01' + ((week_num - 1) * 7);
      week_end := week_start + 6;
      
      -- Determine season and price multiplier
      -- Winter (weeks 1-13): High season for beach properties
      IF week_num BETWEEN 1 AND 13 THEN
        season_name := 'high';
        season_multiplier := 1.3;
      -- Spring (weeks 14-26): Medium season
      ELSIF week_num BETWEEN 14 AND 26 THEN
        season_name := 'medium';
        season_multiplier := 1.0;
      -- Summer (weeks 27-39): Peak season
      ELSIF week_num BETWEEN 27 AND 39 THEN
        season_name := 'peak';
        season_multiplier := 1.5;
      -- Fall (weeks 40-52): Low season
      ELSE
        season_name := 'low';
        season_multiplier := 0.85;
      END IF;
      
      -- Calculate week price with seasonal adjustment
      week_price := prop_record.price * season_multiplier;
      
      -- Insert week
      INSERT INTO weeks (
        id,
        property_id,
        week_number,
        start_date,
        end_date,
        season,
        price,
        status,
        nft_minted,
        rental_enabled,
        usage_count,
        created_at,
        updated_at
      ) VALUES (
        gen_random_uuid(),
        prop_record.id,
        week_num,
        week_start,
        week_end,
        season_name,
        week_price,
        'available',
        false,
        false,
        0,
        NOW(),
        NOW()
      );
    END LOOP;
    
    RAISE NOTICE 'Created 52 weeks for property: %', prop_record.name;
  END LOOP;
END $$;

-- Verify the data
SELECT 
  p.name,
  p.location,
  p.price as base_price,
  COUNT(w.id) as total_weeks,
  COUNT(CASE WHEN w.status = 'available' THEN 1 END) as available_weeks,
  ROUND(MIN(w.price)::numeric, 2) as min_price,
  ROUND(MAX(w.price)::numeric, 2) as max_price,
  ROUND(AVG(w.price)::numeric, 2) as avg_price
FROM properties p
LEFT JOIN weeks w ON p.id = w.property_id
WHERE p.status = 'active'
GROUP BY p.id, p.name, p.location, p.price
ORDER BY p.name;

-- Summary
SELECT 
  COUNT(DISTINCT p.id) as total_properties,
  COUNT(w.id) as total_weeks,
  COUNT(CASE WHEN w.status = 'available' THEN 1 END) as available_weeks,
  COUNT(CASE WHEN w.status = 'reserved' THEN 1 END) as reserved_weeks,
  COUNT(CASE WHEN w.status = 'sold' THEN 1 END) as sold_weeks
FROM properties p
LEFT JOIN weeks w ON p.id = w.property_id
WHERE p.status = 'active';
