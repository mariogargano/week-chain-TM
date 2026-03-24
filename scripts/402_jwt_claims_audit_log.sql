-- =====================================================
-- WEEK-CHAIN: JWT Custom Claims Hook + Audit Log Inmutable
-- Fase 1 Hardening - Security Infrastructure
-- =====================================================

-- =====================================================
-- 1. AUDIT LOG INMUTABLE (Append-Only)
-- =====================================================

-- Drop existing table if exists to recreate with constraints
DROP TABLE IF EXISTS audit_log_immutable CASCADE;

-- Create immutable audit log table
CREATE TABLE audit_log_immutable (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Actor information
  actor_id UUID REFERENCES auth.users(id),
  actor_email TEXT,
  actor_role TEXT,
  actor_ip INET,
  actor_user_agent TEXT,
  
  -- Action details
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  
  -- Change tracking
  old_values JSONB,
  new_values JSONB,
  
  -- Request context
  request_id UUID,
  session_id TEXT,
  
  -- Hash chain for tamper detection
  previous_hash TEXT,
  entry_hash TEXT NOT NULL,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create index for fast lookups
CREATE INDEX idx_audit_log_actor ON audit_log_immutable(actor_id);
CREATE INDEX idx_audit_log_resource ON audit_log_immutable(resource_type, resource_id);
CREATE INDEX idx_audit_log_created ON audit_log_immutable(created_at DESC);
CREATE INDEX idx_audit_log_action ON audit_log_immutable(action);

-- =====================================================
-- 2. PREVENT UPDATE/DELETE ON AUDIT LOG (Inmutabilidad)
-- =====================================================

-- Trigger to prevent updates
CREATE OR REPLACE FUNCTION prevent_audit_update()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'UPDATE not allowed on audit_log_immutable - this is an append-only table';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER no_update_audit_log
  BEFORE UPDATE ON audit_log_immutable
  FOR EACH ROW
  EXECUTE FUNCTION prevent_audit_update();

-- Trigger to prevent deletes
CREATE OR REPLACE FUNCTION prevent_audit_delete()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'DELETE not allowed on audit_log_immutable - this is an append-only table';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER no_delete_audit_log
  BEFORE DELETE ON audit_log_immutable
  FOR EACH ROW
  EXECUTE FUNCTION prevent_audit_delete();

-- =====================================================
-- 3. HASH CHAIN FUNCTION FOR TAMPER DETECTION
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_audit_hash(
  p_created_at TIMESTAMPTZ,
  p_actor_id UUID,
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id TEXT,
  p_previous_hash TEXT
)
RETURNS TEXT AS $$
DECLARE
  hash_input TEXT;
BEGIN
  hash_input := COALESCE(p_created_at::TEXT, '') || '|' ||
                COALESCE(p_actor_id::TEXT, '') || '|' ||
                COALESCE(p_action, '') || '|' ||
                COALESCE(p_resource_type, '') || '|' ||
                COALESCE(p_resource_id, '') || '|' ||
                COALESCE(p_previous_hash, 'GENESIS');
  
  RETURN encode(sha256(hash_input::bytea), 'hex');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- 4. AUTO-HASH ON INSERT
-- =====================================================

CREATE OR REPLACE FUNCTION auto_hash_audit_entry()
RETURNS TRIGGER AS $$
DECLARE
  last_hash TEXT;
BEGIN
  -- Get the hash of the last entry
  SELECT entry_hash INTO last_hash
  FROM audit_log_immutable
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Set previous hash
  NEW.previous_hash := COALESCE(last_hash, 'GENESIS');
  
  -- Calculate and set entry hash
  NEW.entry_hash := calculate_audit_hash(
    NEW.created_at,
    NEW.actor_id,
    NEW.action,
    NEW.resource_type,
    NEW.resource_id,
    NEW.previous_hash
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER hash_audit_entry
  BEFORE INSERT ON audit_log_immutable
  FOR EACH ROW
  EXECUTE FUNCTION auto_hash_audit_entry();

-- =====================================================
-- 5. HELPER FUNCTION TO INSERT AUDIT LOG
-- =====================================================

CREATE OR REPLACE FUNCTION log_audit(
  p_actor_id UUID,
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id TEXT DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  new_id UUID;
  actor_info RECORD;
BEGIN
  -- Get actor info
  SELECT email, role INTO actor_info
  FROM public.users
  WHERE id = p_actor_id;
  
  -- Insert audit entry
  INSERT INTO audit_log_immutable (
    actor_id,
    actor_email,
    actor_role,
    action,
    resource_type,
    resource_id,
    old_values,
    new_values,
    metadata
  ) VALUES (
    p_actor_id,
    actor_info.email,
    actor_info.role,
    p_action,
    p_resource_type,
    p_resource_id,
    p_old_values,
    p_new_values,
    p_metadata
  ) RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. VERIFY HASH CHAIN INTEGRITY
-- =====================================================

CREATE OR REPLACE FUNCTION verify_audit_chain_integrity()
RETURNS TABLE (
  is_valid BOOLEAN,
  total_entries BIGINT,
  broken_at_id UUID,
  broken_at_timestamp TIMESTAMPTZ,
  error_message TEXT
) AS $$
DECLARE
  rec RECORD;
  expected_hash TEXT;
  prev_hash TEXT := 'GENESIS';
  entry_count BIGINT := 0;
BEGIN
  FOR rec IN 
    SELECT * FROM audit_log_immutable ORDER BY created_at ASC
  LOOP
    entry_count := entry_count + 1;
    
    -- Check previous hash
    IF rec.previous_hash != prev_hash THEN
      RETURN QUERY SELECT 
        FALSE,
        entry_count,
        rec.id,
        rec.created_at,
        'Previous hash mismatch at entry ' || entry_count::TEXT;
      RETURN;
    END IF;
    
    -- Verify entry hash
    expected_hash := calculate_audit_hash(
      rec.created_at,
      rec.actor_id,
      rec.action,
      rec.resource_type,
      rec.resource_id,
      rec.previous_hash
    );
    
    IF rec.entry_hash != expected_hash THEN
      RETURN QUERY SELECT 
        FALSE,
        entry_count,
        rec.id,
        rec.created_at,
        'Entry hash mismatch at entry ' || entry_count::TEXT;
      RETURN;
    END IF;
    
    prev_hash := rec.entry_hash;
  END LOOP;
  
  RETURN QUERY SELECT TRUE, entry_count, NULL::UUID, NULL::TIMESTAMPTZ, 'Chain is valid'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. JWT CUSTOM CLAIMS HOOK
-- =====================================================

-- Create function to add custom claims to JWT
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event JSONB)
RETURNS JSONB AS $$
DECLARE
  claims JSONB;
  user_role TEXT;
  user_permissions JSONB;
  user_id UUID;
BEGIN
  -- Extract user ID from the event
  user_id := (event->>'user_id')::UUID;
  
  -- Get user role from users table
  SELECT role INTO user_role
  FROM public.users
  WHERE id = user_id;
  
  -- Default to 'user' if no role found
  user_role := COALESCE(user_role, 'user');
  
  -- Get permissions for the role
  SELECT jsonb_agg(DISTINCT resource || ':' || action)
  INTO user_permissions
  FROM rbac_permissions
  WHERE role = user_role::rbac_role_type;
  
  -- Build custom claims
  claims := event->'claims';
  
  -- Add role claim
  claims := jsonb_set(claims, '{role}', to_jsonb(user_role));
  
  -- Add permissions claim (limited to avoid JWT size issues)
  IF user_permissions IS NOT NULL THEN
    claims := jsonb_set(claims, '{permissions}', user_permissions);
  END IF;
  
  -- Add app metadata
  claims := jsonb_set(claims, '{app_metadata}', jsonb_build_object(
    'provider', 'week-chain',
    'role', user_role
  ));
  
  -- Return modified event
  event := jsonb_set(event, '{claims}', claims);
  
  RETURN event;
EXCEPTION
  WHEN OTHERS THEN
    -- On error, return original event unchanged
    RETURN event;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;

-- =====================================================
-- 8. RLS POLICIES FOR AUDIT LOG
-- =====================================================

ALTER TABLE audit_log_immutable ENABLE ROW LEVEL SECURITY;

-- Only admins can read audit log
CREATE POLICY "Admin read audit log" ON audit_log_immutable
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin', 'compliance', 'legal')
    )
  );

