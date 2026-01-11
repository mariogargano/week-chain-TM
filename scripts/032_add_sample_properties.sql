-- Add 8 sample properties with progressive unlock system
-- Prices range from $65,000 to $210,000 USD
-- Only the first property in each location is available, others are locked

-- Note: Run script 033_add_progressive_unlock_columns.sql FIRST to add required columns

-- Clear existing demo data
DELETE FROM weeks WHERE property_id IN (SELECT id FROM properties WHERE location_group IS NOT NULL);
DELETE FROM properties WHERE location_group IS NOT NULL;

-- Property 1: Tulum Beach House (AVAILABLE)
INSERT INTO properties (
  name, 
  location, 
  location_group,
  description, 
  valor_total_usd,
  price,
  image_url, 
  status,
  unlock_status,
  unlock_order,
  total_weeks,
  weeks_sold,
  presale_target,
  presale_sold,
  presale_progress
) VALUES (
  'Aflora Tulum Beach House',
  'Tulum, Quintana Roo',
  'Tulum',
  'Hermosa casa frente al mar con acceso privado a la playa. Diseño moderno con acabados de lujo y vista panorámica al Caribe.',
  85000,
  85000,
  '/placeholder.svg?height=400&width=600',
  'active',
  'available',
  1,
  52,
  0,
  52,
  0,
  0
);

-- Property 2: Tulum Jungle Villa (LOCKED - waiting for Property 1 to sell out)
INSERT INTO properties (
  name, 
  location, 
  location_group,
  description, 
  valor_total_usd,
  price,
  image_url, 
  status,
  unlock_status,
  unlock_order,
  total_weeks,
  weeks_sold,
  presale_target,
  presale_sold,
  presale_progress
) VALUES (
  'Tulum Jungle Villa',
  'Tulum, Quintana Roo',
  'Tulum',
  'Villa exclusiva en medio de la selva con cenote privado. Arquitectura sustentable y conexión total con la naturaleza.',
  125000,
  125000,
  '/placeholder.svg?height=400&width=600',
  'active',
  'locked',
  2,
  52,
  0,
  52,
  0,
  0
);

-- Property 3: Cancún Penthouse (AVAILABLE)
INSERT INTO properties (
  name, 
  location, 
  location_group,
  description, 
  valor_total_usd,
  price,
  image_url, 
  status,
  unlock_status,
  unlock_order,
  total_weeks,
  weeks_sold,
  presale_target,
  presale_sold,
  presale_progress
) VALUES (
  'Cancún Marina Penthouse',
  'Cancún, Quintana Roo',
  'Cancún',
  'Penthouse de lujo en zona hotelera con vista a la marina. Acceso directo a playa y servicios de hotel 5 estrellas.',
  145000,
  145000,
  '/placeholder.svg?height=400&width=600',
  'active',
  'available',
  1,
  52,
  0,
  52,
  0,
  0
);

-- Property 4: Playa del Carmen Condo (AVAILABLE)
INSERT INTO properties (
  name, 
  location, 
  location_group,
  description, 
  valor_total_usd,
  price,
  image_url, 
  status,
  unlock_status,
  unlock_order,
  total_weeks,
  weeks_sold,
  presale_target,
  presale_sold,
  presale_progress
) VALUES (
  'Playa del Carmen Ocean View',
  'Playa del Carmen, Quintana Roo',
  'Playa del Carmen',
  'Condominio moderno a pasos de la Quinta Avenida. Perfecto para disfrutar de la vida nocturna y playas del Caribe.',
  95000,
  95000,
  '/placeholder.svg?height=400&width=600',
  'active',
  'available',
  1,
  52,
  0,
  52,
  0,
  0
);

-- Property 5: Puerto Vallarta Villa (AVAILABLE)
INSERT INTO properties (
  name, 
  location, 
  location_group,
  description, 
  valor_total_usd,
  price,
  image_url, 
  status,
  unlock_status,
  unlock_order,
  total_weeks,
  weeks_sold,
  presale_target,
  presale_sold,
  presale_progress
) VALUES (
  'Puerto Vallarta Sunset Villa',
  'Puerto Vallarta, Jalisco',
  'Puerto Vallarta',
  'Villa espectacular con vista al atardecer en la Bahía de Banderas. Arquitectura mexicana contemporánea con piscina infinity.',
  175000,
  175000,
  '/placeholder.svg?height=400&width=600',
  'active',
  'available',
  1,
  52,
  0,
  52,
  0,
  0
);

