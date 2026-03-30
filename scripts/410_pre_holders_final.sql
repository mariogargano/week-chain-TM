-- Pre-holders deposit table (create if not exists, with correct schema)

CREATE TABLE IF NOT EXISTS pre_holders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  country TEXT DEFAULT 'MX',
  
  -- Deposit: fixed $100 USD
  deposit_amount_usd NUMERIC(10,2) DEFAULT 100.00,
  
  -- Payment tracking
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  payment_status TEXT DEFAULT 'pending',
  paid_at TIMESTAMP WITH TIME ZONE,
  
  -- Refund tracking
  refund_requested_at TIMESTAMP WITH TIME ZONE,
  refunded_at TIMESTAMP WITH TIME ZONE,
  refund_reason TEXT,
  
  -- Early access window (14 days)
  early_access_starts_at TIMESTAMP WITH TIME ZONE,
  early_access_ends_at TIMESTAMP WITH TIME ZONE,
  discount_percent NUMERIC(5,2) DEFAULT 5.00,
  
  -- When deposit is used
  deposit_applied BOOLEAN DEFAULT FALSE,
  applied_to_certificate_id UUID,
  applied_at TIMESTAMP WITH TIME ZONE,
  
  -- Referral
  referral_code TEXT UNIQUE,
  referred_by_code TEXT,
  
  -- Priority in queue
  priority_number BIGINT,
  
  -- Status tracking
  status TEXT DEFAULT 'pending',
  
  -- Metadata
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_pre_holders_email ON pre_holders(email);
CREATE INDEX IF NOT EXISTS idx_pre_holders_stripe_session ON pre_holders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_pre_holders_status ON pre_holders(status);
CREATE INDEX IF NOT EXISTS idx_pre_holders_payment ON pre_holders(payment_status);

-- Enable RLS
ALTER TABLE pre_holders ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies
CREATE POLICY IF NOT EXISTS pre_holders_admin_policy ON pre_holders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY IF NOT EXISTS pre_holders_insert_policy ON pre_holders
  FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS pre_holders_own_view ON pre_holders
  FOR SELECT USING (email = (SELECT email FROM auth.users WHERE id = auth.uid() LIMIT 1));

GRANT SELECT, INSERT ON pre_holders TO anon, authenticated;
GRANT ALL ON pre_holders TO service_role;

COMMENT ON TABLE pre_holders IS 'Pre-holder deposits: $100 USD refundable. Benefits: 5% discount + deposit credit. Formula: Total = (P * 0.95) - 100 where P is certificate price';
