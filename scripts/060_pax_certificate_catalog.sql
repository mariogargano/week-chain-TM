-- =====================================================
-- WEEK-CHAIN PAX-BASED CERTIFICATE CATALOG
-- Migration: 060_pax_certificate_catalog.sql
-- =====================================================

-- Drop existing table if exists and recreate with new schema
DROP TABLE IF EXISTS certificate_products_v2 CASCADE;

-- Create new PAX-based certificate products table
CREATE TABLE certificate_products_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  max_pax INTEGER NOT NULL CHECK (max_pax IN (2, 4, 6, 8)),
  max_estancias_per_year INTEGER NOT NULL CHECK (max_estancias_per_year IN (1, 2, 3, 4)),
  price_usd INTEGER NOT NULL,
  display_name TEXT GENERATED ALWAYS AS (
    'Hasta ' || max_pax || ' personas • ' || max_estancias_per_year || ' estancia' || 
    CASE WHEN max_estancias_per_year > 1 THEN 's' ELSE '' END || '/año'
  ) STORED,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  sales_enabled BOOLEAN DEFAULT true,
  beta_cap INTEGER NOT NULL DEFAULT 5,
  sold_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Ensure unique product combinations
  UNIQUE(max_pax, max_estancias_per_year)
);

-- Enable RLS
ALTER TABLE certificate_products_v2 ENABLE ROW LEVEL SECURITY;

-- Public can read active products
CREATE POLICY "Anyone can view active products" ON certificate_products_v2
FOR SELECT USING (is_active = true);

-- Only admins can modify
CREATE POLICY "Only admins can modify products" ON certificate_products_v2
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.status = 'active'
  )
);

-- Insert all 16 PAX-based products with locked pricing
INSERT INTO certificate_products_v2 (max_pax, max_estancias_per_year, price_usd, beta_cap, description) VALUES
-- 2 PAX products
(2, 1, 3500, 5, 'Certificado Digital para parejas - 1 estancia anual'),
(2, 2, 6000, 5, 'Certificado Digital para parejas - 2 estancias anuales'),
(2, 3, 8000, 5, 'Certificado Digital para parejas - 3 estancias anuales'),
(2, 4, 10000, 5, 'Certificado Digital para parejas - 4 estancias anuales'),
-- 4 PAX products
(4, 1, 5000, 7, 'Certificado Digital para familia pequeña - 1 estancia anual'),
(4, 2, 9000, 7, 'Certificado Digital para familia pequeña - 2 estancias anuales'),
(4, 3, 12000, 6, 'Certificado Digital para familia pequeña - 3 estancias anuales'),
(4, 4, 15000, 6, 'Certificado Digital para familia pequeña - 4 estancias anuales'),
-- 6 PAX products
(6, 1, 7500, 4, 'Certificado Digital para familia mediana - 1 estancia anual'),
(6, 2, 13000, 4, 'Certificado Digital para familia mediana - 2 estancias anuales'),
(6, 3, 18000, 4, 'Certificado Digital para familia mediana - 3 estancias anuales'),
(6, 4, 20000, 3, 'Certificado Digital para familia mediana - 4 estancias anuales'),
-- 8 PAX products
(8, 1, 10000, 2, 'Certificado Digital para grupo grande - 1 estancia anual'),
(8, 2, 15000, 2, 'Certificado Digital para grupo grande - 2 estancias anuales'),
(8, 3, 20000, 2, 'Certificado Digital para grupo grande - 3 estancias anuales'),
(8, 4, 25000, 1, 'Certificado Digital para grupo grande - 4 estancias anuales')
ON CONFLICT (max_pax, max_estancias_per_year) DO UPDATE SET
  price_usd = EXCLUDED.price_usd,
  beta_cap = EXCLUDED.beta_cap,
  description = EXCLUDED.description;

-- Create or replace beta_config table
DROP TABLE IF EXISTS beta_config CASCADE;
CREATE TABLE beta_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  total_cap INTEGER NOT NULL DEFAULT 68,
  cap_2pax INTEGER NOT NULL DEFAULT 20,
  cap_4pax INTEGER NOT NULL DEFAULT 26,
  cap_6pax INTEGER NOT NULL DEFAULT 15,
  cap_8pax INTEGER NOT NULL DEFAULT 7,
  active_destinations INTEGER NOT NULL DEFAULT 3,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE beta_config ENABLE ROW LEVEL SECURITY;

-- Only admins can access beta config
CREATE POLICY "Only admins can access beta config" ON beta_config
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.status = 'active'
  )
);

-- Insert default beta config
INSERT INTO beta_config (total_cap, cap_2pax, cap_4pax, cap_6pax, cap_8pax, active_destinations)
VALUES (68, 20, 26, 15, 7, 3)
ON CONFLICT DO NOTHING;

