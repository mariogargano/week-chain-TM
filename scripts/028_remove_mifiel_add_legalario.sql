-- Migration: Remove Mifiel and Add Legalario Integration
-- This script removes all Mifiel-related database objects and adds Legalario support

-- Drop Mifiel-specific tables
DROP TABLE IF EXISTS mifiel_webhooks CASCADE;

-- Remove Mifiel columns from contracts table
ALTER TABLE contracts 
  DROP COLUMN IF EXISTS mifiel_file_id,
  DROP COLUMN IF EXISTS mifiel_certificate_url;

-- Update webhook_events source enum to replace 'mifiel' with 'legalario'
-- Note: PostgreSQL doesn't allow direct enum modification, so we need to:
-- 1. Add new value if it doesn't exist
-- 2. Update existing records
-- 3. The old 'mifiel' value will remain in the enum but won't be used

-- Add 'legalario' to the source enum if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'legalario' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'webhook_source')
  ) THEN
    ALTER TYPE webhook_source ADD VALUE 'legalario';
  END IF;
END $$;

-- Update existing mifiel webhook events to legalario
UPDATE webhook_events 
SET source = 'legalario' 
WHERE source = 'mifiel';

-- Add Legalario tracking columns to nom151_certificates if they don't exist
ALTER TABLE nom151_certificates 
  ADD COLUMN IF NOT EXISTS legalario_contract_id TEXT,
  ADD COLUMN IF NOT EXISTS legalario_signature_url TEXT;

-- Create index for Legalario contract lookups
CREATE INDEX IF NOT EXISTS idx_nom151_legalario_contract 
  ON nom151_certificates(legalario_contract_id);

-- Update comments
COMMENT ON TABLE nom151_certificates IS 'Tracks NOM-151 certification status for legal contracts via Legalario';
COMMENT ON COLUMN nom151_certificates.legalario_contract_id IS 'Legalario contract ID for tracking signature requests';
COMMENT ON COLUMN nom151_certificates.legalario_signature_url IS 'URL where signers can access the document';
