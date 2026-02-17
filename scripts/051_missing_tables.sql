-- =====================================================
-- WEEK-CHAIN: Missing Tables for Full Platform Functionality
-- =====================================================

-- Property Submissions (for property owners to submit their properties)
CREATE TABLE IF NOT EXISTS property_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id),
  owner_wallet TEXT,
  
  -- Property Details
  name VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  postal_code VARCHAR(20),
  
  -- Property Specs
  property_type VARCHAR(50), -- 'apartment', 'villa', 'house', 'condo'
  bedrooms INTEGER,
  bathrooms INTEGER,
  max_guests INTEGER,
  square_meters NUMERIC,
  
  -- Pricing
  estimated_value_usd NUMERIC,
  desired_week_price NUMERIC,
  
  -- Media
  images JSONB DEFAULT '[]',
  documents JSONB DEFAULT '[]',
  
  -- Status workflow
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'submitted', 'admin_review', 'notary_review', 'approved', 'rejected', 'published'
  
  -- Review notes
  admin_notes TEXT,
  notary_notes TEXT,
  rejection_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ
);

-- Contract Signatures (for legal document signing)
CREATE TABLE IF NOT EXISTS contract_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Contract info
  contract_type VARCHAR(50) NOT NULL, -- 'purchase', 'rental', 'terms', 'privacy', 'broker_agreement'
  contract_version VARCHAR(20) DEFAULT '1.0',
  
  -- Parties
  signer_id UUID REFERENCES auth.users(id),
  signer_wallet TEXT,
  signer_email TEXT,
  signer_name TEXT,
  
  -- Related entities
  property_id UUID REFERENCES properties(id),
  week_id UUID REFERENCES weeks(id),
  reservation_id UUID REFERENCES reservations(id),
  
  -- Signature data
  signature_hash TEXT,
  ip_address TEXT,
  user_agent TEXT,
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'pending_notary', 'signed', 'notarized', 'rejected'
  
  -- Notary review
  notary_id UUID,
  notary_notes TEXT,
  notarized_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  signed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Property Owner Sales (track sales for property owners)
CREATE TABLE IF NOT EXISTS property_owner_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id),
  owner_wallet TEXT,
  
  -- Sale info
  property_id UUID REFERENCES properties(id),
  week_id UUID REFERENCES weeks(id),
  reservation_id UUID REFERENCES reservations(id),
  
  -- Financial
  sale_amount_usdc NUMERIC NOT NULL,
  commission_rate NUMERIC DEFAULT 0.10, -- 10% platform fee
  commission_amount NUMERIC,
  net_amount NUMERIC,
  
  -- Payment status
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'paid', 'failed'
  payment_method VARCHAR(50),
  transaction_hash TEXT,
  
  -- Timestamps
  sale_date TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Owner Notifications
CREATE TABLE IF NOT EXISTS owner_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id),
  
  -- Notification content
  title VARCHAR(255) NOT NULL,
  message TEXT,
  type VARCHAR(50), -- 'sale', 'review', 'payment', 'system', 'promotion'
  
  -- Related entities
  property_id UUID REFERENCES properties(id),
  submission_id UUID REFERENCES property_submissions(id),
  
  -- Status
  read BOOLEAN DEFAULT FALSE,
  
  -- Action
  action_url TEXT,
  action_label VARCHAR(100),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

-- Property Owner Profiles (extended profile for property owners)
CREATE TABLE IF NOT EXISTS property_owner_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  
  -- Business info
  company_name VARCHAR(255),
  tax_id VARCHAR(100),
  business_type VARCHAR(50),
  
  -- Contact
  business_email VARCHAR(255),
  business_phone VARCHAR(50),
  business_address TEXT,
  
  -- Banking
  bank_name VARCHAR(255),
  bank_account VARCHAR(100),
  bank_routing VARCHAR(50),
  preferred_currency VARCHAR(10) DEFAULT 'USD',
  
  -- Preferences
  notification_preferences JSONB DEFAULT '{"email": true, "sms": false, "push": true}',
  
  -- Verification
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  
  -- Stats
  total_properties INTEGER DEFAULT 0,
  total_sales NUMERIC DEFAULT 0,
  total_earnings NUMERIC DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Purchase Vouchers (for tracking purchases and redemptions)
