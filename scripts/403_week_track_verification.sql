-- =====================================================
-- WEEK-TRACK: Public Verification System with QR
-- Sistema de verificacion publica con hash encadenado
-- =====================================================

-- Table for public verification tokens
CREATE TABLE IF NOT EXISTS public_verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- What we're verifying
  entity_type TEXT NOT NULL CHECK (entity_type IN ('svc_certificate', 'booking', 'contract', 'property', 'week_token')),
  entity_id UUID NOT NULL,
  
  -- Verification token (short code for QR)
  verification_code TEXT UNIQUE NOT NULL,
  
  -- Hash for integrity
  content_hash TEXT NOT NULL,
  previous_hash TEXT, -- For chain integrity
  
  -- What's being verified
  verified_data JSONB NOT NULL DEFAULT '{}',
  
  -- Access control
  is_active BOOLEAN DEFAULT true,
  access_count INTEGER DEFAULT 0,
  max_access_count INTEGER, -- NULL = unlimited
  expires_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  last_accessed_at TIMESTAMPTZ,
  
  -- Index for quick lookups
  CONSTRAINT unique_entity_verification UNIQUE (entity_type, entity_id)
);

-- Table for verification access logs (immutable)
CREATE TABLE IF NOT EXISTS verification_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_id UUID NOT NULL REFERENCES public_verification_tokens(id),
  
  -- Access details
  accessed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  accessor_ip TEXT,
  accessor_user_agent TEXT,
  accessor_country TEXT,
  
  -- Verification result
  verification_result TEXT NOT NULL CHECK (verification_result IN ('valid', 'invalid', 'expired', 'revoked', 'tampered')),
  
  -- Chain integrity
  content_hash_at_access TEXT NOT NULL,
  chain_valid BOOLEAN NOT NULL DEFAULT true
);

-- Prevent updates/deletes on access logs
CREATE OR REPLACE FUNCTION prevent_verification_log_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Verification access logs are immutable and cannot be modified';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_verification_log_update ON verification_access_logs;
CREATE TRIGGER prevent_verification_log_update
  BEFORE UPDATE OR DELETE ON verification_access_logs
  FOR EACH ROW
  EXECUTE FUNCTION prevent_verification_log_modification();

-- Function to generate short verification code
CREATE OR REPLACE FUNCTION generate_verification_code(length INTEGER DEFAULT 8)
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..length LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to create verification token for SVC certificate
CREATE OR REPLACE FUNCTION create_svc_verification_token(
  p_certificate_id UUID,
  p_created_by UUID DEFAULT NULL
)
RETURNS public_verification_tokens AS $$
DECLARE
  v_certificate RECORD;
  v_token public_verification_tokens;
  v_code TEXT;
  v_hash TEXT;
  v_previous_hash TEXT;
  v_data JSONB;
BEGIN
  -- Get certificate data
  SELECT * INTO v_certificate
  FROM user_certificates_v2
  WHERE id = p_certificate_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Certificate not found: %', p_certificate_id;
  END IF;
  
  -- Generate unique code
  LOOP
    v_code := generate_verification_code(8);
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public_verification_tokens WHERE verification_code = v_code);
  END LOOP;
  
  -- Build verification data (public info only)
  v_data := jsonb_build_object(
    'certificate_type', 'SVC',
    'tier', v_certificate.tier,
    'property_id', v_certificate.property_id,
    'valid_from', v_certificate.valid_from,
    'valid_until', v_certificate.valid_until,
    'status', v_certificate.status,
    'issued_at', v_certificate.created_at,
    'blockchain_verified', v_certificate.blockchain_tx_hash IS NOT NULL
  );
  
  -- Get previous hash for chain
  SELECT content_hash INTO v_previous_hash
  FROM public_verification_tokens
  WHERE entity_type = 'svc_certificate'
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Generate content hash
  v_hash := encode(
    sha256(
      (COALESCE(v_previous_hash, 'GENESIS') || v_data::TEXT || v_code || NOW()::TEXT)::BYTEA
    ),
    'hex'
  );
  
  -- Insert token
  INSERT INTO public_verification_tokens (
    entity_type,
    entity_id,
    verification_code,
    content_hash,
    previous_hash,
    verified_data,
    created_by
  ) VALUES (
    'svc_certificate',
    p_certificate_id,
    v_code,
    v_hash,
    v_previous_hash,
    v_data,
    p_created_by
  )
  ON CONFLICT (entity_type, entity_id) DO UPDATE SET
    verification_code = EXCLUDED.verification_code,
    content_hash = EXCLUDED.content_hash,
    previous_hash = EXCLUDED.previous_hash,
    verified_data = EXCLUDED.verified_data,
    is_active = true
  RETURNING * INTO v_token;
  
  RETURN v_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify a token
