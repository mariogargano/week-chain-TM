-- Migration 037: Create missing tables referenced by lib code
-- Tables: commission_records, commission_rates, intermediary_profiles,
--         referral_attributions, compliance_strikes, certificate_waitlist,
--         capacity_engine_status, certificate_products_v2

-- 1. commission_rates — lookup table for commission percentages per tier
CREATE TABLE IF NOT EXISTS commission_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_tier text NOT NULL UNIQUE,
  default_rate numeric NOT NULL DEFAULT 0.05,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Seed default rates
INSERT INTO commission_rates (certificate_tier, default_rate, description) VALUES
  ('silver',    0.05, 'Comision estandar 5%'),
  ('gold',      0.06, 'Comision gold 6%'),
  ('platinum',  0.07, 'Comision platinum 7%'),
  ('signature', 0.08, 'Comision signature 8%'),
  ('wedding',   0.08, 'Comision wedding 8%'),
  ('PAX2_EST1', 0.05, '2 PAX 1 estancia'),
  ('PAX4_EST1', 0.06, '4 PAX 1 estancia'),
  ('PAX6_EST2', 0.07, '6 PAX 2 estancias'),
  ('PAX8_EST3', 0.08, '8 PAX 3 estancias')
ON CONFLICT (certificate_tier) DO NOTHING;

-- 2. intermediary_profiles — agent/broker profile for commission system
CREATE TABLE IF NOT EXISTS intermediary_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code text UNIQUE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','banned','pending')),
  display_name text,
  email text,
  phone text,
  total_sales numeric DEFAULT 0,
  total_commissions numeric DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_intermediary_profiles_user_id ON intermediary_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_intermediary_profiles_referral_code ON intermediary_profiles(referral_code);

ALTER TABLE intermediary_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "intermediary_select_own" ON intermediary_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "intermediary_update_own" ON intermediary_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "intermediary_admin_all" ON intermediary_profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role IN ('admin','super_admin'))
  );

-- 3. commission_records — individual commission for each sale
CREATE TABLE IF NOT EXISTS commission_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  intermediary_id uuid NOT NULL REFERENCES intermediary_profiles(id) ON DELETE CASCADE,
  buyer_user_id uuid REFERENCES auth.users(id),
  order_id text,
  certificate_tier text,
  sale_amount numeric NOT NULL DEFAULT 0,
  commission_rate numeric NOT NULL DEFAULT 0,
  commission_amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','paid','reversed')),
  hold_until timestamptz,
  approved_at timestamptz,
  paid_at timestamptz,
  reversed_at timestamptz,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_commission_records_intermediary ON commission_records(intermediary_id);
CREATE INDEX IF NOT EXISTS idx_commission_records_order ON commission_records(order_id);
CREATE INDEX IF NOT EXISTS idx_commission_records_status ON commission_records(status);

ALTER TABLE commission_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "commission_records_select_own" ON commission_records
  FOR SELECT USING (
    intermediary_id IN (SELECT id FROM intermediary_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "commission_records_admin_all" ON commission_records
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role IN ('admin','super_admin'))
  );

CREATE POLICY "commission_records_insert_service" ON commission_records
  FOR INSERT WITH CHECK (true);

-- 4. referral_attributions — tracks which intermediary referred which lead
CREATE TABLE IF NOT EXISTS referral_attributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code text NOT NULL,
  intermediary_id uuid NOT NULL REFERENCES intermediary_profiles(id) ON DELETE CASCADE,
  lead_email text,
  lead_user_id uuid REFERENCES auth.users(id),
  expires_at timestamptz NOT NULL,
  converted_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_referral_attributions_lead ON referral_attributions(lead_user_id);
CREATE INDEX IF NOT EXISTS idx_referral_attributions_email ON referral_attributions(lead_email);

ALTER TABLE referral_attributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "referral_attributions_select_own" ON referral_attributions
  FOR SELECT USING (
    intermediary_id IN (SELECT id FROM intermediary_profiles WHERE user_id = auth.uid())
    OR lead_user_id = auth.uid()
  );

