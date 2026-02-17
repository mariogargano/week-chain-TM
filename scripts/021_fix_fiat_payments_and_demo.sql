-- Asegurar que la tabla fiat_payments existe con el schema correcto
CREATE TABLE IF NOT EXISTS fiat_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_wallet TEXT NOT NULL,
  user_email TEXT NOT NULL,
  
  -- Información de Stripe
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_checkout_session_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  stripe_charge_id TEXT,
  
  -- Detalles del pago
  amount NUMERIC(20, 6) NOT NULL,
  currency TEXT NOT NULL, -- MXN, USD
  payment_method TEXT NOT NULL, -- card, oxxo, spei
  payment_method_details JSONB,
  
  -- Conversión a USDC
  usdc_equivalent NUMERIC(20, 6) NOT NULL,
  exchange_rate NUMERIC(10, 6),
  
  -- Estado
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, succeeded, failed, refunded, requires_action
  
  -- Referencias
  property_id UUID REFERENCES properties(id),
  week_id UUID REFERENCES weeks(id),
  voucher_id UUID REFERENCES purchase_vouchers(id),
  
  -- Pagos parciales (para Oxxo con límite de 10k MXN)
  is_partial_payment BOOLEAN DEFAULT false,
  parent_payment_id UUID REFERENCES fiat_payments(id),
  total_amount_required NUMERIC(20, 6),
  amount_paid_so_far NUMERIC(20, 6) DEFAULT 0,
  remaining_amount NUMERIC(20, 6),
  
  -- URLs de pago
  payment_url TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  succeeded_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  refunded_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_fiat_payments_stripe_payment_intent ON fiat_payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_fiat_payments_stripe_checkout_session ON fiat_payments(stripe_checkout_session_id);
CREATE INDEX IF NOT EXISTS idx_fiat_payments_user_wallet ON fiat_payments(user_wallet);
CREATE INDEX IF NOT EXISTS idx_fiat_payments_status ON fiat_payments(status);
CREATE INDEX IF NOT EXISTS idx_fiat_payments_parent_payment ON fiat_payments(parent_payment_id);

-- Agregar campo para tracking de KYC en vouchers
ALTER TABLE purchase_vouchers 
ADD COLUMN IF NOT EXISTS kyc_verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS requires_kyc BOOLEAN DEFAULT true;

-- Función para calcular pagos parciales necesarios para Oxxo
CREATE OR REPLACE FUNCTION calculate_oxxo_partial_payments(total_amount_mxn NUMERIC)
RETURNS TABLE(payment_number INTEGER, amount NUMERIC) AS $$
DECLARE
  oxxo_limit NUMERIC := 10000;
  remaining NUMERIC := total_amount_mxn;
  payment_num INTEGER := 1;
BEGIN
  WHILE remaining > 0 LOOP
    IF remaining > oxxo_limit THEN
      RETURN QUERY SELECT payment_num, oxxo_limit;
      remaining := remaining - oxxo_limit;
    ELSE
      RETURN QUERY SELECT payment_num, remaining;
      remaining := 0;
    END IF;
    payment_num := payment_num + 1;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_oxxo_partial_payments IS 'Calcula los pagos parciales necesarios para Oxxo (límite 10,000 MXN)';
