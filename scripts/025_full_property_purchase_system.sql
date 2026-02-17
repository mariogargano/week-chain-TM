-- Sistema de Compra Total de Propiedades
-- Permite comprar la propiedad completa (52 semanas) con reembolso automático a holders existentes

-- Tabla para compras de propiedad completa
CREATE TABLE IF NOT EXISTS full_property_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Información del comprador
  buyer_wallet TEXT NOT NULL,
  buyer_email TEXT,
  buyer_name TEXT,
  
  -- Información de la propiedad
  property_id UUID NOT NULL REFERENCES properties(id),
  
  -- Detalles de la compra
  total_price_usdc NUMERIC(20, 6) NOT NULL,
  discount_percentage NUMERIC(5, 2) DEFAULT 0, -- Descuento por compra total (ej: 10%)
  final_price_usdc NUMERIC(20, 6) NOT NULL,
  
  -- Método de pago
  payment_method TEXT NOT NULL, -- 'usdc_crypto', 'stripe_card', 'stripe_spei', 'multiple'
  payment_status TEXT NOT NULL DEFAULT 'pending', -- pending, partial, completed, failed
  
  -- Referencias de pago
  stripe_payment_intent_id TEXT,
  transaction_hash TEXT,
  
  -- Estado de la compra
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, refunding_holders, completed, cancelled
  
  -- Información de reembolsos a holders existentes
  weeks_to_refund INTEGER DEFAULT 0, -- Número de semanas ya vendidas que necesitan reembolso
  total_refund_amount_usdc NUMERIC(20, 6) DEFAULT 0,
  refunds_completed INTEGER DEFAULT 0,
  refunds_pending INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  payment_completed_at TIMESTAMP WITH TIME ZONE,
  refunds_started_at TIMESTAMP WITH TIME ZONE,
  refunds_completed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'refunding_holders', 'completed', 'cancelled')),
  CONSTRAINT valid_payment_status CHECK (payment_status IN ('pending', 'partial', 'completed', 'failed'))
);

-- Tabla para tracking de reembolsos individuales a holders
CREATE TABLE IF NOT EXISTS holder_refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Referencia a la compra total
  full_purchase_id UUID NOT NULL REFERENCES full_property_purchases(id),
  
  -- Información del holder original
  holder_wallet TEXT NOT NULL,
  voucher_id UUID REFERENCES purchase_vouchers(id),
  week_id UUID REFERENCES weeks(id),
  week_number INTEGER NOT NULL,
  
  -- Detalles del reembolso
  original_amount_usdc NUMERIC(20, 6) NOT NULL,
  refund_amount_usdc NUMERIC(20, 6) NOT NULL, -- Puede incluir compensación adicional
  compensation_percentage NUMERIC(5, 2) DEFAULT 0, -- Ej: 5% extra por inconvenientes
  
  -- Estado del reembolso
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
  
  -- Referencias de transacción
  transaction_hash TEXT,
  stripe_refund_id TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  notification_sent BOOLEAN DEFAULT false,
  
  CONSTRAINT valid_refund_status CHECK (status IN ('pending', 'processing', 'completed', 'failed'))
);

-- Tabla para pagos parciales de compra total (si se permite pago en cuotas)
CREATE TABLE IF NOT EXISTS full_purchase_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  full_purchase_id UUID NOT NULL REFERENCES full_property_purchases(id),
  
  -- Detalles del pago
  payment_number INTEGER NOT NULL, -- 1, 2, 3... para pagos múltiples
  amount_usdc NUMERIC(20, 6) NOT NULL,
  payment_method TEXT NOT NULL,
  
  -- Referencias
  stripe_payment_intent_id TEXT,
  transaction_hash TEXT,
  
  -- Estado
  status TEXT NOT NULL DEFAULT 'pending',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_full_property_purchases_buyer ON full_property_purchases(buyer_wallet);
CREATE INDEX IF NOT EXISTS idx_full_property_purchases_property ON full_property_purchases(property_id);
CREATE INDEX IF NOT EXISTS idx_full_property_purchases_status ON full_property_purchases(status);
CREATE INDEX IF NOT EXISTS idx_holder_refunds_full_purchase ON holder_refunds(full_purchase_id);
CREATE INDEX IF NOT EXISTS idx_holder_refunds_holder_wallet ON holder_refunds(holder_wallet);
CREATE INDEX IF NOT EXISTS idx_holder_refunds_status ON holder_refunds(status);

-- Función para calcular precio de compra total con descuento
CREATE OR REPLACE FUNCTION calculate_full_property_price(
  p_property_id UUID,
  p_discount_percentage NUMERIC DEFAULT 10
) RETURNS TABLE (
  total_weeks INTEGER,
  base_price_usdc NUMERIC,
  discount_amount_usdc NUMERIC,
  final_price_usdc NUMERIC,
  weeks_already_sold INTEGER,
  refund_amount_needed_usdc NUMERIC
) AS $$
DECLARE
  v_total_weeks INTEGER := 52;
  v_base_price NUMERIC;
  v_weeks_sold INTEGER;
  v_refund_needed NUMERIC;
