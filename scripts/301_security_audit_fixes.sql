-- Security Audit Fixes Migration
-- Addresses findings from PLATFORM_AUDIT_REPORT.md

-- Ensure audit_logs table has proper structure for F-01 fix
-- (Logging failed email sends for user creation)

-- Add columns if missing
ALTER TABLE audit_logs 
  ADD COLUMN IF NOT EXISTS user_id text,
  ADD COLUMN IF NOT EXISTS details jsonb;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Ensure RLS policy allows service role inserts
DROP POLICY IF EXISTS "audit_logs_service_insert" ON audit_logs;
CREATE POLICY "audit_logs_service_insert" ON audit_logs 
  FOR INSERT 
  WITH CHECK (true);

-- F-03 FIX: Consolidate admin verification to use single source of truth (users table)
-- Create a function to check admin status consistently
CREATE OR REPLACE FUNCTION is_admin_user(check_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role 
  FROM users 
  WHERE id = check_user_id;
  
  RETURN user_role IN ('admin', 'super_admin');
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION is_admin_user(uuid) TO authenticated;

-- Comment explaining usage
COMMENT ON FUNCTION is_admin_user(uuid) IS 
  'Single source of truth for admin status - checks users table role column. 
   Use this instead of checking multiple tables or hardcoded emails.';

SELECT 'Security audit fixes applied successfully' as status;
