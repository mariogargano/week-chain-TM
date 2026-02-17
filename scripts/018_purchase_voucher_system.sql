-- Sistema de Purchase Vouchers (Certificados de Compra)
-- Reemplaza WEEK tokens como recibo de pago durante preventa

-- Tabla principal de vouchers de compra
CREATE TABLE IF NOT EXISTS purchase_vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_code TEXT UNIQUE NOT NULL, -- Código único del voucher (ej: WK-PROP1-W23-ABC123)
  
  -- Información de la compra
  user_wallet TEXT NOT NULL,
  property_id UUID NOT NULL REFERENCES properties(id),
  week_id UUID NOT NULL REFERENCES weeks(id),
  week_number INTEGER NOT NULL,
  
  -- Detalles del pago
  payment_method TEXT NOT NULL, -- 'usdc_crypto', 'stripe_card', 'stripe_spei', 'stripe_oxxo'
  amount_usdc NUMERIC(20, 6) NOT NULL,
  amount_paid_currency TEXT, -- 'USDC', 'MXN', 'USD'
  amount_paid NUMERIC(20, 6), -- Monto pagado en la moneda original
  
  -- Referencias de pago
  escrow_deposit_id UUID REFERENCES escrow_deposits(id),
  stripe_payment_intent_id TEXT,
  payment_transaction_hash TEXT,
  
  -- Estado del voucher
  status TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, redeemed, refunded, expired
  issued_at TIMESTAMP WITH TIME ZONE,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  redeemed_at TIMESTAMP WITH TIME ZONE,
  refunded_at TIMESTAMP WITH TIME ZONE,
  
  -- Información del NFT (cuando se canjee)
  nft_mint_address TEXT,
  nft_minted_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata adicional
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para pagos fiat (Stripe)
CREATE TABLE IF NOT EXISTS fiat_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_wallet TEXT NOT NULL,
  user_email TEXT NOT NULL,
  
  -- Información de Stripe
  stripe_payment_intent_id TEXT UNIQUE NOT NULL,
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
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, succeeded, failed, refunded
  
  -- Referencias
  property_id UUID REFERENCES properties(id),
  week_id UUID REFERENCES weeks(id),
  voucher_id UUID REFERENCES purchase_vouchers(id),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  succeeded_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  refunded_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Tabla para tracking de canjes de vouchers a NFTs
CREATE TABLE IF NOT EXISTS voucher_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_id UUID NOT NULL REFERENCES purchase_vouchers(id),
  property_id UUID NOT NULL REFERENCES properties(id),
  
  -- Información del canje
  redeemed_by_wallet TEXT NOT NULL,
  nft_mint_address TEXT NOT NULL,
  blockchain_transaction_hash TEXT,
  
  -- Condiciones cumplidas para el canje
  presale_completed BOOLEAN DEFAULT true,
  weeks_sold_at_redemption INTEGER,
  presale_target INTEGER,
  
  -- Timestamps
  redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_purchase_vouchers_user_wallet ON purchase_vouchers(user_wallet);
CREATE INDEX IF NOT EXISTS idx_purchase_vouchers_status ON purchase_vouchers(status);
CREATE INDEX IF NOT EXISTS idx_purchase_vouchers_property_id ON purchase_vouchers(property_id);
CREATE INDEX IF NOT EXISTS idx_purchase_vouchers_week_id ON purchase_vouchers(week_id);
CREATE INDEX IF NOT EXISTS idx_purchase_vouchers_voucher_code ON purchase_vouchers(voucher_code);
CREATE INDEX IF NOT EXISTS idx_fiat_payments_stripe_payment_intent ON fiat_payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_fiat_payments_user_wallet ON fiat_payments(user_wallet);
CREATE INDEX IF NOT EXISTS idx_fiat_payments_status ON fiat_payments(status);
CREATE INDEX IF NOT EXISTS idx_voucher_redemptions_voucher_id ON voucher_redemptions(voucher_id);

-- Función para generar código de voucher único
CREATE OR REPLACE FUNCTION generate_voucher_code(
  p_property_id UUID,
  p_week_number INTEGER
) RETURNS TEXT AS $$
DECLARE
  property_code TEXT;
  random_suffix TEXT;
  voucher_code TEXT;
BEGIN
  -- Obtener código corto de la propiedad (primeros 4 chars del ID)
  SELECT UPPER(SUBSTRING(id::TEXT, 1, 4)) INTO property_code
  FROM properties WHERE id = p_property_id;
  
  -- Generar sufijo aleatorio
  random_suffix := UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 6));
  
  -- Formato: WK-PROP-W23-ABC123
  voucher_code := 'WK-' || property_code || '-W' || LPAD(p_week_number::TEXT, 2, '0') || '-' || random_suffix;
  
  RETURN voucher_code;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar presale_sold cuando se confirma un voucher
CREATE OR REPLACE FUNCTION update_presale_sold_on_voucher_confirm()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
    UPDATE properties
    SET presale_sold = presale_sold + 1
    WHERE id = NEW.property_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_presale_sold
AFTER UPDATE ON purchase_vouchers
FOR EACH ROW
EXECUTE FUNCTION update_presale_sold_on_voucher_confirm();

-- Función para verificar si una propiedad está lista para canjear vouchers
CREATE OR REPLACE FUNCTION can_redeem_vouchers(p_property_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  presale_target INTEGER;
  presale_sold INTEGER;
BEGIN
  SELECT properties.presale_target, properties.presale_sold
  INTO presale_target, presale_sold
  FROM properties
  WHERE id = p_property_id;
  
  RETURN presale_sold >= presale_target;
END;
$$ LANGUAGE plpgsql;

-- Vista para vouchers pendientes de canje
CREATE OR REPLACE VIEW vouchers_ready_to_redeem AS
SELECT 
  pv.*,
  p.name as property_name,
  p.presale_sold,
  p.presale_target,
  p.presale_progress,
  w.week_number,
  can_redeem_vouchers(pv.property_id) as can_redeem
FROM purchase_vouchers pv
JOIN properties p ON pv.property_id = p.id
JOIN weeks w ON pv.week_id = w.id
WHERE pv.status = 'confirmed'
  AND pv.nft_mint_address IS NULL
  AND can_redeem_vouchers(pv.property_id) = true;

-- Comentarios
COMMENT ON TABLE purchase_vouchers IS 'Certificados de compra que reemplazan WEEK tokens durante preventa';
COMMENT ON TABLE fiat_payments IS 'Pagos fiat procesados por Stripe (tarjeta, SPEI, Oxxo)';
COMMENT ON TABLE voucher_redemptions IS 'Historial de canjes de vouchers por NFTs';
COMMENT ON COLUMN purchase_vouchers.voucher_code IS 'Código único del voucher (ej: WK-PROP1-W23-ABC123)';
COMMENT ON COLUMN purchase_vouchers.payment_method IS 'Método de pago: usdc_crypto, stripe_card, stripe_spei, stripe_oxxo';
COMMENT ON COLUMN purchase_vouchers.status IS 'Estado: pending, confirmed, redeemed, refunded, expired';
