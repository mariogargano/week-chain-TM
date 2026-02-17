-- =============================================
-- WEEK-CHAIN: Insert New Properties
-- =============================================
-- This script inserts UXAN (México), Vila Ksamil (Albania), 
-- Bosphorus Yalı Villa (Turquía), and Borgo di Civita (Italia)
-- =============================================

BEGIN;

-- Delete old POLO property if exists
DELETE FROM properties WHERE name ILIKE '%polo%';

-- Insert UXAN (Tulum, México)
INSERT INTO properties (
  id,
  name,
  description,
  location,
  city,
  country,
  image_url,
  status,
  price,
  location_group,
  max_guests,
  bedrooms,
  bathrooms,
  total_weeks,
  weeks_sold
) VALUES (
  'f1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c',
  'UXAN',
  'UXAN es una localidad dentro del mundo maya más exclusiva y cosmopolita, con una esencia única. Arquitectura orgánica con estructuras de celosía de madera tipo domo que fusiona diseño contemporáneo con influencias mayas tradicionales. Interiores bohemio-lujosos con materiales naturales (ratán, madera, concreto pulido). Ubicación privilegiada a 15 min del aeropuerto de Tulum y 20 min de la Estación Tren Maya.',
  'Riviera Maya',
  'Tulum',
  'México',
  '/images/10.jpeg',
  'available',
  12500.00,
  'RIVIERA MAYA',
  8,
  4,
  4,
  52,
  0
);

-- Insert Vila Ksamil (Albania)
INSERT INTO properties (
  id,
  name,
  description,
  location,
  city,
  country,
  image_url,
  status,
  price,
  location_group,
  max_guests,
  bedrooms,
  bathrooms,
  total_weeks,
  weeks_sold
) VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Vila Ksamil',
  'Villa mediterránea de lujo en la Riviera Albanesa con vistas espectaculares al Mar Jónico. Arquitectura contemporánea con materiales naturales, piscina infinita, y acceso privado a playas de aguas cristalinas. Diseño bohemio-chic que combina elegancia moderna con la calidez de la costa adriática. Cerca de sitios arqueológicos de Butrint (UNESCO) y la isla griega de Corfú.',
  'Riviera Albanesa',
  'Ksamil',
  'Albania',
  '/placeholder.svg?height=400&width=600',
  'available',
  11800.00,
  'BALKAN RIVIERA',
  8,
  4,
  3,
  52,
  0
);

-- Insert Bosphorus Yalı Villa (Turquía)
INSERT INTO properties (
  id,
  name,
  description,
  location,
  city,
  country,
  image_url,
  status,
  price,
  location_group,
  max_guests,
  bedrooms,
  bathrooms,
  total_weeks,
  weeks_sold
) VALUES (
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  'Bosphorus Yalı Villa',
  'Yalı histórico completamente renovado en las orillas del Bósforo con vistas panorámicas de Estambul. Arquitectura otomana restaurada con interiores de lujo contemporáneo, muelles privados, hammam tradicional, y jardines con vistas al estrecho. Acceso directo al agua, cerca de palacios históricos y el vibrante centro de Estambul. Experiencia única entre Europa y Asia.',
  'Bósforo',
  'Estambul',
  'Turquía',
  '/placeholder.svg?height=400&width=600',
  'available',
  14900.00,
  'MEDITERRANEAN',
  10,
  5,
  5,
  52,
  0
);

-- Insert Borgo di Civita (Italia)
INSERT INTO properties (
  id,
  name,
  description,
  location,
  city,
  country,
  image_url,
  status,
  price,
  location_group,
  max_guests,
  bedrooms,
  bathrooms,
  total_weeks,
  weeks_sold
) VALUES (
  'c3d4e5f6-a7b8-9012-cdef-123456789012',
  'Borgo di Civita',
  'Residencia histórica en borgo medieval restaurado en las colinas de Umbría con vistas a Orvieto. Arquitectura de piedra auténtica del siglo XIII con interiores modernizados, vigas de madera originales, chimenea de época, y jardín privado con olivos centenarios. Viñedos propios, bodega subterránea, y piscina panorámica. Proximidad a Roma, Florencia y el corazón de la Toscana.',
  'Umbría',
  'Orvieto',
  'Italia',
  '/placeholder.svg?height=400&width=600',
  'available',
  13200.00,
  'MEDITERRANEAN',
  6,
  3,
  3,
  52,
  0
);

-- Verify inserts
SELECT 
  name,
  city,
  country,
  location_group,
  price,
  status
FROM properties
WHERE id IN (
  'f1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  'c3d4e5f6-a7b8-9012-cdef-123456789012'
);

COMMIT;

-- =============================================
-- INSTRUCCIONES:
-- 1. Ve a Supabase Dashboard
-- 2. Click en "SQL Editor" 
-- 3. Copia y pega este script
-- 4. Click "Run"
-- 5. Las 4 propiedades aparecerán en /destinos y en la home
-- =============================================
