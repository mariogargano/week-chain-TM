-- Progressive Property Unlock System
-- Only 1 property per location is available at a time
-- Next property unlocks when previous one is fully sold

-- Add new columns to properties table for unlock system
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS unlock_order INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS unlock_status TEXT DEFAULT 'locked' CHECK (unlock_status IN ('available', 'locked', 'sold_out')),
ADD COLUMN IF NOT EXISTS location_group TEXT,
ADD COLUMN IF NOT EXISTS weeks_available INTEGER DEFAULT 52,
ADD COLUMN IF NOT EXISTS weeks_remaining INTEGER DEFAULT 52;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_properties_unlock ON properties(location_group, unlock_order, unlock_status);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status, unlock_status);

-- Function to check and unlock next property in location
CREATE OR REPLACE FUNCTION unlock_next_property_in_location()
RETURNS TRIGGER AS $$
DECLARE
  current_property RECORD;
  next_property_id UUID;
BEGIN
  -- Get the property that was just fully sold
  SELECT * INTO current_property
  FROM properties
  WHERE id = NEW.property_id;
  
  -- Check if all weeks are sold
  IF current_property.weeks_remaining <= 0 THEN
    -- Mark current property as sold out
    UPDATE properties
    SET unlock_status = 'sold_out',
        updated_at = NOW()
    WHERE id = current_property.id;
    
    -- Find and unlock next property in same location
    SELECT id INTO next_property_id
    FROM properties
    WHERE location_group = current_property.location_group
      AND unlock_order = current_property.unlock_order + 1
      AND unlock_status = 'locked'
    LIMIT 1;
    
    IF next_property_id IS NOT NULL THEN
      UPDATE properties
      SET unlock_status = 'available',
          updated_at = NOW()
      WHERE id = next_property_id;
      
      RAISE NOTICE 'Unlocked next property in %: %', current_property.location_group, next_property_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-unlock when a week is sold
DROP TRIGGER IF EXISTS trigger_unlock_next_property ON weeks;
CREATE TRIGGER trigger_unlock_next_property
AFTER UPDATE OF status ON weeks
FOR EACH ROW
WHEN (NEW.status = 'sold' AND OLD.status != 'sold')
EXECUTE FUNCTION unlock_next_property_in_location();

-- Function to update weeks_remaining counter
CREATE OR REPLACE FUNCTION update_weeks_remaining()
RETURNS TRIGGER AS $$
BEGIN
  -- Decrement weeks_remaining when a week is sold
  IF NEW.status = 'sold' AND OLD.status != 'sold' THEN
    UPDATE properties
    SET weeks_remaining = weeks_remaining - 1,
        presale_sold = presale_sold + 1,
        presale_progress = (presale_sold + 1)::numeric / weeks_available * 100,
        updated_at = NOW()
    WHERE id = NEW.property_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_weeks_remaining ON weeks;
CREATE TRIGGER trigger_update_weeks_remaining
AFTER UPDATE OF status ON weeks
FOR EACH ROW
EXECUTE FUNCTION update_weeks_remaining();

-- Clear existing demo data
DELETE FROM weeks WHERE property_id IN (SELECT id FROM properties);
DELETE FROM properties;

-- Insert 75 properties across different locations in Mexico
-- Prices range from $10,000 to $210,000 USD

