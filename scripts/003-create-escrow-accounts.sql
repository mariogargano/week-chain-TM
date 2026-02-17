-- Migration: Create escrow_accounts table for accounting-based escrow
-- This replaces the blockchain-based escrow system with a traditional accounting approach

-- Create escrow_accounts table if it doesn't exist
CREATE TABLE IF NOT EXISTS escrow_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'released', 'refunded', 'cancelled')),
  amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  weeks_sold INTEGER NOT NULL DEFAULT 0,
  total_weeks INTEGER NOT NULL DEFAULT 52,
  release_threshold_percent DECIMAL(5,2) DEFAULT 80.00,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  released_at TIMESTAMP WITH TIME ZONE,
  refunded_at TIMESTAMP WITH TIME ZONE
);

-- Create index for faster property lookups
CREATE INDEX IF NOT EXISTS idx_escrow_accounts_property_id ON escrow_accounts(property_id);
CREATE INDEX IF NOT EXISTS idx_escrow_accounts_status ON escrow_accounts(status);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_escrow_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_escrow_accounts_updated_at ON escrow_accounts;
CREATE TRIGGER trigger_escrow_accounts_updated_at
  BEFORE UPDATE ON escrow_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_escrow_accounts_updated_at();

-- Add comment explaining the table purpose
COMMENT ON TABLE escrow_accounts IS 'Accounting-based escrow system for property sales. Replaces blockchain escrow with traditional accounting approach.';
COMMENT ON COLUMN escrow_accounts.status IS 'pending: waiting for sales, active: sales in progress, released: funds released to owner, refunded: funds returned to buyers, cancelled: escrow cancelled';
COMMENT ON COLUMN escrow_accounts.release_threshold_percent IS 'Percentage of weeks that must be sold before funds can be released (default 80%)';
