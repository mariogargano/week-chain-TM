-- WEEK-CHAIN: VAFI System & Certificate Visual State Tables
-- This script creates the complete VAFI (DeFi lending) system and certificate visual state tables

-- =====================================================
-- 1. WRAPPED CERTIFICATES (wSVC) - Collateralized certificates
-- =====================================================
CREATE TABLE IF NOT EXISTS wrapped_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Original certificate reference
  certificate_id UUID NOT NULL REFERENCES week_tokens(id) ON DELETE RESTRICT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Wrapped token info
  wrapped_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unwrapped_at TIMESTAMPTZ,
  
  -- Collateral status
  is_collateralized BOOLEAN DEFAULT FALSE,
  collateral_loan_id UUID,
  
  -- Valuation
  wrap_value_usd NUMERIC(12,2) NOT NULL,
  current_value_usd NUMERIC(12,2),
  last_valuation_at TIMESTAMPTZ,
  
  -- Status: wrapped, unwrapped, liquidated
  status VARCHAR(20) NOT NULL DEFAULT 'wrapped',
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT valid_wrapped_status CHECK (status IN ('wrapped', 'unwrapped', 'liquidated', 'pending'))
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_wrapped_certificates_user ON wrapped_certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_wrapped_certificates_certificate ON wrapped_certificates(certificate_id);
CREATE INDEX IF NOT EXISTS idx_wrapped_certificates_status ON wrapped_certificates(status);

-- =====================================================
-- 2. VAFI LIQUIDITY POOL - Pool for lending
-- =====================================================
CREATE TABLE IF NOT EXISTS vafi_liquidity_pool (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Pool configuration
  pool_name VARCHAR(100) NOT NULL DEFAULT 'WEEK-VAFI-MAIN',
  pool_address VARCHAR(100),
  
  -- Liquidity metrics
  total_liquidity_usd NUMERIC(14,2) NOT NULL DEFAULT 0,
  available_liquidity_usd NUMERIC(14,2) NOT NULL DEFAULT 0,
  utilized_liquidity_usd NUMERIC(14,2) NOT NULL DEFAULT 0,
  utilization_rate NUMERIC(5,4) DEFAULT 0, -- 0.0000 to 1.0000
  
  -- Interest rates (annual percentage)
  base_apr NUMERIC(5,4) NOT NULL DEFAULT 0.05, -- 5% base
  current_apr NUMERIC(5,4) NOT NULL DEFAULT 0.05,
  supply_apy NUMERIC(5,4) DEFAULT 0.03, -- 3% for liquidity providers
  
  -- Risk parameters
  max_ltv NUMERIC(5,4) NOT NULL DEFAULT 0.50, -- 50% max loan-to-value
  liquidation_threshold NUMERIC(5,4) NOT NULL DEFAULT 0.75, -- 75%
  liquidation_bonus NUMERIC(5,4) NOT NULL DEFAULT 0.05, -- 5% bonus for liquidators
  
  -- Pool stats
  total_loans_issued INTEGER DEFAULT 0,
  total_loans_repaid INTEGER DEFAULT 0,
  total_liquidations INTEGER DEFAULT 0,
  total_interest_earned_usd NUMERIC(14,2) DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  paused_at TIMESTAMPTZ,
  pause_reason TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default pool
INSERT INTO vafi_liquidity_pool (pool_name, total_liquidity_usd, available_liquidity_usd)
VALUES ('WEEK-VAFI-MAIN', 1000000, 1000000)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 3. VAFI LIQUIDITY PROVIDERS - Users providing liquidity
-- =====================================================
CREATE TABLE IF NOT EXISTS vafi_liquidity_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pool_id UUID NOT NULL REFERENCES vafi_liquidity_pool(id) ON DELETE CASCADE,
  
  -- Deposit info
  deposited_usd NUMERIC(14,2) NOT NULL DEFAULT 0,
  shares NUMERIC(18,8) NOT NULL DEFAULT 0, -- Pool shares
  
  -- Earnings
  total_interest_earned_usd NUMERIC(14,2) DEFAULT 0,
  last_interest_claim_at TIMESTAMPTZ,
  pending_interest_usd NUMERIC(14,2) DEFAULT 0,
  
  -- Deposit history
  first_deposit_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_deposit_at TIMESTAMPTZ,
  last_withdrawal_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id, pool_id)
);

