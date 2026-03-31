-- Script para insertar propiedades de prueba para testing
-- Ejecutar en Supabase SQL Editor

-- Primero, verificar si la tabla properties existe y tiene las columnas necesarias
DO $$
BEGIN
  -- Crear propiedades de prueba solo si no existen
  IF NOT EXISTS (SELECT 1 FROM properties WHERE name = 'AFLORA Tulum') THEN
    INSERT INTO properties (
      id,
      name,
      location,
      description,
      image_url,
      status,
      total_weeks,
      price_high_season,
      price_medium_season,
      price_low_season,
      amenities,
      bedrooms,
      bathrooms,
      size,
      gallery,
      spv_name,
      spv_rfc,
      created_at
    ) VALUES 
    (
      gen_random_uuid(),
      'AFLORA Tulum',
      'Tulum, Quintana Roo',
      'Lujoso departamento frente al mar en la zona mas exclusiva de Tulum. Vista panoramica al Caribe, acceso directo a la playa y amenidades de primer nivel.',
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
      'active',
      48,
      9500,
      7000,
      4143,
      ARRAY['Piscina infinity', 'Gym', 'Spa', 'Beach club', 'Concierge 24/7', 'Estacionamiento'],
      2,
      2,
      '98m2',
      ARRAY['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'],
      'WEEK-CHAIN SPV 001 S.A. de C.V.',
      'WCS010101ABC',
      NOW()
    ),
    (
      gen_random_uuid(),
      'Marina Puerto Aventuras',
      'Puerto Aventuras, Quintana Roo',
      'Espectacular villa con muelle privado en la marina de Puerto Aventuras. Perfecta para amantes del mar y deportes acuaticos.',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
      'active',
      48,
      12000,
      9000,
      6000,
      ARRAY['Muelle privado', 'Piscina', 'Terraza panoramica', 'Cocina gourmet', 'Aire acondicionado', 'WiFi alta velocidad'],
      3,
      3,
      '145m2',
      ARRAY['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'],
      'WEEK-CHAIN SPV 002 S.A. de C.V.',
      'WCS020202DEF',
      NOW()
    ),
    (
      gen_random_uuid(),
      'Penthouse Los Cabos',
      'Los Cabos, Baja California Sur',
      'Penthouse de lujo con vista al Arco de Los Cabos y el Mar de Cortes. Terraza privada con jacuzzi y servicio de mayordomo.',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
      'active',
      48,
      15000,
      11000,
      7500,
      ARRAY['Jacuzzi privado', 'Terraza 360', 'Mayordomo', 'Chef privado disponible', 'Campo de golf', 'Spa'],
      4,
      4,
      '220m2',
      ARRAY['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800'],
      'WEEK-CHAIN SPV 003 S.A. de C.V.',
      'WCS030303GHI',
      NOW()
    ),
    (
      gen_random_uuid(),
      'Hacienda Playa del Carmen',
      'Playa del Carmen, Quintana Roo',
      'Hermosa hacienda renovada con estilo contemporaneo a pasos de la Quinta Avenida. Combina la tradicion mexicana con el lujo moderno.',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
      'active',
      48,
      8500,
      6500,
      4500,
      ARRAY['Jardin tropical', 'Alberca', 'Palapa', 'Parrilla', 'Bicicletas', 'Centro historico'],
      2,
      2,
      '110m2',
      ARRAY['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'],
      'WEEK-CHAIN SPV 004 S.A. de C.V.',
      'WCS040404JKL',
      NOW()
    ),
    (
      gen_random_uuid(),
      'Costa Vallarta Premium',
      'Puerto Vallarta, Jalisco',
      'Suite premium con balcon privado y vista a la bahia de Banderas. Ubicado en la zona romantica con acceso al malecon.',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
      'presale',
      48,
      7500,
      5500,
      3800,
      ARRAY['Vista al mar', 'Balcon privado', 'Gym', 'Restaurante', 'Playa', 'Zona romantica'],
      1,
      1,
      '65m2',
      ARRAY['https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800'],
      'WEEK-CHAIN SPV 005 S.A. de C.V.',
      'WCS050505MNO',
      NOW()
    );
  END IF;
END $$;

-- Crear semanas para cada propiedad nueva
DO $$
DECLARE
  prop_record RECORD;
  current_year INT := EXTRACT(YEAR FROM NOW());
BEGIN
  FOR prop_record IN 
    SELECT id FROM properties 
    WHERE NOT EXISTS (
      SELECT 1 FROM weeks WHERE property_id = properties.id
    )
  LOOP
    -- Crear 52 semanas para cada propiedad
    FOR i IN 1..52 LOOP
      INSERT INTO weeks (
        id,
        property_id,
        week_number,
        year,
        status,
        season,
        created_at
      ) VALUES (
        gen_random_uuid(),
        prop_record.id,
        i,
        current_year,
        CASE 
          WHEN i <= 48 THEN 'available'
          ELSE 'company'
        END,
        CASE 
          WHEN i <= 16 THEN 'high'
          WHEN i <= 34 THEN 'medium'
          ELSE 'low'
        END,
        NOW()
      );
    END LOOP;
  END LOOP;
END $$;

-- Verificar insercion
SELECT 
  name, 
  location, 
  status, 
  price_high_season, 
  price_medium_season, 
  price_low_season,
  (SELECT COUNT(*) FROM weeks WHERE property_id = properties.id) as weeks_count
FROM properties
ORDER BY created_at DESC
LIMIT 10;
