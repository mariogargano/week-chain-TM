-- NFT Mints table with complete mint data
CREATE TABLE IF NOT EXISTS nft_mints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID REFERENCES legal_contracts(id) ON DELETE CASCADE NOT NULL,
  mint_address TEXT UNIQUE NOT NULL,
  recipient_address TEXT NOT NULL,
  metadata_uri TEXT NOT NULL,
  tx_signature TEXT NOT NULL,
  status TEXT DEFAULT 'minted' CHECK (status IN ('pending', 'minted', 'failed')),
  minted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_nft_mints_contract ON nft_mints(contract_id);
CREATE INDEX IF NOT EXISTS idx_nft_mints_recipient ON nft_mints(recipient_address);
CREATE INDEX IF NOT EXISTS idx_nft_mints_status ON nft_mints(status);
CREATE INDEX IF NOT EXISTS idx_nft_mints_mint_address ON nft_mints(mint_address);

-- Enable RLS
ALTER TABLE nft_mints ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own NFT mints" ON nft_mints
  FOR SELECT USING (
    recipient_address IN (
      SELECT wallet_address FROM user_wallets WHERE user_id = auth.uid()
    )
  );

-- Service role can insert (minting API)
CREATE POLICY "Service role can insert NFT mints" ON nft_mints
  FOR INSERT WITH CHECK (false); -- Only service_role can bypass

-- Guard function: Block mints without NOM-151 certification
CREATE OR REPLACE FUNCTION guard_mint_requires_certification()
RETURNS trigger AS $$
BEGIN
  -- Check if referenced contract is certified
  PERFORM 1 FROM legal_contracts
  WHERE id = NEW.contract_id
    AND status = 'certified'
    AND folio IS NOT NULL
    AND sha256_hash IS NOT NULL
    AND certified_at IS NOT NULL;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'NOM-151 certification required before minting. Contract ID: %', NEW.contract_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS trg_guard_mint_requires_cert ON nft_mints;

-- Create trigger
CREATE TRIGGER trg_guard_mint_requires_cert
BEFORE INSERT ON nft_mints
FOR EACH ROW EXECUTE FUNCTION guard_mint_requires_certification();

COMMENT ON FUNCTION guard_mint_requires_certification IS 'Blocks NFT minting for contracts without NOM-151 certification';
COMMENT ON TABLE nft_mints IS 'Stores NFT mint data with Solana blockchain references and NOM-151 compliance';
