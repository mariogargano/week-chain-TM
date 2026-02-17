-- Add progressive unlock columns to properties table
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS location_group TEXT,
ADD COLUMN IF NOT EXISTS unlock_status TEXT DEFAULT 'available' CHECK (unlock_status IN ('available', 'locked', 'sold_out')),
ADD COLUMN IF NOT EXISTS unlock_order INTEGER DEFAULT 1;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_properties_unlock ON properties(location_group, unlock_order);

-- Function to check if property is sold out (all weeks sold)
CREATE OR REPLACE FUNCTION check_property_sold_out()
RETURNS TRIGGER AS $$
DECLARE
  total_weeks INTEGER;
  sold_weeks INTEGER;
  next_property_id UUID;
BEGIN
  -- Get total weeks and sold weeks for the property
  SELECT COUNT(*) INTO total_weeks
  FROM weeks
  WHERE property_id = NEW.property_id;
  
  SELECT COUNT(*) INTO sold_weeks
  FROM weeks
  WHERE property_id = NEW.property_id 
  AND status IN ('reserved', 'sold', 'minted');
  
  -- If all weeks are sold, mark property as sold_out and unlock next
  IF total_weeks > 0 AND sold_weeks >= total_weeks THEN
    -- Mark current property as sold_out
    UPDATE properties
    SET unlock_status = 'sold_out'
    WHERE id = NEW.property_id;
    
    -- Find and unlock the next property in the same location_group
    SELECT id INTO next_property_id
    FROM properties
    WHERE location_group = (SELECT location_group FROM properties WHERE id = NEW.property_id)
    AND unlock_order = (SELECT unlock_order + 1 FROM properties WHERE id = NEW.property_id)
    AND unlock_status = 'locked'
    LIMIT 1;
    
    IF next_property_id IS NOT NULL THEN
      UPDATE properties
      SET unlock_status = 'available'
      WHERE id = next_property_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on weeks table to check when property sells out
DROP TRIGGER IF EXISTS trigger_check_property_sold_out ON weeks;
CREATE TRIGGER trigger_check_property_sold_out
AFTER UPDATE OF status ON weeks
FOR EACH ROW
WHEN (NEW.status IN ('reserved', 'sold', 'minted') AND OLD.status != NEW.status)
EXECUTE FUNCTION check_property_sold_out();

-- Insert 8 demo properties with progressive unlock system
-- Clear existing demo properties first
DELETE FROM weeks WHERE property_id IN (
  SELECT id FROM properties WHERE location_group IS NOT NULL
);
DELETE FROM properties WHERE location_group IS NOT NULL;

-- Property 1: Tulum (Available)
INSERT INTO properties (
  id, name, location, location_group, unlock_order, unlock_status,
  description, valor_total_usd, price, presale_target, presale_sold,
  status, image_url, created_at
) VALUES (
  gen_random_uuid(),
  'Aflora Tulum - Residencia Boutique',
  'Tulum, Quintana Roo',
  'tulum',
  1,
  'available',
  'Exclusiva residencia boutique en el corazón de Tulum, a pasos de la playa. Diseño contemporáneo con acabados de lujo y amenidades premium.',
  210000,
  4038,
  48,
  12,
  'active',
  '/luxury-beach-resort-tulum.jpg',
  NOW()
);

-- Property 2: Tulum (Locked - unlocks when Property 1 sells out)
INSERT INTO properties (
  id, name, location, location_group, unlock_order, unlock_status,
  description, valor_total_usd, price, presale_target, presale_sold,
  status, image_url, created_at
) VALUES (
  gen_random_uuid(),
  'Tulum Jungle Villa',
  'Tulum, Quintana Roo',
  'tulum',
  2,
  'locked',
  'Villa de lujo rodeada de selva tropical con piscina privada y acceso directo a cenotes. Perfecta para quienes buscan privacidad y naturaleza.',
  185000,
  3558,
  48,
  0,
  'active',
  '/luxury-beach-resort-tulum.jpg',
  NOW()
);

-- Property 3: Cancún (Available)
INSERT INTO properties (
  id, name, location, location_group, unlock_order, unlock_status,
  description, valor_total_usd, price, presale_target, presale_sold,
  status, image_url, created_at
) VALUES (
  gen_random_uuid(),
  'Villa Paraíso Cancún',
  'Cancún, Quintana Roo',
  'cancun',
  1,
  'available',
  'Villa frente al mar con vistas espectaculares al Caribe. Incluye acceso a playa privada, gimnasio y spa de clase mundial.',
  195000,
  3750,
  48,
  8,
  'active',
  '/luxury-villa-cancun-beach.jpg',
  NOW()
);

-- Property 4: CDMX Polanco (Available)
INSERT INTO properties (
  id, name, location, location_group, unlock_order, unlock_status,
  description, valor_total_usd, price, presale_target, presale_sold,
  status, image_url, created_at
) VALUES (
  gen_random_uuid(),
  'Penthouse Polanco',
  'Polanco, Ciudad de México',
  'cdmx_polanco',
  1,
  'available',
  'Penthouse de lujo en el corazón de Polanco con vistas panorámicas de la ciudad. Acabados de primera calidad y ubicación privilegiada.',
  175000,
  3365,
  48,
  15,
  'active',
  '/luxury-penthouse-mexico-city.jpg',
  NOW()
);

