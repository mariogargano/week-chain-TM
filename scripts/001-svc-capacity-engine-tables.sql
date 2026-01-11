-- WEEK-CHAIN SVC + CAPACITY ENGINE - DATABASE MIGRATION
-- This migration creates the new data model for Smart Vacational Certificates

-- ============================================
-- 1. CERTIFICATE PRODUCTS (Tier definitions)
-- ============================================
CREATE TABLE IF NOT EXISTS certificate_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier TEXT NOT NULL UNIQUE CHECK (tier IN ('Silver', 'Gold', 'Platinum', 'Signature')),
  display_name TEXT NOT NULL,
  included_weeks_per_year INTEGER NOT NULL,
  request_window_days INTEGER NOT NULL,
  expected_usage_rate NUMERIC(3,2) NOT NULL, -- 0.55, 0.70, 0.80, 0.85
  price_usd NUMERIC(10,2) NOT NULL,
  description TEXT,
  features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert the 4 certificate tiers
INSERT INTO certificate_products (tier, display_name, included_weeks_per_year, request_window_days, expected_usage_rate, price_usd, description, features, sort_order)
VALUES 
  ('Silver', 'WEEK Silver™', 1, 90, 0.55, 3500.00, '1 semana-equivalente por año, ventana de solicitud 90 días', '["1 semana-equivalente/año", "Ventana 90 días", "Acceso a destinos participantes", "Soporte estándar"]', 1),
  ('Gold', 'WEEK Gold™', 1, 180, 0.70, 6000.00, '1 semana-equivalente por año, ventana de solicitud 180 días', '["1 semana-equivalente/año", "Ventana 180 días", "Prioridad en temporada media", "Soporte prioritario"]', 2),
  ('Platinum', 'WEEK Platinum™', 2, 365, 0.80, 11500.00, '2 semanas-equivalente por año, ventana de solicitud 365 días', '["2 semanas-equivalente/año", "Ventana 365 días", "Prioridad en alta temporada", "Concierge dedicado"]', 3),
  ('Signature', 'WEEK Signature™', 4, 365, 0.85, 21000.00, '4 semanas-equivalente por año, ventana de solicitud 365 días', '["4 semanas-equivalente/año", "Ventana 365 días", "Máxima prioridad", "Concierge VIP 24/7"]', 4)
ON CONFLICT (tier) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  included_weeks_per_year = EXCLUDED.included_weeks_per_year,
  request_window_days = EXCLUDED.request_window_days,
  expected_usage_rate = EXCLUDED.expected_usage_rate,
  price_usd = EXCLUDED.price_usd,
  description = EXCLUDED.description,
  features = EXCLUDED.features,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

-- ============================================
-- 2. USER CERTIFICATES (Purchased certificates)
-- ============================================
CREATE TABLE IF NOT EXISTS user_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL REFERENCES certificate_products(tier),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE NOT NULL, -- start_date + 15 years
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'expired', 'cancelled')),
  remaining_weeks_this_year INTEGER NOT NULL,
  reservations_used_this_year INTEGER NOT NULL DEFAULT 0,
  year_start_date DATE NOT NULL, -- For annual reset tracking
  payment_id UUID REFERENCES payments(id),
  purchase_price_usd NUMERIC(10,2),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for user lookups
CREATE INDEX IF NOT EXISTS idx_user_certificates_user_id ON user_certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_user_certificates_status ON user_certificates(status);

-- ============================================
-- 3. SUPPLY PROPERTIES (Properties in the supply pool)
-- ============================================
CREATE TABLE IF NOT EXISTS supply_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id), -- Link to existing properties table
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  city TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('A', 'B', 'C')), -- Quality tier
  max_occupancy INTEGER NOT NULL DEFAULT 6,
  bedrooms INTEGER DEFAULT 2,
  bathrooms INTEGER DEFAULT 2,
  weekly_cost_to_owner NUMERIC(10,2), -- Internal cost (not shown to users)
  supply_weeks_per_year INTEGER NOT NULL DEFAULT 48,
  blackout_weeks INTEGER NOT NULL DEFAULT 4,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'offline', 'maintenance', 'removed')),
  amenities JSONB DEFAULT '[]',
  images JSONB DEFAULT '[]',
  description TEXT,
  location_lat NUMERIC(10,7),
  location_lng NUMERIC(10,7),
  joined_pool_at TIMESTAMPTZ DEFAULT NOW(),
  removed_from_pool_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_supply_properties_status ON supply_properties(status);
CREATE INDEX IF NOT EXISTS idx_supply_properties_category ON supply_properties(category);

-- ============================================
-- 4. RESERVATION REQUESTS (User requests)
-- ============================================
CREATE TABLE IF NOT EXISTS reservation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  certificate_id UUID NOT NULL REFERENCES user_certificates(id),
  desired_start_date DATE NOT NULL,
  desired_end_date DATE NOT NULL,
  flexibility_days INTEGER DEFAULT 0, -- How many days flexible
  party_size INTEGER NOT NULL DEFAULT 2,
  destination_preference TEXT, -- Optional: city/country preference
  category_preference TEXT CHECK (category_preference IN ('A', 'B', 'C', 'any')),
  special_requests TEXT,
  status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'processing', 'offered', 'confirmed', 'completed', 'cancelled', 'expired')),
  offered_property_id UUID REFERENCES supply_properties(id),
  offered_dates_start DATE,
  offered_dates_end DATE,
  offer_expires_at TIMESTAMPTZ,
  confirmed_property_id UUID REFERENCES supply_properties(id),
  confirmed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  admin_notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reservation_requests_user_id ON reservation_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_reservation_requests_status ON reservation_requests(status);
