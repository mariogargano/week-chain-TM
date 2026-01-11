-- Add UXAN as a showcase property (NO weeks, NO pricing)
-- This is simply a catalog entry for the REQUEST→OFFER→CONFIRM flow

INSERT INTO properties (
  id,
  name,
  location,
  location_group,
  description,
  image_url,
  status,
  total_weeks,
  weeks_sold,
  valor_total_usd,
  property_duration_years,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'UXAN',
  'Tulum, Quintana Roo, México',
  'MEXICO',
  'Ubicación privilegiada a una hora de Playa del Carmen y dos horas del Aeropuerto Internacional de Cancún. UXAN se encuentra en una de las localidades dentro del mundo maya más exclusiva y cosmopolita. Arquitectura orgánica con estructuras de madera en celosía tipo domo, interiores bohemio-lujosos con materiales naturales (ratán, madera, concreto pulido). Espacios dramáticos con techos altos y ventanales geométricos que celebran el rico tapiz cultural de la región.',
  '/images/3-20-281-29.jpeg',
  'available',
  52,
  0,
  2600000,
  15,
  now(),
  now()
);

-- Verify insertion
SELECT id, name, location, status, total_weeks 
FROM properties 
WHERE name = 'UXAN';