-- TULUM (10 properties) - Beach paradise
INSERT INTO properties (id, name, location, location_group, description, valor_total_usd, price, image_url, status, unlock_status, unlock_order, weeks_available, weeks_remaining, presale_target, presale_sold, presale_progress, estado, created_at, updated_at) VALUES
('10000000-0000-0000-0000-000000000001'::uuid, 'Aflora Tulum Fase 1', 'Tulum, Quintana Roo', 'tulum', 'Exclusivo desarrollo eco-chic con acceso a playa privada. Beach club, spa y restaurante gourmet.', 2080000, 40000, 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200', 'active', 'available', 1, 52, 52, 48, 0, 0, 'activo', NOW(), NOW()),
('10000000-0000-0000-0000-000000000002'::uuid, 'Aflora Tulum Fase 2', 'Tulum, Quintana Roo', 'tulum', 'Segunda fase del desarrollo más exclusivo de Tulum. Vistas al mar y selva maya.', 2184000, 42000, 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200', 'active', 'locked', 2, 52, 52, 48, 0, 0, 'activo', NOW(), NOW()),
('10000000-0000-0000-0000-000000000003'::uuid, 'Tulum Jungle Villas', 'Tulum, Quintana Roo', 'tulum', 'Villas boutique en medio de la selva con cenote privado y yoga shala.', 1560000, 30000, 'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=1200', 'active', 'locked', 3, 52, 52, 48, 0, 0, 'activo', NOW(), NOW()),
('10000000-0000-0000-0000-000000000004'::uuid, 'Tulum Beach Residences', 'Tulum, Quintana Roo', 'tulum', 'Residencias frente al mar con diseño sustentable y paneles solares.', 2600000, 50000, 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200', 'active', 'locked', 4, 52, 52, 48, 0, 0, 'activo', NOW(), NOW()),
('10000000-0000-0000-0000-000000000005'::uuid, 'Tulum Eco Resort', 'Tulum, Quintana Roo', 'tulum', 'Resort ecológico con arquitectura maya contemporánea y amenidades premium.', 1820000, 35000, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200', 'active', 'locked', 5, 52, 52, 48, 0, 0, 'activo', NOW(), NOW()),
('10000000-0000-0000-0000-000000000006'::uuid, 'Tulum Wellness Retreat', 'Tulum, Quintana Roo', 'tulum', 'Centro de bienestar con spa holístico, temazcal y clases de meditación.', 1456000, 28000, 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200', 'active', 'locked', 6, 52, 52, 48, 0, 0, 'activo', NOW(), NOW()),
('10000000-0000-0000-0000-000000000007'::uuid, 'Tulum Luxury Condos', 'Tulum, Quintana Roo', 'tulum', 'Condominios de lujo con rooftop infinity pool y vistas panorámicas.', 2080000, 40000, 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200', 'active', 'locked', 7, 52, 52, 48, 0, 0, 'activo', NOW(), NOW()),
('10000000-0000-0000-0000-000000000008'::uuid, 'Tulum Beachfront Suites', 'Tulum, Quintana Roo', 'tulum', 'Suites frente a la playa con acceso directo y servicio de concierge 24/7.', 2912000, 56000, 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200', 'active', 'locked', 8, 52, 52, 48, 0, 0, 'activo', NOW(), NOW()),
('10000000-0000-0000-0000-000000000009'::uuid, 'Tulum Cenote Villas', 'Tulum, Quintana Roo', 'tulum', 'Villas exclusivas con cenote privado y acceso a red de cavernas subterráneas.', 3120000, 60000, 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200', 'active', 'locked', 9, 52, 52, 48, 0, 0, 'activo', NOW(), NOW()),
('10000000-0000-0000-0000-000000000010'::uuid, 'Tulum Paradise Estate', 'Tulum, Quintana Roo', 'tulum', 'Mega desarrollo con campo de golf, marina y club de playa privado.', 10920000, 210000, 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200', 'active', 'locked', 10, 52, 52, 48, 0, 0, 'activo', NOW(), NOW());

-- CANCÚN (10 properties) - Caribbean luxury
INSERT INTO properties (id, name, location, location_group, description, valor_total_usd, price, image_url, status, unlock_status, unlock_order, weeks_available, weeks_remaining, presale_target, presale_sold, presale_progress, estado, created_at, updated_at) VALUES
('20000000-0000-0000-0000-000000000001'::uuid, 'Villa Paraíso Cancún', 'Cancún, Quintana Roo', 'cancun', 'Lujosa villa frente al mar Caribe con piscina infinity y jacuzzi.', 2600000, 50000, 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1200', 'active', 'available', 1, 52, 52, 48, 0, 0, 'activo', NOW(), NOW()),
('20000000-0000-0000-0000-000000000002'::uuid, 'Cancún Marina Residences', 'Cancún, Quintana Roo', 'cancun', 'Residencias de lujo en marina privada con yates y deportes acuáticos.', 3640000, 70000, 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200', 'active', 'locked', 2, 52, 52, 48, 0, 0, 'activo', NOW(), NOW()),
('20000000-0000-0000-0000-000000000003'::uuid, 'Cancún Beach Club', 'Cancún, Quintana Roo', 'cancun', 'Exclusivo beach club con restaurante gourmet y spa de clase mundial.', 2080000, 40000, 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200', 'active', 'locked', 3, 52, 52, 48, 0, 0, 'activo', NOW(), NOW()),
('20000000-0000-0000-0000-000000000004'::uuid, 'Cancún Oceanfront Towers', 'Cancún, Quintana Roo', 'cancun', 'Torres frente al océano con amenidades de resort y seguridad 24/7.', 2912000, 56000, 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200', 'active', 'locked', 4, 52, 52, 48, 0, 0, 'activo', NOW(), NOW()),
('20000000-0000-0000-0000-000000000005'::uuid, 'Cancún Golf Resort', 'Cancún, Quintana Roo', 'cancun', 'Resort con campo de golf diseñado por Jack Nicklaus y club house.', 4160000, 80000, 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=1200', 'active', 'locked', 5, 52, 52, 48, 0, 0, 'activo', NOW(), NOW()),
('20000000-0000-0000-0000-000000000006'::uuid, 'Cancún Lagoon Villas', 'Cancún, Quintana Roo', 'cancun', 'Villas en laguna con muelle privado y acceso directo al mar.', 3120000, 60000, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200', 'active', 'locked', 6, 52, 52, 48, 0, 0, 'activo', NOW(), NOW()),
('20000000-0000-0000-0000-000000000007'::uuid, 'Cancún Luxury Penthouses', 'Cancún, Quintana Roo', 'cancun', 'Penthouses de ultra lujo con terraza privada y piscina en rooftop.', 5200000, 100000, 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=1200', 'active', 'locked', 7, 52, 52, 48, 0, 0, 'activo', NOW(), NOW()),
('20000000-0000-0000-0000-000000000008'::uuid, 'Cancún Island Resort', 'Cancún, Quintana Roo', 'cancun', 'Resort en isla privada accesible solo por ferry o yate privado.', 6760000, 130000, 'https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?w=1200', 'active', 'locked', 8, 52, 52, 48, 0, 0, 'activo', NOW(), NOW()),
('20000000-0000-0000-0000-000000000009'::uuid, 'Cancún Mega Yacht Club', 'Cancún, Quintana Roo', 'cancun', 'Club náutico exclusivo con slips para mega yates y helipuerto.', 8320000, 160000, 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200', 'active', 'locked', 9, 52, 52, 48, 0, 0, 'activo', NOW(), NOW()),
('20000000-0000-0000-0000-000000000010'::uuid, 'Cancún Paradise Island', 'Cancún, Quintana Roo', 'cancun', 'Desarrollo ultra exclusivo en isla privada con todas las amenidades.', 10920000, 210000, 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200', 'active', 'locked', 10, 52, 52, 48, 0, 0, 'activo', NOW(), NOW());

-- PLAYA DEL CARMEN (8 properties)
INSERT INTO properties (id, name, location, location_group, description, valor_total_usd, price, image_url, status, unlock_status, unlock_order, weeks_available, weeks_remaining, presale_target, presale_sold, presale_progress, estado, created_at, updated_at) VALUES
('30000000-0000-0000-0000-000000000001'::uuid, 'Playa del Carmen Beach House', 'Playa del Carmen, Quintana Roo', 'playa_carmen', 'Casa de playa moderna a pasos de la Quinta Avenida y el mar.', 1560000, 30000, 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1200', 'active', 'available', 1, 52, 52, 48, 0, 0, 'activo', NOW(), NOW()),
('30000000-0000-0000-0000-000000000002'::uuid, 'Playa Luxury Condos', 'Playa del Carmen, Quintana Roo', 'playa_carmen', 'Condominios de lujo con rooftop pool y vista al mar Caribe.', 2080000, 40000, 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200', 'active', 'locked', 2, 52, 52, 48, 0, 0, 'activo', NOW(), NOW()),
('30000000-0000-0000-0000-000000000003'::uuid, 'Playa Beachfront Villas', 'Playa del Carmen, Quintana Roo', 'playa_carmen', 'Villas frente a la playa con piscina privada y acceso directo.', 2600000, 50000, 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200', 'active', 'locked', 3, 52, 52, 48, 0, 0, 'activo', NOW(), NOW()),
('30000000-0000-0000-0000-000000000004'::uuid, 'Playa Marina Residences', 'Playa del Carmen, Quintana Roo', 'playa_carmen', 'Residencias en marina con muelle privado y club náutico.', 3640000, 70000, 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200', 'active', 'locked', 4, 52, 52, 48, 0, 0, 'activo', NOW(), NOW()),
('30000000-0000-0000-0000-000000000005'::uuid, 'Playa Eco Resort', 'Playa del Carmen, Quintana Roo', 'playa_carmen', 'Resort ecológico con cenotes y actividades de aventura.', 2912000, 56000, 'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=1200', 'active', 'locked', 5, 52, 52, 48, 0, 0, 'activo', NOW(), NOW()),
('30000000-0000-0000-0000-000000000006'::uuid, 'Playa Wellness Center', 'Playa del Carmen, Quintana Roo', 'playa_carmen', 'Centro de bienestar con spa, yoga y tratamientos holísticos.', 2080000, 40000, 'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=1200', 'active', 'locked', 6, 52, 52, 48, 0, 0, 'activo', NOW(), NOW()),
('30000000-0000-0000-0000-000000000007'::uuid, 'Playa Luxury Resort', 'Playa del Carmen, Quintana Roo', 'playa_carmen', 'Resort de lujo all-inclusive con múltiples restaurantes y bares.', 4680000, 90000, 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200', 'active', 'locked', 7, 52, 52, 48, 0, 0, 'activo', NOW(), NOW()),
('30000000-0000-0000-0000-000000000008'::uuid, 'Playa Paradise Estate', 'Playa del Carmen, Quintana Roo', 'playa_carmen', 'Mega desarrollo con golf, marina y todas las amenidades premium.', 7280000, 140000, 'https://images.unsplash.com/photo-1600566753151-384129cf4e3e?w=1200', 'active', 'locked', 8, 52, 52, 48, 0, 0, 'activo', NOW(), NOW());

-- CIUDAD DE MÉXICO - POLANCO (7 properties)
INSERT INTO properties (id, name, location, location_group, description, valor_total_usd, price, image_url, status, unlock_status, unlock_order, weeks_available, weeks_remaining, presale_target, presale_sold, presale_progress, estado, created_at, updated_at) VALUES
('40000000-0000-0000-0000-000000000001'::uuid, 'Penthouse Polanco', 'Polanco, Ciudad de México', 'polanco', 'Elegante penthouse con terraza panorámica de 360° y acabados de lujo.', 2028000, 39000, 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200', 'active', 'available', 1, 52, 52, 48, 0, 0, 'activo', NOW(), NOW()),
('40000000-0000-0000-0000-000000000002'::uuid, 'Polanco Luxury Suites', 'Polanco, Ciudad de México', 'polanco', 'Suites de lujo en el corazón de Polanco con servicio de hotel.', 2600000, 50000, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200', 'active', 'locked', 2, 52, 52, 48, 0, 0, 'activo', NOW(), NOW()),
('40000000-0000-0000-0000-000000000003'::uuid, 'Polanco Residences', 'Polanco, Ciudad de México', 'polanco', 'Residencias exclusivas con concierge y amenidades de clase mundial.', 3120000, 60000, 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200', 'active', 'locked', 3, 52, 52, 48, 0, 0, 'activo', NOW(), NOW()),
('40000000-0000-0000-0000-000000000004'::uuid, 'Polanco Sky Towers', 'Polanco, Ciudad de México', 'polanco', 'Torres de lujo con sky lounge, gimnasio y piscina en rooftop.', 4160000, 80000, 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200', 'active', 'locked', 4, 52, 52, 48, 0, 0, 'activo', NOW(), NOW()),
('40000000-0000-0000-0000-000000000005'::uuid, 'Polanco Executive Suites', 'Polanco, Ciudad de México', 'polanco', 'Suites ejecutivas con oficina privada y salas de juntas.', 3640000, 70000, 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200', 'active', 'locked', 5, 52, 52, 48, 0, 0, 'activo', NOW(), NOW()),
('40000000-0000-0000-0000-000000000006'::uuid, 'Polanco Premium Lofts', 'Polanco, Ciudad de México', 'polanco', 'Lofts de diseño con techos altos y acabados premium.', 2912000, 56000, 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=1200', 'active', 'locked', 6, 52, 52, 48, 0, 0, 'activo', NOW(), NOW()),
('40000000-0000-0000-0000-000000000007'::uuid, 'Polanco Grand Estate', 'Polanco, Ciudad de México', 'polanco', 'Desarrollo ultra exclusivo con spa, restaurante y helipuerto.', 6240000, 120000, 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200', 'active', 'locked', 7, 52, 52, 48, 0, 0, 'activo', NOW(), NOW());

-- Continue with more locations...
-- SAN MIGUEL DE ALLENDE (6 properties)
INSERT INTO properties (id, name, location, location_group, description, valor_total_usd, price, image_url, status, unlock_status, unlock_order, weeks_available, weeks_remaining, presale_target, presale_sold, presale_progress, estado, created_at, updated_at) VALUES
('50000000-0000-0000-0000-000000000001'::uuid, 'Casa Colonial San Miguel', 'San Miguel de Allende, Guanajuato', 'san_miguel', 'Hermosa casa colonial restaurada en el centro histórico.', 1014000, 19500, 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200', 'active', 'available', 1, 52, 52, 48, 0, 0, 'activo', NOW(), NOW()),
('50000000-0000-0000-0000-000000000002'::uuid, 'San Miguel Boutique Hotel', 'San Miguel de Allende, Guanajuato', 'san_miguel', 'Hotel boutique con arquitectura colonial y amenidades modernas.', 1560000, 30000, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200', 'active', 'locked', 2, 52, 52, 48, 0, 0, 'activo', NOW(), NOW()),
('50000000-0000-0000-0000-000000000003'::uuid, 'San Miguel Hacienda', 'San Miguel de Allende, Guanajuato', 'san_miguel', 'Hacienda restaurada con viñedo y producción de vino artesanal.', 2080000, 40000, 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200', 'active', 'locked', 3, 52, 52, 48, 0, 0, 'activo', NOW(), NOW()),
('50000000-0000-0000-0000-000000000004'::uuid, 'San Miguel Art Residences', 'San Miguel de Allende, Guanajuato', 'san_miguel', 'Residencias para artistas con estudios y galerías privadas.', 1560000, 30000, 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200', 'active', 'locked', 4, 52, 52, 48, 0, 0, 'activo', NOW(), NOW()),
('50000000-0000-0000-0000-000000000005'::uuid, 'San Miguel Wellness Retreat', 'San Miguel de Allende, Guanajuato', 'san_miguel', 'Retiro de bienestar con spa, yoga y terapias alternativas.', 2080000, 40000, 'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=1200', 'active', 'locked', 5, 52, 52, 48, 0, 0, 'activo', NOW(), NOW()),
('50000000-0000-0000-0000-000000000006'::uuid, 'San Miguel Grand Estate', 'San Miguel de Allende, Guanajuato', 'san_miguel', 'Mega hacienda con campo de golf, spa y restaurante gourmet.', 3640000, 70000, 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200', 'active', 'locked', 6, 52, 52, 48, 0, 0, 'activo', NOW(), NOW());

-- VALLE DE BRAVO (6 properties)
INSERT INTO properties (id, name, location, location_group, description, valor_total_usd, price, image_url, status, unlock_status, unlock_order, weeks_available, weeks_remaining, presale_target, presale_sold, presale_progress, estado, created_at, updated_at) VALUES
('60000000-0000-0000-0000-000000000001'::uuid, 'Cabaña Valle de Bravo', 'Valle de Bravo, Estado de México', 'valle_bravo', 'Acogedora cabaña de montaña con vista al lago y chimenea.', 676000, 13000, 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=1200', 'active', 'available', 1, 52, 52, 48, 0, 0, 'activo', NOW(), NOW()),
('60000000-0000-0000-0000-000000000002'::uuid, 'Valle Lake House', 'Valle de Bravo, Estado de México', 'valle_bravo', 'Casa frente al lago con muelle privado y deportes acuáticos.', 1040000, 20000, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200', 'active', 'locked', 2, 52, 52, 48, 0, 0, 'activo', NOW(), NOW()),
('60000000-0000-0000-0000-000000000003'::uuid, 'Valle Mountain Resort', 'Valle de Bravo, Estado de México', 'valle_bravo', 'Resort de montaña con spa, restaurante y actividades outdoor.', 1560000, 30000, 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200', 'active', 'locked', 3, 52, 52, 48, 0, 0, 'activo', NOW(), NOW()),
('60000000-0000-0000-0000-000000000004'::uuid, 'Valle Eco Lodge', 'Valle de Bravo, Estado de México', 'valle_bravo', 'Lodge ecológico con cabañas sustentables y granja orgánica.', 1040000, 20000, 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200', 'active', 'locked', 4, 52, 52, 48, 0, 0, 'activo', NOW(), NOW()),
('60000000-0000-0000-0000-000000000005'::uuid, 'Valle Adventure Resort', 'Valle de Bravo, Estado de México', 'valle_bravo', 'Resort de aventura con tirolesa, rappel y parapente.', 1560000, 30000, 'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=1200', 'active', 'locked', 5, 52, 52, 48, 0, 0, 'activo', NOW(), NOW()),
('60000000-0000-0000-0000-000000000006'::uuid, 'Valle Grand Estate', 'Valle de Bravo, Estado de México', 'valle_bravo', 'Mega desarrollo con golf, marina y todas las amenidades.', 2600000, 50000, 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200', 'active', 'locked', 6, 52, 52, 48, 0, 0, 'activo', NOW(), NOW());

-- CONDESA (6 properties)
INSERT INTO properties (id, name, location, location_group, description, valor_total_usd, price, image_url, status, unlock_status, unlock_order, weeks_available, weeks_remaining, presale_target, presale_sold, presale_progress, estado, created_at, updated_at) VALUES
('70000000-0000-0000-0000-000000000001'::uuid, 'Loft Condesa', 'Condesa, Ciudad de México', 'condesa', 'Moderno loft en el barrio más trendy con diseño industrial-chic.', 845000, 16250, 'https://images.unsplash.com/photo-1502672260066-6bc35f0a1f80?w=1200', 'active', 'available', 1, 52, 52, 48, 0, 0, 'activo', NOW(), NOW()),
('70000000-0000-0000-0000-000000000002'::uuid, 'Condesa Art Deco', 'Condesa, Ciudad de México', 'condesa', 'Edificio Art Deco restaurado con departamentos de lujo.', 1560000, 30000, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200', 'active', 'locked', 2, 52, 52, 48, 0, 0, 'activo', NOW(), NOW()),
('70000000-0000-0000-0000-000000000003'::uuid, 'Condesa Rooftop Suites', 'Condesa, Ciudad de México', 'condesa', 'Suites con rooftop privado y vistas al Parque México.', 2080000, 40000, 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200', 'active', 'locked', 3, 52, 52, 48, 0, 0, 'activo', NOW(), NOW()),
('70000000-0000-0000-0000-000000000004'::uuid, 'Condesa Boutique Residences', 'Condesa, Ciudad de México', 'condesa', 'Residencias boutique con concierge y amenidades premium.', 2600000, 50000, 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200', 'active', 'locked', 4, 52, 52, 48, 0, 0, 'activo', NOW(), NOW()),
('70000000-0000-0000-0000-000000000005'::uuid, 'Condesa Luxury Lofts', 'Condesa, Ciudad de México', 'condesa', 'Lofts de lujo con techos de doble altura y terraza privada.', 3120000, 60000, 'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=1200', 'active', 'locked', 5, 52, 52, 48, 0, 0, 'activo', NOW(), NOW()),
('70000000-0000-0000-0000-000000000006'::uuid, 'Condesa Grand Tower', 'Condesa, Ciudad de México', 'condesa', 'Torre de lujo con spa, gimnasio y restaurante en rooftop.', 4160000, 80000, 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200', 'active', 'locked', 6, 52, 52, 48, 0, 0, 'activo', NOW(), NOW());

-- LOS CABOS (6 properties)
INSERT INTO properties (id, name, location, location_group, description, valor_total_usd, price, image_url, status, unlock_status, unlock_order, weeks_available, weeks_remaining, presale_target, presale_sold, presale_progress, estado, created_at, updated_at) VALUES
('80000000-0000-0000-0000-000000000001'::uuid, 'Cabo Beach Villa', 'Los Cabos, Baja California Sur', 'los_cabos', 'Villa frente a la playa con piscina infinity y vista al arco.', 2080000, 40000, 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200', 'active', 'available', 1, 52, 52, 48, 0, 0, 'activo', NOW(), NOW()),
('80000000-0000-0000-0000-000000000002'::uuid, 'Cabo Golf Resort', 'Los Cabos, Baja California Sur', 'los_cabos', 'Resort con campo de golf Jack Nicklaus y club de playa.', 3120000, 60000, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200', 'active', 'locked', 2, 52, 52, 48, 0, 0, 'activo', NOW(), NOW()),
('80000000-0000-0000-0000-000000000003'::uuid, 'Cabo Marina Residences', 'Los Cabos, Baja California Sur', 'los_cabos', 'Residencias en marina con muelle privado y club náutico.', 4160000, 80000, 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200', 'active', 'locked', 3, 52, 52, 48, 0, 0, 'activo', NOW(), NOW()),
('80000000-0000-0000-0000-000000000004'::uuid, 'Cabo Luxury Villas', 'Los Cabos, Baja California Sur', 'los_cabos', 'Villas de ultra lujo con chef privado y servicio de mayordomo.', 5200000, 100000, 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200', 'active', 'locked', 4, 52, 52, 48, 0, 0, 'activo', NOW(), NOW()),
('80000000-0000-0000-0000-000000000005'::uuid, 'Cabo Oceanfront Estate', 'Los Cabos, Baja California Sur', 'los_cabos', 'Mega estate frente al océano con helipuerto y spa privado.', 7280000, 140000, 'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=1200', 'active', 'locked', 5, 52, 52, 48, 0, 0, 'activo', NOW(), NOW()),
('80000000-0000-0000-0000-000000000006'::uuid, 'Cabo Paradise Resort', 'Los Cabos, Baja California Sur', 'los_cabos', 'Resort ultra exclusivo con todas las amenidades de clase mundial.', 10920000, 210000, 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200', 'active', 'locked', 6, 52, 52, 48, 0, 0, 'activo', NOW(), NOW());

-- PUERTO VALLARTA (6 properties)
INSERT INTO properties (id, name, location, location_group, description, valor_total_usd, price, image_url, status, unlock_status, unlock_order, weeks_available, weeks_remaining, presale_target, presale_sold, presale_progress, estado, created_at, updated_at) VALUES
('90000000-0000-0000-0000-000000000001'::uuid, 'Vallarta Beach House', 'Puerto Vallarta, Jalisco', 'puerto_vallarta', 'Casa de playa con vista panorámica a la bahía y piscina infinity.', 1560000, 30000, 'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=1200', 'active', 'available', 1, 52, 52, 48, 0, 0, 'activo', NOW(), NOW()),
('90000000-0000-0000-0000-000000000002'::uuid, 'Vallarta Marina Condos', 'Puerto Vallarta, Jalisco', 'puerto_vallarta', 'Condominios en marina con acceso a yates y deportes acuáticos.', 2080000, 40000, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200', 'active', 'locked', 2, 52, 52, 48, 0, 0, 'activo', NOW(), NOW()),
('90000000-0000-0000-0000-000000000003'::uuid, 'Vallarta Luxury Resort', 'Puerto Vallarta, Jalisco', 'puerto_vallarta', 'Resort de lujo all-inclusive con múltiples restaurantes.', 2912000, 56000, 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200', 'active', 'locked', 3, 52, 52, 48, 0, 0, 'activo', NOW(), NOW()),
('90000000-0000-0000-0000-000000000004'::uuid, 'Vallarta Golf Villas', 'Puerto Vallarta, Jalisco', 'puerto_vallarta', 'Villas en campo de golf con vista al mar y club house.', 3640000, 70000, 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200', 'active', 'locked', 4, 52, 52, 48, 0, 0, 'activo', NOW(), NOW()),
('90000000-0000-0000-0000-000000000005'::uuid, 'Vallarta Oceanfront Towers', 'Puerto Vallarta, Jalisco', 'puerto_vallarta', 'Torres frente al océano con amenidades de resort 5 estrellas.', 4680000, 90000, 'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=1200', 'active', 'locked', 5, 52, 52, 48, 0, 0, 'activo', NOW(), NOW()),
('90000000-0000-0000-0000-000000000006'::uuid, 'Vallarta Paradise Estate', 'Puerto Vallarta, Jalisco', 'puerto_vallarta', 'Mega desarrollo con marina, golf y todas las amenidades premium.', 6760000, 130000, 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200', 'active', 'locked', 6, 52, 52, 48, 0, 0, 'activo', NOW(), NOW());

-- GUADALAJARA (4 properties)
INSERT INTO properties (id, name, location, location_group, description, valor_total_usd, price, image_url, status, unlock_status, unlock_order, weeks_available, weeks_remaining, presale_target, presale_sold, presale_progress, estado, created_at, updated_at) VALUES
('A0000000-0000-0000-0000-000000000001'::uuid, 'Guadalajara Executive Suites', 'Guadalajara, Jalisco', 'guadalajara', 'Suites ejecutivas en zona financiera con todas las amenidades.', 1040000, 20000, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200', 'active', 'available', 1, 52, 52, 48, 0, 0, 'activo', NOW(), NOW()),
('A0000000-0000-0000-0000-000000000002'::uuid, 'Guadalajara Luxury Lofts', 'Guadalajara, Jalisco', 'guadalajara', 'Lofts de lujo en zona Chapultepec con diseño contemporáneo.', 1560000, 30000, 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200', 'active', 'locked', 2, 52, 52, 48, 0, 0, 'activo', NOW(), NOW()),
('A0000000-0000-0000-0000-000000000003'::uuid, 'Guadalajara Premium Residences', 'Guadalajara, Jalisco', 'guadalajara', 'Residencias premium con spa, gimnasio y áreas verdes.', 2080000, 40000, 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200', 'active', 'locked', 3, 52, 52, 48, 0, 0, 'activo', NOW(), NOW()),
('A0000000-0000-0000-0000-000000000004'::uuid, 'Guadalajara Grand Tower', 'Guadalajara, Jalisco', 'guadalajara', 'Torre de lujo con rooftop lounge y vistas panorámicas de la ciudad.', 2912000, 56000, 'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=1200', 'active', 'locked', 4, 52, 52, 48, 0, 0, 'activo', NOW(), NOW());

-- Create 52 weeks for each property with seasonal pricing
DO $$
DECLARE
  prop_record RECORD;
  week_num integer;
  week_start date;
  week_end date;
  season_name text;
  week_price decimal;
  season_multiplier decimal;
BEGIN
  FOR prop_record IN 
    SELECT id, price, name FROM properties WHERE status = 'active'
  LOOP
    FOR week_num IN 1..52
    LOOP
      week_start := DATE '2025-01-01' + ((week_num - 1) * 7);
      week_end := week_start + 6;
      
      -- Seasonal pricing
      IF week_num BETWEEN 1 AND 13 THEN
        season_name := 'high';
        season_multiplier := 1.3;
      ELSIF week_num BETWEEN 14 AND 26 THEN
        season_name := 'medium';
        season_multiplier := 1.0;
      ELSIF week_num BETWEEN 27 AND 39 THEN
        season_name := 'peak';
        season_multiplier := 1.5;
      ELSE
        season_name := 'low';
        season_multiplier := 0.85;
      END IF;
      
      week_price := prop_record.price * season_multiplier;
      
      INSERT INTO weeks (
        id, property_id, week_number, start_date, end_date,
        season, price, status, nft_minted, rental_enabled,
        usage_count, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), prop_record.id, week_num, week_start, week_end,
        season_name, week_price, 'available', false, false,
        0, NOW(), NOW()
      );
    END LOOP;
    
    RAISE NOTICE 'Created 52 weeks for: %', prop_record.name;
  END LOOP;
END $$;

-- Summary report
SELECT 
  location_group,
  COUNT(*) as total_properties,
  COUNT(CASE WHEN unlock_status = 'available' THEN 1 END) as available_properties,
  COUNT(CASE WHEN unlock_status = 'locked' THEN 1 END) as locked_properties,
  MIN(price) as min_price,
  MAX(price) as max_price,
  ROUND(AVG(price)::numeric, 2) as avg_price
FROM properties
WHERE status = 'active'
GROUP BY location_group
ORDER BY location_group;

-- Overall summary
SELECT 
  COUNT(*) as total_properties,
  COUNT(CASE WHEN unlock_status = 'available' THEN 1 END) as available_now,
  COUNT(CASE WHEN unlock_status = 'locked' THEN 1 END) as locked,
  (SELECT COUNT(*) FROM weeks WHERE status = 'available') as total_weeks_available
FROM properties
WHERE status = 'active';
