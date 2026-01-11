-- ============================================================================
-- WEEK-CHAIN: Insertar Propiedades en la Base de Datos
-- ============================================================================
-- INSTRUCCIONES:
-- 1. Ve a Supabase Dashboard → SQL Editor
-- 2. Copia y pega este script COMPLETO
-- 3. Presiona RUN para ejecutar
-- 4. Las propiedades aparecerán inmediatamente en la home y /destinos
-- ============================================================================

BEGIN;

-- Limpiar propiedades existentes de ejemplo (POLO, AFLORA, etc.)
DELETE FROM properties WHERE name IN ('POLO 54', 'AFLORA Tulum', 'Test Property');

-- Insertar UXAN (Tulum, México)
INSERT INTO properties (
  id, name, description, location, image_url, status, price,
  location_group, total_weeks, weeks_sold, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'UXAN',
  'Arquitectura orgánica con celosía de madera sumergida en la selva maya de Tulum. Fusión de diseño contemporáneo con influencias tradicionales mayas, creando espacios únicos integrados con la naturaleza.',
  'Riviera Maya, Tulum, México',
  '/images/12.jpeg',
  'available',
  12500.00,
  'RIVIERA MAYA',
  48,
  0,
  now(),
  now()
);

-- Insertar Vila Ksamil (Albania)
INSERT INTO properties (
  id, name, description, location, image_url, status, price,
  location_group, total_weeks, weeks_sold, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'Vila Ksamil',
  'Villa moderna frente al mar Jónico con vistas panorámicas a las islas griegas. Diseño contemporáneo mediterráneo con terrazas escalonadas y acceso privado a la playa de aguas cristalinas.',
  'Ksamil, Riviera Albanesa, Albania',
  '/luxury-modern-beachfront-villa-ksamil-albania-whit.jpg',
  'available',
  11800.00,
  'BALKAN RIVIERA',
  52,
  0,
  now(),
  now()
);

-- Insertar Bosphorus Yalı (Turquía)
INSERT INTO properties (
  id, name, description, location, image_url, status, price,
  location_group, total_weeks, weeks_sold, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'Bosphorus Yalı Villa',
  'Mansión otomana renovada en el estrecho del Bósforo con arquitectura histórica preservada. Vistas espectaculares donde Europa y Asia se encuentran, con muelles privados y jardines con siglos de historia.',
  'Bósforo, Estambul, Turquía',
  '/ottoman-yali-mansion-bosphorus-istanbul-waterfront.jpg',
  'available',
  14900.00,
  'MEDITERRANEAN',
  52,
  0,
  now(),
  now()
);

-- Insertar Borgo di Civita (Italia - Umbría)
INSERT INTO properties (
  id, name, description, location, image_url, status, price,
  location_group, total_weeks, weeks_sold, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'Borgo di Civita',
  'Borgo medieval de piedra restaurado en las colinas de Umbría con vistas panorámicas de los valles toscanos. Arquitectura histórica del siglo XIV con todas las comodidades modernas, piscina infinity y viñedos propios.',
  'Orvieto, Umbría, Italia',
  '/medieval-stone-borgo-orvieto-umbria-italy-hilltop-.jpg',
  'available',
  13200.00,
  'ITALIAN COUNTRYSIDE',
  48,
  0,
  now(),
  now()
);

-- Insertar Casa Bacalar (México - Laguna)
INSERT INTO properties (
  id, name, description, location, image_url, status, price,
  location_group, total_weeks, weeks_sold, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'Casa Bacalar',
  'Villa moderna con deck sobre la famosa Laguna de los Siete Colores. Diseño minimalista integrado con el agua turquesa, kayaks y paddleboards incluidos. Experiencia única en uno de los cenotes más hermosos de México.',
  'Bacalar, Quintana Roo, México',
  '/modern-luxury-villa-bacalar-lagoon-mexico-overwate.jpg',
  'available',
  9800.00,
  'CARIBBEAN MEXICO',
  52,
  0,
  now(),
  now()
);

-- Insertar Villa Positano (Italia - Costa Amalfitana)
INSERT INTO properties (
  id, name, description, location, image_url, status, price,
  location_group, total_weeks, weeks_sold, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'Villa Positano',
  'Villa en acantilado con terrazas escalonadas sobre el Mediterráneo. Arquitectura típica de la Costa Amalfitana con azulejos de cerámica pintados a mano, limoneros centenarios y acceso privado a caleta escondida.',
  'Positano, Costa Amalfitana, Italia',
  '/cliffside-villa-positano-amalfi-coast-italy-medite.jpg',
  'available',
  16500.00,
  'AMALFI COAST',
  48,
  0,
  now(),
  now()
);

-- Insertar Chalet Dolomiti (Italia - Alpes)
INSERT INTO properties (
  id, name, description, location, image_url, status, price,
  location_group, total_weeks, weeks_sold, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'Chalet Dolomiti',
  'Chalet alpino de lujo con acceso directo a pistas de esquí en Cortina d''Ampezzo. Arquitectura tradicional tirolesa con interiores contemporáneos, spa privado, sauna finlandesa y vistas panorámicas a las Dolomitas declaradas Patrimonio de la Humanidad.',
  'Cortina d''Ampezzo, Dolomitas, Italia',
  '/luxury-alpine-chalet-dolomites-italy-mountain-view.jpg',
  'available',
  14200.00,
  'ITALIAN ALPS',
  48,
  0,
  now(),
  now()
);

-- Insertar Finca Cholula (México - Puebla)
INSERT INTO properties (
  id, name, description, location, image_url, status, price,
  location_group, total_weeks, weeks_sold, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'Finca Cholula',
  'Hacienda colonial restaurada con vistas espectaculares a la pirámide de Cholula y los volcanes Popocatépetl e Iztaccíhuatl. Arquitectura virreinal del siglo XVIII con patios coloniales, fuentes históricas y capilla privada.',
  'Cholula, Puebla, México',
  '/colonial-hacienda-cholula-puebla-mexico-pyramid-vi.jpg',
  'available',
  8900.00,
  'CENTRAL MEXICO',
  52,
  0,
  now(),
  now()
);

-- Verificar que se insertaron correctamente
SELECT 
  name, 
  location, 
  price, 
  status, 
  location_group,
  total_weeks
FROM properties
ORDER BY location_group, name;

COMMIT;

-- ============================================================================
-- RESULTADO ESPERADO:
-- Deberías ver 8 propiedades insertadas agrupadas por región:
-- - AMALFI COAST: Villa Positano
-- - BALKAN RIVIERA: Vila Ksamil
-- - CARIBBEAN MEXICO: Casa Bacalar
-- - CENTRAL MEXICO: Finca Cholula
-- - ITALIAN ALPS: Chalet Dolomiti
-- - ITALIAN COUNTRYSIDE: Borgo di Civita
-- - MEDITERRANEAN: Bosphorus Yalı Villa
-- - RIVIERA MAYA: UXAN
-- ============================================================================