-- Service role can insert (for system operations)
CREATE POLICY "Service insert audit log" ON audit_log_immutable
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Authenticated users can insert their own actions
CREATE POLICY "Users insert own audit" ON audit_log_immutable
  FOR INSERT
  TO authenticated
  WITH CHECK (actor_id = auth.uid());

-- =====================================================
-- 9. HIGH-VALUE OPERATION TRACKING TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS high_value_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  user_id UUID NOT NULL REFERENCES auth.users(id),
  operation_type TEXT NOT NULL,
  operation_value DECIMAL(15,2),
  currency TEXT DEFAULT 'USD',
  
  -- OTP verification
  otp_required BOOLEAN DEFAULT false,
  otp_verified BOOLEAN DEFAULT false,
  otp_verified_at TIMESTAMPTZ,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'otp_sent', 'verified', 'completed', 'failed', 'expired')),
  
  -- Metadata
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '15 minutes')
);

-- Index for lookups
CREATE INDEX idx_high_value_user ON high_value_operations(user_id, status);
CREATE INDEX idx_high_value_expires ON high_value_operations(expires_at) WHERE status = 'pending';

-- RLS
ALTER TABLE high_value_operations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own operations" ON high_value_operations
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users create own operations" ON high_value_operations
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admin see all operations" ON high_value_operations
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin', 'finance')
    )
  );

-- =====================================================
-- 10. OTP FOR HIGH-VALUE OPERATIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  user_id UUID NOT NULL REFERENCES auth.users(id),
  operation_id UUID REFERENCES high_value_operations(id),
  
  code_hash TEXT NOT NULL, -- Store hashed OTP
  attempts INT DEFAULT 0,
  max_attempts INT DEFAULT 3,
  
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '5 minutes'),
  
  -- Delivery
  delivery_method TEXT DEFAULT 'email' CHECK (delivery_method IN ('email', 'sms', 'whatsapp')),
  delivered_at TIMESTAMPTZ
);

-- Index
CREATE INDEX idx_otp_user ON otp_codes(user_id, operation_id) WHERE NOT verified;
CREATE INDEX idx_otp_expires ON otp_codes(expires_at) WHERE NOT verified;

-- RLS
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users verify own OTP" ON otp_codes
  FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- =====================================================
-- 11. INSERT GENESIS AUDIT ENTRY
-- =====================================================

INSERT INTO audit_log_immutable (
  action,
  resource_type,
  resource_id,
  metadata
) VALUES (
  'SYSTEM_INIT',
  'audit_log',
  'genesis',
  jsonb_build_object(
    'message', 'Audit log initialized',
    'version', '1.0.0',
    'timestamp', now()
  )
);

-- =====================================================
-- DONE
-- =====================================================
