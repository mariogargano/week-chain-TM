-- Script SQL para insertar las 4 villas reales de UXAN Tulum en la base de datos

-- Eliminar propiedades existentes si ya existen
DELETE FROM properties WHERE name LIKE 'UXAN%';

-- Insertar Villa Cora
INSERT INTO properties (
  name,
  description,
  location,
  city,
  country,
  price,
  image_url,
  status,
  bedrooms,
  bathrooms,
  max_guests,
  location_group,
  property_type,
  square_meters
) VALUES (
  'UXAN Villa Cora',
  'Sumérgete en la serenidad mientras esta residencia de ensueño se funde armoniosamente con la naturaleza. Villa de bambú con 1,000 m2 de terreno y 158 m2 de construcción en el corazón de la selva maya.',
  'Riviera Maya',
  'Tulum',
  'México',
  12500.00,
  'https://cdn.prod.website-files.com/65fc71a078305843e339ff15/660c7265d811d8c5b87393f3_Cora_10.jpg',
  'available',
  2,
  2,
  4,
  'RIVIERA MAYA',
  'villa',
  158
);

-- Insertar Villa Naab
INSERT INTO properties (
  name,
  description,
  location,
  city,
  country,
  price,
  image_url,
  status,
  bedrooms,
  bathrooms,
  max_guests,
  location_group,
  property_type,
  square_meters
) VALUES (
  'UXAN Villa Naab',
  'En medio de la selva y rodeada de naturaleza, esta villa de bambú deslumbra por su auténtica arquitectura. Con 1,000 m2 de terreno y 218 m2 de construcción, ofrece una experiencia única de conexión con la naturaleza.',
  'Riviera Maya',
  'Tulum',
  'México',
  14800.00,
  'https://cdn.prod.website-files.com/65fc71a078305843e339ff15/660c725309cc9bd18f1c442d_0009.jpg',
  'available',
  3,
  3,
  6,
  'RIVIERA MAYA',
  'villa',
  218
);

-- Insertar Loft Saasil
INSERT INTO properties (
  name,
  description,
  location,
  city,
  country,
  price,
  image_url,
  status,
  bedrooms,
  bathrooms,
  max_guests,
  location_group,
  property_type,
  square_meters
) VALUES (
  'UXAN Loft Saasil',
  'Descubre Saasil, lofts de bambú diseñados para crear un espacio armonioso en conexión con la naturaleza. Con 60 m2 de construcción, ofrece una experiencia íntima y acogedora en medio de la selva.',
  'Riviera Maya',
  'Tulum',
  'México',
  9500.00,
  'https://cdn.prod.website-files.com/65fc71a078305843e339ff15/660c7221bf5472a2eb02db6f_0000.jpg',
  'available',
  1,
  1,
  3,
  'RIVIERA MAYA',
  'loft',
  60
);

-- Insertar Villa Aruma
INSERT INTO properties (
  name,
  description,
  location,
  city,
  country,
  price,
  image_url,
  status,
  bedrooms,
  bathrooms,
  max_guests,
  location_group,
  property_type,
  square_meters
) VALUES (
  'UXAN Villa Aruma',
  'Experimenta la armonía entre la arquitectura sostenible y la naturaleza, donde la serenidad se encuentra en cada rincón. Con 1,000 m2 de terreno y 277 m2 de construcción, es la villa más espaciosa de UXAN.',
  'Riviera Maya',
  'Tulum',
  'México',
  15900.00,
  'https://cdn.prod.website-files.com/65fc71a078305843e339ff15/660c7207a97f94e0d5d60adc_0000.jpg',
  'available',
  3,
  3,
  6,
  'RIVIERA MAYA',
  'villa',
  277
);

-- Verificar la inserción
SELECT 
  name,
  city,
  price,
  bedrooms,
  max_guests,
  status
FROM properties 
WHERE name LIKE 'UXAN%'
ORDER BY price ASC;
