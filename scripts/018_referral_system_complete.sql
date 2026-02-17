-- =====================================================
-- 018: SISTEMA COMPLETO DE REFERIDOS (3 NIVELES) - PROFECO COMPLIANT
-- Objetivo: Tracking de árbol genealógico y comisiones por servicio de intermediación
-- Compliance: Sistema multi-nivel con límite de 3 niveles
-- IMPORTANTE: Comisiones son por SERVICIO DE INTERMEDIACIÓN, no por "venta"
-- =====================================================

-- Tabla: Árbol de referidos con tracking completo
CREATE TABLE IF NOT EXISTS referral_tree (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referrer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 3),
  referral_code VARCHAR(20) UNIQUE NOT NULL,
  total_referrals INTEGER DEFAULT 0,
  active_referrals INTEGER DEFAULT 0,
  total_sales_generated DECIMAL(12,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_level CHECK (level <= 3)
);

-- Tabla: Comisiones de referidos por servicio de intermediación
CREATE TABLE IF NOT EXISTS referral_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  certificate_activation_id UUID NOT NULL REFERENCES certificate_sales(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 3),
  commission_percentage DECIMAL(5,2) NOT NULL,
  service_amount DECIMAL(12,2) NOT NULL,
  commission_amount DECIMAL(12,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'rejected')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- Índices para performance
CREATE INDEX idx_referral_tree_user ON referral_tree(user_id);
CREATE INDEX idx_referral_tree_referrer ON referral_tree(referrer_id);
CREATE INDEX idx_referral_tree_code ON referral_tree(referral_code);
CREATE INDEX idx_referral_commissions_referrer ON referral_commissions(referrer_id);
CREATE INDEX idx_referral_commissions_sale ON referral_commissions(certificate_activation_id);
CREATE INDEX idx_referral_commissions_status ON referral_commissions(status);

-- Función: Validar árbol de referidos (máx 3 niveles)
CREATE OR REPLACE FUNCTION validate_referral_tree()
RETURNS TRIGGER AS $$
DECLARE
  current_level INTEGER;
BEGIN
  -- Si no hay referrer, es nivel 1
  IF NEW.referrer_id IS NULL THEN
    NEW.level := 1;
    RETURN NEW;
  END IF;

  -- Obtener nivel del referrer
  SELECT level INTO current_level
  FROM referral_tree
  WHERE user_id = NEW.referrer_id;

  -- Validar que no exceda 3 niveles
  IF current_level >= 3 THEN
    RAISE EXCEPTION 'Maximum referral depth of 3 levels exceeded';
  END IF;

  -- Asignar nivel
  NEW.level := current_level + 1;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Validar niveles antes de insertar
CREATE TRIGGER validate_referral_tree_trigger
  BEFORE INSERT ON referral_tree
  FOR EACH ROW
  EXECUTE FUNCTION validate_referral_tree();

-- Función: Calcular comisiones automáticamente por activaciones de certificado
CREATE OR REPLACE FUNCTION calculate_referral_commissions()
RETURNS TRIGGER AS $$
DECLARE
  referrer_record RECORD;
  level_count INTEGER := 0;
  commission_pct DECIMAL(5,2);
BEGIN
  -- Buscar hasta 3 niveles de referrers
  FOR referrer_record IN
    WITH RECURSIVE referral_chain AS (
      -- Base case: referrer directo del usuario que activó certificado
      SELECT user_id, referrer_id, level, 1 as chain_level
      FROM referral_tree
      WHERE user_id = NEW.user_id
      
      UNION ALL
      
      -- Recursive case: siguientes niveles
      SELECT rt.user_id, rt.referrer_id, rt.level, rc.chain_level + 1
      FROM referral_tree rt
      INNER JOIN referral_chain rc ON rt.user_id = rc.referrer_id
      WHERE rc.chain_level < 3
    )
    SELECT user_id, chain_level
    FROM referral_chain
    WHERE referrer_id IS NOT NULL
    ORDER BY chain_level
  LOOP
    level_count := level_count + 1;
    
    -- Calcular porcentaje según nivel (comisión por servicio de intermediación)
    commission_pct := CASE referrer_record.chain_level
      WHEN 1 THEN 10.00  -- 10% nivel 1
      WHEN 2 THEN 5.00   -- 5% nivel 2
      WHEN 3 THEN 2.50   -- 2.5% nivel 3
      ELSE 0.00
    END;

    -- Insertar comisión por servicio de intermediación
    INSERT INTO referral_commissions (
      referrer_id,
      certificate_activation_id,
      referred_user_id,
      level,
      commission_percentage,
      service_amount,
      commission_amount,
      status
    ) VALUES (
      referrer_record.user_id,
      NEW.id,
      NEW.user_id,
      referrer_record.chain_level,
      commission_pct,
      NEW.total_amount,
      (NEW.total_amount * commission_pct / 100),
      'pending'
    );

    -- Actualizar estadísticas del referrer
    UPDATE referral_tree
    SET 
      total_sales_generated = total_sales_generated + NEW.total_amount,
      updated_at = NOW()
    WHERE user_id = referrer_record.user_id;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Calcular comisiones en cada activación de certificado
CREATE TRIGGER calculate_referral_commissions_trigger
  AFTER INSERT ON certificate_sales
  FOR EACH ROW
  WHEN (NEW.payment_status = 'completed')
  EXECUTE FUNCTION calculate_referral_commissions();

-- RLS Policies
ALTER TABLE referral_tree ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_commissions ENABLE ROW LEVEL SECURITY;

-- Policy: Usuarios ven solo su árbol
CREATE POLICY "Users can view their own referral tree"
  ON referral_tree FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Usuarios ven sus comisiones
CREATE POLICY "Users can view their own commissions"
  ON referral_commissions FOR SELECT
  USING (auth.uid() = referrer_id);

-- Policy: Admin ve todo
CREATE POLICY "Admins can view all referrals"
  ON referral_tree FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all commissions"
  ON referral_commissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Función helper: Obtener estadísticas de referidos
CREATE OR REPLACE FUNCTION get_referral_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_referrals', COUNT(DISTINCT rt.user_id),
    'active_referrals', COUNT(DISTINCT rt.user_id) FILTER (WHERE rt.active_referrals > 0),
    'total_commissions_pending', COALESCE(SUM(rc.commission_amount) FILTER (WHERE rc.status = 'pending'), 0),
    'total_commissions_paid', COALESCE(SUM(rc.commission_amount) FILTER (WHERE rc.status = 'paid'), 0),
    'level_1_referrals', COUNT(DISTINCT rt.user_id) FILTER (WHERE rt.level = 2),
    'level_2_referrals', COUNT(DISTINCT rt.user_id) FILTER (WHERE rt.level = 3),
    'level_3_referrals', COUNT(DISTINCT rt.user_id) FILTER (WHERE rt.level = 4)
  )
  INTO result
  FROM referral_tree rt
  LEFT JOIN referral_commissions rc ON rc.referrer_id = rt.user_id
  WHERE rt.referrer_id = p_user_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE referral_tree IS 'Sistema de árbol genealógico de referidos con máximo 3 niveles - PROFECO compliant';
COMMENT ON TABLE referral_commissions IS 'Comisiones por servicio de intermediación en activaciones de certificados SVC';
