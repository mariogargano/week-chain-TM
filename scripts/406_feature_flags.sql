-- scripts/406_feature_flags.sql
-- Feature Flags Table for Launch Ready Deployment

CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  owner TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Insert core flags with defaults
INSERT INTO feature_flags (name, enabled, description, owner) VALUES
  ('PAYMENTS_ENABLED', false, 'Master switch for payment processing (Stripe + Conekta)', 'Finance'),
  ('STRIPE_LIVE_MODE_ENABLED', false, 'Toggle between Stripe test ↔ live mode', 'Finance'),
  ('CONEKTA_ENABLED', false, 'Enable Conekta for Mexican payments (OXXO, etc.)', 'Finance'),
  ('CERTIFICATE_ISSUANCE_ENABLED', false, 'Allow creation of new SVC certificates', 'Operations'),
  ('WEBHOOK_PROCESSING_ENABLED', true, 'Process payment/signature webhooks', 'Platform'),
  ('EMAILS_ENABLED', false, 'Send transactional emails via Resend', 'Communications'),
  ('KYC_ENABLED', false, 'Require KYC verification for brokers', 'Compliance'),
  ('SIGNATURE_ENABLED', false, 'Require digital signature on contracts', 'Legal'),
  ('PUBLIC_SIGNUP_ENABLED', true, 'Allow new user registration', 'Product'),
  ('BETA_ALLOWLIST_ONLY', false, 'Restrict access to allowlist only (emergency lockdown)', 'Product')
ON CONFLICT (name) DO NOTHING;

-- Audit log for flag changes
CREATE TABLE IF NOT EXISTS feature_flag_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_name TEXT NOT NULL REFERENCES feature_flags(name),
  old_value BOOLEAN,
  new_value BOOLEAN NOT NULL,
  changed_by UUID,
  changed_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create trigger to audit flag changes
CREATE OR REPLACE FUNCTION audit_feature_flag_change()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO feature_flag_audit (flag_name, old_value, new_value, changed_by)
  VALUES (NEW.name, OLD.enabled, NEW.enabled, auth.uid());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_audit_feature_flag ON feature_flags;
CREATE TRIGGER trigger_audit_feature_flag
  AFTER UPDATE ON feature_flags
  FOR EACH ROW
  EXECUTE FUNCTION audit_feature_flag_change();

-- RLS: Allow admins to read/update, others to read only
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage feature flags"
  ON feature_flags
  FOR ALL
  USING (auth.jwt() ->> 'email' IN (
    SELECT email FROM users WHERE role = 'admin' OR role = 'super_admin'
  ));

CREATE POLICY "Everyone can read feature flags"
  ON feature_flags
  FOR SELECT
  USING (true);

ALTER TABLE feature_flag_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read feature flag audit"
  ON feature_flag_audit
  FOR SELECT
  USING (auth.jwt() ->> 'email' IN (
    SELECT email FROM users WHERE role = 'admin' OR role = 'super_admin'
  ));
