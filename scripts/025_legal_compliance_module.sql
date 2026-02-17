-- Legal Compliance Module for WEEKCHAIN México
-- Compliance with NOM-029-SE-2021, NOM-151-SCFI-2016, LFPDPPP

-- Table for tracking terms acceptance (Contrato de Adhesión Digital)
CREATE TABLE IF NOT EXISTS terms_acceptance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address TEXT NOT NULL,
  user_agent TEXT,
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  terms_version TEXT NOT NULL DEFAULT 'v1.0',
  nom151_hash TEXT, -- Hash NOM-151 del documento aceptado
  clickwrap_signature JSONB, -- Metadata de la firma digital
  UNIQUE(user_id, terms_version)
);

-- Table for privacy policy acceptance (LFPDPPP)
CREATE TABLE IF NOT EXISTS privacy_acceptance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address TEXT NOT NULL,
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  privacy_version TEXT NOT NULL DEFAULT 'v1.0',
  marketing_consent BOOLEAN DEFAULT false,
  data_sharing_consent BOOLEAN DEFAULT false,
  UNIQUE(user_id, privacy_version)
);

-- Table for cancellation requests (Periodo de reflexión NOM-029)
CREATE TABLE IF NOT EXISTS cancellation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  voucher_id UUID REFERENCES purchase_vouchers(id),
  escrow_tx TEXT,
  reason TEXT,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected, completed
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  refund_amount DECIMAL(10,2),
  refund_tx TEXT,
  within_reflection_period BOOLEAN DEFAULT true,
  notes TEXT
);

-- Table for NOM-151 document hashes
CREATE TABLE IF NOT EXISTS nom151_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_type TEXT NOT NULL, -- 'terms', 'privacy', 'contract', 'voucher'
  document_version TEXT NOT NULL,
  content_hash TEXT NOT NULL, -- SHA-256 hash
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  issuer TEXT DEFAULT 'WEEKCHAIN S.A.P.I. de C.V.',
  metadata JSONB,
  UNIQUE(document_type, document_version)
);

-- Table for legal compliance audit log
CREATE TABLE IF NOT EXISTS compliance_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL, -- 'terms_accepted', 'privacy_accepted', 'cancellation_requested', etc.
  event_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_terms_acceptance_user ON terms_acceptance(user_id);
CREATE INDEX IF NOT EXISTS idx_privacy_acceptance_user ON privacy_acceptance(user_id);
CREATE INDEX IF NOT EXISTS idx_cancellation_requests_user ON cancellation_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_cancellation_requests_status ON cancellation_requests(status);
CREATE INDEX IF NOT EXISTS idx_compliance_audit_log_user ON compliance_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_compliance_audit_log_event ON compliance_audit_log(event_type);

-- Insert initial NOM-151 hashes for current document versions
INSERT INTO nom151_documents (document_type, document_version, content_hash, metadata) VALUES
  ('terms', 'v1.0', 'a1b2c3d4e5f6...', '{"description": "Términos y Condiciones iniciales"}'),
  ('privacy', 'v1.0', 'f6e5d4c3b2a1...', '{"description": "Política de Privacidad inicial"}')
ON CONFLICT (document_type, document_version) DO NOTHING;

-- Enable RLS
ALTER TABLE terms_acceptance ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_acceptance ENABLE ROW LEVEL SECURITY;
ALTER TABLE cancellation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE nom151_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "user_reads_own_accepts" ON terms_acceptance
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_inserts_own_accepts" ON terms_acceptance
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own privacy acceptance" ON privacy_acceptance
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own privacy acceptance" ON privacy_acceptance
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own cancellation requests" ON cancellation_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create cancellation requests" ON cancellation_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "NOM-151 documents are public" ON nom151_documents
  FOR SELECT USING (true);

CREATE POLICY "Users can view their own audit log" ON compliance_audit_log
  FOR SELECT USING (auth.uid() = user_id);

-- Adding additional tables for legal contracts and refunds
-- Table for legal contracts with NOM-151 certification
CREATE TABLE IF NOT EXISTS legal_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  voucher_id UUID REFERENCES purchase_vouchers(id),
  nom151_folio TEXT UNIQUE NOT NULL,
  sha256_hash TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'certified', 'minted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  certified_at TIMESTAMPTZ,
  metadata JSONB
);

-- Table for refund/cancellation tracking
CREATE TABLE IF NOT EXISTS refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  voucher_id UUID REFERENCES purchase_vouchers(id),
  escrow_tx TEXT,
  amount DECIMAL(10,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  refund_tx TEXT,
  reason TEXT
);

-- Indexes for new tables
CREATE INDEX IF NOT EXISTS idx_legal_contracts_user ON legal_contracts(user_id);
CREATE INDEX IF NOT EXISTS idx_legal_contracts_status ON legal_contracts(status);
CREATE INDEX IF NOT EXISTS idx_legal_contracts_folio ON legal_contracts(nom151_folio);
CREATE INDEX IF NOT EXISTS idx_refunds_user ON refunds(user_id);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(status);

-- Enable RLS for new tables
ALTER TABLE legal_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;

-- RLS Policies for legal_contracts
CREATE POLICY "Users can view their own legal contracts" ON legal_contracts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role inserts legal contracts" ON legal_contracts
  FOR INSERT WITH CHECK (false); -- Only service_role can bypass and insert

-- RLS Policies for refunds
CREATE POLICY "Users can view their own refunds" ON refunds
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create refund requests" ON refunds
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to check if a voucher is within the 120-hour (5-day) refund window
-- Required by NOM-029-SE-2021 (Periodo de reflexión)
CREATE OR REPLACE FUNCTION can_refund_120h(p_voucher_id UUID)
RETURNS BOOLEAN LANGUAGE SQL AS $$
  SELECT (NOW() - pv.created_at) <= INTERVAL '120 hours'
  FROM purchase_vouchers pv 
  WHERE pv.id = p_voucher_id;
$$;

-- Function to automatically approve refunds within reflection period
CREATE OR REPLACE FUNCTION auto_approve_refund_if_within_period()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  within_period BOOLEAN;
BEGIN
  -- Check if voucher is within 120-hour refund window
  SELECT can_refund_120h(NEW.voucher_id) INTO within_period;
  
  -- Auto-approve if within reflection period
  IF within_period THEN
    NEW.status := 'approved';
    NEW.within_reflection_period := true;
    NEW.processed_at := NOW();
  ELSE
    NEW.within_reflection_period := false;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to auto-approve refunds within reflection period
DROP TRIGGER IF EXISTS trg_auto_approve_refund ON cancellation_requests;
CREATE TRIGGER trg_auto_approve_refund
  BEFORE INSERT ON cancellation_requests
  FOR EACH ROW
  EXECUTE FUNCTION auto_approve_refund_if_within_period();

COMMENT ON FUNCTION can_refund_120h IS 'Verifica si un voucher está dentro del periodo de reflexión de 120 horas (5 días) según NOM-029-SE-2021';