CREATE INDEX IF NOT EXISTS idx_vafi_lp_user ON vafi_liquidity_providers(user_id);

-- =====================================================
-- 4. VAFI POSITIONS - Active loan positions (extends vafi_loans)
-- =====================================================
CREATE TABLE IF NOT EXISTS vafi_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL REFERENCES vafi_loans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pool_id UUID NOT NULL REFERENCES vafi_liquidity_pool(id),
  
  -- Position details
  wrapped_certificate_id UUID REFERENCES wrapped_certificates(id),
  
  -- Loan metrics
  principal_usd NUMERIC(14,2) NOT NULL,
  interest_accrued_usd NUMERIC(14,2) DEFAULT 0,
  total_debt_usd NUMERIC(14,2) NOT NULL,
  
  -- Collateral metrics
  collateral_value_usd NUMERIC(14,2) NOT NULL,
  ltv_ratio NUMERIC(5,4) NOT NULL,
  health_factor NUMERIC(5,2) NOT NULL DEFAULT 1.50,
  
  -- Interest
  interest_rate NUMERIC(5,4) NOT NULL,
  interest_start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_interest_update TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Status: active, repaid, liquidated, defaulted
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  
  CONSTRAINT valid_position_status CHECK (status IN ('active', 'repaid', 'liquidated', 'defaulted'))
);

CREATE INDEX IF NOT EXISTS idx_vafi_positions_user ON vafi_positions(user_id);
CREATE INDEX IF NOT EXISTS idx_vafi_positions_status ON vafi_positions(status);
CREATE INDEX IF NOT EXISTS idx_vafi_positions_health ON vafi_positions(health_factor);

-- =====================================================
-- 5. CERTIFICATE VISUAL STATE - Dynamic certificate display
-- =====================================================
CREATE TABLE IF NOT EXISTS certificate_visual_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id UUID NOT NULL REFERENCES week_tokens(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Display mode: standard, vacation, wrapped, collateralized
  display_mode VARCHAR(30) NOT NULL DEFAULT 'standard',
  
  -- Current destination (when in vacation mode)
  current_destination_id UUID REFERENCES properties(id),
  destination_name VARCHAR(200),
  destination_photo_url TEXT,
  destination_check_in DATE,
  destination_check_out DATE,
  
  -- Active services
  active_services JSONB DEFAULT '[]', -- Array of service objects
  
  -- VAFI state
  is_wrapped BOOLEAN DEFAULT FALSE,
  wrapped_certificate_id UUID REFERENCES wrapped_certificates(id),
  is_collateralized BOOLEAN DEFAULT FALSE,
  vafi_loan_id UUID REFERENCES vafi_loans(id),
  vafi_health_factor NUMERIC(5,2),
  
  -- Visual customization
  theme VARCHAR(30) DEFAULT 'default', -- default, gold, platinum, diamond
  custom_background_url TEXT,
  show_qr_code BOOLEAN DEFAULT TRUE,
  show_blockchain_hash BOOLEAN DEFAULT TRUE,
  
  -- Usage history
  total_vacations_taken INTEGER DEFAULT 0,
  last_vacation_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(certificate_id)
);

CREATE INDEX IF NOT EXISTS idx_certificate_visual_user ON certificate_visual_state(user_id);
CREATE INDEX IF NOT EXISTS idx_certificate_visual_mode ON certificate_visual_state(display_mode);

-- =====================================================
-- 6. RESERVATION OFFERS - For REQUEST-OFFER-CONFIRM flow
-- =====================================================
CREATE TABLE IF NOT EXISTS reservation_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Request reference
  reservation_request_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  certificate_id UUID NOT NULL REFERENCES week_tokens(id),
  
  -- Offer details
  property_id UUID NOT NULL REFERENCES properties(id),
  property_name VARCHAR(200) NOT NULL,
  property_location VARCHAR(200),
  property_image_url TEXT,
  
  -- Dates offered
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  nights INTEGER NOT NULL,
  
  -- Capacity
  max_guests INTEGER NOT NULL,
  
  -- Amenities included
  amenities JSONB DEFAULT '[]',
  
  -- Pricing (if any additional fees)
  additional_fees_usd NUMERIC(10,2) DEFAULT 0,
  fee_description TEXT,
  
  -- Status: pending, accepted, rejected, expired
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  
  -- Validity
  offer_expires_at TIMESTAMPTZ NOT NULL,
  
  -- Response
  responded_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- Who made the offer
  offered_by UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT valid_offer_status CHECK (status IN ('pending', 'accepted', 'rejected', 'expired', 'cancelled'))
);

