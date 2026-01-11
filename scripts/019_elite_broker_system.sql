-- =====================================================
-- 019: SISTEMA OPERADOR WEEK-CHAIN CERTIFICADO (ELITE)
-- Objetivo: 24 certificados = 1 semana gratis, 48 = 2 semanas gratis
-- Compliance: Sistema de recompensas automático
-- IMPORTANTE: Operadores son "Operadores WEEK-CHAIN Certificados"
-- NO son "vendedores", son intermediarios de servicio
-- =====================================================

-- Tabla: Estado Operador WEEK-CHAIN Certificado
CREATE TABLE IF NOT EXISTS elite_broker_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broker_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  certificates_facilitated_total INTEGER DEFAULT 0,
  weeks_earned_free INTEGER DEFAULT 0,
  current_tier VARCHAR(20) DEFAULT 'standard' CHECK (current_tier IN ('standard', 'elite', 'elite_plus')),
  next_milestone INTEGER DEFAULT 24,
  progress_percentage DECIMAL(5,2) DEFAULT 0.00,
  last_milestone_reached_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: Recompensas Elite
CREATE TABLE IF NOT EXISTS elite_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_type VARCHAR(30) NOT NULL CHECK (reward_type IN ('free_week', 'bonus_commission', 'exclusive_access')),
  milestone_reached INTEGER NOT NULL,
  weeks_granted INTEGER DEFAULT 0,
  certificate_id UUID REFERENCES user_certificates(id),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'issued', 'redeemed', 'expired')),
  issued_at TIMESTAMPTZ,
  redeemed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- Índices
CREATE INDEX idx_elite_broker_status_broker ON elite_broker_status(broker_id);
CREATE INDEX idx_elite_broker_status_tier ON elite_broker_status(current_tier);
CREATE INDEX idx_elite_rewards_broker ON elite_rewards(broker_id);
CREATE INDEX idx_elite_rewards_status ON elite_rewards(status);

-- Función: Calcular progreso hacia Elite
CREATE OR REPLACE FUNCTION calculate_elite_progress(p_broker_id UUID)
RETURNS JSON AS $$
DECLARE
  current_sold INTEGER;
  free_weeks_earned INTEGER;
  tier VARCHAR(20);
  next_milestone INTEGER;
  progress DECIMAL(5,2);
  result JSON;