-- Property 6: Los Cabos Beachfront (AVAILABLE)
INSERT INTO properties (
  name, 
  location, 
  location_group,
  description, 
  valor_total_usd,
  price,
  image_url, 
  status,
  unlock_status,
  unlock_order,
  total_weeks,
  weeks_sold,
  presale_target,
  presale_sold,
  presale_progress
) VALUES (
  'Los Cabos Beachfront Estate',
  'Los Cabos, Baja California Sur',
  'Los Cabos',
  'Propiedad exclusiva frente al mar con acceso directo a playa privada. Diseño arquitectónico premiado con vistas al Arco.',
  210000,
  210000,
  '/placeholder.svg?height=400&width=600',
  'active',
  'available',
  1,
  52,
  0,
  52,
  0,
  0
);

-- Property 7: Mérida Colonial House (AVAILABLE)
INSERT INTO properties (
  name, 
  location, 
  location_group,
  description, 
  valor_total_usd,
  price,
  image_url, 
  status,
  unlock_status,
  unlock_order,
  total_weeks,
  weeks_sold,
  presale_target,
  presale_sold,
  presale_progress
) VALUES (
  'Mérida Casa Colonial',
  'Mérida, Yucatán',
  'Mérida',
  'Casa colonial restaurada en el centro histórico. Combina la elegancia del pasado con comodidades modernas.',
  65000,
  65000,
  '/placeholder.svg?height=400&width=600',
  'active',
  'available',
  1,
  52,
  0,
  52,
  0,
  0
);

-- Property 8: San Miguel de Allende Hacienda (AVAILABLE)
INSERT INTO properties (
  name, 
  location, 
  location_group,
  description, 
  valor_total_usd,
  price,
  image_url, 
  status,
  unlock_status,
  unlock_order,
  total_weeks,
  weeks_sold,
  presale_target,
  presale_sold,
  presale_progress
) VALUES (
  'San Miguel Hacienda Colonial',
  'San Miguel de Allende, Guanajuato',
  'San Miguel de Allende',
  'Hacienda histórica completamente renovada. Arte mexicano y arquitectura colonial en Patrimonio de la Humanidad UNESCO.',
  155000,
  155000,
  '/placeholder.svg?height=400&width=600',
  'active',
  'available',
  1,
  52,
  0,
  52,
  0,
  0
);

-- Generate 52 weeks for each property with seasonal pricing
DO $$
DECLARE
  prop RECORD;
  week_num INTEGER;
  season TEXT;
  week_price DECIMAL(10,2);
  base_price DECIMAL(10,2);
BEGIN
  FOR prop IN SELECT id, valor_total_usd FROM properties WHERE location_group IS NOT NULL LOOP
    base_price := prop.valor_total_usd / 52.0;
    
    FOR week_num IN 1..52 LOOP
      -- Determine season and price multiplier
      -- High season: Christmas/New Year (51-2), Easter (12-15), Summer (25-28)
      -- Low season: Spring (3-11), Fall (29-35)
      -- Medium season: Rest of the year
      IF week_num IN (51, 52, 1, 2, 12, 13, 14, 15, 25, 26, 27, 28) THEN
        season := 'high';
        week_price := base_price * 1.5;
      ELSIF week_num IN (3, 4, 5, 6, 7, 8, 9, 10, 11, 29, 30, 31, 32, 33, 34, 35) THEN
        season := 'low';
        week_price := base_price * 0.8;
      ELSE
        season := 'medium';
        week_price := base_price * 1.0;
      END IF;
      
      INSERT INTO weeks (
        property_id,
        week_number,
        season,
        price,
        status,
        start_date,
        end_date
      ) VALUES (
        prop.id,
        week_num,
        season,
        ROUND(week_price, 2),
        'available',
        DATE '2025-01-01' + (week_num - 1) * INTERVAL '7 days',
        DATE '2025-01-01' + week_num * INTERVAL '7 days'
      );
    END LOOP;
  END LOOP;
END $$;

-- Verify the data
SELECT 
  p.name,
  p.location_group,
  p.unlock_status,
  p.unlock_order,
  p.valor_total_usd as price_usd,
  COUNT(w.id) as total_weeks,
  COUNT(w.id) FILTER (WHERE w.status = 'available') as available_weeks
FROM properties p
LEFT JOIN weeks w ON p.id = w.property_id
WHERE p.location_group IS NOT NULL
GROUP BY p.id, p.name, p.location_group, p.unlock_status, p.unlock_order, p.valor_total_usd
ORDER BY p.location_group, p.unlock_order;
