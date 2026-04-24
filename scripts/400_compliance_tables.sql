-- =====================================================
-- COMPLIANCE TABLES: PROFECO, NOM-151, LFPDPPP
-- =====================================================
-- Creates tables required for legal compliance in Mexico
-- PROFECO: Consumer protection (user_consents)
-- NOM-151: Data integrity and evidence preservation (evidence_events)
-- LFPDPPP: Privacy and personal data protection
-- =====================================================

-- 1. USER CONSENTS TABLE (PROFECO)
-- Stores user acceptance of terms, privacy, KYC, and SVC-specific consent
CREATE TABLE IF NOT EXISTS public.user_consents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL,
  consent_version TEXT NOT NULL,
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_consent_type CHECK (
    consent_type IN ('terms', 'privacy', 'kyc', 'svc_acceptance', 'marketing', 'cookies', 'waiver_120h')
  )
);

CREATE INDEX IF NOT EXISTS idx_user_consents_user_type ON public.user_consents(user_id, consent_type);
CREATE INDEX IF NOT EXISTS idx_user_consents_accepted ON public.user_consents(accepted_at DESC);

ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own consents" ON public.user_consents;
CREATE POLICY "Users can view their own consents"
  ON public.user_consents FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own consents" ON public.user_consents;
CREATE POLICY "Users can insert their own consents"
  ON public.user_consents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all consents" ON public.user_consents;
CREATE POLICY "Admins can view all consents"
  ON public.user_consents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- 2. EVIDENCE EVENTS TABLE (NOM-151)
-- Immutable audit log for critical business events
-- Required by NOM-151 for data integrity and non-repudiation
CREATE TABLE IF NOT EXISTS public.evidence_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_role TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  hash TEXT NOT NULL,
  previous_hash TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_event_type CHECK (
    event_type IN (
      'request_created',
      'offer_generated',
      'offer_sent',
      'offer_accepted',
      'offer_rejected',
      'offer_expired',
      'svc_issued',
      'svc_confirmed',
      'svc_cancelled',
      'svc_transferred',
      'payment_received',
      'payment_refunded',
      'refund_requested',
      'refund_approved',
      'consent_recorded',
      'kyc_submitted',
      'kyc_approved',
      'kyc_rejected',
      'document_signed',
      'document_uploaded',
      'user_created',
      'user_updated',
      'admin_action'
    )
  )
);

CREATE INDEX IF NOT EXISTS idx_evidence_events_entity ON public.evidence_events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_evidence_events_user ON public.evidence_events(user_id);
CREATE INDEX IF NOT EXISTS idx_evidence_events_type ON public.evidence_events(event_type);
CREATE INDEX IF NOT EXISTS idx_evidence_events_created ON public.evidence_events(created_at DESC);

ALTER TABLE public.evidence_events ENABLE ROW LEVEL SECURITY;

-- Only admins can view evidence events
DROP POLICY IF EXISTS "Admins can view all evidence" ON public.evidence_events;
CREATE POLICY "Admins can view all evidence"
  ON public.evidence_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin', 'compliance')
    )
  );

-- Users can view their own events
DROP POLICY IF EXISTS "Users can view own evidence" ON public.evidence_events;
CREATE POLICY "Users can view own evidence"
  ON public.evidence_events FOR SELECT
  USING (auth.uid() = user_id);

-- Evidence events are immutable - NO UPDATE or DELETE policies
-- Only INSERT allowed (via service role)

-- 3. REFUND WINDOW FUNCTION (120h PROFECO requirement)
-- Calculates if a purchase is within the 120h refund window
CREATE OR REPLACE FUNCTION public.can_refund_120h(
  p_purchase_date TIMESTAMPTZ,
  p_waiver_accepted BOOLEAN DEFAULT FALSE
) RETURNS BOOLEAN AS $$
BEGIN
  -- If user waived the 120h right, no refund available
  IF p_waiver_accepted THEN
    RETURN FALSE;
  END IF;
  
  -- Check if within 120 hours (5 days) of purchase
  RETURN (NOW() - p_purchase_date) <= INTERVAL '120 hours';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 4. REFUND ELIGIBILITY HELPER
CREATE OR REPLACE FUNCTION public.get_refund_eligibility(
  p_user_id UUID,
  p_purchase_id UUID,
  p_purchase_date TIMESTAMPTZ
) RETURNS JSONB AS $$
DECLARE
  v_waiver_accepted BOOLEAN;
  v_can_refund BOOLEAN;
  v_hours_remaining NUMERIC;
BEGIN
  -- Check if user accepted 120h waiver
  SELECT EXISTS(
    SELECT 1 FROM public.user_consents
    WHERE user_id = p_user_id
    AND consent_type = 'waiver_120h'
    AND metadata->>'purchase_id' = p_purchase_id::TEXT
  ) INTO v_waiver_accepted;
  
  v_can_refund := public.can_refund_120h(p_purchase_date, v_waiver_accepted);
  v_hours_remaining := EXTRACT(EPOCH FROM (p_purchase_date + INTERVAL '120 hours' - NOW())) / 3600;
  
  RETURN jsonb_build_object(
    'can_refund', v_can_refund,
    'waiver_accepted', v_waiver_accepted,
    'hours_remaining', GREATEST(v_hours_remaining, 0),
    'deadline', p_purchase_date + INTERVAL '120 hours'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. SEED INITIAL CONSENT VERSIONS (for reference)
INSERT INTO public.user_consents (user_id, consent_type, consent_version, accepted_at, metadata)
SELECT 
  id,
  'terms',
  'v1.0.0',
  NOW(),
  jsonb_build_object('auto_generated', true, 'reason', 'legacy_user_migration')
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_consents
  WHERE user_consents.user_id = auth.users.id
  AND user_consents.consent_type = 'terms'
)
LIMIT 0; -- Set to 0 to disable auto-seed. Change to higher number to migrate existing users.

-- Grant permissions
GRANT SELECT, INSERT ON public.user_consents TO authenticated;
GRANT SELECT, INSERT ON public.evidence_events TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_refund_120h TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_refund_eligibility TO authenticated;
