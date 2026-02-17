-- Script to insert 8 diverse properties with different capacities across Mexico, Italy, Albania, and Turkey
-- Delete POLO if it exists
DELETE FROM properties WHERE name = 'POLO 54' OR name LIKE '%POLO%';

-- Insert UXAN (Tulum, Mexico) - 8 guests
INSERT INTO properties (
  id, name, description, location, image_url, status, price, max_guests, bedrooms, bathrooms,
  location_group, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'UXAN',
  'Arquitectura orgánica con celosía de madera tipo domo en la selva maya. Ubicación privilegiada a 1 hora de Playa del Carmen y 2 horas del Aeropuerto Internacional de Cancún.',
  'Riviera Maya, Tulum, México',
  '/images/12.jpeg',
  'available',
  12500.00,
  8,
  4,
  4,
  'RIVIERA MAYA',
  now(),
  now()
) ON CONFLICT (name) DO UPDATE SET
  image_url = EXCLUDED.image_url,
  max_guests = EXCLUDED.max_guests,
  updated_at = now();

-- Insert Vila Ksamil (Albania) - 10 guests
INSERT INTO properties (
  id, name, description, location, image_url, status, price, max_guests, bedrooms, bathrooms,
  location_group, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'Vila Ksamil',
  'Villa moderna frente al mar Jónico con arquitectura mediterránea contemporánea. Vistas panorámicas al mar y acceso directo a playas de arena blanca.',
  'Riviera Albanesa, Ksamil, Albania',
  '/placeholder.svg?height=400&width=600',
  'available',
  11800.00,
  10,
  5,
  4,
  'BALKAN RIVIERA',
  now(),
  now()
) ON CONFLICT (name) DO NOTHING;

-- Insert Bosphorus Yalı (Turkey) - 12 guests
INSERT INTO properties (
  id, name, description, location, image_url, status, price, max_guests, bedrooms, bathrooms,
  location_group, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'Bosphorus Yalı',
  'Mansión otomana renovada en el estrecho del Bósforo. Arquitectura histórica con amenidades modernas, vistas únicas a dos continentes.',
  'Bósforo, Estambul, Turquía',
  '/placeholder.svg?height=400&width=600',
  'available',
  14900.00,
  12,
  6,
  5,
  'MEDITERRANEAN',
  now(),
  now()
) ON CONFLICT (name) DO NOTHING;

-- Insert Borgo di Civita (Italy) - 8 guests
INSERT INTO properties (
  id, name, description, location, image_url, status, price, max_guests, bedrooms, bathrooms,
  location_group, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'Borgo di Civita',
  'Borgo medieval de piedra en las colinas de Umbría. Arquitectura auténtica del siglo XIII restaurada con vistas a viñedos y olivares.',
  'Umbría, Orvieto, Italia',
  '/placeholder.svg?height=400&width=600',
  'available',
  13200.00,
  8,
  4,
  3,
  'ITALIAN COUNTRYSIDE',
  now(),
  now()
) ON CONFLICT (name) DO NOTHING;

-- Insert Casa Bacalar (Mexico) - 6 guests
INSERT INTO properties (
  id, name, description, location, image_url, status, price, max_guests, bedrooms, bathrooms,
  location_group, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'Casa Bacalar',
  'Villa moderna con deck sobre la Laguna de los Siete Colores. Arquitectura contemporánea integrada al entorno natural con aguas turquesas.',
  'Laguna de los Siete Colores, Bacalar, México',
  '/placeholder.svg?height=400&width=600',
  'available',
  9800.00,
  6,
  3,
  3,
  'CARIBBEAN MEXICO',
  now(),
  now()
) ON CONFLICT (name) DO NOTHING;

-- Insert Villa Positano (Italy) - 10 guests
INSERT INTO properties (
  id, name, description, location, image_url, status, price, max_guests, bedrooms, bathrooms,
  location_group, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'Villa Positano',
  'Villa en acantilado con terrazas escalonadas sobre el mar Mediterráneo. Arquitectura típica amalfitana con vistas espectaculares a la costa.',
  'Costa Amalfitana, Positano, Italia',
  '/placeholder.svg?height=400&width=600',
  'available',
  16500.00,
  10,
  5,
  5,
  'AMALFI COAST',
  now(),
  now()
) ON CONFLICT (name) DO NOTHING;

-- Insert Chalet Dolomiti (Italy) - 8 guests
INSERT INTO properties (
  id, name, description, location, image_url, status, price, max_guests, bedrooms, bathrooms,
  location_group, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'Chalet Dolomiti',
  'Chalet alpino de lujo con acceso directo a pistas de esquí. Arquitectura moderna en madera con vistas panorámicas a las Dolomitas.',
  'Dolomitas, Cortina d''Ampezzo, Italia',
  '/placeholder.svg?height=400&width=600',
  'available',
  14200.00,
  8,
  4,
  4,
  'ITALIAN ALPS',
  now(),
  now()
) ON CONFLICT (name) DO NOTHING;

-- Insert Finca Cholula (Mexico) - 12 guests
INSERT INTO properties (
  id, name, description, location, image_url, status, price, max_guests, bedrooms, bathrooms,
  location_group, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'Finca Cholula',
  'Hacienda colonial con vistas a la gran pirámide de Cholula. Arquitectura virreinal restaurada con jardines y patios tradicionales.',
  'Valle de Puebla, Cholula, México',
  '/placeholder.svg?height=400&width=600',
  'available',
  8900.00,
  12,
  6,
  4,
  'CENTRAL MEXICO',
  now(),
  now()
) ON CONFLICT (name) DO NOTHING;

-- Verify insertion
SELECT name, location, max_guests, price, status, location_group 
FROM properties 
WHERE status = 'available' 
ORDER BY location_group, name;