CREATE INDEX IF NOT EXISTS idx_reservation_offers_user ON reservation_offers(user_id);
CREATE INDEX IF NOT EXISTS idx_reservation_offers_status ON reservation_offers(status);
CREATE INDEX IF NOT EXISTS idx_reservation_offers_request ON reservation_offers(reservation_request_id);

-- =====================================================
-- 7. RESERVATION REQUESTS - User requests for vacations
-- =====================================================
CREATE TABLE IF NOT EXISTS reservation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  certificate_id UUID NOT NULL REFERENCES week_tokens(id),
  
  -- Request details
  preferred_destinations JSONB DEFAULT '[]', -- Array of location preferences
  preferred_dates_start DATE,
  preferred_dates_end DATE,
  flexible_dates BOOLEAN DEFAULT TRUE,
  flexibility_days INTEGER DEFAULT 7,
  
  -- Party details
  num_guests INTEGER NOT NULL DEFAULT 2,
  guest_details JSONB DEFAULT '{}',
  
  -- Special requests
  special_requests TEXT,
  accessibility_needs JSONB DEFAULT '{}',
  
  -- Status: pending, offers_sent, confirmed, cancelled, expired
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  
  -- Offers tracking
  num_offers_received INTEGER DEFAULT 0,
  num_offers_pending INTEGER DEFAULT 0,
  
  -- Confirmation
  confirmed_offer_id UUID REFERENCES reservation_offers(id),
  confirmed_at TIMESTAMPTZ,
  
  -- Admin notes
  admin_notes TEXT,
  assigned_to UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  
  CONSTRAINT valid_request_status CHECK (status IN ('pending', 'reviewing', 'offers_sent', 'confirmed', 'cancelled', 'expired'))
);

CREATE INDEX IF NOT EXISTS idx_reservation_requests_user ON reservation_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_reservation_requests_status ON reservation_requests(status);
CREATE INDEX IF NOT EXISTS idx_reservation_requests_dates ON reservation_requests(preferred_dates_start, preferred_dates_end);

-- =====================================================
-- 8. TRIGGERS FOR AUTO-UPDATE
-- =====================================================

-- Update health factor trigger
CREATE OR REPLACE FUNCTION update_vafi_health_factor()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate health factor: (collateral_value * liquidation_threshold) / total_debt
  IF NEW.total_debt_usd > 0 THEN
    NEW.health_factor := (NEW.collateral_value_usd * 0.75) / NEW.total_debt_usd;
  ELSE
    NEW.health_factor := 99.99;
  END IF;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_health_factor ON vafi_positions;
CREATE TRIGGER trigger_update_health_factor
  BEFORE INSERT OR UPDATE ON vafi_positions
  FOR EACH ROW
  EXECUTE FUNCTION update_vafi_health_factor();

