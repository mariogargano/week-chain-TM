-- =====================================================
-- 020: DISTRIBUCIÓN POST 15 AÑOS (FINALIZACIÓN DE CERTIFICADO)
-- Objetivo: 50% capital, 10% operadores, 30% usuarios, 10% pool
-- Compliance: Sistema automático de distribución al finalizar certificado SVC
-- IMPORTANTE: NO es "liquidación de inversión", es finalización de certificado
-- Los usuarios NO son "propietarios", tienen derecho temporal de uso
-- =====================================================

-- Tabla: Configuración de distribución
CREATE TABLE IF NOT EXISTS exit_distribution_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL UNIQUE REFERENCES properties(id) ON DELETE CASCADE,
  capital_percentage DECIMAL(5,2) DEFAULT 50.00 CHECK (capital_percentage >= 0 AND capital_percentage <= 100),
  broker_percentage DECIMAL(5,2) DEFAULT 10.00 CHECK (broker_percentage >= 0 AND broker_percentage <= 100),
  user_percentage DECIMAL(5,2) DEFAULT 30.00 CHECK (user_percentage >= 0 AND user_percentage <= 100),
  pool_percentage DECIMAL(5,2) DEFAULT 10.00 CHECK (pool_percentage >= 0 AND pool_percentage <= 100),
  total_percentage DECIMAL(5,2) GENERATED ALWAYS AS (capital_percentage + broker_percentage + user_percentage + pool_percentage) STORED,
  is_locked BOOLEAN DEFAULT false,
  distribution_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_total_percentage CHECK (
    (capital_percentage + broker_percentage + user_percentage + pool_percentage) = 100.00
  )
);

-- Tabla: Transacciones de distribución
CREATE TABLE IF NOT EXISTS exit_distribution_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  config_id UUID NOT NULL REFERENCES exit_distribution_config(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_type VARCHAR(20) NOT NULL CHECK (recipient_type IN ('capital', 'broker', 'user', 'pool')),
  amount DECIMAL(12,2) NOT NULL CHECK (amount >= 0),
  percentage DECIMAL(5,2) NOT NULL,
  payment_method VARCHAR(30),
  payment_reference VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'reversed')),
  processed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- Tabla: Audit log de distribuciones
CREATE TABLE IF NOT EXISTS exit_distribution_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  performed_by UUID REFERENCES auth.users(id),
  total_amount DECIMAL(12,2),
  recipients_count INTEGER,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_exit_config_property ON exit_distribution_config(property_id);
CREATE INDEX idx_exit_transactions_property ON exit_distribution_transactions(property_id);
CREATE INDEX idx_exit_transactions_recipient ON exit_distribution_transactions(recipient_id);
CREATE INDEX idx_exit_transactions_status ON exit_distribution_transactions(status);
CREATE INDEX idx_exit_audit_property ON exit_distribution_audit(property_id);

-- Función: Calcular distribución al finalizar certificado
CREATE OR REPLACE FUNCTION calculate_exit_distribution(p_property_id UUID, p_total_amount DECIMAL)
RETURNS JSON AS $$
DECLARE
  config RECORD;
  result JSON;
BEGIN
  -- Obtener configuración de finalización
  SELECT * INTO config
  FROM exit_distribution_config
  WHERE property_id = p_property_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No distribution config found for property %', p_property_id;
  END IF;

  -- Validar que la suma sea 100%
  IF config.total_percentage != 100.00 THEN
    RAISE EXCEPTION 'Distribution percentages must sum to 100%, current: %', config.total_percentage;
  END IF;

  -- Calcular distribución al finalizar el certificado (NO liquidación de inversión)
  result := json_build_object(
    'property_id', p_property_id,
    'total_amount', p_total_amount,
    'capital_amount', (p_total_amount * config.capital_percentage / 100),
    'operador_amount', (p_total_amount * config.broker_percentage / 100),
    'user_benefit_amount', (p_total_amount * config.user_percentage / 100),
    'pool_amount', (p_total_amount * config.pool_percentage / 100),
    'capital_percentage', config.capital_percentage,
    'operador_percentage', config.broker_percentage,
    'user_percentage', config.user_percentage,
    'pool_percentage', config.pool_percentage,
    'is_locked', config.is_locked,
    'finalization_date', config.distribution_date
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función: Ejecutar distribución
CREATE OR REPLACE FUNCTION execute_exit_distribution(
  p_property_id UUID,
  p_total_amount DECIMAL,
  p_performed_by UUID
)
RETURNS JSON AS $$
DECLARE
  config RECORD;
  capital_recipients RECORD;
  broker_recipients RECORD;
  user_recipients RECORD;
  pool_recipients RECORD;
  distribution_result JSON;
  transactions_created INTEGER := 0;
BEGIN
  -- Obtener configuración
  SELECT * INTO config
  FROM exit_distribution_config
  WHERE property_id = p_property_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No distribution config found for property %', p_property_id;
  END IF;

  -- Validar que no esté bloqueada
  IF config.is_locked THEN
    RAISE EXCEPTION 'Distribution is locked for property %', p_property_id;
  END IF;

  -- Bloquear configuración
  UPDATE exit_distribution_config
  SET is_locked = true, updated_at = NOW()
  WHERE property_id = p_property_id;

  -- Crear transacciones para cada recipiente
  -- TODO: Implementar lógica de distribución a cada tipo de recipiente
  
  -- Crear audit log
  INSERT INTO exit_distribution_audit (
    property_id,
    action,
    performed_by,
    total_amount,
    recipients_count,
    details
  ) VALUES (
    p_property_id,
    'DISTRIBUTION_EXECUTED',
    p_performed_by,
    p_total_amount,
    transactions_created,
    json_build_object(
      'config', row_to_json(config),
      'timestamp', NOW()
    )
  );

  -- Retornar resultado
  distribution_result := json_build_object(
    'success', true,
    'property_id', p_property_id,
    'total_amount', p_total_amount,
    'transactions_created', transactions_created,
    'executed_at', NOW()
  );

  RETURN distribution_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Prevenir cambios durante distribución
CREATE OR REPLACE FUNCTION prevent_changes_during_distribution()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM exit_distribution_config
    WHERE property_id = NEW.property_id
    AND is_locked = true
  ) THEN
    RAISE EXCEPTION 'Cannot modify property during exit distribution process';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_changes_during_distribution_trigger
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION prevent_changes_during_distribution();

-- RLS Policies
ALTER TABLE exit_distribution_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE exit_distribution_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exit_distribution_audit ENABLE ROW LEVEL SECURITY;

-- Solo admin puede ver configuración
CREATE POLICY "Only admins can manage distribution config"
  ON exit_distribution_config FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Usuarios ven solo sus transacciones
CREATE POLICY "Users can view their own distribution transactions"
  ON exit_distribution_transactions FOR SELECT
  USING (auth.uid() = recipient_id);

-- Admin ve todo
CREATE POLICY "Admins can view all distribution transactions"
  ON exit_distribution_transactions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can view distribution audit"
  ON exit_distribution_audit FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

COMMENT ON TABLE exit_distribution_config IS 'Configuración de distribución al finalizar certificado SVC (15 años): 50% capital, 10% operadores, 30% beneficio usuarios, 10% pool - PROFECO compliant';
COMMENT ON TABLE exit_distribution_transactions IS 'Transacciones de distribución al finalizar el certificado temporal (NO es liquidación de inversión)';
