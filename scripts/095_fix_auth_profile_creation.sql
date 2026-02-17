-- ==========================================
-- FIX: Authentication & Profile Creation System
-- ==========================================
-- This script ensures that profiles are created automatically
-- when users sign up via email/password OR Google OAuth

-- Step 1: Drop existing trigger if any
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 2: Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  user_name TEXT;
  user_email TEXT;
BEGIN
  -- Extract name and email
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );
  user_email := NEW.email;

  -- Create profile for new user
  INSERT INTO public.profiles (
    id,
    username,
    display_name,
    email,
    avatar_url,
    role,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    LOWER(REPLACE(user_name, ' ', '_')) || '_' || substr(NEW.id::text, 1, 8),
    user_name,
    user_email,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
    'user', -- Default role
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    display_name = COALESCE(profiles.display_name, EXCLUDED.display_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    updated_at = NOW();

  RETURN NEW;
END;
$$;

-- Step 3: Create trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Add user_id column to admin_users if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'admin_users' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.admin_users ADD COLUMN user_id UUID REFERENCES auth.users(id);
    CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON public.admin_users(user_id);
  END IF;
END $$;

-- Step 5: Sync existing admin_users emails with auth.users
UPDATE public.admin_users au
SET user_id = a.id
FROM auth.users a
WHERE au.email = a.email
AND au.user_id IS NULL;

-- Step 6: Create index on profiles.email for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Step 7: Ensure corporativo@morises.com has admin access
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Get user_id for corporativo@morises.com
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'corporativo@morises.com';

  IF admin_user_id IS NOT NULL THEN
    -- Update profile to admin role
    UPDATE public.profiles
    SET role = 'admin', updated_at = NOW()
    WHERE id = admin_user_id;

    -- Ensure entry in admin_users
    INSERT INTO public.admin_users (
      id,
      user_id,
      email,
      name,
      role,
      status,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      admin_user_id,
      'corporativo@morises.com',
      'Corporativo WEEK-CHAIN',
      'super_admin',
      'active',
      NOW(),
      NOW()
    )
    ON CONFLICT (email) DO UPDATE SET
      user_id = EXCLUDED.user_id,
      role = 'super_admin',
      status = 'active',
      updated_at = NOW();
  END IF;
END $$;

-- Step 8: Fix any existing users without profiles
INSERT INTO public.profiles (id, username, display_name, email, role, created_at, updated_at)
SELECT 
  au.id,
  LOWER(REPLACE(COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)), ' ', '_')) || '_' || substr(au.id::text, 1, 8),
  COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)),
  au.email,
  'user',
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

COMMENT ON FUNCTION public.handle_new_user IS 'Automatically creates a profile when a new user signs up via email or OAuth';
COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 'Triggers profile creation for new users';
