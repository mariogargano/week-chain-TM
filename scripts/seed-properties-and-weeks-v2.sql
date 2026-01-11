-- Updated seed script to match actual database schema
-- Version 2: Uses correct field names from properties and weeks tables

-- Insert test properties with correct field names
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
  created_at,
  updated_at
) VALUES 
(
  gen_random_uuid(),
  'Villa Paraíso Cancún',
  'Cancún, Quintana Roo, México',
  'Lujosa villa frente al mar con acceso privado a la playa. Cuenta con piscina infinity, jacuzzi, y vistas espectaculares al Caribe mexicano.',
  130000.00,
  2500.00,
  'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800',
  'active',
  0,
  'villa',
  4,
  3,
  8,
  ARRAY['Piscina', 'Playa privada', 'WiFi', 'Aire acondicionado', 'Cocina equipada', 'Jacuzzi', 'Estacionamiento'],
  ARRAY['https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800', 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800'],
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Penthouse Polanco CDMX',
  'Polanco, Ciudad de México',
  'Elegante penthouse en el corazón de Polanco con terraza panorámica y acabados de lujo. A pasos de restaurantes y boutiques exclusivas.',
  182000.00,
  3500.00,
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
  'active',
  0,
  'apartment',
  3,
  2,
  6,
  ARRAY['Terraza', 'WiFi', 'Aire acondicionado', 'Cocina gourmet', 'Gimnasio', 'Seguridad 24/7', 'Estacionamiento'],
  ARRAY['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'],
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Casa Colonial San Miguel',
  'San Miguel de Allende, Guanajuato',
  'Hermosa casa colonial restaurada en el centro histórico. Combina arquitectura tradicional con comodidades modernas.',
  93600.00,
  1800.00,
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
  'active',
  0,
  'house',
  3,
  2,
  6,
  ARRAY['Patio central', 'WiFi', 'Chimenea', 'Cocina equipada', 'Terraza en azotea', 'Estacionamiento'],
  ARRAY['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'],
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Cabaña Bosque Mazamitla',
  'Mazamitla, Jalisco',
  'Acogedora cabaña en el bosque con chimenea y vistas al valle. Perfecta para escapadas románticas o familiares.',
  62400.00,
  1200.00,
  'https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800',
  'active',
  0,
  'cabin',
  2,
  1,
  4,
  ARRAY['Chimenea', 'WiFi', 'Cocina equipada', 'Terraza', 'Jardín', 'Estacionamiento', 'BBQ'],
  ARRAY['https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800', 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800'],
  NOW(),
  NOW()
);

-- Create 52 weeks for each property
DO $$
DECLARE
  prop_id uuid;
  week_num integer;
  week_start date;
  week_end date;
  season text;
  week_price decimal;
  base_price decimal;
BEGIN
  FOR prop_id IN SELECT id FROM properties WHERE name IN ('Villa Paraíso Cancún', 'Penthouse Polanco CDMX', 'Casa Colonial San Miguel', 'Cabaña Bosque Mazamitla')
  LOOP
    -- Get base price for this property
    SELECT price INTO base_price FROM properties WHERE id = prop_id;
    
    FOR week_num IN 1..52
    LOOP
      -- Calculate week dates (starting from 2025)
      week_start := DATE '2025-01-01' + ((week_num - 1) * 7);
      week_end := week_start + 6;
      
      -- Determine season and price multiplier
      IF week_num BETWEEN 1 AND 13 THEN
        season := 'winter';
        week_price := base_price * 1.2;
      ELSIF week_num BETWEEN 14 AND 26 THEN
        season := 'spring';
        week_price := base_price * 1.0;
      ELSIF week_num BETWEEN 27 AND 39 THEN
        season := 'summer';
        week_price := base_price * 1.5;
      ELSE
        season := 'fall';
        week_price := base_price * 1.1;
      END IF;
      
      -- Insert week with correct field names
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
        prop_id,
        week_num,
        week_start,
        week_end,
        season,
        week_price,
        'available',
        false,
        false,
        0,
        NOW(),
        NOW()
      );
    END LOOP;
  END LOOP;
END $$;

-- Verify the data
SELECT 
  p.name,
  COUNT(w.id) as total_weeks,
  COUNT(CASE WHEN w.status = 'available' THEN 1 END) as available_weeks,
  MIN(w.price) as min_price,
  MAX(w.price) as max_price
FROM properties p
LEFT JOIN weeks w ON p.id = w.property_id
WHERE p.name IN ('Villa Paraíso Cancún', 'Penthouse Polanco CDMX', 'Casa Colonial San Miguel', 'Cabaña Bosque Mazamitla')
GROUP BY p.name;
