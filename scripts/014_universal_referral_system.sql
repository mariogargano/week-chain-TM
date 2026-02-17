-- Universal Referral System - Todos los usuarios pueden referir
-- Usuarios regulares: 3% comisión directa
-- Brokers: Sistema multinivel (5%/2%/1%)

-- Modificar tabla profiles para que todos los usuarios tengan código de referido
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_referral_code_check;

-- Actualizar trigger para generar código de referido para TODOS los usuarios
CREATE OR REPLACE FUNCTION auto_generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  -- Generar código de referido para TODOS los usuarios, no solo brokers
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := generate_referral_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear tabla de comisiones para usuarios regulares
CREATE TABLE IF NOT EXISTS user_referral_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES profiles(id),
  referred_user_id UUID NOT NULL REFERENCES profiles(id),
  reservation_id UUID REFERENCES reservations(id),
  sale_amount_usdc NUMERIC(20, 6) NOT NULL,
  commission_rate NUMERIC(5, 4) NOT NULL DEFAULT 0.03, -- 3% para usuarios regulares
  commission_amount_usdc NUMERIC(20, 6) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  paid_at TIMESTAMPTZ,
  transaction_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);

-- Función para determinar tipo de comisión según rol del usuario
CREATE OR REPLACE FUNCTION get_commission_rate(
  p_user_role TEXT,
  p_referral_level INTEGER DEFAULT 1
)
RETURNS NUMERIC AS $$
BEGIN
  -- Brokers tienen sistema multinivel
  IF p_user_role IN ('broker', 'admin') THEN
    CASE p_referral_level
      WHEN 1 THEN RETURN 0.05;    -- 5% para brokers nivel 1
      WHEN 2 THEN RETURN 0.02;    -- 2% para brokers nivel 2
      WHEN 3 THEN RETURN 0.01;    -- 1% para brokers nivel 3
      ELSE RETURN 0;
    END CASE;
  -- Usuarios regulares solo tienen comisión directa
  ELSE
    IF p_referral_level = 1 THEN
      RETURN 0.03;  -- 3% para usuarios regulares
    ELSE
      RETURN 0;     -- Sin multinivel para usuarios regulares
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Función mejorada para distribuir comisiones según tipo de usuario
CREATE OR REPLACE FUNCTION distribute_universal_referral_commissions(
  p_reservation_id UUID,
  p_sale_amount NUMERIC
)
RETURNS VOID AS $$
DECLARE
  v_user_wallet TEXT;
  v_referred_user_id UUID;
  v_direct_referrer_id UUID;
  v_referrer_role TEXT;
  v_commission_rate NUMERIC;
  v_commission_amount NUMERIC;
  v_referral RECORD;
BEGIN
  -- Obtener información del usuario que hizo la compra
  SELECT r.user_wallet, p.id, p.referred_by
  INTO v_user_wallet, v_referred_user_id, v_direct_referrer_id
  FROM reservations r
  JOIN profiles p ON p.wallet_address = r.user_wallet
  WHERE r.id = p_reservation_id;
  
  -- Si no hay referidor, salir
  IF v_direct_referrer_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Obtener rol del referidor directo
  SELECT role INTO v_referrer_role
  FROM profiles
  WHERE id = v_direct_referrer_id;
  
  -- Si es usuario regular, solo comisión directa
  IF v_referrer_role NOT IN ('broker', 'admin') THEN
    v_commission_rate := 0.03;  -- 3%
    v_commission_amount := p_sale_amount * v_commission_rate;
    
    INSERT INTO user_referral_commissions (
      referrer_id,
      referred_user_id,
      reservation_id,
      sale_amount_usdc,
      commission_rate,
      commission_amount_usdc,
      status
    ) VALUES (
      v_direct_referrer_id,
      v_referred_user_id,
      p_reservation_id,
      p_sale_amount,
      v_commission_rate,
      v_commission_amount,
      'pending'
    );
  
  -- Si es broker, usar sistema multinivel existente
  ELSE
    -- Usar la función existente para brokers
    PERFORM distribute_referral_commissions(p_reservation_id, p_sale_amount);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Generar códigos de referido para usuarios existentes que no tienen
UPDATE profiles
SET referral_code = generate_referral_code()
WHERE referral_code IS NULL;

-- Crear índices para performance
CREATE INDEX IF NOT EXISTS idx_user_referral_commissions_referrer ON user_referral_commissions(referrer_id);
CREATE INDEX IF NOT EXISTS idx_user_referral_commissions_referred ON user_referral_commissions(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_user_referral_commissions_status ON user_referral_commissions(status);

-- Comentarios
COMMENT ON TABLE user_referral_commissions IS 'Comisiones de referidos para usuarios regulares (3% directo)';
COMMENT ON FUNCTION get_commission_rate IS 'Retorna tasa de comisión según rol: usuarios 3% directo, brokers 5%/2%/1% multinivel';
COMMENT ON FUNCTION distribute_universal_referral_commissions IS 'Distribuye comisiones: usuarios regulares 3% directo, brokers multinivel';