BEGIN
  -- Obtener certificados facilitados totales
  SELECT COUNT(*) INTO current_sold
  FROM certificate_sales
  WHERE broker_id = p_broker_id
  AND payment_status = 'completed';

  -- Calcular semanas gratis ganadas
  free_weeks_earned := (current_sold / 24)::INTEGER;

  -- Determinar tier
  IF current_sold >= 48 THEN
    tier := 'elite_plus';
    next_milestone := ((current_sold / 24)::INTEGER + 1) * 24;
  ELSIF current_sold >= 24 THEN
    tier := 'elite';
    next_milestone := 48;
  ELSE
    tier := 'standard';
    next_milestone := 24;
  END IF;

  -- Calcular progreso
  IF tier = 'standard' THEN
    progress := (current_sold::DECIMAL / 24) * 100;
  ELSIF tier = 'elite' THEN
    progress := ((current_sold - 24)::DECIMAL / 24) * 100;
  ELSE
    progress := ((current_sold % 24)::DECIMAL / 24) * 100;
  END IF;

  -- Construir resultado
  result := json_build_object(
    'certificates_facilitated', current_sold,
    'free_weeks_earned', free_weeks_earned,
    'current_tier', tier,
    'next_milestone', next_milestone,
    'progress_percentage', progress,
    'weeks_until_reward', next_milestone - current_sold
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función: Actualizar estado Elite automáticamente
CREATE OR REPLACE FUNCTION update_elite_broker_status()
RETURNS TRIGGER AS $$
DECLARE
  broker_status RECORD;
  certificates_facilitated INTEGER;
  free_weeks INTEGER;
  new_tier VARCHAR(20);
BEGIN
  -- Solo procesar activaciones completadas
  IF NEW.payment_status != 'completed' THEN
    RETURN NEW;
  END IF;

  -- Contar certificados facilitados por el operador
  SELECT COUNT(*) INTO certificates_facilitated
  FROM certificate_sales
  WHERE broker_id = NEW.broker_id
  AND payment_status = 'completed';

  -- Calcular semanas gratis ganadas como recompensa
  free_weeks := (certificates_facilitated / 24)::INTEGER;

  -- Determinar tier
  IF certificates_facilitated >= 48 THEN
    new_tier := 'elite_plus';
  ELSIF certificates_facilitated >= 24 THEN
    new_tier := 'elite';
  ELSE
    new_tier := 'standard';
  END IF;

  -- Actualizar o crear estado
  INSERT INTO elite_broker_status (
    broker_id,
    certificates_facilitated_total,
    weeks_earned_free,
    current_tier,
    next_milestone,
    progress_percentage,
    updated_at
  ) VALUES (
    NEW.broker_id,
    certificates_facilitated,
    free_weeks,
    new_tier,
    CASE 
      WHEN certificates_facilitated < 24 THEN 24
      WHEN certificates_facilitated < 48 THEN 48
      ELSE ((certificates_facilitated / 24)::INTEGER + 1) * 24
    END,
    CASE 
      WHEN certificates_facilitated < 24 THEN (certificates_facilitated::DECIMAL / 24) * 100
      WHEN certificates_facilitated < 48 THEN ((certificates_facilitated - 24)::DECIMAL / 24) * 100
      ELSE ((certificates_facilitated % 24)::DECIMAL / 24) * 100
    END,
    NOW()
  )
  ON CONFLICT (broker_id) DO UPDATE SET
    certificates_facilitated_total = EXCLUDED.certificates_facilitated_total,
    weeks_earned_free = EXCLUDED.weeks_earned_free,
    current_tier = EXCLUDED.current_tier,
    next_milestone = EXCLUDED.next_milestone,
    progress_percentage = EXCLUDED.progress_percentage,
    updated_at = NOW();

  -- Si alcanzó un múltiplo de 24, crear recompensa
  IF certificates_facilitated % 24 = 0 AND certificates_facilitated > 0 THEN
    INSERT INTO elite_rewards (
      broker_id,
      reward_type,
      milestone_reached,
      weeks_granted,
      status,
      expires_at
    ) VALUES (
      NEW.broker_id,
      'free_week',
      certificates_facilitated,
      1,
      'pending',
      NOW() + INTERVAL '1 year'
    );

    -- Actualizar last_milestone_reached_at
    UPDATE elite_broker_status
    SET last_milestone_reached_at = NOW()
    WHERE broker_id = NEW.broker_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Actualizar Elite status después de cada venta
CREATE TRIGGER update_elite_broker_status_trigger
  AFTER INSERT OR UPDATE ON certificate_sales
  FOR EACH ROW
  EXECUTE FUNCTION update_elite_broker_status();

-- RLS Policies
ALTER TABLE elite_broker_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE elite_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Operadores can view their own status"
  ON elite_broker_status FOR SELECT
  USING (auth.uid() = broker_id);

CREATE POLICY "Operadores can view their own rewards"
  ON elite_rewards FOR SELECT
  USING (auth.uid() = broker_id);

CREATE POLICY "Admins can manage all elite statuses"
  ON elite_broker_status FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all elite rewards"
  ON elite_rewards FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

COMMENT ON TABLE elite_broker_status IS 'Tracking de Operador WEEK-CHAIN Certificado: 24 certificados facilitados = 1 semana de uso gratis - PROFECO compliant';
COMMENT ON TABLE elite_rewards IS 'Recompensas automáticas para Operadores Elite (no son comisiones por venta)';
