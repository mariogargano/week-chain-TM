-- Demo Environment Setup for User Testing
-- Creates realistic demo properties with complete data for testing the voucher system

-- Clean up existing demo data (optional - comment out if you want to keep existing data)
-- DELETE FROM weeks WHERE property_id IN (SELECT id FROM properties WHERE name LIKE '%DEMO%');
-- DELETE FROM properties WHERE name LIKE '%DEMO%';

-- Insert demo properties with complete information
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
  property_type,
  bedrooms,
  bathrooms,
  max_guests,
  amenities,
  images,
  presale_target,
  weeks_sold,
  total_weeks,
  created_at,
  updated_at
) VALUES 
-- Property 1: Beach Villa (High demand for testing)
(
  '11111111-1111-1111-1111-111111111111',
  'DEMO: Villa Paraíso Playa del Carmen',
  'Playa del Carmen, Quintana Roo, México',
  'Espectacular villa frente al mar en la Riviera Maya. Disfruta de atardeceres inolvidables desde tu terraza privada con acceso directo a la playa. Perfecta para familias y grupos que buscan lujo y tranquilidad.',
  156000.00,
  3000.00,
  'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1200&q=80',
  'active',
  45000.00,
  'villa',
  5,
  4,
  10,
  ARRAY['Piscina infinity', 'Playa privada', 'WiFi de alta velocidad', 'Aire acondicionado', 'Cocina gourmet', 'Jacuzzi', 'Estacionamiento privado', 'Chef disponible', 'Servicio de limpieza'],
  ARRAY[
    'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1200&q=80',
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80'
  ],
  48,
  15,
  52,
  NOW(),
  NOW()
),
-- Property 2: City Penthouse (Modern luxury)
(
  '22222222-2222-2222-2222-222222222222',
  'DEMO: Penthouse Reforma CDMX',
  'Paseo de la Reforma, Ciudad de México',
  'Penthouse de lujo en el corazón financiero de la ciudad. Vistas panorámicas de 360 grados, acabados de primera clase y acceso a amenidades exclusivas. Ideal para viajeros de negocios y turistas sofisticados.',
  208000.00,
  4000.00,
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80',
  'active',
  80000.00,
  'apartment',
  4,
  3,
  8,
  ARRAY['Terraza panorámica', 'WiFi de alta velocidad', 'Aire acondicionado', 'Cocina italiana', 'Gimnasio privado', 'Seguridad 24/7', 'Valet parking', 'Concierge', 'Smart home'],
  ARRAY[
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80'
  ],
  48,
  20,
  52,
  NOW(),
  NOW()
),
-- Property 3: Colonial House (Cultural experience)
(
  '33333333-3333-3333-3333-333333333333',
  'DEMO: Casa Colonial San Miguel',
  'Centro Histórico, San Miguel de Allende, Guanajuato',
  'Hermosa casa colonial del siglo XVIII completamente restaurada. Combina la arquitectura tradicional mexicana con todas las comodidades modernas. A pasos de galerías, restaurantes y la vida cultural de San Miguel.',
  104000.00,
  2000.00,
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80',
  'active',
  30000.00,
  'house',
  4,
  3,
  8,
  ARRAY['Patio central con fuente', 'WiFi', 'Chimenea', 'Cocina equipada', 'Terraza en azotea', 'Estacionamiento', 'Biblioteca', 'Arte mexicano'],
  ARRAY[
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=80'
  ],
  48,
  15,
  52,
  NOW(),
  NOW()
),
-- Property 4: Mountain Cabin (Nature escape)
(
  '44444444-4444-4444-4444-444444444444',
  'DEMO: Cabaña Valle de Bravo',
  'Valle de Bravo, Estado de México',
  'Cabaña de montaña con vistas al lago. Perfecta para desconectar y disfrutar de la naturaleza. Actividades como kayak, senderismo y ciclismo de montaña a tu alcance.',
  78000.00,
  1500.00,
  'https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=1200&q=80',
  'active',
  15000.00,
  'cabin',
  3,
  2,
  6,
  ARRAY['Chimenea de leña', 'WiFi', 'Cocina equipada', 'Terraza con vista al lago', 'Jardín', 'Estacionamiento', 'BBQ', 'Kayaks incluidos'],
  ARRAY[
    'https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=1200&q=80',
    'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=1200&q=80',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80'
  ],
  48,
  10,
  52,
  NOW(),
  NOW()
);

-- Create weeks for each demo property
DO $$
DECLARE
  prop_record RECORD;
  week_num integer;
  week_start date;
  week_end date;
  season text;
  week_price decimal;
  week_status text;
BEGIN
  -- Loop through each demo property
  FOR prop_record IN 
    SELECT id, price, weeks_sold 
    FROM properties 
    WHERE name LIKE 'DEMO:%'
  LOOP
    
    FOR week_num IN 1..52
    LOOP
      -- Calculate week dates (starting from 2025)
      week_start := DATE '2025-01-06' + ((week_num - 1) * 7);
      week_end := week_start + 6;
      
      -- Determine season and price multiplier
      IF week_num BETWEEN 1 AND 13 THEN
        season := 'winter';
        week_price := prop_record.price * 1.3; -- High season
      ELSIF week_num BETWEEN 14 AND 26 THEN
        season := 'spring';
        week_price := prop_record.price * 1.0; -- Regular season
      ELSIF week_num BETWEEN 27 AND 39 THEN
        season := 'summer';
        week_price := prop_record.price * 1.5; -- Peak season
      ELSE
        season := 'fall';
        week_price := prop_record.price * 1.1; -- Medium season
      END IF;
      
      -- Set status: some weeks already "sold" for testing
      IF week_num <= prop_record.weeks_sold THEN
        week_status := 'reserved';
      ELSE
        week_status := 'available';
      END IF;
      
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
        season,
        week_price,
        week_status,
        false,
        false,
        0,
        NOW(),
        NOW()
      );
    END LOOP;
  END LOOP;
END $$;

-- Create some demo vouchers for testing (optional)
-- Uncomment if you want to test with existing vouchers
/*
INSERT INTO purchase_vouchers (
  id,
  user_id,
  property_id,
  week_id,
  voucher_code,
  amount_paid,
  payment_method,
  payment_status,
  can_claim_nft,
  claimed_at,
  metadata,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'YOUR_USER_ID_HERE', -- Replace with actual user ID for testing
  '11111111-1111-1111-1111-111111111111',
  (SELECT id FROM weeks WHERE property_id = '11111111-1111-1111-1111-111111111111' AND status = 'available' LIMIT 1),
  'DEMO-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8)),
  3000.00,
  'oxxo',
  'completed',
  false,
  NULL,
  '{"test": true, "demo_voucher": true}'::jsonb,
  NOW(),
  NOW()
);
*/

-- Verify the demo data
SELECT 
  p.name,
  p.price as base_price,
  p.weeks_sold,
  p.presale_target,
  ROUND((p.weeks_sold::decimal / p.presale_target::decimal) * 100, 1) as presale_progress,
  COUNT(w.id) as total_weeks,
  COUNT(CASE WHEN w.status = 'available' THEN 1 END) as available_weeks,
  COUNT(CASE WHEN w.status = 'reserved' THEN 1 END) as reserved_weeks,
  MIN(w.price) as min_week_price,
  MAX(w.price) as max_week_price
FROM properties p
LEFT JOIN weeks w ON p.id = w.property_id
WHERE p.name LIKE 'DEMO:%'
GROUP BY p.id, p.name, p.price, p.weeks_sold, p.presale_target
ORDER BY p.name;
