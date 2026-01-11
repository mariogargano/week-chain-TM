-- Create fiat_payments table for tracking Stripe payments
CREATE TABLE IF NOT EXISTS fiat_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_payment_intent_id TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL,
  week_id UUID NOT NULL REFERENCES weeks(id),
  property_id UUID NOT NULL REFERENCES properties(id),
  amount_usd DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('card', 'oxxo', 'spei')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  voucher_id UUID REFERENCES purchase_vouchers(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  CONSTRAINT fk_week FOREIGN KEY (week_id) REFERENCES weeks(id) ON DELETE CASCADE,
  CONSTRAINT fk_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_fiat_payments_stripe_id ON fiat_payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_fiat_payments_user_id ON fiat_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_fiat_payments_status ON fiat_payments(status);

-- Add RLS policies
ALTER TABLE fiat_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payments"
  ON fiat_payments FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Service role can manage all payments"
  ON fiat_payments FOR ALL
  USING (auth.role() = 'service_role');
