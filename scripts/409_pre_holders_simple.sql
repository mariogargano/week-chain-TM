-- PRE-HOLDERS DEPOSIT SYSTEM - SIMPLIFIED
-- $100 USD refundable deposit for early access

DROP TABLE IF EXISTS pre_holders CASCADE;

CREATE TABLE pre_holders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  country TEXT DEFAULT 'MX',
  deposit_amount_usd DECIMAL(10,2) DEFAULT 100.00,
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  payment_status TEXT DEFAULT 'pending',
  paid_at TIMESTAMP WITH TIME ZONE,
  refund_requested_at TIMESTAMP WITH TIME ZONE,
  refunded_at TIMESTAMP WITH TIME ZONE,
  refund_reason TEXT,
  early_access_starts_at TIMESTAMP WITH TIME ZONE,
  early_access_ends_at TIMESTAMP WITH TIME ZONE,
  discount_percent DECIMAL(5,2) DEFAULT 5.00,
  deposit_applied BOOLEAN DEFAULT FALSE,
  applied_to_certificate_id UUID,
  applied_at TIMESTAMP WITH TIME ZONE,
  referral_code TEXT UNIQUE,
  referred_by_code TEXT,
  priority_number INTEGER,
  status TEXT DEFAULT 'pending',
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_pre_holders_email ON pre_holders(email);
CREATE INDEX idx_pre_holders_stripe_session ON pre_holders(stripe_session_id);
CREATE INDEX idx_pre_holders_status ON pre_holders(status);
CREATE INDEX idx_pre_holders_referral_code ON pre_holders(referral_code);

ALTER TABLE pre_holders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert pre_holders"
  ON pre_holders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can manage all pre_holders"
  ON pre_holders FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

GRANT SELECT, INSERT ON pre_holders TO anon;
GRANT ALL ON pre_holders TO authenticated;
GRANT ALL ON pre_holders TO service_role;
