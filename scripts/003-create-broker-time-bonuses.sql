-- Migration 003: Create broker_time_bonuses table
-- Tabla para manejar bonos de semanas gratis para brokers

CREATE TABLE IF NOT EXISTS broker_time_bonuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broker_id UUID REFERENCES profiles(id) NOT NULL,
  level_id UUID REFERENCES broker_levels(id) NOT NULL,
  weeks_bonus INT NOT NULL DEFAULT 1,
  granted_at TIMESTAMPTZ DEFAULT now(),
  redeemed_at TIMESTAMPTZ NULL,
  property_id UUID REFERENCES properties(id) NULL,
  week_id UUID REFERENCES weeks(id) NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'redeemed', 'expired', 'cancelled'))
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_broker_time_bonuses_broker ON broker_time_bonuses(broker_id);
CREATE INDEX IF NOT EXISTS idx_broker_time_bonuses_status ON broker_time_bonuses(status);
CREATE INDEX IF NOT EXISTS idx_broker_time_bonuses_level ON broker_time_bonuses(level_id);

COMMENT ON TABLE broker_time_bonuses IS 'Bonos de semanas gratis para brokers basados en tiempo/ventas';
COMMENT ON COLUMN broker_time_bonuses.weeks_bonus IS 'Número de semanas de bonus (normalmente 1)';
COMMENT ON COLUMN broker_time_bonuses.status IS 'Estado: pending, redeemed, expired, cancelled';
