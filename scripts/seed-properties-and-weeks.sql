-- Seed properties and weeks for testing the reservation system

-- Insert test properties
INSERT INTO properties (
  id,
  name,
  location,
  description,
  total_weeks,
  price_per_week,
  amenities,
  images,
  property_type,
  bedrooms,
  bathrooms,
  max_guests,
  status
) VALUES 
(
  gen_random_uuid(),
  'Villa Paraíso Cancún',
  'Cancún, Quintana Roo, México',
  'Lujosa villa frente al mar con acceso privado a la playa. Cuenta con piscina infinity, jacuzzi, y vistas espectaculares al Caribe mexicano.',
  52,
  2500.00,
  ARRAY['Piscina', 'Playa privada', 'WiFi', 'Aire acondicionado', 'Cocina equipada', 'Jacuzzi', 'Estacionamiento'],
  ARRAY['https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800', 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800'],
  'villa',
  4,
  3,
  8,
  'active'
),
(
  gen_random_uuid(),
  'Penthouse Polanco CDMX',
  'Polanco, Ciudad de México',
  'Elegante penthouse en el corazón de Polanco con terraza panorámica y acabados de lujo. A pasos de restaurantes y boutiques exclusivas.',
  52,
  3500.00,
  ARRAY['Terraza', 'WiFi', 'Aire acondicionado', 'Cocina gourmet', 'Gimnasio', 'Seguridad 24/7', 'Estacionamiento'],
  ARRAY['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'],
  'apartment',
  3,
  2,
  6,
  'active'
),
(
  gen_random_uuid(),
  'Casa Colonial San Miguel',
  'San Miguel de Allende, Guanajuato',
  'Hermosa casa colonial restaurada en el centro histórico. Combina arquitectura tradicional con comodidades modernas.',
  52,
  1800.00,
  ARRAY['Patio central', 'WiFi', 'Chimenea', 'Cocina equipada', 'Terraza en azotea', 'Estacionamiento'],
  ARRAY['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'],
  'house',
  3,
  2,
  6,
  'active'
),
(
  gen_random_uuid(),
  'Cabaña Bosque Mazamitla',
  'Mazamitla, Jalisco',
  'Acogedora cabaña en el bosque con chimenea y vistas al valle. Perfecta para escapadas románticas o familiares.',
  52,
  1200.00,
  ARRAY['Chimenea', 'WiFi', 'Cocina equipada', 'Terraza', 'Jardín', 'Estacionamiento', 'BBQ'],
  ARRAY['https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800', 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800'],
  'cabin',
  2,
  1,
  4,
  'active'
);

-- Get the property IDs we just created
DO $$
DECLARE
  prop_id uuid;
  week_num integer;
  week_start date;
  week_end date;
  season text;
  week_price decimal;
BEGIN
  -- For each property, create 52 weeks
  FOR prop_id IN SELECT id FROM properties WHERE name IN ('Villa Paraíso Cancún', 'Penthouse Polanco CDMX', 'Casa Colonial San Miguel', 'Cabaña Bosque Mazamitla')
  LOOP
    FOR week_num IN 1..52
    LOOP
      -- Calculate week dates (starting from 2025)
      week_start := DATE '2025-01-01' + ((week_num - 1) * 7);
      week_end := week_start + 6;
      
      -- Determine season and price multiplier
      IF week_num BETWEEN 1 AND 13 THEN
        season := 'winter';
        week_price := (SELECT price_per_week FROM properties WHERE id = prop_id) * 1.2;
      ELSIF week_num BETWEEN 14 AND 26 THEN
        season := 'spring';
        week_price := (SELECT price_per_week FROM properties WHERE id = prop_id) * 1.0;
      ELSIF week_num BETWEEN 27 AND 39 THEN
        season := 'summer';
        week_price := (SELECT price_per_week FROM properties WHERE id = prop_id) * 1.5;
      ELSE
        season := 'fall';
        week_price := (SELECT price_per_week FROM properties WHERE id = prop_id) * 1.1;
      END IF;
      
      -- Insert week
      INSERT INTO semanas (
        property_id,
        week_number,
        start_date,
        end_date,
        season,
        price,
        status,
        available
      ) VALUES (
        prop_id,
        week_num,
        week_start,
        week_end,
        season,
        week_price,
        'available',
        true
      );
    END LOOP;
  END LOOP;
END $$;

-- Verify the data
SELECT 
  p.name,
  COUNT(s.id) as total_weeks,
  COUNT(CASE WHEN s.status = 'available' THEN 1 END) as available_weeks
FROM properties p
LEFT JOIN semanas s ON p.id = s.property_id
WHERE p.name IN ('Villa Paraíso Cancún', 'Penthouse Polanco CDMX', 'Casa Colonial San Miguel', 'Cabaña Bosque Mazamitla')
GROUP BY p.name;
