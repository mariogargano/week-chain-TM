-- Script to enforce NOM-151 certification before NFT minting
-- Prevents minting NFTs without proper legal certification

-- Function to verify contract is certified before minting
CREATE OR REPLACE FUNCTION guard_mint_requires_certification()
RETURNS trigger AS $$
DECLARE
  v_contract_status TEXT;
  v_folio TEXT;
  v_sha256 TEXT;
  v_certified_at TIMESTAMPTZ;
BEGIN
  -- Check if contract_id exists and is certified
  SELECT 
    status, 
    nom151_folio, 
    sha256_hash, 
    certified_at
  INTO 
    v_contract_status,
    v_folio,
    v_sha256,
    v_certified_at
  FROM legal_contracts
  WHERE id = NEW.contract_id;

  -- Contract must exist
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Contract not found: %', NEW.contract_id
      USING HINT = 'NFT minting requires a valid legal contract';
  END IF;

  -- Contract must be certified
  IF v_contract_status != 'certified' THEN
    RAISE EXCEPTION 'Contract not certified: % (status: %)', NEW.contract_id, v_contract_status
      USING HINT = 'Contract must be certified with NOM-151 before minting NFT';
  END IF;

  -- Must have NOM-151 folio
  IF v_folio IS NULL OR v_folio = '' THEN
    RAISE EXCEPTION 'Contract missing NOM-151 folio: %', NEW.contract_id
      USING HINT = 'Valid NOM-151 folio is required for NFT minting';
  END IF;

  -- Must have SHA256 hash
  IF v_sha256 IS NULL OR v_sha256 = '' THEN
    RAISE EXCEPTION 'Contract missing SHA256 hash: %', NEW.contract_id
      USING HINT = 'Valid SHA256 hash is required for NFT minting';
  END IF;

  -- Must have certification timestamp
  IF v_certified_at IS NULL THEN
    RAISE EXCEPTION 'Contract missing certification timestamp: %', NEW.contract_id
      USING HINT = 'Certification timestamp is required for NFT minting';
  END IF;

  -- All checks passed
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS trg_guard_mint_requires_cert ON nft_mints;

-- Create trigger to enforce certification before mint
CREATE TRIGGER trg_guard_mint_requires_cert
  BEFORE INSERT ON nft_mints
  FOR EACH ROW 
  EXECUTE FUNCTION guard_mint_requires_certification();

-- Add comment for documentation
COMMENT ON FUNCTION guard_mint_requires_certification IS 
  'Enforces NOM-151 certification requirement before NFT minting. Prevents minting without valid legal contract, folio, SHA256 hash, and certification timestamp.';

COMMENT ON TRIGGER trg_guard_mint_requires_cert ON nft_mints IS
  'Blocks NFT minting attempts without proper NOM-151 legal certification';

-- Create index for performance on contract lookups
CREATE INDEX IF NOT EXISTS idx_legal_contracts_cert_status 
  ON legal_contracts(id, status, nom151_folio, sha256_hash, certified_at)
  WHERE status = 'certified';

-- Log creation
DO $$
BEGIN
  RAISE NOTICE 'NOM-151 certification guard successfully installed';
  RAISE NOTICE 'All NFT mints will now require certified legal contracts';
END $$;