CREATE OR REPLACE FUNCTION verify_token(
  p_code TEXT,
  p_accessor_ip TEXT DEFAULT NULL,
  p_accessor_user_agent TEXT DEFAULT NULL
)
RETURNS TABLE (
  is_valid BOOLEAN,
  result TEXT,
  entity_type TEXT,
  entity_id UUID,
  verified_data JSONB,
  issued_at TIMESTAMPTZ,
  chain_integrity BOOLEAN
) AS $$
DECLARE
  v_token public_verification_tokens;
  v_result TEXT;
  v_chain_valid BOOLEAN := true;
  v_expected_hash TEXT;
BEGIN
  -- Find token
  SELECT * INTO v_token
  FROM public_verification_tokens
  WHERE verification_code = UPPER(p_code);
  
  IF NOT FOUND THEN
    -- Log failed attempt
    INSERT INTO verification_access_logs (
      verification_id,
      accessor_ip,
      accessor_user_agent,
      verification_result,
      content_hash_at_access,
      chain_valid
    ) VALUES (
      NULL,
      p_accessor_ip,
      p_accessor_user_agent,
      'invalid',
      'NOT_FOUND',
      false
    );
    
    RETURN QUERY SELECT 
      false::BOOLEAN,
      'invalid'::TEXT,
      NULL::TEXT,
      NULL::UUID,
      NULL::JSONB,
      NULL::TIMESTAMPTZ,
      false::BOOLEAN;
    RETURN;
  END IF;
  
  -- Check if active
  IF NOT v_token.is_active THEN
    v_result := 'revoked';
  -- Check expiration
  ELSIF v_token.expires_at IS NOT NULL AND v_token.expires_at < NOW() THEN
    v_result := 'expired';
  -- Check max access count
  ELSIF v_token.max_access_count IS NOT NULL AND v_token.access_count >= v_token.max_access_count THEN
    v_result := 'expired';
  ELSE
    -- Verify chain integrity
    IF v_token.previous_hash IS NOT NULL THEN
      SELECT content_hash INTO v_expected_hash
      FROM public_verification_tokens
      WHERE entity_type = v_token.entity_type
        AND created_at < v_token.created_at
      ORDER BY created_at DESC
      LIMIT 1;
      
      v_chain_valid := (v_expected_hash = v_token.previous_hash);
    END IF;
    
    IF NOT v_chain_valid THEN
      v_result := 'tampered';
    ELSE
      v_result := 'valid';
    END IF;
  END IF;
  
  -- Update access count
  UPDATE public_verification_tokens
  SET 
    access_count = access_count + 1,
    last_accessed_at = NOW()
  WHERE id = v_token.id;
  
  -- Log access
  INSERT INTO verification_access_logs (
    verification_id,
    accessor_ip,
    accessor_user_agent,
    verification_result,
    content_hash_at_access,
    chain_valid
  ) VALUES (
    v_token.id,
    p_accessor_ip,
    p_accessor_user_agent,
    v_result,
    v_token.content_hash,
    v_chain_valid
  );
  
  RETURN QUERY SELECT 
    (v_result = 'valid')::BOOLEAN,
    v_result,
    v_token.entity_type,
    v_token.entity_id,
    v_token.verified_data,
    v_token.created_at,
    v_chain_valid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create verification for booking
