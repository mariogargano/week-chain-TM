-- Script to consolidate admin_users table into users.role
-- Version: 1.0.0
-- Description: Migrate admin_users data to users table and remove redundancy

-- Step 1: Migrate any admin_users that don't exist in users
-- (This assumes admin_users might have some data not in users)
INSERT INTO users (id, email, full_name, role, created_at, updated_at)
SELECT 
  id,
  email,
  name as full_name,
  COALESCE(role, 'admin') as role,
  created_at,
  updated_at
FROM admin_users
WHERE email NOT IN (SELECT email FROM users WHERE email IS NOT NULL)
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  updated_at = NOW();

-- Step 2: Update existing users who are admins but might not have correct role
UPDATE users u
SET role = au.role, updated_at = NOW()
FROM admin_users au
WHERE u.email = au.email
AND u.role IS DISTINCT FROM au.role;

-- Step 3: Create backup of admin_users before dropping (optional, for safety)
CREATE TABLE IF NOT EXISTS admin_users_backup AS 
SELECT * FROM admin_users;

-- Step 4: Drop admin_users table (commented out for safety - uncomment after verification)
-- DROP TABLE admin_users CASCADE;

-- Step 5: Drop admin_permissions table as it's redundant with users.role
-- DROP TABLE admin_permissions CASCADE;

-- Step 6: Drop admin_wallets table if not needed
-- DROP TABLE admin_wallets CASCADE;

-- Verification query to check migration
-- SELECT email, role FROM users WHERE role IN ('admin', 'super_admin', 'management');
