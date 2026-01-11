-- Add Conekta payment processor support
-- This extends the payment system to support Conekta alongside Stripe

-- Add processor column to fiat_payments table
ALTER TABLE fiat_payments 
ADD COLUMN IF NOT EXISTS processor VARCHAR(20) DEFAULT 'stripe' CHECK (processor IN ('stripe', 'conekta'));

-- Add Conekta-specific fields
ALTER TABLE fiat_payments 
ADD COLUMN IF NOT EXISTS conekta_order_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS conekta_charge_id VARCHAR(255);

-- Create index for Conekta order lookups
CREATE INDEX IF NOT EXISTS idx_fiat_payments_conekta_order 
ON fiat_payments(conekta_order_id) WHERE conekta_order_id IS NOT NULL;

-- Update existing records to use 'stripe' processor
UPDATE fiat_payments 
SET processor = 'stripe' 
WHERE processor IS NULL;

-- Add comment
COMMENT ON COLUMN fiat_payments.processor IS 'Payment processor used: stripe or conekta';
COMMENT ON COLUMN fiat_payments.conekta_order_id IS 'Conekta order ID for tracking';
COMMENT ON COLUMN fiat_payments.conekta_charge_id IS 'Conekta charge ID after payment completion';
