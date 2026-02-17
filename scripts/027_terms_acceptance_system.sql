-- Terms Acceptance System for Legal Compliance
-- NOM-151-SCFI-2016 Compliant

-- Create terms_acceptance table
CREATE TABLE IF NOT EXISTS terms_acceptance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  terms_version TEXT NOT NULL DEFAULT '1.0',
  accepted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  nom151_hash TEXT NOT NULL,
  clickwrap_signature JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create compliance_audit_log table
CREATE TABLE IF NOT EXISTS compliance_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_terms_acceptance_user ON terms_acceptance(user_id);
CREATE INDEX IF NOT EXISTS idx_terms_acceptance_version ON terms_acceptance(terms_version);
CREATE INDEX IF NOT EXISTS idx_compliance_audit_user ON compliance_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_compliance_audit_type ON compliance_audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_compliance_audit_created ON compliance_audit_log(created_at DESC);

-- Enable RLS
ALTER TABLE terms_acceptance ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for terms_acceptance
CREATE POLICY "Users can read own terms acceptance"
  ON terms_acceptance FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own terms acceptance"
  ON terms_acceptance FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for compliance_audit_log
CREATE POLICY "Users can read own audit logs"
  ON compliance_audit_log FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can do everything
CREATE POLICY "Service role full access to terms"
  ON terms_acceptance FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role full access to audit"
  ON compliance_audit_log FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Grant permissions
GRANT ALL ON terms_acceptance TO service_role;
GRANT ALL ON compliance_audit_log TO service_role;
GRANT SELECT, INSERT ON terms_acceptance TO authenticated;
GRANT SELECT ON compliance_audit_log TO authenticated;
