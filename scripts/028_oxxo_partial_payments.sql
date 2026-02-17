-- Sistema de Pagos Parciales para OXXO
-- Permite dividir pagos > $10,000 MXN en múltiples transacciones

-- Agregar campos para pagos parciales
ALTER TABLE fiat_payments 
ADD COLUMN IF NOT EXISTS payment_group_id UUID,
ADD COLUMN IF NOT EXISTS sequence_number INT DEFAULT 1,
ADD COLUMN IF NOT EXISTS total_in_sequence INT DEFAULT 1,
ADD COLUMN IF NOT EXISTS is_partial_payment BOOLEAN DEFAULT FALSE;

-- Crear tabla para tracking de grupos de pagos
CREATE TABLE IF NOT EXISTS payment_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_id UUID REFERENCES purchase_vouchers(id),
  property_id UUID NOT NULL REFERENCES properties(id),
  week_id UUID NOT NULL REFERENCES weeks(id),
  user_wallet TEXT NOT NULL,
  user_email TEXT NOT NULL,
  total_amount_mxn DECIMAL(10, 2) NOT NULL,
  total_amount_usd DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL,
  processor TEXT NOT NULL,
  total_payments INT NOT NULL,
  completed_payments INT DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'completed', 'failed')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_fiat_payments_group ON fiat_payments(payment_group_id) WHERE payment_group_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payment_groups_status ON payment_groups(status);
CREATE INDEX IF NOT EXISTS idx_payment_groups_voucher ON payment_groups(voucher_id);

-- RLS policies
ALTER TABLE payment_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payment groups"
  ON payment_groups FOR SELECT
  USING (auth.uid()::text = user_wallet OR user_email = auth.email());

CREATE POLICY "Service role can manage all payment groups"
  ON payment_groups FOR ALL
  USING (auth.role() = 'service_role');

-- Función para actualizar estado del grupo cuando se completa un pago
CREATE OR REPLACE FUNCTION update_payment_group_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo procesar si el pago es parte de un grupo
  IF NEW.payment_group_id IS NOT NULL AND NEW.status = 'succeeded' THEN
    -- Actualizar contador de pagos completados
    UPDATE payment_groups
    SET 
      completed_payments = (
        SELECT COUNT(*) 
        FROM fiat_payments 
        WHERE payment_group_id = NEW.payment_group_id 
        AND status = 'succeeded'
      ),
      status = CASE 
        WHEN (SELECT COUNT(*) FROM fiat_payments WHERE payment_group_id = NEW.payment_group_id AND status = 'succeeded') >= total_payments 
        THEN 'completed'
        ELSE 'partial'
      END,
      completed_at = CASE 
        WHEN (SELECT COUNT(*) FROM fiat_payments WHERE payment_group_id = NEW.payment_group_id AND status = 'succeeded') >= total_payments 
        THEN NOW()
        ELSE NULL
      END
    WHERE id = NEW.payment_group_id;
    
    -- Si todos los pagos están completos, actualizar el voucher a confirmed
    IF (SELECT status FROM payment_groups WHERE id = NEW.payment_group_id) = 'completed' THEN
      UPDATE purchase_vouchers
      SET status = 'confirmed'
      WHERE id = (SELECT voucher_id FROM payment_groups WHERE id = NEW.payment_group_id);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar automáticamente el estado del grupo
DROP TRIGGER IF EXISTS trigger_update_payment_group ON fiat_payments;
CREATE TRIGGER trigger_update_payment_group
  AFTER UPDATE OF status ON fiat_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_group_status();

-- Comentarios
COMMENT ON TABLE payment_groups IS 'Agrupa múltiples pagos parciales de OXXO para un mismo voucher';
COMMENT ON COLUMN fiat_payments.payment_group_id IS 'ID del grupo de pagos parciales (si aplica)';
COMMENT ON COLUMN fiat_payments.sequence_number IS 'Número de secuencia del pago (1 de 3, 2 de 3, etc)';
COMMENT ON COLUMN fiat_payments.total_in_sequence IS 'Total de pagos en la secuencia';
