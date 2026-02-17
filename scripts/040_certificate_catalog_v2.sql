-- WEEK-CHAIN Certificate Catalog V2 (Pax-Based Model)
-- This migration creates the new pax-based certificate structure
-- per the locked specification

-- Certificate Products V2 Table (Pax-based catalog)
CREATE TABLE IF NOT EXISTS certificate_products_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  max_pax INTEGER NOT NULL CHECK (max_pax IN (2, 4, 6, 8)),
  max_estancias_per_year INTEGER NOT NULL CHECK (max_estancias_per_year BETWEEN 1 AND 4),
  price_usd NUMERIC(10,2) NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  beta_cap INTEGER NOT NULL, -- Maximum certificates allowed in beta
  sold_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(max_pax, max_estancias_per_year)
);

-- Insert the locked certificate catalog
INSERT INTO certificate_products_v2 (max_pax, max_estancias_per_year, price_usd, display_name, description, beta_cap) VALUES
-- 2 PAX (Total: 20 certificates)
(2, 1, 3500.00, 'Certificado 2 PAX - 1 Estancia', 'Hasta 2 personas, 1 estancia de máximo 7 noches por año', 5),
(2, 2, 6000.00, 'Certificado 2 PAX - 2 Estancias', 'Hasta 2 personas, 2 estancias de máximo 7 noches por año', 5),
(2, 3, 8000.00, 'Certificado 2 PAX - 3 Estancias', 'Hasta 2 personas, 3 estancias de máximo 7 noches por año', 5),
(2, 4, 10000.00, 'Certificado 2 PAX - 4 Estancias', 'Hasta 2 personas, 4 estancias de máximo 7 noches por año', 5),
-- 4 PAX (Total: 26 certificates)
(4, 1, 5000.00, 'Certificado 4 PAX - 1 Estancia', 'Hasta 4 personas, 1 estancia de máximo 7 noches por año', 7),
(4, 2, 9000.00, 'Certificado 4 PAX - 2 Estancias', 'Hasta 4 personas, 2 estancias de máximo 7 noches por año', 7),
(4, 3, 12000.00, 'Certificado 4 PAX - 3 Estancias', 'Hasta 4 personas, 3 estancias de máximo 7 noches por año', 6),
(4, 4, 15000.00, 'Certificado 4 PAX - 4 Estancias', 'Hasta 4 personas, 4 estancias de máximo 7 noches por año', 6),
-- 6 PAX (Total: 15 certificates)
(6, 1, 7500.00, 'Certificado 6 PAX - 1 Estancia', 'Hasta 6 personas, 1 estancia de máximo 7 noches por año', 4),
(6, 2, 13000.00, 'Certificado 6 PAX - 2 Estancias', 'Hasta 6 personas, 2 estancias de máximo 7 noches por año', 4),
(6, 3, 18000.00, 'Certificado 6 PAX - 3 Estancias', 'Hasta 6 personas, 3 estancias de máximo 7 noches por año', 4),
(6, 4, 20000.00, 'Certificado 6 PAX - 4 Estancias', 'Hasta 6 personas, 4 estancias de máximo 7 noches por año', 3),
-- 8 PAX (Total: 7 certificates)
(8, 1, 10000.00, 'Certificado 8 PAX - 1 Estancia', 'Hasta 8 personas, 1 estancia de máximo 7 noches por año', 2),
(8, 2, 15000.00, 'Certificado 8 PAX - 2 Estancias', 'Hasta 8 personas, 2 estancias de máximo 7 noches por año', 2),
(8, 3, 20000.00, 'Certificado 8 PAX - 3 Estancias', 'Hasta 8 personas, 3 estancias de máximo 7 noches por año', 2),
(8, 4, 25000.00, 'Certificado 8 PAX - 4 Estancias', 'Hasta 8 personas, 4 estancias de máximo 7 noches por año', 1)
ON CONFLICT (max_pax, max_estancias_per_year) DO UPDATE SET
  price_usd = EXCLUDED.price_usd,
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  beta_cap = EXCLUDED.beta_cap,
  updated_at = now();

-- User Certificates V2 Table (Pax-based)
CREATE TABLE IF NOT EXISTS user_certificates_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES certificate_products_v2(id),
  max_pax INTEGER NOT NULL,
  max_estancias_per_year INTEGER NOT NULL,
  remaining_estancias_this_year INTEGER NOT NULL,
  year_start_date DATE NOT NULL,
  year_end_date DATE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'expired', 'cancelled')),
  purchase_price_usd NUMERIC(10,2) NOT NULL,
  stripe_payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Beta configuration table
