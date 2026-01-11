-- Tabla de Escrow Contable SAPI
-- Los pagos se mantienen aquí hasta que se emita el certificado digital

CREATE TABLE IF NOT EXISTS escrow_contable (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id TEXT,
  stripe_payment_intent TEXT,
  property_id TEXT NOT NULL,
  property_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  season TEXT NOT NULL CHECK (season IN ('high', 'medium', 'low')),
  quantity INTEGER NOT NULL DEFAULT 1,
  amount_mxn DECIMAL(12, 2) NOT NULL,
  amount_usd DECIMAL(12, 2),
  status TEXT NOT NULL DEFAULT 'held' CHECK (status IN ('held', 'released', 'refunded')),
  escrow_type TEXT NOT NULL DEFAULT 'contable_sapi',
  released_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  refund_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_escrow_contable_property ON escrow_contable(property_id);
CREATE INDEX IF NOT EXISTS idx_escrow_contable_status ON escrow_contable(status);
CREATE INDEX IF NOT EXISTS idx_escrow_contable_customer ON escrow_contable(customer_email);

-- Agregar columnas a purchase_vouchers si no existen
ALTER TABLE purchase_vouchers 
ADD COLUMN IF NOT EXISTS escrow_id UUID REFERENCES escrow_contable(id),
ADD COLUMN IF NOT EXISTS amount_mxn DECIMAL(12, 2),
ADD COLUMN IF NOT EXISTS certificate_status TEXT DEFAULT 'pending' CHECK (certificate_status IN ('pending', 'issued', 'revoked')),
ADD COLUMN IF NOT EXISTS certificate_issued_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS refund_eligible BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS user_name TEXT,
ADD COLUMN IF NOT EXISTS user_phone TEXT,
ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;

-- Función para incrementar semanas vendidas
CREATE OR REPLACE FUNCTION increment_weeks_sold(p_property_id TEXT, p_quantity INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE properties 
  SET weeks_sold = COALESCE(weeks_sold, 0) + p_quantity,
      updated_at = NOW()
  WHERE id = p_property_id;
END;
$$ LANGUAGE plpgsql;

-- Agregar columna weeks_sold a properties si no existe
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS weeks_sold INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_weeks INTEGER DEFAULT 48;

-- RLS policies
ALTER TABLE escrow_contable ENABLE ROW LEVEL SECURITY;

-- Los usuarios pueden ver sus propios registros de escrow
CREATE POLICY "Users can view own escrow records" ON escrow_contable
  FOR SELECT
  USING (customer_email = auth.jwt() ->> 'email');

-- Solo admins pueden modificar
CREATE POLICY "Admins can manage escrow" ON escrow_contable
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
