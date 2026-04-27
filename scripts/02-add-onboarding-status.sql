-- Migration: Add onboarding status to users table
-- Purpose: Track user journey from visitor → registered → holder/agent
-- Timeline: Executed before Fase 2 deployment

-- Add onboarding_status column
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_status TEXT DEFAULT 'registered';
-- Possible values:
--   visitor (not in DB, tracked via cookies)
--   registered (just signed up, no KYC yet)
--   holder_pending_kyc (bought cert, KYC not yet approved)
--   holder_verified (bought cert, KYC approved, can use)
--   agent_pending_kyc (activated agent mode, KYC not yet approved)
--   agent_verified (activated agent mode, KYC approved, can earn commissions)

-- Add holder_since timestamp (when first cert was activated)
ALTER TABLE users ADD COLUMN IF NOT EXISTS holder_since TIMESTAMP NULL;

-- Add agent_since timestamp (when agent mode was activated)
ALTER TABLE users ADD COLUMN IF NOT EXISTS agent_since TIMESTAMP NULL;

-- Create index for faster onboarding status queries
CREATE INDEX IF NOT EXISTS idx_users_onboarding_status ON users(onboarding_status);

-- Update existing users: if they have an active certificate, mark as holder_verified
UPDATE users u
SET onboarding_status = 'holder_verified',
    holder_since = COALESCE((
      SELECT MIN(created_at)
      FROM certificates
      WHERE user_id = u.id AND status = 'active'
      LIMIT 1
    ), NOW())
WHERE onboarding_status = 'registered'
  AND EXISTS (
    SELECT 1 FROM certificates
    WHERE user_id = u.id AND status = 'active'
  );

-- Update existing users: if they are intermediary_profiles (agents), mark as agent_verified
UPDATE users u
SET agent_since = COALESCE((
  SELECT created_at FROM intermediary_profiles
  WHERE user_id = u.id
  LIMIT 1
), NOW())
WHERE onboarding_status IN ('registered', 'holder_verified')
  AND EXISTS (
    SELECT 1 FROM intermediary_profiles
    WHERE user_id = u.id AND status = 'active'
  );
