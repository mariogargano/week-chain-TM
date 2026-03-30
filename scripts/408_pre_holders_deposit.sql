-- =====================================================
-- PRE-HOLDERS DEPOSIT SYSTEM
-- $100 USD refundable deposit for early access
-- 5% discount + deposit credit on certificate purchase
-- =====================================================

-- Drop old table if exists and recreate with correct schema
DROP TABLE IF EXISTS pre_holders CASCADE;

-- Create pre_holders table
CREATE TABLE pre_holders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User info
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  country TEXT DEFAULT 'MX',
  
  -- Deposit info (fixed $100 USD)
  deposit_amount_usd NUMERIC(10,2) DEFAULT 100.00,
  
  -- Payment info
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'refunded')),
  paid_at TIMESTAMP WITH TIME ZONE,
  
  -- Refund info
  refund_requested_at TIMESTAMP WITH TIME ZONE,
  refunded_at TIMESTAMP WITH TIME ZONE,
  refund_reason TEXT,
  
  -- Early access window
  early_access_starts_at TIMESTAMP WITH TIME ZONE,
  early_access_ends_at TIMESTAMP WITH TIME ZONE,
  discount_percent NUMERIC(5,2) DEFAULT 5.00,
  
  -- Conversion to certificate purchase
  deposit_applied BOOLEAN DEFAULT FALSE,
  applied_to_certificate_id UUID,
  applied_at TIMESTAMP WITH TIME ZONE,
  
  -- Referral
  referral_code TEXT UNIQUE,
  referred_by_code TEXT,
  
  -- Priority (position in queue)
  priority_number SERIAL,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'applied', 'refunded', 'expired')),
  
  -- Metadata
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_pre_holders_email ON pre_holders(email);
CREATE INDEX idx_pre_holders_stripe_session ON pre_holders(stripe_session_id);
CREATE INDEX idx_pre_holders_status ON pre_holders(status);
CREATE INDEX idx_pre_holders_referral_code ON pre_holders(referral_code);
CREATE INDEX idx_pre_holders_priority ON pre_holders(priority_number);
CREATE INDEX idx_pre_holders_payment_status ON pre_holders(payment_status);

-- Generate unique referral code for each pre-holder
CREATE OR REPLACE FUNCTION generate_pre_holder_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := 'PH-' || UPPER(SUBSTRING(MD5(NEW.email || NOW()::TEXT) FROM 1 FOR 8));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_pre_holder_referral_code
  BEFORE INSERT ON pre_holders
  FOR EACH ROW
  EXECUTE FUNCTION generate_pre_holder_referral_code();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_pre_holders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_pre_holders_updated_at
  BEFORE UPDATE ON pre_holders
  FOR EACH ROW
  EXECUTE FUNCTION update_pre_holders_updated_at();

-- Enable RLS
ALTER TABLE pre_holders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage all pre_holders"
  ON pre_holders FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Anyone can insert pre_holders"
  ON pre_holders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view own pre_holder record"
  ON pre_holders FOR SELECT
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Grant permissions
GRANT SELECT, INSERT ON pre_holders TO anon;
GRANT ALL ON pre_holders TO authenticated;
GRANT ALL ON pre_holders TO service_role;

-- Add comment
COMMENT ON TABLE pre_holders IS 'Pre-holder deposits: $100 USD refundable. Benefits: 5% discount + deposit credit. Formula: Total = (P * 0.95) - 100';
