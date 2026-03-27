-- Migration: 037_pre_holders
-- Pre-Holder campaign table: stores interest deposits for WEEK-CHAIN early adopters

CREATE TABLE IF NOT EXISTS pre_holders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  country TEXT,
  status TEXT DEFAULT 'pending_payment', -- pending_payment, paid, refunded
  holder_number INTEGER UNIQUE,
  stripe_session_id TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common lookups
CREATE INDEX IF NOT EXISTS idx_pre_holders_email ON pre_holders(email);
CREATE INDEX IF NOT EXISTS idx_pre_holders_status ON pre_holders(status);
CREATE INDEX IF NOT EXISTS idx_pre_holders_holder_number ON pre_holders(holder_number);

-- RLS: table is public-ish for insert, but reads are restricted
ALTER TABLE pre_holders ENABLE ROW LEVEL SECURITY;

-- Service role can do everything
CREATE POLICY "service_role_all_pre_holders"
  ON pre_holders
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Public can read only count (no PII) — actual count is handled via API route
-- No public SELECT policy on full table to protect PII
