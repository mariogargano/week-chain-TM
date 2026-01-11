-- =====================================================
-- SCRIPT: Setup Admin Access for WEEK-CHAIN
-- PURPOSE: Grant admin access to a specific user
-- =====================================================

-- Step 1: Get your user ID from auth.users
-- Replace 'YOUR_EMAIL@example.com' with your actual email
DO $$
DECLARE
  v_user_id uuid;
  v_user_email text := 'corporativo@morises.com'; -- CHANGE THIS to your email if different
BEGIN
  -- Find user ID
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = v_user_email;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found. Please sign up first at /auth/sign-up', v_user_email;
  END IF;

  RAISE NOTICE 'Found user ID: %', v_user_id;

  -- Step 2: Ensure user exists in profiles table with admin role
  INSERT INTO profiles (
    id,
    email,
    username,
    display_name,
    role,
    created_at,
    updated_at
  )
  VALUES (
    v_user_id,
    v_user_email,
    'admin',
    'Administrador WEEK-CHAIN',
    'admin', -- This is the key field
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    email = v_user_email,
    updated_at = NOW();

  RAISE NOTICE 'Updated profiles table with admin role';

  -- Step 3: Ensure user exists in admin_users table
  INSERT INTO admin_users (
    user_id,
    email,
    name,
    role,
    status,
    created_at,
    updated_at
  )
  VALUES (
    v_user_id,
    v_user_email,
    'Administrador WEEK-CHAIN',
    'super_admin', -- This is the key field
    'active',      -- This is required
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    role = 'super_admin',
    status = 'active',
    email = v_user_email,
    updated_at = NOW();

  RAISE NOTICE 'Updated admin_users table with super_admin role and active status';

  -- Success message
  RAISE NOTICE '✅ Admin access granted successfully!';
  RAISE NOTICE 'Email: %', v_user_email;
  RAISE NOTICE 'User ID: %', v_user_id;
  RAISE NOTICE 'You can now access: /dashboard/admin';

END $$;

-- Verify the setup
SELECT 
  'Setup Verification' as check_type,
  au.email,
  au.role as admin_role,
  au.status as admin_status,
  p.role as profile_role,
  'Access granted ✅' as result
FROM admin_users au
JOIN profiles p ON p.id = au.user_id
WHERE au.email = 'corporativo@morises.com'
  AND au.role = 'super_admin'
  AND au.status = 'active'
  AND p.role = 'admin';