-- Update certificate visual state when VAFI changes
CREATE OR REPLACE FUNCTION sync_certificate_vafi_state()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE certificate_visual_state
  SET 
    is_collateralized = (NEW.status = 'active'),
    vafi_loan_id = NEW.loan_id,
    vafi_health_factor = NEW.health_factor,
    display_mode = CASE 
      WHEN NEW.status = 'active' THEN 'collateralized'
      ELSE 'standard'
    END,
    updated_at = NOW()
  WHERE certificate_id = (
    SELECT certificate_id FROM wrapped_certificates 
    WHERE id = NEW.wrapped_certificate_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_vafi_state ON vafi_positions;
CREATE TRIGGER trigger_sync_vafi_state
  AFTER INSERT OR UPDATE ON vafi_positions
  FOR EACH ROW
  EXECUTE FUNCTION sync_certificate_vafi_state();

-- Update pool utilization
CREATE OR REPLACE FUNCTION update_pool_utilization()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE vafi_liquidity_pool
  SET 
    utilized_liquidity_usd = (
      SELECT COALESCE(SUM(principal_usd), 0) 
      FROM vafi_positions 
      WHERE pool_id = NEW.pool_id AND status = 'active'
    ),
    available_liquidity_usd = total_liquidity_usd - utilized_liquidity_usd,
    utilization_rate = CASE 
      WHEN total_liquidity_usd > 0 
      THEN utilized_liquidity_usd / total_liquidity_usd 
      ELSE 0 
    END,
    updated_at = NOW()
  WHERE id = NEW.pool_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_pool_utilization ON vafi_positions;
CREATE TRIGGER trigger_update_pool_utilization
  AFTER INSERT OR UPDATE OR DELETE ON vafi_positions
  FOR EACH ROW
  EXECUTE FUNCTION update_pool_utilization();

-- =====================================================
-- 9. RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE wrapped_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE vafi_liquidity_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vafi_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificate_visual_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservation_offers ENABLE ROW LEVEL SECURITY;

-- Wrapped certificates policies
CREATE POLICY "Users can view own wrapped certificates" ON wrapped_certificates
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wrapped certificates" ON wrapped_certificates
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own wrapped certificates" ON wrapped_certificates
  FOR UPDATE USING (auth.uid() = user_id);

-- VAFI positions policies
CREATE POLICY "Users can view own VAFI positions" ON vafi_positions
  FOR SELECT USING (auth.uid() = user_id);

-- Certificate visual state policies
CREATE POLICY "Users can view own certificate visual state" ON certificate_visual_state
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own certificate visual state" ON certificate_visual_state
  FOR UPDATE USING (auth.uid() = user_id);

-- Reservation requests policies
CREATE POLICY "Users can view own reservation requests" ON reservation_requests
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own reservation requests" ON reservation_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reservation requests" ON reservation_requests
  FOR UPDATE USING (auth.uid() = user_id);

-- Reservation offers policies  
CREATE POLICY "Users can view offers for their requests" ON reservation_offers
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can respond to offers" ON reservation_offers
  FOR UPDATE USING (auth.uid() = user_id);

-- Admin policies (using admin_users table)
CREATE POLICY "Admins can manage all wrapped certificates" ON wrapped_certificates
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE email = auth.jwt()->>'email')
  );

CREATE POLICY "Admins can manage all VAFI positions" ON vafi_positions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE email = auth.jwt()->>'email')
  );

CREATE POLICY "Admins can manage all reservation requests" ON reservation_requests
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE email = auth.jwt()->>'email')
  );

CREATE POLICY "Admins can manage all reservation offers" ON reservation_offers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE email = auth.jwt()->>'email')
  );

-- =====================================================
-- 10. HELPER FUNCTIONS
-- =====================================================

-- Calculate certificate value for VAFI collateral
CREATE OR REPLACE FUNCTION calculate_certificate_value(cert_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  base_value NUMERIC;
  season_multiplier NUMERIC;
  years_remaining INTEGER;
BEGIN
  SELECT 
    wt.price_usd,
    COALESCE(s.multiplier, 1.0),
    GREATEST(0, 15 - EXTRACT(YEAR FROM AGE(NOW(), wt.created_at)))
  INTO base_value, season_multiplier, years_remaining
  FROM week_tokens wt
  LEFT JOIN seasons s ON wt.season = s.name
  WHERE wt.id = cert_id;
  
  -- Value = base_price * season_multiplier * (years_remaining / 15)
  RETURN COALESCE(base_value * season_multiplier * (years_remaining::NUMERIC / 15), 0);
END;
$$ LANGUAGE plpgsql;

-- Get available offers for a request
CREATE OR REPLACE FUNCTION get_available_offers(request_id UUID)
RETURNS TABLE (
  offer_id UUID,
  property_name VARCHAR,
  location VARCHAR,
  check_in DATE,
  check_out DATE,
  max_guests INTEGER,
  expires_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ro.id,
    ro.property_name,
    ro.property_location,
    ro.check_in_date,
    ro.check_out_date,
    ro.max_guests,
    ro.offer_expires_at
  FROM reservation_offers ro
  WHERE ro.reservation_request_id = request_id
    AND ro.status = 'pending'
    AND ro.offer_expires_at > NOW()
  ORDER BY ro.check_in_date;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMPLETE
-- =====================================================
