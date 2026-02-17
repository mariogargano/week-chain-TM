-- =====================================================
-- WEEK-CHAIN NOM-151 Evidence Events System
-- Implements immutable audit trail for legal compliance
-- =====================================================

-- Create evidence_events table for NOM-151 compliance
CREATE TABLE IF NOT EXISTS public.evidence_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL, -- 'consent_accepted', 'certificate_activated', 'reservation_requested', 'offer_accepted', etc.
  entity_type TEXT NOT NULL, -- 'certificate', 'reservation', 'offer', 'consent', etc.
  entity_id UUID NOT NULL, -- ID of the entity being acted upon
  user_id UUID NOT NULL REFERENCES auth.users(id),
  actor_role TEXT NOT NULL, -- 'user', 'admin', 'system', 'broker', etc.
  payload_canonical JSONB NOT NULL, -- Canonical representation of the event payload
  hash_sha256 TEXT NOT NULL, -- SHA-256 hash of payload_canonical
  document_version TEXT, -- Version of the document/terms if applicable
  occurred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_evidence_events_user_id ON public.evidence_events(user_id);
CREATE INDEX IF NOT EXISTS idx_evidence_events_entity_type_id ON public.evidence_events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_evidence_events_event_type ON public.evidence_events(event_type);
CREATE INDEX IF NOT EXISTS idx_evidence_events_occurred_at ON public.evidence_events(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_evidence_events_hash ON public.evidence_events(hash_sha256);

-- Enable Row Level Security
ALTER TABLE public.evidence_events ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only view their own evidence events
CREATE POLICY "Users can view their own evidence events"
  ON public.evidence_events
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Admins can view all evidence events
CREATE POLICY "Admins can view all evidence events"
  ON public.evidence_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- RLS Policy: System can insert evidence events (via service role)
CREATE POLICY "System can insert evidence events"
  ON public.evidence_events
  FOR INSERT
  WITH CHECK (true);

-- NO UPDATE OR DELETE POLICIES - Evidence events are IMMUTABLE

-- Helper function to verify evidence chain integrity
CREATE OR REPLACE FUNCTION verify_evidence_chain(p_entity_id UUID, p_entity_type TEXT)
RETURNS TABLE(
  is_valid BOOLEAN,
  total_events INTEGER,
  hash_mismatches INTEGER,
  details JSONB
) AS $$
DECLARE
  v_event RECORD;
  v_computed_hash TEXT;
  v_mismatches INTEGER := 0;
  v_total INTEGER := 0;
BEGIN
  FOR v_event IN
    SELECT * FROM public.evidence_events
    WHERE entity_id = p_entity_id AND entity_type = p_entity_type
    ORDER BY occurred_at
  LOOP
    v_total := v_total + 1;
    
    -- Compute hash from payload_canonical
    v_computed_hash := encode(digest(v_event.payload_canonical::text, 'sha256'), 'hex');
    
    -- Check if hash matches
    IF v_computed_hash != v_event.hash_sha256 THEN
      v_mismatches := v_mismatches + 1;
    END IF;
  END LOOP;
  
  RETURN QUERY SELECT
    (v_mismatches = 0) as is_valid,
    v_total as total_events,
    v_mismatches as hash_mismatches,
    jsonb_build_object(
      'entity_id', p_entity_id,
      'entity_type', p_entity_type,
      'verified_at', NOW()
    ) as details;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE public.evidence_events IS 'NOM-151 compliant immutable audit trail for legal evidence';
COMMENT ON COLUMN public.evidence_events.hash_sha256 IS 'SHA-256 hash of payload_canonical for integrity verification';
COMMENT ON COLUMN public.evidence_events.payload_canonical IS 'Canonical JSONB representation ensuring deterministic hashing';
