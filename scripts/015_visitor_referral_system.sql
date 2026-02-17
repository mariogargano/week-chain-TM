-- Sistema de Referidos para Visitantes Anónimos
-- Permite que cualquier visitante genere un link de referido sin registrarse

-- Tabla para tracking de referidos anónimos
CREATE TABLE IF NOT EXISTS anonymous_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code VARCHAR(20) UNIQUE NOT NULL,
  visitor_fingerprint TEXT, -- Browser fingerprint para tracking
  visitor_ip TEXT,
  visitor_country TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  claimed_by_user_id UUID REFERENCES profiles(id), -- Cuando se registre y reclame
  claimed_at TIMESTAMPTZ,
  total_referrals INTEGER DEFAULT 0,
  total_sales_usdc NUMERIC(20, 6) DEFAULT 0,
  total_commissions_usdc NUMERIC(20, 6) DEFAULT 0,
  metadata JSONB
);

-- Tabla para tracking de conversiones de referidos anónimos
CREATE TABLE IF NOT EXISTS anonymous_referral_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anonymous_referral_id UUID NOT NULL REFERENCES anonymous_referrals(id),
  referred_user_id UUID REFERENCES profiles(id),
  reservation_id UUID REFERENCES reservations(id),
  sale_amount_usdc NUMERIC(20, 6) NOT NULL,
  commission_rate NUMERIC(5, 4) NOT NULL DEFAULT 0.03, -- 3% para referidos anónimos
  commission_amount_usdc NUMERIC(20, 6) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled', 'claimed')),
  paid_at TIMESTAMPTZ,
  transaction_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);

-- Función para generar código de referido anónimo
CREATE OR REPLACE FUNCTION generate_anonymous_referral_code()
RETURNS VARCHAR(20) AS $$
DECLARE
  code VARCHAR(20);
  exists BOOLEAN;
BEGIN
  LOOP
    -- Generar código: VISIT-XXXXX
    code := 'VISIT-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
    SELECT EXISTS(SELECT 1 FROM anonymous_referrals WHERE referral_code = code) INTO exists;
    EXIT WHEN NOT exists;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Función para crear referido anónimo
CREATE OR REPLACE FUNCTION create_anonymous_referral(
  p_visitor_fingerprint TEXT DEFAULT NULL,
  p_visitor_ip TEXT DEFAULT NULL,
  p_visitor_country TEXT DEFAULT NULL
)
RETURNS TABLE(referral_code VARCHAR(20), referral_id UUID) AS $$
DECLARE
  v_code VARCHAR(20);
  v_id UUID;
BEGIN
  -- Generar código único
  v_code := generate_anonymous_referral_code();
  
  -- Insertar referido anónimo
  INSERT INTO anonymous_referrals (
    referral_code,
    visitor_fingerprint,
    visitor_ip,
    visitor_country
  ) VALUES (
    v_code,
    p_visitor_fingerprint,
    p_visitor_ip,
    p_visitor_country
  ) RETURNING id INTO v_id;
  
  RETURN QUERY SELECT v_code, v_id;
END;
$$ LANGUAGE plpgsql;

-- Función para registrar conversión de referido anónimo
CREATE OR REPLACE FUNCTION track_anonymous_referral_conversion(
  p_referral_code VARCHAR(20),
  p_referred_user_id UUID,
  p_reservation_id UUID,
  p_sale_amount NUMERIC
)
RETURNS VOID AS $$
DECLARE
  v_anonymous_referral_id UUID;
  v_commission_rate NUMERIC := 0.03; -- 3%
  v_commission_amount NUMERIC;
