-- Squads Escrow System for Week-Chain
-- Creates tables for Series-based escrow with Squads multisig vaults

-- Series table: Each series (B1, B2, etc.) has its own Squads vault
CREATE TABLE IF NOT EXISTS series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_code TEXT UNIQUE NOT NULL, -- 'B1', 'B2', etc.
  squads_vault_address TEXT NOT NULL,
  treasury_address TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- active, paused, closed
  total_raised_usdc NUMERIC(20, 6) DEFAULT 0,
  total_settled_usdc NUMERIC(20, 6) DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unified payments table: Tracks both Solana Pay and Stripe payments
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id UUID NOT NULL REFERENCES series(id),
  user_wallet TEXT,
  user_email TEXT,
  amount_usdc NUMERIC(20, 6) NOT NULL,
  payment_method TEXT NOT NULL, -- 'solana_pay', 'stripe_card', 'stripe_oxxo'
  status TEXT NOT NULL DEFAULT 'held', -- held, settled, refunded, failed
  
  -- Solana Pay fields
  solana_reference TEXT, -- For tracking Solana Pay transactions
  escrow_tx TEXT, -- Transaction hash of deposit to vault
  
  -- Stripe fields
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT,
  
  -- Contract & NFT tracking
  contract_id UUID, -- References contracts table
  nft_mint_id UUID, -- References nft_mints table
  
  -- Squads proposal tracking
  refund_proposal_id TEXT,
  settle_proposal_id TEXT,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_payment_method CHECK (payment_method IN ('solana_pay', 'stripe_card', 'stripe_oxxo')),
  CONSTRAINT valid_status CHECK (status IN ('held', 'settled', 'refunded', 'failed'))
);

-- Refunds table: Tracks refund requests and Squads proposals
CREATE TABLE IF NOT EXISTS refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES payments(id),
  user_wallet TEXT NOT NULL,
  amount_usdc NUMERIC(20, 6) NOT NULL,
  reason TEXT,
  squads_proposal_id TEXT, -- Squads multisig proposal ID
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, executed, rejected
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  executed_at TIMESTAMPTZ,
  refund_tx TEXT, -- Transaction hash of refund
  metadata JSONB DEFAULT '{}',
  
  CONSTRAINT valid_refund_status CHECK (status IN ('pending', 'approved', 'executed', 'rejected'))
);

-- Contracts table: Legal contracts for each purchase
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID REFERENCES payments(id),
  user_wallet TEXT NOT NULL,
  user_email TEXT,
  user_name TEXT,
  contract_type TEXT NOT NULL DEFAULT 'purchase', -- purchase, rental, etc.
  contract_hash TEXT, -- SHA256 hash of contract
  contract_url TEXT, -- URL to signed contract PDF
  status TEXT NOT NULL DEFAULT 'pending', -- pending, signed, certified, minted
  
  -- Legalario/NOM-151 certification
  legalario_document_id TEXT,
  certified_at TIMESTAMPTZ,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_contract_status CHECK (status IN ('pending', 'signed', 'certified', 'minted'))
);

-- NOM-151 certificates table: Legal certification records
CREATE TABLE IF NOT EXISTS nom151_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES contracts(id),
  legalario_document_id TEXT NOT NULL,
  certificate_url TEXT,
  certificate_hash TEXT,
  issuer TEXT DEFAULT 'Legalario',
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  
  UNIQUE(contract_id)
);

-- NFT mints table: Tracks NFT minting after legal certification
CREATE TABLE IF NOT EXISTS nft_mints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES payments(id),
  contract_id UUID NOT NULL REFERENCES contracts(id),
  user_wallet TEXT NOT NULL,
  nft_mint_address TEXT, -- Solana NFT mint address
  nft_metadata_uri TEXT,
  week_id UUID REFERENCES weeks(id),
  property_id UUID REFERENCES properties(id),
  mint_tx TEXT, -- Transaction hash of NFT mint
  status TEXT NOT NULL DEFAULT 'pending', -- pending, minted, failed
  minted_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_mint_status CHECK (status IN ('pending', 'minted', 'failed'))
);

-- Legal acceptances table: Track terms acceptance
CREATE TABLE IF NOT EXISTS legal_acceptances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_wallet TEXT NOT NULL,
  user_email TEXT,
  acceptance_type TEXT NOT NULL, -- 'terms', 'privacy', 'contract'
  document_version TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  accepted_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_payments_series ON payments(series_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_user_wallet ON payments(user_wallet);
CREATE INDEX IF NOT EXISTS idx_payments_solana_reference ON payments(solana_reference);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_intent ON payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

CREATE INDEX IF NOT EXISTS idx_refunds_payment ON refunds(payment_id);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(status);
CREATE INDEX IF NOT EXISTS idx_refunds_user_wallet ON refunds(user_wallet);

CREATE INDEX IF NOT EXISTS idx_contracts_payment ON contracts(payment_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_user_wallet ON contracts(user_wallet);

CREATE INDEX IF NOT EXISTS idx_nom151_contract ON nom151_certificates(contract_id);

CREATE INDEX IF NOT EXISTS idx_nft_mints_payment ON nft_mints(payment_id);
CREATE INDEX IF NOT EXISTS idx_nft_mints_contract ON nft_mints(contract_id);
CREATE INDEX IF NOT EXISTS idx_nft_mints_user_wallet ON nft_mints(user_wallet);
CREATE INDEX IF NOT EXISTS idx_nft_mints_status ON nft_mints(status);

CREATE INDEX IF NOT EXISTS idx_legal_acceptances_user ON legal_acceptances(user_wallet);

-- Update timestamps trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_series_updated_at BEFORE UPDATE ON series
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default Series B1
INSERT INTO series (series_code, squads_vault_address, treasury_address, status)
VALUES (
  'B1',
  'PLACEHOLDER_VAULT_ADDRESS', -- Replace with actual Squads vault
  'PLACEHOLDER_TREASURY_ADDRESS', -- Replace with actual treasury
  'active'
) ON CONFLICT (series_code) DO NOTHING;
