-- =====================================================
-- WEEK-CHAIN: Complete Properties Setup with Progressive Unlock
-- =====================================================
-- This script does everything needed in one go:
-- 1. Adds missing columns to properties table
-- 2. Creates 8 sample properties with progressive unlock
-- 3. Sets up automatic unlock triggers
-- =====================================================

-- Step 1: Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add location_group column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'properties' AND column_name = 'location_group'
    ) THEN
        ALTER TABLE properties ADD COLUMN location_group TEXT;
    END IF;

    -- Add unlock_status column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'properties' AND column_name = 'unlock_status'
    ) THEN
        ALTER TABLE properties ADD COLUMN unlock_status TEXT DEFAULT 'available';
    END IF;

    -- Add unlock_order column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'properties' AND column_name = 'unlock_order'
    ) THEN
        ALTER TABLE properties ADD COLUMN unlock_order INTEGER DEFAULT 1;
    END IF;

    -- Add bedrooms column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'properties' AND column_name = 'bedrooms'
    ) THEN
        ALTER TABLE properties ADD COLUMN bedrooms INTEGER DEFAULT 2;
    END IF;

    -- Add bathrooms column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'properties' AND column_name = 'bathrooms'
    ) THEN
        ALTER TABLE properties ADD COLUMN bathrooms DECIMAL(3,1) DEFAULT 2.0;
    END IF;

    -- Add area_sqm column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'properties' AND column_name = 'area_sqm'
    ) THEN
        ALTER TABLE properties ADD COLUMN area_sqm INTEGER;
    END IF;
END $$;

-- Step 2: Clear any existing test data (optional - comment out if you want to keep existing data)
-- DELETE FROM weeks WHERE property_id IN (SELECT id FROM properties WHERE location_group IS NOT NULL);
-- DELETE FROM properties WHERE location_group IS NOT NULL;

-- Step 3: Insert 8 sample properties with progressive unlock system
INSERT INTO properties (
    name,
    description,
    location,
    location_group,
    price,
    valor_total_usd,
    image_url,
    bedrooms,
    bathrooms,
    area_sqm,
    unlock_status,
    unlock_order,
    status,
    property_duration_years,
    presale_target,
    presale_progress,
    recaudado_actual
) VALUES
-- Tulum Properties (2 properties - first available, second locked)
(
    'Villa Paraíso Tulum',
    'Hermosa villa frente al mar en la zona hotelera de Tulum. Acceso privado a la playa, piscina infinity y diseño contemporáneo mexicano.',
    'Tulum, Quintana Roo',
    'Tulum',
    1250.00,
    65000.00,
    '/placeholder.svg?height=400&width=600',
    3,
    2.5,
    180,
    'available',
    1,
    'active',
    10,
    52,
    0,
    0
),
(
    'Casa Selva Tulum',
    'Exclusiva residencia en la selva maya con cenote privado. Arquitectura sustentable y lujo ecológico.',
    'Tulum, Quintana Roo',
    'Tulum',
    1730.00,
    90000.00,
    '/placeholder.svg?height=400&width=600',
    4,
    3.0,
    250,
    'locked',
    2,
    'active',
    10,
    52,
    0,
    0
),

-- Playa del Carmen
(
    'Penthouse Marina Playa',
    'Espectacular penthouse con vista a la marina. Roof garden privado, jacuzzi y acabados de lujo.',
    'Playa del Carmen, Quintana Roo',
    'Playa del Carmen',
    1920.00,
    100000.00,
    '/placeholder.svg?height=400&width=600',
    3,
    3.0,
    200,
    'available',
    1,
    'active',
    10,
    52,
    0,
    0
),

-- Cancún
(
    'Villa Laguna Cancún',
    'Impresionante villa en zona hotelera con vista a la laguna Nichupté. Muelle privado y acceso directo al mar.',
    'Cancún, Quintana Roo',
    'Cancún',
    2690.00,
    140000.00,
    '/placeholder.svg?height=400&width=600',
    5,
    4.0,
    350,
    'available',
    1,
    'active',
    10,
    52,
    0,
    0
),

-- Los Cabos
(
    'Casa Vista Mar Cabos',
    'Residencia de lujo con vista panorámica al Mar de Cortés. Infinity pool, cava de vinos y home theater.',
    'Los Cabos, Baja California Sur',
    'Los Cabos',
    3270.00,
    170000.00,
    '/placeholder.svg?height=400&width=600',
    4,
    3.5,
    300,
    'available',
    1,
    'active',
    10,
    52,
    0,
    0
),

-- Puerto Vallarta
(
    'Penthouse Bahía Vallarta',
    'Exclusivo penthouse en la zona romántica con vistas espectaculares a la Bahía de Banderas.',
    'Puerto Vallarta, Jalisco',
    'Puerto Vallarta',
    2880.00,
    150000.00,
    '/placeholder.svg?height=400&width=600',
    3,
    2.5,
    220,
    'available',
    1,
    'active',
    10,
    52,
    0,
    0
),

