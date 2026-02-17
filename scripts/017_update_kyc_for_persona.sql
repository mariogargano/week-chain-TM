-- Add Persona inquiry ID column to kyc_users table
ALTER TABLE kyc_users 
ADD COLUMN IF NOT EXISTS persona_inquiry_id TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_kyc_users_persona_inquiry_id 
ON kyc_users(persona_inquiry_id);

-- Add comment
COMMENT ON COLUMN kyc_users.persona_inquiry_id IS 'Persona inquiry ID for tracking KYC verification';
