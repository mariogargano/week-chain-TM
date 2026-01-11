CREATE TABLE IF NOT EXISTS certificate_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Certificate details
  certificate_type TEXT NOT NULL, -- 'basic', 'premium', 'elite'
  certificate_number TEXT UNIQUE NOT NULL, -- Generated: SVC-2025-XXXXX
  certificate_code TEXT UNIQUE NOT NULL, -- QR/Barcode: WEEK-XXXXX-XXXXX
  
  -- Pricing
  amount_usd NUMERIC(10,2) NOT NULL,
  amount_mxn NUMERIC(10,2),
  currency TEXT NOT NULL DEFAULT 'USD',
  exchange_rate NUMERIC(10,4),
  
  -- Payment details
  payment_id UUID REFERENCES payments(id),
  payment_status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, failed, refunded
  payment_method TEXT, -- stripe, conekta_card, conekta_oxxo, conekta_spei
  payment_reference TEXT,
  
  -- Legal compliance
  terms_acceptance_id UUID REFERENCES terms_acceptance(id) NOT NULL,
  privacy_acceptance_id UUID REFERENCES legal_acceptances(id) NOT NULL,
  clickwrap_data JSONB NOT NULL, -- IP, timestamp, user_agent, full signature
  nom151_compliance_hash TEXT NOT NULL, -- Hash for audit trail
  
  -- Voucher
  voucher_generated BOOLEAN DEFAULT FALSE,
  voucher_url TEXT,
  voucher_generated_at TIMESTAMPTZ,
  voucher_sent_via_email BOOLEAN DEFAULT FALSE,
  
  -- Invoice
  invoice_requested BOOLEAN DEFAULT FALSE,
  invoice_generated BOOLEAN DEFAULT FALSE,
  invoice_number TEXT UNIQUE,
  invoice_url TEXT,
  invoice_requested_at TIMESTAMPTZ,
  invoice_generated_at TIMESTAMPTZ,
  invoice_sent_via_email BOOLEAN DEFAULT FALSE,
  
  -- Billing info for invoice
  billing_name TEXT,
  billing_rfc TEXT,
  billing_email TEXT,
  billing_address JSONB,
  billing_fiscal_regime TEXT,
  billing_cfdi_use TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending', -- pending, active, expired, cancelled
  activated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ, -- 15 years from activation
  
  CONSTRAINT valid_payment_status CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'active', 'expired', 'cancelled'))
);

-- Indexes for performance
CREATE INDEX idx_certificate_purchases_user ON certificate_purchases(user_id);
CREATE INDEX idx_certificate_purchases_payment ON certificate_purchases(payment_id);
CREATE INDEX idx_certificate_purchases_status ON certificate_purchases(status);
CREATE INDEX idx_certificate_purchases_number ON certificate_purchases(certificate_number);
CREATE INDEX idx_certificate_purchases_created ON certificate_purchases(created_at DESC);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_certificate_purchases_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER certificate_purchases_updated_at
BEFORE UPDATE ON certificate_purchases
FOR EACH ROW EXECUTE FUNCTION update_certificate_purchases_timestamp();

-- Function to generate certificate number
CREATE OR REPLACE FUNCTION generate_certificate_number()
RETURNS TEXT AS $$
DECLARE
  year TEXT;
  sequence_num TEXT;
  result TEXT;
BEGIN
  year := TO_CHAR(NOW(), 'YYYY');
  
  -- Get next sequence number (pad to 6 digits)
  SELECT LPAD((COUNT(*) + 1)::TEXT, 6, '0')
  INTO sequence_num
  FROM certificate_purchases
  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
  
  result := 'SVC-' || year || '-' || sequence_num;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to generate certificate code (for QR/barcode)
CREATE OR REPLACE FUNCTION generate_certificate_code()
RETURNS TEXT AS $$
DECLARE
  part1 TEXT;
  part2 TEXT;
BEGIN
  part1 := UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 5));
  part2 := UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 5));
  RETURN 'WEEK-' || part1 || '-' || part2;
END;
$$ LANGUAGE plpgsql;

-- Auto-generate certificate number and code on insert
CREATE OR REPLACE FUNCTION auto_generate_certificate_identifiers()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.certificate_number IS NULL THEN
    NEW.certificate_number := generate_certificate_number();
  END IF;
  
  IF NEW.certificate_code IS NULL THEN
    NEW.certificate_code := generate_certificate_code();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER certificate_identifiers_auto_generate
BEFORE INSERT ON certificate_purchases
FOR EACH ROW EXECUTE FUNCTION auto_generate_certificate_identifiers();

-- RLS Policies
ALTER TABLE certificate_purchases ENABLE ROW LEVEL SECURITY;

-- Users can view their own purchases
CREATE POLICY "users_view_own_certificates"
ON certificate_purchases FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own purchases
CREATE POLICY "users_insert_own_certificates"
ON certificate_purchases FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own certificate billing info
CREATE POLICY "users_update_own_certificate_billing"
ON certificate_purchases FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id AND
  -- Only allow updating billing fields and invoice request flag
  (
    billing_name IS NOT DISTINCT FROM OLD.billing_name OR
    billing_rfc IS NOT DISTINCT FROM OLD.billing_rfc OR
    billing_email IS NOT DISTINCT FROM OLD.billing_email OR
    billing_address IS NOT DISTINCT FROM OLD.billing_address OR
    billing_fiscal_regime IS NOT DISTINCT FROM OLD.billing_fiscal_regime OR
    billing_cfdi_use IS NOT DISTINCT FROM OLD.billing_cfdi_use OR
    invoice_requested IS NOT DISTINCT FROM OLD.invoice_requested
  )
);

-- Service role has full access
CREATE POLICY "service_role_full_access_certificates"
ON certificate_purchases FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Admin can view all
CREATE POLICY "admins_view_all_certificates"
ON certificate_purchases FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

COMMENT ON TABLE certificate_purchases IS 'Complete certificate purchase flow with legal compliance, vouchers, and automatic invoicing';
COMMENT ON COLUMN certificate_purchases.clickwrap_data IS 'Complete click-wrap signature data including IP, timestamp, user agent for legal proof';
COMMENT ON COLUMN certificate_purchases.nom151_compliance_hash IS 'SHA-256 hash of terms acceptance for NOM-151 compliance and audit trail';
