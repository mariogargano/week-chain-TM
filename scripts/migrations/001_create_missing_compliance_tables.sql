-- ============================================================================
-- WEEK-CHAIN: Migration 001 - Create Missing Compliance Tables
-- Required for: Consent Validation, NOM-151 Evidence Logging
-- Priority: P0 (Blocks Go-Live)
-- ============================================================================

-- 1. CREATE user_consents TABLE
-- Required by: lib/consent/validator.ts -> validateConsent()
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    consent_type TEXT NOT NULL, -- 'terms', 'privacy', 'reservation', 'activation', 'offer_acceptance'
    consent_version TEXT NOT NULL, -- e.g., '2025.01', 'v1.2'
    accepted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Ensure one consent per type per user (can have multiple versions over time)
    CONSTRAINT unique_user_consent_type_version UNIQUE (user_id, consent_type, consent_version)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_user_consents_user_id ON public.user_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_consents_type ON public.user_consents(consent_type);
CREATE INDEX IF NOT EXISTS idx_user_consents_accepted_at ON public.user_consents(accepted_at DESC);

-- RLS Policies
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;

-- Users can read their own consents
CREATE POLICY "Users read own consents" ON public.user_consents
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own consents
CREATE POLICY "Users insert own consents" ON public.user_consents
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Service role can manage all (for admin operations)
CREATE POLICY "Service manages all consents" ON public.user_consents
    FOR ALL
    USING (auth.role() = 'service_role');

-- Admins can view all consents
CREATE POLICY "Admins view all consents" ON public.user_consents
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE email = (auth.jwt()->>'email')::text 
            AND status = 'active'
        )
    );

COMMENT ON TABLE public.user_consents IS 'Tracks user consent acceptances for PROFECO/LFPDPPP compliance';
COMMENT ON COLUMN public.user_consents.consent_type IS 'Type of consent: terms, privacy, reservation, activation, offer_acceptance';
COMMENT ON COLUMN public.user_consents.consent_version IS 'Version of the document/terms accepted';


-- 2. CREATE evidence_events TABLE
-- Required by: lib/evidence/logger.ts -> logEvidenceEvent()
-- Purpose: NOM-151 compliance - immutable audit trail with SHA-256 hashing
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.evidence_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Event identification
    event_type TEXT NOT NULL, -- 'consent_accepted', 'certificate_issued', 'reservation_confirmed', etc.
    entity_type TEXT NOT NULL, -- 'certificate', 'reservation', 'offer', 'consent', 'payment', 'document'
    entity_id TEXT NOT NULL, -- UUID or reference ID of the entity
    
    -- Actor information
    user_id UUID REFERENCES auth.users(id),
    actor_role TEXT NOT NULL, -- 'user', 'admin', 'system', 'broker', 'property_owner', 'notary'
    
    -- Payload and integrity
    payload_canonical JSONB NOT NULL, -- Canonicalized payload (sorted keys)
    hash_sha256 TEXT NOT NULL, -- SHA-256 hash of payload_canonical for integrity verification
    previous_hash TEXT, -- For hash chain verification (optional)
    
    -- Metadata
    document_version TEXT, -- Version of document/contract if applicable
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ip_address TEXT,
    user_agent TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for audit queries
CREATE INDEX IF NOT EXISTS idx_evidence_events_entity ON public.evidence_events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_evidence_events_user ON public.evidence_events(user_id);
CREATE INDEX IF NOT EXISTS idx_evidence_events_type ON public.evidence_events(event_type);
CREATE INDEX IF NOT EXISTS idx_evidence_events_occurred ON public.evidence_events(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_evidence_events_hash ON public.evidence_events(hash_sha256);

-- RLS Policies
ALTER TABLE public.evidence_events ENABLE ROW LEVEL SECURITY;

-- Service role can insert (system logging)
CREATE POLICY "Service inserts evidence" ON public.evidence_events
    FOR INSERT
    WITH CHECK (true); -- Allow all inserts (integrity is handled by app logic)

-- Admins can read all evidence
CREATE POLICY "Admins read all evidence" ON public.evidence_events
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE email = (auth.jwt()->>'email')::text 
            AND status = 'active'
        )
    );

-- Users can read their own evidence
CREATE POLICY "Users read own evidence" ON public.evidence_events
    FOR SELECT
    USING (auth.uid() = user_id);

-- NO UPDATE or DELETE policies - this table is immutable
-- Evidence events should NEVER be modified or deleted

COMMENT ON TABLE public.evidence_events IS 'NOM-151 compliant immutable audit trail for all critical business events';
COMMENT ON COLUMN public.evidence_events.hash_sha256 IS 'SHA-256 hash of payload_canonical for integrity verification';
COMMENT ON COLUMN public.evidence_events.previous_hash IS 'Optional hash chain for tamper detection';


-- 3. CREATE FUNCTION for hash chain verification
-- ============================================================================

