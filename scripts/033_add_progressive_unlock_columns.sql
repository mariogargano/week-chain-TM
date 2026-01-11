-- Add progressive unlock system columns to properties table
-- This enables the system where only 1 property per location is available at a time

-- Add new columns for progressive unlock system
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS location_group TEXT,
ADD COLUMN IF NOT EXISTS unlock_order INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS unlock_status TEXT DEFAULT 'locked',
ADD COLUMN IF NOT EXISTS weeks_sold INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_weeks INTEGER DEFAULT 52;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_properties_location_group ON properties(location_group);
CREATE INDEX IF NOT EXISTS idx_properties_unlock_status ON properties(unlock_status);
CREATE INDEX IF NOT EXISTS idx_properties_unlock_order ON properties(location_group, unlock_order);

-- Update existing properties to have location_group based on location
UPDATE properties 
SET location_group = location 
WHERE location_group IS NULL;

-- Set first property of each location as available
WITH first_properties AS (
  SELECT DISTINCT ON (location_group) id
  FROM properties
  ORDER BY location_group, created_at
)
UPDATE properties
SET unlock_status = 'available'
WHERE id IN (SELECT id FROM first_properties);

-- Create function to auto-unlock next property when current one sells out
CREATE OR REPLACE FUNCTION unlock_next_property()
RETURNS TRIGGER AS $$
DECLARE
  current_property RECORD;
  next_property_id UUID;
BEGIN
  -- Get current property details
  SELECT * INTO current_property
  FROM properties
  WHERE id = NEW.property_id;

  -- Check if property is now sold out (all weeks sold)
  IF current_property.weeks_sold >= current_property.total_weeks THEN
    -- Mark current property as sold_out
    UPDATE properties
    SET unlock_status = 'sold_out'
    WHERE id = current_property.id;

    -- Find next property in same location group
    SELECT id INTO next_property_id
    FROM properties
    WHERE location_group = current_property.location_group
      AND unlock_order = current_property.unlock_order + 1
      AND unlock_status = 'locked'
    LIMIT 1;

    -- Unlock next property if found
    IF next_property_id IS NOT NULL THEN
      UPDATE properties
      SET unlock_status = 'available'
      WHERE id = next_property_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-unlock when a week is sold
DROP TRIGGER IF EXISTS trigger_unlock_next_property ON weeks;
CREATE TRIGGER trigger_unlock_next_property
AFTER UPDATE OF status ON weeks
FOR EACH ROW
WHEN (NEW.status = 'sold' AND OLD.status != 'sold')
EXECUTE FUNCTION unlock_next_property();

-- Update weeks_sold count for existing properties
UPDATE properties p
SET weeks_sold = (
  SELECT COUNT(*)
  FROM weeks w
  WHERE w.property_id = p.id
    AND w.status = 'sold'
);

COMMENT ON COLUMN properties.location_group IS 'Location group for progressive unlock system';
COMMENT ON COLUMN properties.unlock_order IS 'Order in which properties unlock within a location group (1 = first available)';
COMMENT ON COLUMN properties.unlock_status IS 'Status: available (can buy), locked (not yet available), sold_out (all weeks sold)';
COMMENT ON COLUMN properties.weeks_sold IS 'Number of weeks sold for this property';
COMMENT ON COLUMN properties.total_weeks IS 'Total number of weeks for this property (usually 52)';
