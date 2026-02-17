-- ============================================
-- WEEK-CHAIN FINAL PRODUCTION FIX
-- Version: 1.0
-- Date: 2025-01-XX
-- Purpose: Apply ALL corrections for production launch
-- ============================================

-- 1. CREATE MISSING TESTIMONIALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_first_name TEXT NOT NULL,
  author_last_name TEXT,
  email TEXT NOT NULL,
  city TEXT,
  country TEXT,
  pax INTEGER DEFAULT 1,
  tier_label TEXT, -- e.g., "Usuario Beta", "Certificado PAX-4"
  quote TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  photo_url TEXT,
  is_approved BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view approved testimonials"
  ON public.testimonials FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Users can submit their own testimonials"
  ON public.testimonials FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage all testimonials"
  ON public.testimonials FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE email = auth.jwt()->>'email'
      AND status = 'active'
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_testimonials_approved ON public.testimonials(is_approved, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_testimonials_email ON public.testimonials(email);

-- Insert demo testimonials (PROFECO-compliant)
INSERT INTO public.testimonials (
  author_first_name, 
  city, 
  country, 
  pax, 
  tier_label, 
  quote, 
  rating, 
  is_approved, 
  approved_at,
  email
) VALUES 
  (
    'María',
    'Cancún',
    'México',
    4,
    'Certificado PAX-4',
    'Excelente experiencia usando mi certificado de vacaciones. El sistema de solicitud fue simple y la confirmación llegó rápido. Recomendado para familias.',
    5,
    true,
    NOW(),
    'maria.demo@example.com'
  ),
  (
    'Roberto',
    'Guadalajara',
    'México',
    2,
    'Certificado PAX-2',
    'Muy satisfecho con el servicio. La transparencia del proceso y el cumplimiento de fechas fueron perfectos. Vale la pena.',
    5,
    true,
    NOW(),
    'roberto.demo@example.com'
  ),
  (
    'Ana',
    'Monterrey',
    'México',
    6,
    'Certificado PAX-6',
    'Viajamos con toda la familia y fue una experiencia inolvidable. El destino asignado superó nuestras expectativas.',
    5,
    true,
    NOW(),
    'ana.demo@example.com'
  )
ON CONFLICT DO NOTHING;

-- 2. FIX ADMIN_USERS TABLE
-- ============================================
-- Add user_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'admin_users' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.admin_users 
    ADD COLUMN user_id UUID REFERENCES auth.users(id);
    
    CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON public.admin_users(user_id);
  END IF;
END $$;

-- Add status column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'admin_users' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE public.admin_users 
    ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive'));
  END IF;
END $$;

-- 3. CREATE ADMIN AUDIT LOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_email TEXT,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created ON public.admin_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_actor ON public.admin_audit_log(actor_email);

-- 4. CONFIGURE corporativo@morises.com AS SUPER ADMIN
-- ============================================
-- Insert or update admin user
INSERT INTO public.admin_users (email, name, role, status, user_id, created_at, updated_at)
SELECT 
  'corporativo@morises.com',
  'Administrador WEEK-CHAIN',
  'super_admin',
  'active',
  u.id,
  NOW(),
  NOW()
FROM auth.users u
WHERE u.email = 'corporativo@morises.com'
ON CONFLICT (email) 
DO UPDATE SET 
  role = 'super_admin',
  status = 'active',
  user_id = EXCLUDED.user_id,
  updated_at = NOW();

-- 5. CREATE PROFILE AUTO-CREATION TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    display_name,
    role,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'user',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;

CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_profile();

-- 6. SYNC EXISTING USERS
-- ============================================
-- Sync existing auth.users to profiles
INSERT INTO public.profiles (id, email, display_name, role, created_at, updated_at)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', u.email) as display_name,
  'user' as role,
  u.created_at,
  NOW()
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO NOTHING;

-- Sync admin_users with auth.users  
UPDATE public.admin_users au
SET user_id = u.id
FROM auth.users u
WHERE au.email = u.email 
AND au.user_id IS NULL;

-- 7. VERIFICATION QUERIES
-- ============================================
-- Verify testimonials table
DO $$
DECLARE
  testimonial_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO testimonial_count FROM public.testimonials WHERE is_approved = true;
  RAISE NOTICE '✅ Testimonials table created: % approved testimonials', testimonial_count;
END $$;

-- Verify admin setup
DO $$
DECLARE
  admin_exists BOOLEAN;
  admin_has_user_id BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM public.admin_users 
    WHERE email = 'corporativo@morises.com' 
    AND role = 'super_admin' 
    AND status = 'active'
  ) INTO admin_exists;
  
  SELECT EXISTS(
    SELECT 1 FROM public.admin_users 
    WHERE email = 'corporativo@morises.com' 
    AND user_id IS NOT NULL
  ) INTO admin_has_user_id;
  
  IF admin_exists AND admin_has_user_id THEN
    RAISE NOTICE '✅ Admin user corporativo@morises.com configured correctly';
  ELSE
    RAISE WARNING '⚠️ Admin user needs manual setup. Run: SELECT * FROM admin_users WHERE email = ''corporativo@morises.com'';';
  END IF;
END $$;

-- Verify profiles
DO $$
DECLARE
  profiles_count INTEGER;
  users_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO profiles_count FROM public.profiles;
  SELECT COUNT(*) INTO users_count FROM auth.users;
  
  IF profiles_count >= users_count THEN
    RAISE NOTICE '✅ All users have profiles: % profiles for % users', profiles_count, users_count;
  ELSE
    RAISE WARNING '⚠️ Some users missing profiles: % profiles vs % users', profiles_count, users_count;
  END IF;
END $$;

-- Final status
RAISE NOTICE '============================================';
RAISE NOTICE '✅ WEEK-CHAIN PRODUCTION FIX COMPLETE';
RAISE NOTICE '============================================';
RAISE NOTICE '';
RAISE NOTICE 'Next steps:';
RAISE NOTICE '1. Test homepage (testimonials should load)';
RAISE NOTICE '2. Login with corporativo@morises.com via Google OAuth';
RAISE NOTICE '3. Access /dashboard/admin (should work)';
RAISE NOTICE '4. Test new user registration (profile auto-created)';
RAISE NOTICE '';
