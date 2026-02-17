-- New database schema for Legalario integration

-- Create legalario_contracts table to track signature requests
CREATE TABLE IF NOT EXISTS legalario_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id TEXT NOT NULL UNIQUE,
  signer_name TEXT NOT NULL,
  signer_email TEXT NOT NULL,
  role TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'signed', 'rejected', 'cancelled')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  signed_at TIMESTAMP WITH TIME ZONE,
  certificate_url TEXT,
  payload JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_legalario_contracts_contract_id ON legalario_contracts(contract_id);
CREATE INDEX IF NOT EXISTS idx_legalario_contracts_signer_email ON legalario_contracts(signer_email);
CREATE INDEX IF NOT EXISTS idx_legalario_contracts_status ON legalario_contracts(status);

-- Add RLS policies
ALTER TABLE legalario_contracts ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view their own contracts
CREATE POLICY "Users can view their own contracts" ON legalario_contracts
  FOR SELECT
  USING (auth.uid() = created_by OR signer_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Allow service role to manage all contracts
CREATE POLICY "Service role can manage all contracts" ON legalario_contracts
  FOR ALL
  USING (auth.role() = 'service_role');

-- Add legal agreement fields to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS legal_agreement_signed BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS legal_agreement_signed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Add comments for documentation
COMMENT ON TABLE legalario_contracts IS 'Tracks Legalario signature requests and their status';
COMMENT ON COLUMN legalario_contracts.contract_id IS 'Legalario contract ID from their API';
COMMENT ON COLUMN legalario_contracts.status IS 'Current status: pending, signed, rejected, or cancelled';
COMMENT ON COLUMN legalario_contracts.payload IS 'Full response from Legalario API';

-- Update webhook_events source enum to include legalario
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'webhook_source') THEN
    ALTER TYPE webhook_source ADD VALUE IF NOT EXISTS 'legalario';
  END IF;
END$$;
