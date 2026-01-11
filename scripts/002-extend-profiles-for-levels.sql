-- Migration 002: Extend profiles table for broker levels
-- Añade columnas necesarias para el sistema de niveles en la tabla profiles

-- 1. Añadir columnas a profiles (solo si no existen)
DO $$ 
BEGIN
  -- broker_level_id
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'broker_level_id') THEN
    ALTER TABLE profiles ADD COLUMN broker_level_id UUID REFERENCES broker_levels(id);
  END IF;
  
  -- total_weeks_sold
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'total_weeks_sold') THEN
    ALTER TABLE profiles ADD COLUMN total_weeks_sold INT NOT NULL DEFAULT 0;
  END IF;
  
  -- years_active
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'years_active') THEN
    ALTER TABLE profiles ADD COLUMN years_active INT NOT NULL DEFAULT 0;
  END IF;
  
  -- bonuses_claimed
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'bonuses_claimed') THEN
    ALTER TABLE profiles ADD COLUMN bonuses_claimed INT NOT NULL DEFAULT 0;
  END IF;
END $$;

-- 2. Crear índices
CREATE INDEX IF NOT EXISTS idx_profiles_broker_level_id ON profiles(broker_level_id);
CREATE INDEX IF NOT EXISTS idx_profiles_total_weeks_sold ON profiles(total_weeks_sold);

-- 3. Asignar nivel inicial BROKER a todos los brokers existentes que no tienen nivel
UPDATE profiles 
SET broker_level_id = (SELECT id FROM broker_levels WHERE tag = 'BROKER')
WHERE role = 'broker' 
  AND broker_level_id IS NULL;

-- También actualizar brokers elite existentes
UPDATE profiles
SET broker_level_id = (SELECT id FROM broker_levels WHERE tag = 'BROKER_ELITE')
WHERE is_broker_elite = true
  AND broker_level_id IS NOT NULL;

COMMENT ON COLUMN profiles.broker_level_id IS 'FK al nivel actual del broker en broker_levels';
COMMENT ON COLUMN profiles.total_weeks_sold IS 'Total de semanas vendidas por este broker';
COMMENT ON COLUMN profiles.years_active IS 'Años activos como broker (calculado desde created_at)';
COMMENT ON COLUMN profiles.bonuses_claimed IS 'Número de bonos de tiempo reclamados';
