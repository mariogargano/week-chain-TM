-- ================================================
-- WEEK-CHAIN: Property Management Script
-- Este script elimina Polo y agrega UXAN, Albania y Turquía
-- ================================================

BEGIN;

-- Step 1: Delete Polo property
DELETE FROM properties 
WHERE LOWER(name) LIKE '%polo%';

-- Step 2: Insert UXAN (Tulum, México)
INSERT INTO properties (
  id,
  name,
  description,
  location,
  city,
  country,
  price,
  image_url,
  status,
  created_at,
  updated_at,
  valor_total_usd,
  presale_target,
  presale_sold,
  presale_progress,
  estado,
  weeks_sold,
  total_weeks,
  unlock_status,
  location_group,
  unlock_order,
  exit_status,
  weeks_purchased,
  weeks_available
)
VALUES (
  gen_random_uuid(),
  'UXAN',
  'UXAN es una localidad dentro del mundo maya más exclusiva y cosmopolita, con una esencia única. Siendo la cuna de una de las civilizaciones y ciudades prehispánicas más importantes del continente, esta área de la Riviera Maya ofrece una mezcla perfecta de selva y playa para conectarnos con la naturaleza en todo su esplendor. La fusión de diseños contemporáneos con influencias tradicionales mayas crea una sinfonía visual que celebra el rico tapiz cultural de la región. Estructuras inspiradoras que no solo elevan el horizonte, sino que también rinden homenaje al patrimonio cultural de Tulum.',
  'Riviera Maya',
  'Tulum',
  'México',
  12500.00,
  '/images/10.jpeg',
  'available',
  NOW(),
  NOW(),
  650000.00,
  52,
  0,
  0.00,
  'pendiente',
  0,
  52,
  'locked',
  'RIVIERA MAYA',
  1,
  'active',
  0,
  52
);

-- Step 3: Insert Vila Ksamil (Albania)
INSERT INTO properties (
  id,
  name,
  description,
  location,
  city,
  country,
  price,
  image_url,
  status,
  created_at,
  updated_at,
  valor_total_usd,
  presale_target,
  presale_sold,
  presale_progress,
  estado,
  weeks_sold,
  total_weeks,
  unlock_status,
  location_group,
  unlock_order,
  exit_status,
  weeks_purchased,
  weeks_available
)
VALUES (
  gen_random_uuid(),
  'Vila Ksamil',
  'Vila Ksamil es una joya escondida en la Riviera Albanesa, donde el mar Jónico abraza playas de arena blanca y aguas cristalinas color turquesa. Esta propiedad de arquitectura orgánica combina diseño contemporáneo con influencias mediterráneas, ofreciendo una experiencia única de lujo bohemio en uno de los destinos más vírgenes y exclusivos de Europa. La fusión de materiales naturales como madera de celosía, ratán y piedra local crea espacios que celebran la belleza natural de la costa albanesa. Ubicada a minutos del Parque Nacional Butrint, Patrimonio de la Humanidad por UNESCO, Vila Ksamil ofrece una conexión auténtica con la historia antigua y la naturaleza del Mediterráneo.',
  'Ksamil',
  'Ksamil',
  'Albania',
  11800.00,
  '/images/11.jpeg',
  'available',
  NOW(),
  NOW(),
  613600.00,
  52,
  0,
  0.00,
  'pendiente',
  0,
  52,
  'locked',
  'BALKAN RIVIERA',
  2,
  'active',
  0,
  52
);

-- Step 4: Insert Bosphorus Yalı Villa (Turquía)
INSERT INTO properties (
  id,
  name,
  description,
  location,
  city,
  country,
  price,
  image_url,
  status,
  created_at,
  updated_at,
  valor_total_usd,
  presale_target,
  presale_sold,
  presale_progress,
  estado,
  weeks_sold,
  total_weeks,
  unlock_status,
  location_group,
  unlock_order,
  exit_status,
  weeks_purchased,
  weeks_available
)
VALUES (
  gen_random_uuid(),
  'Bosphorus Yalı Villa',
  'Bosphorus Yalı Villa es una residencia histórica otomana completamente renovada ubicada en las orillas del estrecho del Bósforo, donde Europa y Asia se encuentran. Esta propiedad icónica combina la arquitectura tradicional yalı turca con diseño contemporáneo de lujo, ofreciendo vistas incomparables al estrecho que conecta el Mar Negro con el Mar de Mármara. Con sus techos altos, ventanales arqueados y detalles ornamentales preservados, la villa celebra siglos de historia otomana mientras ofrece todas las comodidades modernas. La ubicación privilegiada permite disfrutar de la vibrante vida cultural de Estambul, con acceso a bazares históricos, palacios otomanos, y la gastronomía de clase mundial que define a esta ciudad milenaria.',
  'Bósforo',
  'Estambul',
  'Turquía',
  14900.00,
  '/images/12.jpeg',
  'available',
  NOW(),
  NOW(),
  774800.00,
  52,
  0,
  0.00,
  'pendiente',
  0,
  52,
  'locked',
  'MEDITERRANEAN',
  3,
  'active',
  0,
  52
);

-- Verify insertions
SELECT 
  id,
  name,
  location,
  city,
  country,
  price,
  status,
  location_group,
  total_weeks
FROM properties
WHERE name IN ('UXAN', 'Vila Ksamil', 'Bosphorus Yalı Villa')
ORDER BY name;

COMMIT;