-- Property 5: San Miguel de Allende (Available)
INSERT INTO properties (
  id, name, location, location_group, unlock_order, unlock_status,
  description, valor_total_usd, price, presale_target, presale_sold,
  status, image_url, created_at
) VALUES (
  gen_random_uuid(),
  'Casa Colonial San Miguel',
  'San Miguel de Allende, Guanajuato',
  'san_miguel',
  1,
  'available',
  'Hermosa casa colonial restaurada en el centro histórico. Arquitectura tradicional mexicana con comodidades modernas y terraza con vista.',
  145000,
  2788,
  48,
  6,
  'active',
  '/colonial-house-san-miguel-allende.jpg',
  NOW()
);

-- Property 6: Valle de Bravo (Available)
INSERT INTO properties (
  id, name, location, location_group, unlock_order, unlock_status,
  description, valor_total_usd, price, presale_target, presale_sold,
  status, image_url, created_at
) VALUES (
  gen_random_uuid(),
  'Cabaña Valle de Bravo',
  'Valle de Bravo, Estado de México',
  'valle_bravo',
  1,
  'available',
  'Cabaña de montaña con vista al lago. Perfecta para escapadas de fin de semana, con chimenea, jacuzzi y acceso a deportes acuáticos.',
  125000,
  2404,
  48,
  10,
  'active',
  '/mountain-cabin-lake-view-mexico.jpg',
  NOW()
);

-- Property 7: CDMX Condesa (Available)
INSERT INTO properties (
  id, name, location, location_group, unlock_order, unlock_status,
  description, valor_total_usd, price, presale_target, presale_sold,
  status, image_url, created_at
) VALUES (
  gen_random_uuid(),
  'Loft Condesa',
  'Condesa, Ciudad de México',
  'cdmx_condesa',
  1,
  'available',
  'Loft moderno en el barrio más trendy de la ciudad. Diseño industrial con techos altos, cerca de los mejores restaurantes y vida nocturna.',
  105000,
  2019,
  48,
  18,
  'active',
  '/modern-loft-condesa-mexico.jpg',
  NOW()
);

-- Property 8: Playa del Carmen (Available)
INSERT INTO properties (
  id, name, location, location_group, unlock_order, unlock_status,
  description, valor_total_usd, price, presale_target, presale_sold,
  status, image_url, created_at
) VALUES (
  gen_random_uuid(),
  'Casa Moderna Playa del Carmen',
  'Playa del Carmen, Quintana Roo',
  'playa_carmen',
  1,
  'available',
  'Casa contemporánea a 5 minutos de la playa y la Quinta Avenida. Piscina privada, roof garden y diseño minimalista de lujo.',
  165000,
  3173,
  48,
  5,
  'active',
  '/modern-house-playa-del-carmen.jpg',
  NOW()
);

-- Create 52 weeks for each property with seasonal pricing
DO $$
DECLARE
  prop RECORD;
  week_num INTEGER;
  season_name TEXT;
  season_multiplier NUMERIC;
  week_price NUMERIC;
BEGIN
  FOR prop IN SELECT id, price FROM properties WHERE location_group IS NOT NULL LOOP
    FOR week_num IN 1..52 LOOP
      -- Determine season and multiplier
      IF week_num IN (1,2,51,52,24,25,26,27,28) THEN
        season_name := 'peak';
        season_multiplier := 1.4;
      ELSIF week_num BETWEEN 12 AND 16 OR week_num BETWEEN 29 AND 35 THEN
        season_name := 'high';
        season_multiplier := 1.2;
      ELSIF week_num BETWEEN 6 AND 11 OR week_num BETWEEN 36 AND 45 THEN
        season_name := 'medium';
        season_multiplier := 1.0;
      ELSE
        season_name := 'low';
        season_multiplier := 0.8;
      END IF;
      
      week_price := prop.price * season_multiplier;
      
      INSERT INTO weeks (
        id, property_id, week_number, season, price,
        status, start_date, end_date, created_at
      ) VALUES (
        gen_random_uuid(),
        prop.id,
        week_num,
        season_name,
        week_price,
        'available',
        DATE '2025-01-01' + (week_num - 1) * INTERVAL '7 days',
        DATE '2025-01-01' + week_num * INTERVAL '7 days',
        NOW()
      );
    END LOOP;
  END LOOP;
END $$;

-- Update presale_progress for all properties
UPDATE properties
SET presale_progress = CASE 
  WHEN presale_target > 0 THEN (presale_sold::NUMERIC / presale_target::NUMERIC) * 100
  ELSE 0
END
WHERE location_group IS NOT NULL;

-- Summary
SELECT 
  location_group,
  unlock_order,
  name,
  unlock_status,
  presale_sold || '/' || presale_target as "Weeks Sold",
  '$' || valor_total_usd::TEXT as "Total Value"
FROM properties
WHERE location_group IS NOT NULL
ORDER BY location_group, unlock_order;
