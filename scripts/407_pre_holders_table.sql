-- =====================================================
-- PRE-HOLDERS TABLE
-- Stores pre-holder registrations before official launch
-- =====================================================

-- Create pre_holders table
CREATE TABLE IF NOT EXISTS pre_holders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User info
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  country TEXT DEFAULT 'MX',
  
  -- Tier selection
  tier TEXT NOT NULL CHECK (tier IN ('essential', 'premium', 'elite')),
  price_usd NUMERIC(10,2) NOT NULL,
  
  -- Payment info
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  paid_at TIMESTAMP WITH TIME ZONE,
  
  -- Referral
  referral_code TEXT,
  referred_by UUID REFERENCES pre_holders(id),
  
  -- Priority and status
  priority_number INTEGER,
  status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'paid', 'converted', 'cancelled')),
  
  -- Converted to actual holder
  converted_at TIMESTAMP WITH TIME ZONE,
  user_id UUID REFERENCES auth.users(id),
  certificate_id UUID,
  
  -- Metadata
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_pre_holders_email ON pre_holders(email);
CREATE INDEX IF NOT EXISTS idx_pre_holders_stripe_session ON pre_holders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_pre_holders_status ON pre_holders(status);
CREATE INDEX IF NOT EXISTS idx_pre_holders_referral_code ON pre_holders(referral_code);
CREATE INDEX IF NOT EXISTS idx_pre_holders_priority ON pre_holders(priority_number);

-- Auto-generate priority number
CREATE OR REPLACE FUNCTION generate_pre_holder_priority()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.priority_number IS NULL THEN
    SELECT COALESCE(MAX(priority_number), 0) + 1 INTO NEW.priority_number FROM pre_holders;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_pre_holder_priority
  BEFORE INSERT ON pre_holders
  FOR EACH ROW
  EXECUTE FUNCTION generate_pre_holder_priority();

-- Auto-update updated_at
CREATE TRIGGER set_pre_holders_updated_at
  BEFORE UPDATE ON pre_holders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

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

-- Insert sample tiers info (for reference in app)
COMMENT ON TABLE pre_holders IS 'Pre-holder registrations for early access program. Tiers: essential ($1,499), premium ($2,999), elite ($4,999)';