CREATE POLICY "referral_attributions_insert_service" ON referral_attributions
  FOR INSERT WITH CHECK (true);

-- 5. compliance_strikes — tracks compliance violations
CREATE TABLE IF NOT EXISTS compliance_strikes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  intermediary_id uuid NOT NULL REFERENCES intermediary_profiles(id) ON DELETE CASCADE,
  reason text NOT NULL,
  evidence_url text,
  action_taken text NOT NULL CHECK (action_taken IN ('warning','suspend','ban')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE compliance_strikes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "compliance_strikes_admin_all" ON compliance_strikes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role IN ('admin','super_admin'))
  );

-- 6. certificate_waitlist — tracks users waiting when capacity is full
CREATE TABLE IF NOT EXISTS certificate_waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  email text NOT NULL,
  product_id text,
  tier text,
  priority integer DEFAULT 0,
  status text DEFAULT 'waiting' CHECK (status IN ('waiting','notified','converted','expired')),
  notified_at timestamptz,
  converted_at timestamptz,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_certificate_waitlist_status ON certificate_waitlist(status);

ALTER TABLE certificate_waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "certificate_waitlist_insert_anon" ON certificate_waitlist
  FOR INSERT WITH CHECK (true);

CREATE POLICY "certificate_waitlist_select_own" ON certificate_waitlist
  FOR SELECT USING (user_id = auth.uid());

-- 7. capacity_engine_status — singleton row tracking global supply/demand
CREATE TABLE IF NOT EXISTS capacity_engine_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  total_supply_weeks integer DEFAULT 0,
  total_sold_weeks integer DEFAULT 0,
  safe_capacity_pct numeric DEFAULT 70,
  utilization_pct numeric DEFAULT 0,
  stop_sale_active boolean DEFAULT false,
  stop_sale_reason text,
  last_calculated_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert default singleton row
INSERT INTO capacity_engine_status (total_supply_weeks, total_sold_weeks) VALUES (3536, 0)
ON CONFLICT DO NOTHING;

ALTER TABLE capacity_engine_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "capacity_engine_select_all" ON capacity_engine_status
  FOR SELECT USING (true);

CREATE POLICY "capacity_engine_admin_update" ON capacity_engine_status
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role IN ('admin','super_admin'))
  );

-- 8. certificate_products_v2 — product catalog for PAX-based certificates
CREATE TABLE IF NOT EXISTS certificate_products_v2 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id text NOT NULL UNIQUE,
  name text NOT NULL,
  max_pax integer NOT NULL DEFAULT 2,
  estancias_per_year integer NOT NULL DEFAULT 1,
  validity_years integer NOT NULL DEFAULT 15,
  price_usd numeric NOT NULL,
  stripe_price_id text,
  conekta_price_id text,
  tier text,
  description text,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Seed default products matching the PAX system
INSERT INTO certificate_products_v2 (product_id, name, max_pax, estancias_per_year, price_usd, tier) VALUES
  ('PAX2_EST1', 'Certificado 2 PAX - 1 Estancia', 2, 1, 5000, 'silver'),
  ('PAX4_EST1', 'Certificado 4 PAX - 1 Estancia', 4, 1, 7500, 'gold'),
  ('PAX6_EST2', 'Certificado 6 PAX - 2 Estancias', 6, 2, 12000, 'platinum'),
  ('PAX8_EST3', 'Certificado 8 PAX - 3 Estancias', 8, 3, 18000, 'signature')
ON CONFLICT (product_id) DO NOTHING;

ALTER TABLE certificate_products_v2 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "certificate_products_v2_select_all" ON certificate_products_v2
  FOR SELECT USING (true);

CREATE POLICY "certificate_products_v2_admin_manage" ON certificate_products_v2
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role IN ('admin','super_admin'))
  );