CREATE OR REPLACE FUNCTION create_booking_verification_token(
  p_booking_id UUID,
  p_created_by UUID DEFAULT NULL
)
RETURNS public_verification_tokens AS $$
DECLARE
  v_booking RECORD;
  v_token public_verification_tokens;
  v_code TEXT;
  v_hash TEXT;
  v_previous_hash TEXT;
  v_data JSONB;
BEGIN
  -- Get booking data
  SELECT cr.*, p.name as property_name
  INTO v_booking
  FROM confirmed_reservations cr
  LEFT JOIN properties p ON cr.property_id = p.id
  WHERE cr.id = p_booking_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found: %', p_booking_id;
  END IF;
  
  -- Generate unique code
  LOOP
    v_code := generate_verification_code(10);
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public_verification_tokens WHERE verification_code = v_code);
  END LOOP;
  
  -- Build verification data
  v_data := jsonb_build_object(
    'booking_type', 'WEEK-BOOKING',
    'property_name', v_booking.property_name,
    'check_in', v_booking.check_in_date,
    'check_out', v_booking.check_out_date,
    'status', v_booking.status,
    'confirmation_code', v_booking.confirmation_code,
    'guests', v_booking.guest_count
  );
  
  -- Get previous hash
  SELECT content_hash INTO v_previous_hash
  FROM public_verification_tokens
  WHERE entity_type = 'booking'
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Generate hash
  v_hash := encode(
    sha256(
      (COALESCE(v_previous_hash, 'GENESIS') || v_data::TEXT || v_code || NOW()::TEXT)::BYTEA
    ),
    'hex'
  );
  
  -- Insert token
  INSERT INTO public_verification_tokens (
    entity_type,
    entity_id,
    verification_code,
    content_hash,
    previous_hash,
    verified_data,
    created_by,
    expires_at
  ) VALUES (
    'booking',
    p_booking_id,
    v_code,
    v_hash,
    v_previous_hash,
    v_data,
    p_created_by,
    v_booking.check_out_date + INTERVAL '30 days' -- Expires 30 days after checkout
  )
  ON CONFLICT (entity_type, entity_id) DO UPDATE SET
    verification_code = EXCLUDED.verification_code,
    content_hash = EXCLUDED.content_hash,
    previous_hash = EXCLUDED.previous_hash,
    verified_data = EXCLUDED.verified_data,
    expires_at = EXCLUDED.expires_at,
    is_active = true
  RETURNING * INTO v_token;
  
  RETURN v_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies
ALTER TABLE public_verification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_access_logs ENABLE ROW LEVEL SECURITY;

-- Anyone can read verification tokens (public verification)
CREATE POLICY "Public can verify tokens" ON public_verification_tokens
  FOR SELECT USING (is_active = true);

-- Only admins can manage tokens
CREATE POLICY "Admins manage verification tokens" ON public_verification_tokens
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Only admins can read access logs
CREATE POLICY "Admins read verification logs" ON verification_access_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'compliance'))
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_verification_tokens_code ON public_verification_tokens(verification_code);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_entity ON public_verification_tokens(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_verification_logs_token ON verification_access_logs(verification_id);
CREATE INDEX IF NOT EXISTS idx_verification_logs_date ON verification_access_logs(accessed_at);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public_verification_tokens TO anon, authenticated;
GRANT SELECT ON verification_access_logs TO authenticated;
GRANT EXECUTE ON FUNCTION verify_token TO anon, authenticated;
GRANT EXECUTE ON FUNCTION create_svc_verification_token TO authenticated;
GRANT EXECUTE ON FUNCTION create_booking_verification_token TO authenticated;
