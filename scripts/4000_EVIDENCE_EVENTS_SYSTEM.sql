-- ============================================================================
-- NOM-151 COMPLIANT EVIDENCE EVENTS SYSTEM
-- Creates audit trail with SHA-256 hashing for legal compliance
-- ============================================================================

-- Create evidence_events table
CREATE TABLE IF NOT EXISTS public.evidence_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  user_id UUID,
  actor_role TEXT,
  payload_canonical JSONB NOT NULL,
  hash_sha256 TEXT NOT NULL,
  document_version TEXT,
  occurred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_evidence_events_entity ON public.evidence_events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_evidence_events_user ON public.evidence_events(user_id);
CREATE INDEX IF NOT EXISTS idx_evidence_events_type ON public.evidence_events(event_type);
CREATE INDEX IF NOT EXISTS idx_evidence_events_occurred ON public.evidence_events(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_evidence_events_hash ON public.evidence_events(hash_sha256);

-- Enable RLS
ALTER TABLE public.evidence_events ENABLE ROW LEVEL SECURITY;

-- Admin can view all evidence
CREATE POLICY "Admin can view all evidence"
  ON public.evidence_events
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Users can view their own evidence
CREATE POLICY "Users can view their own evidence"
  ON public.evidence_events
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- System can insert evidence (no user-facing inserts)
CREATE POLICY "System can insert evidence"
  ON public.evidence_events
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create helper function to log evidence
CREATE OR REPLACE FUNCTION public.log_evidence_event(
  p_event_type TEXT,
  p_entity_type TEXT,
  p_entity_id UUID,
  p_user_id UUID,
  p_actor_role TEXT,
  p_payload_canonical JSONB,
  p_hash_sha256 TEXT,
  p_document_version TEXT DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO public.evidence_events (
    event_type,
    entity_type,
    entity_id,
    user_id,
    actor_role,
    payload_canonical,
    hash_sha256,
    document_version,
    ip_address,
    user_agent,
    occurred_at
  ) VALUES (
    p_event_type,
    p_entity_type,
    p_entity_id,
    p_user_id,
    p_actor_role,
    p_payload_canonical,
    p_hash_sha256,
    p_document_version,
    p_ip_address,
    p_user_agent,
    now()
  ) RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.log_evidence_event TO authenticated;

COMMENT ON TABLE public.evidence_events IS 'NOM-151 compliant audit trail with SHA-256 hashing for legal compliance';
COMMENT ON COLUMN public.evidence_events.payload_canonical IS 'Canonicalized JSON payload for deterministic hashing';
COMMENT ON COLUMN public.evidence_events.hash_sha256 IS 'SHA-256 hash of canonicalized payload for tamper detection';
