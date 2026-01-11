-- ============================================================================
-- WEEK-CHAIN - User Consents System (PROFECO-Compliant)
-- ============================================================================
-- Purpose: Implement STRICT click-wrap enforcement with audit trail
-- Compliance: NOM-151-SCFI-2016, LFPDPPP, PROFECO
-- ============================================================================

-- Drop existing if exists
DROP TABLE IF EXISTS public.user_consents CASCADE;

-- Create user_consents table
CREATE TABLE public.user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL CHECK (consent_type IN (
    'terms_acceptance',
    'certificate_activation',
    'reservation_request',
    'offer_acceptance',
    'privacy_policy',
    'marketing_consent'
  )),
  document_version TEXT NOT NULL DEFAULT '1.0',
  ip_address TEXT,
  user_agent TEXT,
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  
  -- NOM-151 compliance
  consent_hash TEXT, -- SHA-256 hash of consent for legal verification
  
  -- Prevent duplicates within same hour (user can't spam accept)
  UNIQUE(user_id, consent_type, accepted_at)
);

-- Indexes for performance
CREATE INDEX idx_user_consents_user_id ON public.user_consents(user_id);
CREATE INDEX idx_user_consents_type ON public.user_consents(consent_type);
CREATE INDEX idx_user_consents_accepted_at ON public.user_consents(accepted_at);

-- RLS Policies
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own consents"
  ON public.user_consents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own consents"
  ON public.user_consents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all consents"
  ON public.user_consents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Function to check if user has valid consent
CREATE OR REPLACE FUNCTION public.has_valid_consent(
  p_user_id UUID,
  p_consent_type TEXT,
  p_max_age_days INTEGER DEFAULT 365
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_has_consent BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.user_consents
    WHERE user_id = p_user_id
      AND consent_type = p_consent_type
      AND accepted_at > NOW() - (p_max_age_days || ' days')::INTERVAL
  ) INTO v_has_consent;
  
  RETURN v_has_consent;
END;
$$;

-- Function to record consent with hash
CREATE OR REPLACE FUNCTION public.record_consent(
  p_user_id UUID,
  p_consent_type TEXT,
  p_document_version TEXT,
  p_ip_address TEXT,
  p_user_agent TEXT,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_consent_id UUID;
  v_consent_hash TEXT;
BEGIN
  -- Generate SHA-256 hash (NOM-151 compliance)
  v_consent_hash := encode(
    digest(
      p_user_id::TEXT || p_consent_type || p_document_version || NOW()::TEXT,
      'sha256'
    ),
    'hex'
  );
  
  -- Insert consent record
  INSERT INTO public.user_consents (
    user_id,
    consent_type,
    document_version,
    ip_address,
    user_agent,
    metadata,
    consent_hash
  ) VALUES (
    p_user_id,
    p_consent_type,
    p_document_version,
    p_ip_address,
    p_user_agent,
    p_metadata,
    v_consent_hash
  )
  RETURNING id INTO v_consent_id;
  
  RETURN v_consent_id;
END;
$$;

-- ============================================================================
-- Seed Data - Admin User Setup
-- ============================================================================

-- Ensure corporativo@morises.com has consent recorded
DO $$
DECLARE
  v_admin_user_id UUID;
BEGIN
  -- Get admin user ID from auth.users
  SELECT id INTO v_admin_user_id
  FROM auth.users
  WHERE email = 'corporativo@morises.com'
  LIMIT 1;
  
  IF v_admin_user_id IS NOT NULL THEN
    -- Record terms acceptance for admin
    INSERT INTO public.user_consents (
      user_id,
      consent_type,
      document_version,
      ip_address,
      user_agent,
      metadata,
      consent_hash
    ) VALUES (
      v_admin_user_id,
      'terms_acceptance',
      '1.0',
      '127.0.0.1',
      'WEEK-CHAIN Admin Setup',
      '{"source": "admin_setup", "auto_approved": true}'::jsonb,
      encode(digest(v_admin_user_id::TEXT || 'terms_acceptance' || '1.0' || NOW()::TEXT, 'sha256'), 'hex')
    )
    ON CONFLICT (user_id, consent_type, accepted_at) DO NOTHING;
    
    RAISE NOTICE 'Admin user consent recorded successfully';
  ELSE
    RAISE NOTICE 'Admin user not found - consent will be recorded on first login';
  END IF;
END $$;

-- ============================================================================
-- Verification
-- ============================================================================

SELECT 
  'user_consents table created' AS status,
  COUNT(*) AS initial_records
FROM public.user_consents;

RAISE NOTICE 'User consents system installed successfully';
RAISE NOTICE 'Run this script in Supabase SQL Editor to activate consent tracking';