-- Create user_certificates_v2 table with PAX-based structure
DROP TABLE IF EXISTS user_certificates_v2 CASCADE;
CREATE TABLE user_certificates_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES certificate_products_v2(id),
  max_pax INTEGER NOT NULL,
  max_estancias_per_year INTEGER NOT NULL,
  purchase_price_usd INTEGER NOT NULL,
  
  -- Certificate validity (15 years)
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '15 years'),
  
  -- Annual entitlement tracking
  annual_entitlement_estancias INTEGER NOT NULL,
  annual_used_estancias INTEGER DEFAULT 0,
  annual_reset_at DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '1 year'),
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'expired', 'cancelled')),
  
  -- Metadata
  order_id TEXT,
  stripe_session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_certificates_v2 ENABLE ROW LEVEL SECURITY;

-- Users can view their own certificates
CREATE POLICY "Users can view own certificates" ON user_certificates_v2
FOR SELECT USING (auth.uid() = user_id);

-- Admins can view all certificates
CREATE POLICY "Admins can view all certificates" ON user_certificates_v2
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.status = 'active'
  )
);

-- Only system/admin can insert/update certificates
CREATE POLICY "Only system can modify certificates" ON user_certificates_v2
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.status = 'active'
  )
);

-- Create certificate_waitlist_v2 for product-scoped waitlist
DROP TABLE IF EXISTS certificate_waitlist_v2 CASCADE;
CREATE TABLE certificate_waitlist_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES certificate_products_v2(id),
  max_pax INTEGER NOT NULL,
  max_estancias_per_year INTEGER NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'notified', 'purchased', 'expired')),
  notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Prevent duplicate waitlist entries
  UNIQUE(email, product_id)
);

-- Enable RLS
ALTER TABLE certificate_waitlist_v2 ENABLE ROW LEVEL SECURITY;

-- Users can view their own waitlist entries
CREATE POLICY "Users can view own waitlist" ON certificate_waitlist_v2
FOR SELECT USING (auth.uid() = user_id);

-- Admins can view all waitlist
CREATE POLICY "Admins can view all waitlist" ON certificate_waitlist_v2
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.status = 'active'
  )
);

-- Function to increment sold_count when certificate purchased
CREATE OR REPLACE FUNCTION increment_product_sold_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE certificate_products_v2
  SET sold_count = sold_count + 1,
      updated_at = now()
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for certificate creation
DROP TRIGGER IF EXISTS on_certificate_created ON user_certificates_v2;
CREATE TRIGGER on_certificate_created
AFTER INSERT ON user_certificates_v2
FOR EACH ROW
EXECUTE FUNCTION increment_product_sold_count();

-- Function to decrement sold_count when certificate cancelled
CREATE OR REPLACE FUNCTION decrement_product_sold_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    UPDATE certificate_products_v2
    SET sold_count = GREATEST(sold_count - 1, 0),
        updated_at = now()
    WHERE id = NEW.product_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for certificate cancellation
DROP TRIGGER IF EXISTS on_certificate_cancelled ON user_certificates_v2;
CREATE TRIGGER on_certificate_cancelled
AFTER UPDATE ON user_certificates_v2
FOR EACH ROW
EXECUTE FUNCTION decrement_product_sold_count();

-- Function to auto-disable sales when beta cap reached
CREATE OR REPLACE FUNCTION check_product_beta_cap()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.sold_count >= NEW.beta_cap AND NEW.sales_enabled = true THEN
    NEW.sales_enabled := false;
    
    -- Log the auto-disable
    INSERT INTO admin_audit_log (action, entity_type, entity_id, metadata)
    VALUES (
      'AUTO_STOP_SALE',
      'certificate_product',
      NEW.id::text,
      jsonb_build_object(
        'reason', 'beta_cap_reached',
        'sold_count', NEW.sold_count,
        'beta_cap', NEW.beta_cap
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto-disable
DROP TRIGGER IF EXISTS check_beta_cap ON certificate_products_v2;
CREATE TRIGGER check_beta_cap
BEFORE UPDATE ON certificate_products_v2
FOR EACH ROW
EXECUTE FUNCTION check_product_beta_cap();

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_user_certificates_v2_user ON user_certificates_v2(user_id);
CREATE INDEX IF NOT EXISTS idx_user_certificates_v2_product ON user_certificates_v2(product_id);
CREATE INDEX IF NOT EXISTS idx_user_certificates_v2_status ON user_certificates_v2(status);
CREATE INDEX IF NOT EXISTS idx_certificate_products_v2_pax ON certificate_products_v2(max_pax);
CREATE INDEX IF NOT EXISTS idx_certificate_waitlist_v2_product ON certificate_waitlist_v2(product_id);

-- Grant necessary permissions
GRANT SELECT ON certificate_products_v2 TO anon, authenticated;
GRANT SELECT ON user_certificates_v2 TO authenticated;
GRANT SELECT ON certificate_waitlist_v2 TO authenticated;