BEGIN
  -- Buscar el referido anónimo
  SELECT id INTO v_anonymous_referral_id
  FROM anonymous_referrals
  WHERE referral_code = p_referral_code;
  
  IF v_anonymous_referral_id IS NULL THEN
    RAISE EXCEPTION 'Código de referido no encontrado: %', p_referral_code;
  END IF;
  
  -- Calcular comisión
  v_commission_amount := p_sale_amount * v_commission_rate;
  
  -- Registrar conversión
  INSERT INTO anonymous_referral_conversions (
    anonymous_referral_id,
    referred_user_id,
    reservation_id,
    sale_amount_usdc,
    commission_rate,
    commission_amount_usdc,
    status
  ) VALUES (
    v_anonymous_referral_id,
    p_referred_user_id,
    p_reservation_id,
    p_sale_amount,
    v_commission_rate,
    v_commission_amount,
    'pending'
  );
  
  -- Actualizar totales del referido anónimo
  UPDATE anonymous_referrals
  SET 
    total_referrals = total_referrals + 1,
    total_sales_usdc = total_sales_usdc + p_sale_amount,
    total_commissions_usdc = total_commissions_usdc + v_commission_amount
  WHERE id = v_anonymous_referral_id;
END;
$$ LANGUAGE plpgsql;

-- Función para reclamar referidos anónimos al registrarse
CREATE OR REPLACE FUNCTION claim_anonymous_referrals(
  p_user_id UUID,
  p_referral_code VARCHAR(20)
)
RETURNS VOID AS $$
DECLARE
  v_anonymous_referral_id UUID;
BEGIN
  -- Buscar el referido anónimo
  SELECT id INTO v_anonymous_referral_id
  FROM anonymous_referrals
  WHERE referral_code = p_referral_code
  AND claimed_by_user_id IS NULL;
  
  IF v_anonymous_referral_id IS NULL THEN
    RAISE EXCEPTION 'Código de referido no encontrado o ya reclamado: %', p_referral_code;
  END IF;
  
  -- Reclamar el referido anónimo
  UPDATE anonymous_referrals
  SET 
    claimed_by_user_id = p_user_id,
    claimed_at = NOW()
  WHERE id = v_anonymous_referral_id;
  
  -- Transferir comisiones pendientes a user_referral_commissions
  INSERT INTO user_referral_commissions (
    referrer_id,
    referred_user_id,
    reservation_id,
    sale_amount_usdc,
    commission_rate,
    commission_amount_usdc,
    status
  )
  SELECT 
    p_user_id,
    referred_user_id,
    reservation_id,
    sale_amount_usdc,
    commission_rate,
    commission_amount_usdc,
    'pending'
  FROM anonymous_referral_conversions
  WHERE anonymous_referral_id = v_anonymous_referral_id
  AND status = 'pending';
  
  -- Marcar conversiones como reclamadas
  UPDATE anonymous_referral_conversions
  SET status = 'claimed'
  WHERE anonymous_referral_id = v_anonymous_referral_id;
END;
$$ LANGUAGE plpgsql;

-- Crear índices para performance
CREATE INDEX IF NOT EXISTS idx_anonymous_referrals_code ON anonymous_referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_anonymous_referrals_claimed ON anonymous_referrals(claimed_by_user_id);
CREATE INDEX IF NOT EXISTS idx_anonymous_referral_conversions_referral ON anonymous_referral_conversions(anonymous_referral_id);
CREATE INDEX IF NOT EXISTS idx_anonymous_referral_conversions_status ON anonymous_referral_conversions(status);

-- Comentarios
COMMENT ON TABLE anonymous_referrals IS 'Referidos generados por visitantes anónimos antes de registrarse';
COMMENT ON TABLE anonymous_referral_conversions IS 'Conversiones (ventas) de referidos anónimos';
COMMENT ON FUNCTION create_anonymous_referral IS 'Crea un código de referido para visitante anónimo';
COMMENT ON FUNCTION track_anonymous_referral_conversion IS 'Registra una venta de un referido anónimo';
COMMENT ON FUNCTION claim_anonymous_referrals IS 'Permite a un usuario registrado reclamar sus referidos anónimos';