BEGIN
  -- Calcular precio base (suma de todas las semanas)
  SELECT 
    COALESCE(SUM(w.price), 0),
    COUNT(*) FILTER (WHERE w.status IN ('reserved', 'sold'))
  INTO v_base_price, v_weeks_sold
  FROM weeks w
  WHERE w.property_id = p_property_id;
  
  -- Calcular reembolso necesario para holders existentes
  SELECT COALESCE(SUM(pv.amount_usdc), 0)
  INTO v_refund_needed
  FROM purchase_vouchers pv
  WHERE pv.property_id = p_property_id
    AND pv.status IN ('confirmed', 'redeemed');
  
  RETURN QUERY SELECT
    v_total_weeks,
    v_base_price,
    ROUND(v_base_price * (p_discount_percentage / 100), 2),
    ROUND(v_base_price * (1 - p_discount_percentage / 100), 2),
    v_weeks_sold,
    v_refund_needed;
END;
$$ LANGUAGE plpgsql;

-- Función para iniciar proceso de reembolso a holders
CREATE OR REPLACE FUNCTION initiate_holder_refunds(
  p_full_purchase_id UUID,
  p_compensation_percentage NUMERIC DEFAULT 5
) RETURNS INTEGER AS $$
DECLARE
  v_property_id UUID;
  v_refunds_created INTEGER := 0;
  v_voucher RECORD;
BEGIN
  -- Obtener property_id de la compra
  SELECT property_id INTO v_property_id
  FROM full_property_purchases
  WHERE id = p_full_purchase_id;
  
  -- Crear registros de reembolso para cada voucher confirmado
  FOR v_voucher IN
    SELECT 
      pv.id as voucher_id,
      pv.user_wallet,
      pv.week_id,
      pv.week_number,
      pv.amount_usdc
    FROM purchase_vouchers pv
    WHERE pv.property_id = v_property_id
      AND pv.status IN ('confirmed', 'redeemed')
  LOOP
    INSERT INTO holder_refunds (
      full_purchase_id,
      holder_wallet,
      voucher_id,
      week_id,
      week_number,
      original_amount_usdc,
      refund_amount_usdc,
      compensation_percentage,
      status
    ) VALUES (
      p_full_purchase_id,
      v_voucher.user_wallet,
      v_voucher.voucher_id,
      v_voucher.week_id,
      v_voucher.week_number,
      v_voucher.amount_usdc,
      ROUND(v_voucher.amount_usdc * (1 + p_compensation_percentage / 100), 2),
      p_compensation_percentage,
      'pending'
    );
    
    v_refunds_created := v_refunds_created + 1;
  END LOOP;
  
  -- Actualizar estado de la compra total
  UPDATE full_property_purchases
  SET 
    status = 'refunding_holders',
    refunds_started_at = NOW(),
    weeks_to_refund = v_refunds_created,
    refunds_pending = v_refunds_created
  WHERE id = p_full_purchase_id;
  
  RETURN v_refunds_created;
END;
$$ LANGUAGE plpgsql;

-- Función para marcar un reembolso como completado
CREATE OR REPLACE FUNCTION complete_holder_refund(
  p_refund_id UUID,
  p_transaction_hash TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_full_purchase_id UUID;
  v_pending_refunds INTEGER;
BEGIN
  -- Actualizar el reembolso
  UPDATE holder_refunds
  SET 
    status = 'completed',
    transaction_hash = p_transaction_hash,
    completed_at = NOW()
  WHERE id = p_refund_id
  RETURNING full_purchase_id INTO v_full_purchase_id;
  
  -- Actualizar contadores en la compra total
  UPDATE full_property_purchases
  SET 
    refunds_completed = refunds_completed + 1,
    refunds_pending = refunds_pending - 1
  WHERE id = v_full_purchase_id;
  
  -- Verificar si todos los reembolsos están completos
  SELECT refunds_pending INTO v_pending_refunds
  FROM full_property_purchases
  WHERE id = v_full_purchase_id;
  
  IF v_pending_refunds = 0 THEN
    UPDATE full_property_purchases
    SET 
      status = 'completed',
      refunds_completed_at = NOW(),
      completed_at = NOW()
    WHERE id = v_full_purchase_id;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Vista para dashboard de compras totales
CREATE OR REPLACE VIEW full_property_purchases_summary AS
SELECT 
  fpp.*,
  p.name as property_name,
  p.location as property_location,
  p.presale_sold as weeks_already_sold,
  (SELECT COUNT(*) FROM holder_refunds WHERE full_purchase_id = fpp.id AND status = 'completed') as refunds_completed_count,
  (SELECT COUNT(*) FROM holder_refunds WHERE full_purchase_id = fpp.id AND status = 'pending') as refunds_pending_count,
  (SELECT SUM(refund_amount_usdc) FROM holder_refunds WHERE full_purchase_id = fpp.id) as total_refund_amount
FROM full_property_purchases fpp
JOIN properties p ON fpp.property_id = p.id;

-- Comentarios
COMMENT ON TABLE full_property_purchases IS 'Compras de propiedades completas (52 semanas) con gestión de reembolsos a holders';
COMMENT ON TABLE holder_refunds IS 'Reembolsos individuales a holders cuando se compra la propiedad completa';
COMMENT ON COLUMN full_property_purchases.discount_percentage IS 'Descuento aplicado por compra total (ej: 10% o 15%)';
COMMENT ON COLUMN holder_refunds.compensation_percentage IS 'Compensación adicional al holder por inconvenientes (ej: 5%)';