-- Mérida
(
    'Hacienda Colonial Mérida',
    'Hacienda restaurada del siglo XIX en el centro histórico. Piscina con jardín tropical y arquitectura colonial.',
    'Mérida, Yucatán',
    'Mérida',
    1730.00,
    90000.00,
    '/placeholder.svg?height=400&width=600',
    4,
    3.0,
    280,
    'available',
    1,
    'active',
    10,
    52,
    0,
    0
),

-- San Miguel de Allende
(
    'Casa Boutique San Miguel',
    'Residencia boutique en el corazón de San Miguel de Allende. Roof terrace con vistas a la Parroquia y acabados artesanales.',
    'San Miguel de Allende, Guanajuato',
    'San Miguel de Allende',
    4040.00,
    210000.00,
    '/placeholder.svg?height=400&width=600',
    3,
    2.5,
    200,
    'available',
    1,
    'active',
    10,
    52,
    0,
    0
);

-- Step 4: Create weeks for each property (52 weeks per property)
DO $$
DECLARE
    prop RECORD;
    week_num INTEGER;
    season TEXT;
    week_price DECIMAL(10,2);
    base_price DECIMAL(10,2);
BEGIN
    FOR prop IN SELECT id, price, location_group FROM properties WHERE location_group IS NOT NULL
    LOOP
        base_price := prop.price;
        
        FOR week_num IN 1..52
        LOOP
            -- Determine season and adjust price
            IF week_num IN (1,2,51,52) OR week_num BETWEEN 12 AND 16 OR week_num BETWEEN 26 AND 30 THEN
                season := 'high';
                week_price := base_price * 1.5; -- High season: +50%
            ELSIF week_num BETWEEN 6 AND 10 OR week_num BETWEEN 20 AND 24 OR week_num BETWEEN 40 AND 44 THEN
                season := 'medium';
                week_price := base_price * 1.2; -- Medium season: +20%
            ELSE
                season := 'low';
                week_price := base_price * 0.9; -- Low season: -10%
            END IF;
            
            INSERT INTO weeks (
                property_id,
                week_number,
                season,
                price,
                status,
                year
            ) VALUES (
                prop.id,
                week_num,
                season,
                week_price,
                'available',
                2025
            );
        END LOOP;
    END LOOP;
END $$;

-- Step 5: Create trigger function for automatic unlock
CREATE OR REPLACE FUNCTION check_and_unlock_next_property()
RETURNS TRIGGER AS $$
DECLARE
    current_property RECORD;
    next_property RECORD;
    total_weeks INTEGER;
    sold_weeks INTEGER;
BEGIN
    -- Get the property that was just updated
    SELECT * INTO current_property 
    FROM properties 
    WHERE id = NEW.property_id;
    
    -- Only proceed if this property is available
    IF current_property.unlock_status = 'available' THEN
        -- Count total and sold weeks for this property
        SELECT COUNT(*) INTO total_weeks
        FROM weeks
        WHERE property_id = current_property.id;
        
        SELECT COUNT(*) INTO sold_weeks
        FROM weeks
        WHERE property_id = current_property.id
        AND status = 'sold';
        
        -- If all weeks are sold, mark as sold_out and unlock next
        IF sold_weeks = total_weeks THEN
            UPDATE properties
            SET unlock_status = 'sold_out'
            WHERE id = current_property.id;
            
            -- Find and unlock the next property in the same location
            SELECT * INTO next_property
            FROM properties
            WHERE location_group = current_property.location_group
            AND unlock_order = current_property.unlock_order + 1
            AND unlock_status = 'locked';
            
            IF FOUND THEN
                UPDATE properties
                SET unlock_status = 'available'
                WHERE id = next_property.id;
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and create new one
DROP TRIGGER IF EXISTS trigger_unlock_next_property ON weeks;
CREATE TRIGGER trigger_unlock_next_property
AFTER UPDATE OF status ON weeks
FOR EACH ROW
WHEN (NEW.status = 'sold' AND OLD.status != 'sold')
EXECUTE FUNCTION check_and_unlock_next_property();

-- Step 6: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_properties_location_group ON properties(location_group);
CREATE INDEX IF NOT EXISTS idx_properties_unlock_status ON properties(unlock_status);
CREATE INDEX IF NOT EXISTS idx_properties_unlock_order ON properties(unlock_order);
CREATE INDEX IF NOT EXISTS idx_weeks_property_status ON weeks(property_id, status);

-- Done!
SELECT 
    'Setup complete!' as message,
    COUNT(*) as total_properties,
    COUNT(*) FILTER (WHERE unlock_status = 'available') as available_properties,
    COUNT(*) FILTER (WHERE unlock_status = 'locked') as locked_properties
FROM properties
WHERE location_group IS NOT NULL;
