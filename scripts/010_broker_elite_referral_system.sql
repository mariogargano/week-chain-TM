-- Broker Elite Referral System with Multi-level Structure
-- This script creates the infrastructure for a 2-3 level referral system

-- Add referral tracking to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS referral_code VARCHAR(20) UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS is_broker_elite BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS elite_weeks_claimed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS elite_weeks_available INTEGER DEFAULT 0;

-- Create referral tree table for multi-level tracking
CREATE TABLE IF NOT EXISTS referral_tree (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broker_id UUID NOT NULL REFERENCES profiles(id),
  referred_user_id UUID NOT NULL REFERENCES profiles(id),
  level INTEGER NOT NULL CHECK (level >= 1 AND level <= 3),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(broker_id, referred_user_id)
);

-- Create broker commissions table
CREATE TABLE IF NOT EXISTS broker_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broker_id UUID NOT NULL REFERENCES profiles(id),
  reservation_id UUID REFERENCES reservations(id),
  sale_amount_usdc NUMERIC(20, 6) NOT NULL,
  commission_rate NUMERIC(5, 4) NOT NULL, -- 0.05 for 5%
  commission_amount_usdc NUMERIC(20, 6) NOT NULL,
  referral_level INTEGER CHECK (referral_level >= 1 AND referral_level <= 3),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  paid_at TIMESTAMPTZ,
  transaction_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);

-- Create broker elite benefits table
CREATE TABLE IF NOT EXISTS broker_elite_benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broker_id UUID NOT NULL REFERENCES profiles(id),
  benefit_type TEXT NOT NULL CHECK (benefit_type IN ('low_season_week', 'commission_bonus', 'exclusive_access')),
  week_id UUID REFERENCES weeks(id),
  property_id UUID REFERENCES properties(id),
  claimed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'claimed', 'expired', 'used')),
  ownership_percentage NUMERIC(5, 2) DEFAULT 50.00, -- 50% ownership with company
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    code := 'WC' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
    SELECT EXISTS(SELECT 1 FROM profiles WHERE referral_code = code) INTO exists;
    EXIT WHEN NOT exists;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate referral code for brokers
CREATE OR REPLACE FUNCTION auto_generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role IN ('broker', 'admin') AND NEW.referral_code IS NULL THEN
    NEW.referral_code := generate_referral_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_referral_code
BEFORE INSERT OR UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION auto_generate_referral_code();

-- Function to track referral tree (up to 3 levels)
CREATE OR REPLACE FUNCTION track_referral_tree(
  p_referred_user_id UUID,
  p_direct_referrer_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_level INTEGER := 1;
  v_current_referrer UUID := p_direct_referrer_id;
BEGIN
  -- Track up to 3 levels
  WHILE v_current_referrer IS NOT NULL AND v_level <= 3 LOOP
    INSERT INTO referral_tree (broker_id, referred_user_id, level)
    VALUES (v_current_referrer, p_referred_user_id, v_level)
    ON CONFLICT (broker_id, referred_user_id) DO NOTHING;
    
    -- Get next level referrer
    SELECT referred_by INTO v_current_referrer
    FROM profiles
    WHERE id = v_current_referrer;
    
    v_level := v_level + 1;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate commission based on level
CREATE OR REPLACE FUNCTION calculate_commission_rate(p_level INTEGER)
RETURNS NUMERIC AS $$
BEGIN
  CASE p_level
    WHEN 1 THEN RETURN 0.05;    -- 5% for direct referrals
    WHEN 2 THEN RETURN 0.02;    -- 2% for second level
    WHEN 3 THEN RETURN 0.01;    -- 1% for third level
    ELSE RETURN 0;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Function to distribute commissions across referral tree
CREATE OR REPLACE FUNCTION distribute_referral_commissions(
  p_reservation_id UUID,
  p_sale_amount NUMERIC
)
RETURNS VOID AS $$
DECLARE
  v_user_wallet TEXT;
  v_referral RECORD;
  v_commission_rate NUMERIC;
  v_commission_amount NUMERIC;
BEGIN
  -- Get user wallet from reservation
  SELECT user_wallet INTO v_user_wallet
  FROM reservations
  WHERE id = p_reservation_id;
  
  -- Find all brokers in the referral tree for this user
  FOR v_referral IN
    SELECT rt.broker_id, rt.level, p.referral_code
    FROM referral_tree rt
    JOIN profiles p ON p.id = rt.broker_id
    JOIN profiles referred ON referred.id = rt.referred_user_id
    WHERE referred.wallet_address = v_user_wallet
    ORDER BY rt.level
  LOOP
    v_commission_rate := calculate_commission_rate(v_referral.level);
    v_commission_amount := p_sale_amount * v_commission_rate;
    
    INSERT INTO broker_commissions (
      broker_id,
      reservation_id,
      sale_amount_usdc,
      commission_rate,
      commission_amount_usdc,
      referral_level,
      status
    ) VALUES (
      v_referral.broker_id,
      p_reservation_id,
      p_sale_amount,
      v_commission_rate,
      v_commission_amount,
      v_referral.level,
      'pending'
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Grant Broker Elite status and benefits
CREATE OR REPLACE FUNCTION grant_broker_elite_status(p_broker_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET 
    is_broker_elite = TRUE,
    elite_weeks_available = 2  -- 2 low season weeks
  WHERE id = p_broker_id;
  
  -- Create benefit records for the 2 weeks
  INSERT INTO broker_elite_benefits (broker_id, benefit_type, ownership_percentage)
  VALUES 
    (p_broker_id, 'low_season_week', 50.00),
    (p_broker_id, 'low_season_week', 50.00);
END;
$$ LANGUAGE plpgsql;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_referral_tree_broker ON referral_tree(broker_id);
CREATE INDEX IF NOT EXISTS idx_referral_tree_referred ON referral_tree(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_broker_commissions_broker ON broker_commissions(broker_id);
CREATE INDEX IF NOT EXISTS idx_broker_commissions_status ON broker_commissions(status);
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON profiles(referred_by);

-- Comments
COMMENT ON TABLE referral_tree IS 'Tracks multi-level referral relationships (up to 3 levels)';
COMMENT ON TABLE broker_commissions IS 'Tracks broker commissions: 5% level 1, 2% level 2, 1% level 3';
COMMENT ON TABLE broker_elite_benefits IS 'Broker Elite benefits including 2 low season weeks at 50% ownership';
COMMENT ON COLUMN broker_elite_benefits.ownership_percentage IS 'Broker owns 50% with company owning 50%';