CREATE INDEX IF NOT EXISTS idx_reservation_requests_dates ON reservation_requests(desired_start_date, desired_end_date);

-- ============================================
-- 5. CONFIRMED RESERVATIONS (Finalized bookings)
-- ============================================
CREATE TABLE IF NOT EXISTS confirmed_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  certificate_id UUID NOT NULL REFERENCES user_certificates(id),
  request_id UUID REFERENCES reservation_requests(id),
  property_id UUID NOT NULL REFERENCES supply_properties(id),
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  party_size INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'checked_in', 'completed', 'cancelled', 'no_show', 'relocated')),
  check_in_instructions TEXT,
  access_code TEXT,
  property_contact TEXT,
  emergency_contact TEXT,
  relocated_from_id UUID REFERENCES confirmed_reservations(id), -- If re-accommodated
  relocated_to_id UUID REFERENCES confirmed_reservations(id),
  relocation_reason TEXT,
  special_notes TEXT,
  metadata JSONB DEFAULT '{}',
  confirmed_at TIMESTAMPTZ DEFAULT NOW(),
  checked_in_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_confirmed_reservations_user_id ON confirmed_reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_confirmed_reservations_property_id ON confirmed_reservations(property_id);
CREATE INDEX IF NOT EXISTS idx_confirmed_reservations_dates ON confirmed_reservations(check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_confirmed_reservations_status ON confirmed_reservations(status);

-- ============================================
-- 6. CAPACITY ENGINE STATUS (System-wide metrics)
-- ============================================
CREATE TABLE IF NOT EXISTS capacity_engine_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Supply metrics
  total_properties INTEGER NOT NULL DEFAULT 0,
  active_properties INTEGER NOT NULL DEFAULT 0,
  total_supply_weeks INTEGER NOT NULL DEFAULT 0, -- Sum of all supply_weeks_per_year
  safe_capacity INTEGER NOT NULL DEFAULT 0, -- total_supply_weeks * 0.70
  
  -- Demand metrics  
  total_certificates_silver INTEGER NOT NULL DEFAULT 0,
  total_certificates_gold INTEGER NOT NULL DEFAULT 0,
  total_certificates_platinum INTEGER NOT NULL DEFAULT 0,
  total_certificates_signature INTEGER NOT NULL DEFAULT 0,
  projected_demand NUMERIC(10,2) NOT NULL DEFAULT 0, -- SUM(certificates * weeks * usage_rate)
  
  -- Capacity ratios
  capacity_utilization_pct NUMERIC(5,2) NOT NULL DEFAULT 0, -- projected_demand / safe_capacity * 100
  system_status TEXT NOT NULL DEFAULT 'GREEN' CHECK (system_status IN ('GREEN', 'YELLOW', 'ORANGE', 'RED')),
  
  -- Stop-sale status
  silver_sales_enabled BOOLEAN NOT NULL DEFAULT true,
  gold_sales_enabled BOOLEAN NOT NULL DEFAULT true,
  platinum_sales_enabled BOOLEAN NOT NULL DEFAULT true,
  signature_sales_enabled BOOLEAN NOT NULL DEFAULT true,
  
  -- Waitlist
  waitlist_enabled BOOLEAN NOT NULL DEFAULT false,
  waitlist_count INTEGER NOT NULL DEFAULT 0,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Keep only the last 100 status records for history
CREATE INDEX IF NOT EXISTS idx_capacity_engine_status_calculated_at ON capacity_engine_status(calculated_at DESC);

-- ============================================
-- 7. WAITLIST (When stop-sale is active)
-- ============================================
CREATE TABLE IF NOT EXISTS certificate_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  preferred_tier TEXT NOT NULL CHECK (preferred_tier IN ('Silver', 'Gold', 'Platinum', 'Signature', 'any')),
  notified_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  converted_certificate_id UUID REFERENCES user_certificates(id),
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'notified', 'converted', 'expired', 'cancelled')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_certificate_waitlist_status ON certificate_waitlist(status);
CREATE INDEX IF NOT EXISTS idx_certificate_waitlist_email ON certificate_waitlist(email);

-- ============================================
-- 8. Enable RLS on new tables
-- ============================================
ALTER TABLE certificate_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE supply_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE confirmed_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE capacity_engine_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificate_waitlist ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view certificate products" ON certificate_products FOR SELECT USING (true);
CREATE POLICY "Users can view own certificates" ON user_certificates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view active supply properties" ON supply_properties FOR SELECT USING (status = 'active');
CREATE POLICY "Users can view own reservation requests" ON reservation_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own reservation requests" ON reservation_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own confirmed reservations" ON confirmed_reservations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view latest capacity status" ON capacity_engine_status FOR SELECT USING (true);
CREATE POLICY "Anyone can join waitlist" ON certificate_waitlist FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own waitlist entry" ON certificate_waitlist FOR SELECT USING (auth.uid() = user_id OR email = auth.email());