CREATE TABLE IF NOT EXISTS purchase_vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Buyer info
  buyer_id UUID REFERENCES auth.users(id),
  buyer_wallet TEXT,
  buyer_email TEXT,
  
  -- Voucher details
  voucher_code VARCHAR(50) UNIQUE,
  voucher_type VARCHAR(50) DEFAULT 'week_purchase', -- 'week_purchase', 'service', 'gift'
  
  -- Related entities
  property_id UUID REFERENCES properties(id),
  week_id UUID REFERENCES weeks(id),
  reservation_id UUID REFERENCES reservations(id),
  
  -- Financial
  amount_paid NUMERIC,
  currency VARCHAR(10) DEFAULT 'USDC',
  payment_method VARCHAR(50),
  transaction_hash TEXT,
  
  -- Status
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'redeemed', 'expired', 'cancelled'
  
  -- Redemption
  redeemed_at TIMESTAMPTZ,
  redeemed_by UUID,
  
  -- Validity
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add user_id column to reservations if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reservations' AND column_name = 'user_id') THEN
    ALTER TABLE reservations ADD COLUMN user_id UUID REFERENCES auth.users(id);
  END IF;
END $$;

-- Enable RLS on new tables
ALTER TABLE property_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_owner_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE owner_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_owner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_vouchers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for property_submissions
CREATE POLICY "Owners can view own submissions" ON property_submissions
  FOR SELECT USING (owner_id = auth.uid() OR owner_wallet = current_setting('request.jwt.claims', true)::json->>'wallet_address');

CREATE POLICY "Owners can create submissions" ON property_submissions
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update own submissions" ON property_submissions
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Admins can manage all submissions" ON property_submissions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_wallets WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address')
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Notaries can view submissions for review" ON property_submissions
  FOR SELECT USING (
    status = 'notary_review' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'notaria')
  );

-- RLS Policies for contract_signatures
CREATE POLICY "Users can view own signatures" ON contract_signatures
  FOR SELECT USING (signer_id = auth.uid());

CREATE POLICY "Users can create signatures" ON contract_signatures
  FOR INSERT WITH CHECK (signer_id = auth.uid());

CREATE POLICY "Notaries can manage signatures" ON contract_signatures
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'notaria')
  );

-- RLS Policies for property_owner_sales
CREATE POLICY "Owners can view own sales" ON property_owner_sales
  FOR SELECT USING (owner_id = auth.uid());

-- RLS Policies for owner_notifications
CREATE POLICY "Owners can view own notifications" ON owner_notifications
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Owners can update own notifications" ON owner_notifications
  FOR UPDATE USING (owner_id = auth.uid());

-- RLS Policies for property_owner_profiles
CREATE POLICY "Owners can manage own profile" ON property_owner_profiles
  FOR ALL USING (user_id = auth.uid());

-- RLS Policies for purchase_vouchers
CREATE POLICY "Users can view own vouchers" ON purchase_vouchers
  FOR SELECT USING (buyer_id = auth.uid());

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_property_submissions_owner ON property_submissions(owner_id);
CREATE INDEX IF NOT EXISTS idx_property_submissions_status ON property_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contract_signatures_signer ON contract_signatures(signer_id);
CREATE INDEX IF NOT EXISTS idx_property_owner_sales_owner ON property_owner_sales(owner_id);
CREATE INDEX IF NOT EXISTS idx_owner_notifications_owner ON owner_notifications(owner_id);
CREATE INDEX IF NOT EXISTS idx_purchase_vouchers_buyer ON purchase_vouchers(buyer_id);
CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON reservations(user_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_property_submissions_updated_at BEFORE UPDATE ON property_submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contract_signatures_updated_at BEFORE UPDATE ON contract_signatures
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_owner_profiles_updated_at BEFORE UPDATE ON property_owner_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_vouchers_updated_at BEFORE UPDATE ON purchase_vouchers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
