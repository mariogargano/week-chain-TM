-- Agregar campos de contacto al sistema de referidos anónimos
-- Esto permite identificar al referidor antes de que se registre

-- Agregar columnas de contacto a anonymous_referrals
ALTER TABLE anonymous_referrals
ADD COLUMN IF NOT EXISTS referrer_name TEXT,
ADD COLUMN IF NOT EXISTS referrer_email TEXT,
ADD COLUMN IF NOT EXISTS referrer_phone TEXT;

-- Crear índice para búsqueda por email
CREATE INDEX IF NOT EXISTS idx_anonymous_referrals_email ON anonymous_referrals(referrer_email);

-- Actualizar función para crear referido anónimo con información de contacto
CREATE OR REPLACE FUNCTION create_anonymous_referral(
  p_visitor_fingerprint TEXT DEFAULT NULL,
  p_visitor_ip TEXT DEFAULT NULL,
  p_visitor_country TEXT DEFAULT NULL,
  p_referrer_name TEXT DEFAULT NULL,
  p_referrer_email TEXT DEFAULT NULL,
  p_referrer_phone TEXT DEFAULT NULL
)
RETURNS TABLE(referral_code VARCHAR(20), referral_id UUID) AS $$
DECLARE
  v_code VARCHAR(20);
  v_id UUID;
BEGIN
  -- Generar código único
  v_code := generate_anonymous_referral_code();
  
  -- Insertar referido anónimo con información de contacto
  INSERT INTO anonymous_referrals (
    referral_code,
    visitor_fingerprint,
    visitor_ip,
    visitor_country,
    referrer_name,
    referrer_email,
    referrer_phone
  ) VALUES (
    v_code,
    p_visitor_fingerprint,
    p_visitor_ip,
    p_visitor_country,
    p_referrer_name,
    p_referrer_email,
    p_referrer_phone
  ) RETURNING id INTO v_id;
  
  RETURN QUERY SELECT v_code, v_id;
END;
$$ LANGUAGE plpgsql;

-- Comentarios
COMMENT ON COLUMN anonymous_referrals.referrer_name IS 'Nombre del referidor para identificación';
COMMENT ON COLUMN anonymous_referrals.referrer_email IS 'Email del referidor para contacto';
COMMENT ON COLUMN anonymous_referrals.referrer_phone IS 'Teléfono del referidor para contacto';
