-- Add UXAN property in Riviera Maya and similar villa in Albania
-- Both properties use the REQUEST → OFFER → CONFIRM model (no individual weeks)

-- Insert UXAN (Riviera Maya, México)
INSERT INTO properties (
  id,
  name,
  description,
  location,
  location_group,
  image_url,
  price,
  status,
  total_weeks,
  weeks_sold,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'UXAN',
  'UXAN es una localidad dentro del mundo maya más exclusiva y cosmopolita, con una esencia única. Arquitectura orgánica de celosía de madera con diseño contemporáneo bohemio, estructuras inspiradoras que elevan el horizonte y rinden homenaje al patrimonio cultural de Tulum. A una hora de Playa del Carmen y dos horas del Aeropuerto Internacional de Cancún, ubicado en la cuna de una de las civilizaciones más importantes del continente. Fusión perfecta de selva y playa para conectar con la naturaleza en todo su esplendor.',
  'Tulum, Riviera Maya, Quintana Roo, México',
  'RIVIERA MAYA',
  '/images/12.jpeg',
  12500.00,
  'available',
  52,
  0,
  now(),
  now()
);

-- Insert Vila Ksamil (Albanian Riviera, Albania)  
INSERT INTO properties (
  id,
  name,
  description,
  location,
  location_group,
  image_url,
  price,
  status,
  total_weeks,
  weeks_sold,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Vila Ksamil',
  'Vila Ksamil combina arquitectura orgánica mediterránea con diseño bohemio contemporáneo en la virgen Riviera Albanesa. Estructuras de piedra y madera que celebran la tradición arquitectónica de los Balcanes con techos de celosía artesanal. Ubicada a 20 minutos de Sarandë y 1 hora del aeropuerto de Corfú (Grecia), ofrece acceso exclusivo a playas de aguas cristalinas turquesa comparables con el Caribe. Fusión perfecta de montañas de olivos centenarios y costas vírgenes del Jónico, ideal para conectar con la naturaleza mediterránea auténtica.',
  'Ksamil, Riviera Albanesa, Vlorë, Albania',
  'EUROPA MEDITERRÁNEA',
  '/images/10.jpeg',
  11800.00,
  'available',
  52,
  0,
  now(),
  now()
);

-- Verify insertion
SELECT id, name, location, location_group, status, price FROM properties WHERE name IN ('UXAN', 'Vila Ksamil');
