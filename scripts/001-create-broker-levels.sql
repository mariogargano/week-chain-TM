-- Migration 001: Create broker_levels table
-- Este script crea la tabla de niveles de broker con configuración flexible

-- 1. Crear tabla broker_levels
CREATE TABLE IF NOT EXISTS broker_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  level SMALLINT NOT NULL,
  direct_commission_rate NUMERIC(6,4) NOT NULL,
  min_weeks_sold INT NOT NULL DEFAULT 0,
  min_affiliates INT NOT NULL DEFAULT 0,
  retirement_bonus_rate NUMERIC(6,4) NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Insertar datos iniciales de niveles
INSERT INTO broker_levels (tag, display_name, level, direct_commission_rate, min_weeks_sold, min_affiliates, retirement_bonus_rate)
VALUES 
  ('BROKER', 'Broker', 1, 0.0400, 0, 0, NULL),
  ('SILVER_BROKER', 'Silver Broker', 2, 0.0500, 12, 4, NULL),
  ('BROKER_ELITE', 'Broker Elite', 3, 0.0600, 24, 9, 0.1000)
ON CONFLICT (tag) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  level = EXCLUDED.level,
  direct_commission_rate = EXCLUDED.direct_commission_rate,
  min_weeks_sold = EXCLUDED.min_weeks_sold,
  min_affiliates = EXCLUDED.min_affiliates,
  retirement_bonus_rate = EXCLUDED.retirement_bonus_rate;

-- 3. Crear índices
CREATE INDEX IF NOT EXISTS idx_broker_levels_tag ON broker_levels(tag);
CREATE INDEX IF NOT EXISTS idx_broker_levels_level ON broker_levels(level);

COMMENT ON TABLE broker_levels IS 'Configuración de niveles de broker con comisiones y requisitos';
COMMENT ON COLUMN broker_levels.tag IS 'Identificador único del nivel: BROKER, SILVER_BROKER, BROKER_ELITE';
COMMENT ON COLUMN broker_levels.direct_commission_rate IS 'Porcentaje de comisión directa (0.04 = 4%, 0.05 = 5%, 0.06 = 6%)';
COMMENT ON COLUMN broker_levels.min_weeks_sold IS 'Mínimo de semanas vendidas para alcanzar este nivel';
COMMENT ON COLUMN broker_levels.min_affiliates IS 'Mínimo de afiliados directos con tag BROKER para alcanzar este nivel';
COMMENT ON COLUMN broker_levels.retirement_bonus_rate IS 'Porcentaje del bonus de retiro (solo para Elite, 0.10 = 10%)';
