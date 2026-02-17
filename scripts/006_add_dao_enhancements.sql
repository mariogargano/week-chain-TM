-- Mejorar tablas DAO existentes con campos adicionales
ALTER TABLE dao_proposals
ADD COLUMN IF NOT EXISTS execution_status TEXT DEFAULT 'pending', -- pending, executed, failed
ADD COLUMN IF NOT EXISTS executed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS execution_tx_hash TEXT,
ADD COLUMN IF NOT EXISTS proposal_type TEXT DEFAULT 'parameter_change', -- parameter_change, treasury, emergency
ADD COLUMN IF NOT EXISTS target_contract TEXT,
ADD COLUMN IF NOT EXISTS execution_data JSONB;

-- Tabla para parámetros del sistema gestionados por DAO
CREATE TABLE IF NOT EXISTS dao_parameters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parameter_key TEXT NOT NULL UNIQUE,
  parameter_value TEXT NOT NULL,
  parameter_type TEXT NOT NULL, -- number, percentage, address, boolean
  description TEXT NOT NULL,
  min_value NUMERIC,
  max_value NUMERIC,
  last_updated_by UUID REFERENCES dao_proposals(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar parámetros iniciales del sistema
INSERT INTO dao_parameters (parameter_key, parameter_value, parameter_type, description, min_value, max_value)
VALUES 
  ('vafi_ltv_high_season', '50', 'percentage', 'LTV máximo para temporada alta en VA-FI', 30, 70),
  ('vafi_ltv_medium_season', '40', 'percentage', 'LTV máximo para temporada media en VA-FI', 25, 60),
  ('vafi_ltv_low_season', '30', 'percentage', 'LTV máximo para temporada baja en VA-FI', 20, 50),
  ('vafi_interest_rate', '8.00', 'percentage', 'Tasa de interés anual para préstamos VA-FI', 5, 15),
  ('vafi_liquidation_threshold', '80', 'percentage', 'Umbral de liquidación para VA-FI', 70, 90),
  ('platform_fee_rental', '15', 'percentage', 'Comisión de plataforma en rentas', 10, 25),
  ('presale_target_weeks', '48', 'number', 'Objetivo de semanas vendidas para confirmar preventa', 40, 52),
  ('property_duration_years', '15', 'number', 'Duración estándar de propiedad en años', 10, 25),
  ('exit_nft_holders_share', '50', 'percentage', 'Porcentaje para holders en exit', 40, 60),
  ('exit_brokers_share', '10', 'percentage', 'Porcentaje para brokers en exit', 5, 15),
  ('exit_weekchain_share', '30', 'percentage', 'Porcentaje para WEEK-CHAIN en exit', 20, 40),
  ('exit_ngo_share', '10', 'percentage', 'Porcentaje para ONGs en exit', 5, 15)
ON CONFLICT (parameter_key) DO NOTHING;

-- Índices
CREATE INDEX IF NOT EXISTS idx_dao_proposals_execution_status ON dao_proposals(execution_status);
CREATE INDEX IF NOT EXISTS idx_dao_proposals_type ON dao_proposals(proposal_type);
CREATE INDEX IF NOT EXISTS idx_dao_parameters_key ON dao_parameters(parameter_key);

-- Comentarios
COMMENT ON TABLE dao_parameters IS 'Parámetros del sistema gestionados por DAO';
COMMENT ON COLUMN dao_proposals.execution_status IS 'Estado de ejecución de la propuesta aprobada';
COMMENT ON COLUMN dao_proposals.proposal_type IS 'Tipo de propuesta (cambio de parámetros, tesorería, emergencia)';