CREATE TABLE IF NOT EXISTS beta_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID
);

-- Insert beta configuration
INSERT INTO beta_config (key, value, description) VALUES
('total_certificates_allowed', '68', 'Maximum total certificates allowed in beta phase'),
('distribution_by_pax', '{"2": 20, "4": 26, "6": 15, "8": 7}', 'Distribution of certificates by pax capacity'),
('active_destinations_count', '3', 'Number of active destinations (2-3 active, rest dormant)'),
('stop_sale_threshold', '65', 'Percentage utilization that triggers stop-sale'),
('matching_time_target_hours', '72', 'Target hours for reservation matching')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = now();

-- Create function to check beta cap
CREATE OR REPLACE FUNCTION check_beta_cap(p_max_pax INTEGER, p_max_estancias INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  v_beta_cap INTEGER;
  v_sold_count INTEGER;
BEGIN
  SELECT beta_cap, sold_count INTO v_beta_cap, v_sold_count
  FROM certificate_products_v2
  WHERE max_pax = p_max_pax AND max_estancias_per_year = p_max_estancias;
  
  IF v_sold_count >= v_beta_cap THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create function to check total beta limit
CREATE OR REPLACE FUNCTION check_total_beta_limit()
RETURNS BOOLEAN AS $$
DECLARE
  v_total_sold INTEGER;
  v_max_allowed INTEGER;
BEGIN
  SELECT SUM(sold_count) INTO v_total_sold FROM certificate_products_v2;
  SELECT (value::INTEGER) INTO v_max_allowed FROM beta_config WHERE key = 'total_certificates_allowed';
  
  IF v_total_sold >= v_max_allowed THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Trigger to increment sold_count on certificate purchase
CREATE OR REPLACE FUNCTION increment_certificate_sold_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE certificate_products_v2
  SET sold_count = sold_count + 1, updated_at = now()
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_increment_sold_count ON user_certificates_v2;
CREATE TRIGGER trigger_increment_sold_count
AFTER INSERT ON user_certificates_v2
FOR EACH ROW
EXECUTE FUNCTION increment_certificate_sold_count();

-- Trigger to decrement sold_count on certificate cancellation
CREATE OR REPLACE FUNCTION decrement_certificate_sold_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    UPDATE certificate_products_v2
    SET sold_count = GREATEST(0, sold_count - 1), updated_at = now()
    WHERE id = NEW.product_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_decrement_sold_count ON user_certificates_v2;
CREATE TRIGGER trigger_decrement_sold_count
AFTER UPDATE ON user_certificates_v2
FOR EACH ROW
EXECUTE FUNCTION decrement_certificate_sold_count();

-- RLS Policies
ALTER TABLE certificate_products_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_certificates_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_config ENABLE ROW LEVEL SECURITY;

-- Anyone can view certificate products
CREATE POLICY "Anyone can view certificate products"
ON certificate_products_v2 FOR SELECT
USING (true);

-- Only admins can modify certificate products
CREATE POLICY "Only admins can modify certificate products"
ON certificate_products_v2 FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.status = 'active'
  )
);

-- Users can view their own certificates
CREATE POLICY "Users can view own certificates v2"
ON user_certificates_v2 FOR SELECT
USING (user_id = auth.uid());

-- System can create certificates (via service role)
CREATE POLICY "System can create certificates v2"
ON user_certificates_v2 FOR INSERT
WITH CHECK (true);

-- Only admins can view beta config
CREATE POLICY "Only admins can view beta config"
ON beta_config FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.status = 'active'
  )
);

-- Only admins can modify beta config
CREATE POLICY "Only admins can modify beta config"
ON beta_config FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.status = 'active'
  )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_cert_products_v2_pax ON certificate_products_v2(max_pax);
CREATE INDEX IF NOT EXISTS idx_cert_products_v2_active ON certificate_products_v2(is_active);
CREATE INDEX IF NOT EXISTS idx_user_certs_v2_user ON user_certificates_v2(user_id);
CREATE INDEX IF NOT EXISTS idx_user_certs_v2_status ON user_certificates_v2(status);
CREATE INDEX IF NOT EXISTS idx_user_certs_v2_product ON user_certificates_v2(product_id);

-- Audit log entry
INSERT INTO admin_audit_log (action, entity_type, metadata)
VALUES ('SCHEMA_MIGRATION', 'certificate_catalog_v2', jsonb_build_object(
  'migration', '040_certificate_catalog_v2',
  'description', 'Created pax-based certificate catalog with beta caps',
  'total_products', 16,
  'total_beta_cap', 68
));
