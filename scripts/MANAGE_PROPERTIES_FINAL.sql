-- =====================================================
-- WEEK-CHAIN Property Management Script
-- =====================================================
-- This script:
-- 1. Deletes "Polo" property
-- 2. Adds UXAN (Tulum, México - Riviera Maya)
-- 3. Adds Vila Ksamil (Albania - Albanian Riviera)
-- 4. Adds Bosphorus Villa (Istanbul, Turkey)
-- =====================================================

BEGIN;

-- =====================================================
-- STEP 1: Delete Polo Property
-- =====================================================
DELETE FROM properties 
WHERE name ILIKE '%polo%' 
OR description ILIKE '%polo%';

-- =====================================================
-- STEP 2: Insert UXAN - Tulum, México
-- =====================================================
INSERT INTO properties (
  id,
  name,
  description,
  location,
  location_group,
  price,
  image_url,
  status,
  total_weeks,
  weeks_sold,
  presale_sold,
  presale_target,
  unlock_status,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'UXAN',
  'UXAN es una localidad dentro del mundo maya más exclusiva y cosmopolita, con una esencia única. Arquitectura orgánica con estructuras de celosía de madera en forma de domo que fusionan diseño contemporáneo con influencias mayas tradicionales. Interiores bohemio-lujosos con materiales naturales como ratán, madera, jute y concreto pulido. Espacios dramáticos con techos altos, ventanales geométricos y vistas a la selva tropical. A 15 minutos del Aeropuerto de Tulum y 20 minutos de la Estación Tren Maya.',
  'Riviera Maya, Tulum, México',
  'RIVIERA MAYA',
  12500.00,
  '/images/10.jpeg',
  'available',
  52,
  0,
  0,
  48,
  'locked',
  now(),
  now()
);

-- =====================================================
-- STEP 3: Insert Vila Ksamil - Albania
-- =====================================================
INSERT INTO properties (
  id,
  name,
  description,
  location,
  location_group,
  price,
  image_url,
  status,
  total_weeks,
  weeks_sold,
  presale_sold,
  presale_target,
  unlock_status,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Vila Ksamil',
  'Vila de lujo en la Riviera Albanesa con arquitectura orgánica similar a UXAN. Estructuras de madera con celosía geométrica integradas en el paisaje mediterráneo. Diseño bohemio contemporáneo con materiales locales: madera de olivo, piedra de mármol albanés y textiles artesanales. Vistas panorámicas al Mar Jónico y las islas Ksamil. A 20 minutos del Parque Nacional Butrint (UNESCO) y 45 minutos del Aeropuerto de Corfú, Grecia.',
  'Ksamil, Albania',
  'BALKAN RIVIERA',
  11800.00,
  '/images/11.jpeg',
  'available',
  52,
  0,
  0,
  48,
  'locked',
  now(),
  now()
);

-- =====================================================
-- STEP 4: Insert Bosphorus Villa - Istanbul, Turkey
-- =====================================================
INSERT INTO properties (
  id,
  name,
  description,
  location,
  location_group,
  price,
  image_url,
  status,
  total_weeks,
  weeks_sold,
  presale_sold,
  presale_target,
  unlock_status,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Bosphorus Yalı Villa',
  'Villa histórica otomana (Yalı) completamente renovada en el Bósforo con arquitectura que fusiona elementos tradicionales turcos con diseño contemporáneo. Fachada de madera tallada original preservada, interiores con mármol de Mármara, azulejos de İznik y maderas nobles. Embarcadero privado y vistas panorámicas a ambos continentes (Europa y Asia). Acceso directo por barco privado o a 25 minutos del Aeropuerto de Estambul. Ubicación privilegiada en el estrecho más icónico del mundo.',
  'Bosphorus, Istanbul, Turquía',
  'MEDITERRANEAN',
  14900.00,
  '/images/3-20-281-29.jpeg',
  'available',
  52,
  0,
  0,
  48,
  'locked',
  now(),
  now()
);

-- =====================================================
-- Verify Results
-- =====================================================
SELECT 
  name,
  location,
  location_group,
  price,
  status
FROM properties
WHERE name IN ('UXAN', 'Vila Ksamil', 'Bosphorus Yalı Villa')
ORDER BY name;

COMMIT;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
-- Script completed successfully!
-- - Polo property deleted
-- - UXAN (Riviera Maya) added
-- - Vila Ksamil (Albanian Riviera) added
-- - Bosphorus Yalı Villa (Mediterranean) added
-- 
-- Next steps:
-- 1. Verify properties appear in /destinos page
-- 2. Check HomePageClient PlatformShowcase
-- 3. Test request-reservation flow
-- =====================================================
