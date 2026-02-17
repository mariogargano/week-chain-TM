-- =====================================================
-- WEEK-CHAIN: Complete Auth System Fix
-- Fixes all authentication issues for go-live
-- =====================================================

-- 1. Add user_id column to admin_users if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'admin_users' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE admin_users ADD COLUMN user_id uuid REFERENCES auth.users(id);
    CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
  END IF;
END $$;

-- 2. Add status column to admin_users if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'admin_users' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE admin_users ADD COLUMN status VARCHAR(50) DEFAULT 'active';
  END IF;
END $$;

-- 3. Create admin_audit_log table if not exists
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id),
  actor_email text,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  metadata jsonb DEFAULT '{}',
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_log_actor ON admin_audit_log(actor_email);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_action ON admin_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created ON admin_audit_log(created_at DESC);

-- 4. Create or replace the profile creation trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_referral_code TEXT;
  v_display_name TEXT;
BEGIN
  -- Generate unique referral code
  v_referral_code := 'WC' || UPPER(SUBSTRING(NEW.id::text, 1, 8));
  
  -- Get display name from metadata or email
  v_display_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    SPLIT_PART(NEW.email, '@', 1)
  );
  
  -- Insert profile
  INSERT INTO public.profiles (
    id,
    email,
    display_name,
    avatar_url,
    role,
    referral_code,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    LOWER(NEW.email),
    v_display_name,
    NEW.raw_user_meta_data->>'avatar_url',
    CASE 
      WHEN LOWER(NEW.email) = 'corporativo@morises.com' THEN 'admin'
      ELSE 'user'
    END,
    v_referral_code,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    display_name = COALESCE(profiles.display_name, EXCLUDED.display_name),
    avatar_url = COALESCE(profiles.avatar_url, EXCLUDED.avatar_url),
    updated_at = NOW();
  
  -- Also create entry in users table for compatibility
  INSERT INTO public.users (
    id,
    email,
    full_name,
    avatar_url,
    role,
    referral_code,
    account_type,
    verification_status,
    profile_completed,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    LOWER(NEW.email),
    v_display_name,
    NEW.raw_user_meta_data->>'avatar_url',
    CASE 
      WHEN LOWER(NEW.email) = 'corporativo@morises.com' THEN 'admin'
      ELSE 'member'
    END,
    v_referral_code,
    'individual',
    'pending',
    false,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(users.full_name, EXCLUDED.full_name),
    avatar_url = COALESCE(users.avatar_url, EXCLUDED.avatar_url),
    updated_at = NOW();

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create trigger if not exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 6. Sync existing auth users to profiles (for users that registered before trigger)
INSERT INTO public.profiles (id, email, display_name, role, referral_code, created_at, updated_at)
SELECT 
  au.id,
  LOWER(au.email),
  COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', SPLIT_PART(au.email, '@', 1)),
  CASE WHEN LOWER(au.email) = 'corporativo@morises.com' THEN 'admin' ELSE 'user' END,
  'WC' || UPPER(SUBSTRING(au.id::text, 1, 8)),
  au.created_at,
  NOW()
FROM auth.users au
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = au.id)
ON CONFLICT (id) DO NOTHING;

-- 7. Setup admin user for corporativo@morises.com
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Get user_id from auth.users
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE LOWER(email) = 'corporativo@morises.com'
  LIMIT 1;
  
  IF v_user_id IS NOT NULL THEN
    -- Update or insert admin_users
    INSERT INTO admin_users (id, email, name, role, status, user_id, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      'corporativo@morises.com',
      'Administrador WEEK-CHAIN',
      'super_admin',
      'active',
      v_user_id,
      NOW(),
      NOW()
    )
    ON CONFLICT (email) DO UPDATE SET
      user_id = v_user_id,
      role = 'super_admin',
      status = 'active',
      updated_at = NOW();
    
    -- Update profiles table
    UPDATE profiles SET role = 'admin' WHERE id = v_user_id;
    
    -- Update users table
    UPDATE users SET role = 'admin' WHERE id = v_user_id;
    
    RAISE NOTICE 'Admin user configured successfully for user_id: %', v_user_id;
  ELSE
    RAISE NOTICE 'Admin user not found in auth.users - will be configured on first login';
  END IF;
END $$;

-- 8. Create unique constraint on admin_users.email if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'admin_users_email_key'
  ) THEN
    ALTER TABLE admin_users ADD CONSTRAINT admin_users_email_key UNIQUE (email);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 9. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT SELECT ON public.admin_users TO authenticated;
GRANT INSERT ON public.admin_audit_log TO authenticated;

-- 10. RLS policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 11. RLS for admin_audit_log
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view audit log" ON admin_audit_log;
CREATE POLICY "Admins can view audit log" ON admin_audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "System can insert audit log" ON admin_audit_log;
CREATE POLICY "System can insert audit log" ON admin_audit_log
  FOR INSERT WITH CHECK (true);

-- Success message
DO $$ BEGIN RAISE NOTICE '✅ Auth system fix complete!'; END $$;