CREATE OR REPLACE FUNCTION public.verify_evidence_chain(
    p_entity_id TEXT,
    p_entity_type TEXT
)
RETURNS TABLE (
    id UUID,
    event_type TEXT,
    occurred_at TIMESTAMPTZ,
    hash_sha256 TEXT,
    previous_hash TEXT,
    chain_valid BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH ordered_events AS (
        SELECT 
            e.id,
            e.event_type,
            e.occurred_at,
            e.hash_sha256,
            e.previous_hash,
            LAG(e.hash_sha256) OVER (ORDER BY e.occurred_at) as expected_previous
        FROM public.evidence_events e
        WHERE e.entity_id = p_entity_id 
        AND e.entity_type = p_entity_type
        ORDER BY e.occurred_at
    )
    SELECT 
        oe.id,
        oe.event_type,
        oe.occurred_at,
        oe.hash_sha256,
        oe.previous_hash,
        (oe.previous_hash IS NULL AND oe.expected_previous IS NULL) 
        OR (oe.previous_hash = oe.expected_previous) as chain_valid
    FROM ordered_events oe;
END;
$$;

COMMENT ON FUNCTION public.verify_evidence_chain IS 'Verifies hash chain integrity for NOM-151 compliance';


-- 4. ADD MISSING RLS TO consent_records TABLE
-- ============================================================================

DO $$
BEGIN
    -- Enable RLS if not already enabled
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'consent_records' 
        AND schemaname = 'public'
        AND rowsecurity = true
    ) THEN
        ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;
        
        -- Users can read their own consent records
        CREATE POLICY "Users read own consent_records" ON public.consent_records
            FOR SELECT
            USING (auth.uid() = user_id);
            
        -- Service can insert consent records
        CREATE POLICY "Service inserts consent_records" ON public.consent_records
            FOR INSERT
            WITH CHECK (true);
    END IF;
EXCEPTION
    WHEN undefined_table THEN
        -- Table doesn't exist, skip
        NULL;
END $$;


-- 5. CREATE can_refund_120h FUNCTION (if not exists)
-- Required by: /api/legal/request-cancellation/route.ts
-- ============================================================================

CREATE OR REPLACE FUNCTION public.can_refund_120h(p_voucher_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_created_at TIMESTAMPTZ;
    v_hours_elapsed NUMERIC;
BEGIN
    -- Get voucher creation time
    SELECT created_at INTO v_created_at
    FROM public.purchase_vouchers
    WHERE id = p_voucher_id;
    
    IF v_created_at IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Calculate hours elapsed
    v_hours_elapsed := EXTRACT(EPOCH FROM (now() - v_created_at)) / 3600;
    
    -- Return true if within 120 hours (5 days)
    RETURN v_hours_elapsed <= 120;
END;
$$;

COMMENT ON FUNCTION public.can_refund_120h IS 'Checks if voucher is within 120h (5 day) reflection period per PROFECO';


-- 6. CREATE get_refund_eligibility FUNCTION (if not exists)
-- Required by: /api/legal/check-refund-eligibility/route.ts
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_refund_eligibility(
    p_id UUID,
    p_type TEXT DEFAULT 'voucher'
)
RETURNS TABLE (
    eligible BOOLEAN,
    hours_remaining NUMERIC,
    deadline TIMESTAMPTZ,
    reason TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_created_at TIMESTAMPTZ;
    v_deadline TIMESTAMPTZ;
    v_hours_elapsed NUMERIC;
    v_hours_remaining NUMERIC;
BEGIN
    IF p_type = 'voucher' THEN
        SELECT created_at INTO v_created_at
        FROM public.purchase_vouchers
        WHERE id = p_id;
    ELSIF p_type = 'booking' THEN
        SELECT created_at INTO v_created_at
        FROM public.confirmed_reservations
        WHERE id = p_id;
    END IF;
    
    IF v_created_at IS NULL THEN
        RETURN QUERY SELECT 
            FALSE::BOOLEAN, 
            0::NUMERIC, 
            NULL::TIMESTAMPTZ, 
            'Record not found'::TEXT;
        RETURN;
    END IF;
    
    v_deadline := v_created_at + INTERVAL '120 hours';
    v_hours_elapsed := EXTRACT(EPOCH FROM (now() - v_created_at)) / 3600;
    v_hours_remaining := 120 - v_hours_elapsed;
    
    IF v_hours_remaining > 0 THEN
        RETURN QUERY SELECT 
            TRUE::BOOLEAN,
            v_hours_remaining,
            v_deadline,
            'Within 120h reflection period'::TEXT;
    ELSE
        RETURN QUERY SELECT 
            FALSE::BOOLEAN,
            0::NUMERIC,
            v_deadline,
            'Reflection period expired'::TEXT;
    END IF;
END;
$$;

COMMENT ON FUNCTION public.get_refund_eligibility IS 'Returns refund eligibility details for PROFECO compliance';


-- ============================================================================
-- VERIFICATION QUERIES (run after migration)
-- ============================================================================

-- Verify tables exist
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('user_consents', 'evidence_events');

-- Verify RLS is enabled
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('user_consents', 'evidence_events');

-- Verify functions exist
-- SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name IN ('verify_evidence_chain', 'can_refund_120h', 'get_refund_eligibility');
