-- =============================================
-- VERIFY AND REPAIR AUTH SYSTEM
-- Ensures the authentication flow is bulletproof
-- =============================================

-- 1. Verify the trigger exists
DO $$
DECLARE
  v_trigger_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_trigger_count 
  FROM pg_trigger 
  WHERE tgname = 'on_auth_user_created';
  
  IF v_trigger_count = 0 THEN
    RAISE NOTICE 'WARNING: Auth trigger is missing! Will recreate...';
  ELSE
    RAISE NOTICE 'OK: Auth trigger exists';
  END IF;
END $$;

-- 2. Ensure the function exists with proper logic
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_full_name TEXT;
  v_avatar_url TEXT;
  v_phone TEXT;
  v_referral_code TEXT;
  v_role TEXT;
  v_email TEXT;
  v_referred_by_code TEXT;
  v_referrer_id UUID;
BEGIN
  -- Extract metadata
  v_email := LOWER(COALESCE(NEW.email, ''));
  v_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    SPLIT_PART(v_email, '@', 1)
  );
  v_avatar_url := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture',
    ''
  );
  v_phone := COALESCE(NEW.raw_user_meta_data->>'phone', '');
  v_referred_by_code := NEW.raw_user_meta_data->>'referral_code';

  -- Generate unique referral code
  v_referral_code := 'WC-' || UPPER(SUBSTRING(MD5(NEW.id::text || NOW()::text || RANDOM()::text) FROM 1 FOR 6));

  -- Determine role: admin for corporativo@morises.com, user for everyone else
  IF v_email = 'corporativo@morises.com' THEN
    v_role := 'admin';
  ELSE
    v_role := 'user';
  END IF;

  -- Look up referrer if referral code provided
  IF v_referred_by_code IS NOT NULL AND v_referred_by_code != '' THEN
    SELECT id INTO v_referrer_id 
    FROM public.users 
    WHERE referral_code = v_referred_by_code 
    LIMIT 1;
  END IF;

  -- Insert into users table (primary data store) with ON CONFLICT handling
  INSERT INTO public.users (
    id, email, full_name, avatar_url, phone, role, 
    account_type, referral_code, referred_by,
    total_referrals, total_sales,
    created_at, updated_at
  ) VALUES (
    NEW.id, v_email, v_full_name, v_avatar_url, v_phone, v_role,
    'individual', v_referral_code, v_referrer_id,
    0, 0,
    NOW(), NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = CASE WHEN public.users.full_name IS NULL OR public.users.full_name = '' 
                     THEN EXCLUDED.full_name ELSE public.users.full_name END,
    avatar_url = CASE WHEN public.users.avatar_url IS NULL OR public.users.avatar_url = ''
                      THEN EXCLUDED.avatar_url ELSE public.users.avatar_url END,
    updated_at = NOW();

  -- Insert into profiles table (social/display data)
  INSERT INTO public.profiles (
    id, email, display_name, avatar_url, username, role,
    referral_code, referred_by,
    follower_count, following_count, post_count,
    verified, is_broker_elite,
    created_at, updated_at
  ) VALUES (
    NEW.id, v_email, v_full_name, v_avatar_url,
    LOWER(REGEXP_REPLACE(SPLIT_PART(v_email, '@', 1), '[^a-zA-Z0-9]', '', 'g')) || LPAD(FLOOR(RANDOM() * 9999)::text, 4, '0'),
    v_role, v_referral_code, v_referrer_id,
    0, 0, 0, FALSE, FALSE,
    NOW(), NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    display_name = CASE WHEN public.profiles.display_name IS NULL OR public.profiles.display_name = '' 
                        THEN EXCLUDED.display_name ELSE public.profiles.display_name END,
    avatar_url = CASE WHEN public.profiles.avatar_url IS NULL OR public.profiles.avatar_url = ''
                      THEN EXCLUDED.avatar_url ELSE public.profiles.avatar_url END,
    updated_at = NOW();

  -- If admin, also insert into admin_users
  IF v_role = 'admin' THEN
    INSERT INTO public.admin_users (id, email, name, role, created_at, updated_at)
    VALUES (NEW.id, v_email, v_full_name, 'admin', NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- If referred, update referrer's total_referrals
  IF v_referrer_id IS NOT NULL THEN
    UPDATE public.users 
    SET total_referrals = COALESCE(total_referrals, 0) + 1, 
        updated_at = NOW()
    WHERE id = v_referrer_id;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but NEVER block signup - this is critical
    RAISE WARNING 'handle_new_user error for user %: % (SQLSTATE: %)', NEW.id, SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$;

-- 3. Recreate the trigger (drop first to ensure clean state)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO service_role;

-- Ensure the trigger function can access all necessary tables
GRANT SELECT, INSERT, UPDATE ON public.users TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO service_role;
GRANT SELECT, INSERT ON public.admin_users TO service_role;

-- 5. Verify final state
DO $$
DECLARE
  v_trigger_count INTEGER;
  v_function_exists BOOLEAN;
BEGIN
  -- Check trigger
  SELECT COUNT(*) INTO v_trigger_count 
  FROM pg_trigger 
  WHERE tgname = 'on_auth_user_created';
  
  -- Check function
  SELECT EXISTS(
    SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user'
  ) INTO v_function_exists;
  
  IF v_trigger_count > 0 AND v_function_exists THEN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'AUTH SYSTEM VERIFICATION: SUCCESS';
    RAISE NOTICE '- Trigger: on_auth_user_created ACTIVE';
    RAISE NOTICE '- Function: handle_new_user EXISTS';
    RAISE NOTICE '========================================';
  ELSE
    RAISE EXCEPTION 'AUTH SYSTEM VERIFICATION FAILED: trigger=%, function=%', v_trigger_count, v_function_exists;
  END IF;
END $$;
