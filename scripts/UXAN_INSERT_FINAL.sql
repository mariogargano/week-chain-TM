-- UXAN Property Insert Script
-- Execute this in Supabase SQL Editor

INSERT INTO public.properties (
  id,
  name,
  description,
  location,
  location_group,
  image_url,
  status,
  total_weeks,
  weeks_sold,
  price,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'UXAN',
  'UXAN es una localidad dentro del mundo maya más exclusiva y cosmopolita, con una esencia única. Siendo la cuna de una de las civilizaciones y ciudades prehispánicas más importantes del continente, esta área de la Riviera Maya ofrece una mezcla perfecta de selva y playa para conectarnos con la naturaleza en todo su esplendor.

La fusión de diseños contemporáneos con influencias tradicionales mayas crea una sinfonía visual que celebra el rico tapiz cultural de la región. Estructuras inspiradoras que no solo elevan el horizonte, sino que también rinden homenaje al patrimonio cultural de Tulum.

UBICACIÓN PRIVILEGIADA:
• Aeropuerto de Tulum: 15 min
• Estación Tren Maya: 20 min  
• Tulum Pueblo: 10 min
• Boann, Club de Laguna: 15 min
• Laguna Kaan Lum: 5 min
• Ammos, Club de Playa: 20 min
• Biosfera de Sian Ka''an: 15 min

ARQUITECTURA ORGÁNICA:
• Estructura de domo con celosía de madera geométrica
• Techos altos de bambú tejido con vigas expuestas
• Ventanales triangulares floor-to-ceiling
• Espacios abiertos que conectan interior y exterior
• Materiales naturales: ratán, madera, concreto pulido, jute
• Iluminación cálida con lámparas artesanales tejidas
• Diseño contemporáneo con alma maya tradicional',
  'Riviera Maya, Tulum, México',
  'RIVIERA MAYA',
  '/placeholder.svg?height=400&width=600&text=UXAN',
  'available',
  52,
  0,
  12500.00,
  now(),
  now()
);

-- Verify insertion
SELECT 
  id,
  name,
  location_group,
  status,
  total_weeks,
  price
FROM public.properties 
WHERE name = 'UXAN';
