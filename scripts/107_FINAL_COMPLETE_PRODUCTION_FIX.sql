-- ================================================
-- WEEK-CHAIN PRODUCTION FIX - FINAL VERSION
-- Fixes: Google OAuth, Admin Access, Missing Tables
-- ================================================

-- 1. CREATE MISSING TESTIMONIALS TABLE
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name VARCHAR(255) NOT NULL,
  user_email VARCHAR(255),
  user_avatar_url TEXT,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  certificate_type VARCHAR(50),
  location VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_approved BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  is_featured BOOLEAN DEFAULT false
);

-- Index for fast approved testimonials query
CREATE INDEX IF NOT EXISTS idx_testimonials_approved ON testimonials(is_approved, created_at DESC);

-- RLS for testimonials
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Anyone can view approved testimonials"
  ON testimonials FOR SELECT
  USING (is_approved = true);

CREATE POLICY IF NOT EXISTS "Authenticated users can create testimonials"
  ON testimonials FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Insert 3 demo testimonials
INSERT INTO testimonials (user_name, user_email, content, rating, certificate_type, location, is_approved, approved_at) VALUES
('María González', 'maria@example.com', 'Excelente experiencia con WEEK-CHAIN. He utilizado mi certificado Silver para viajar a Playa del Carmen y todo fue perfecto. El proceso es transparente y seguro.', 5, 'Silver', 'Ciudad de México', true, NOW()),
('Carlos Ramírez', 'carlos@example.com', 'Mi familia y yo disfrutamos muchísimo nuestras vacaciones en Los Cabos gracias al certificado Gold. La plataforma es muy fácil de usar y el soporte es excelente.', 5, 'Gold', 'Monterrey', true, NOW()),
('Ana Martínez', 'ana@example.com', 'Recomiendo 100% WEEK-CHAIN. Es una forma innovadora y segura de asegurar tus vacaciones. El certificado Platinum me ha dado acceso a destinos increíbles en temporada alta.', 5, 'Platinum', 'Guadalajara', true, NOW())
ON CONFLICT DO NOTHING;

-- 2. FIX ADMIN_USERS TABLE - ADD user_id COLUMN
-- Check if column exists, if not add it
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'admin_users' AND column_name = 'user_id') THEN
    ALTER TABLE admin_users ADD COLUMN user_id UUID REFERENCES auth.users(id);
    CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
  END IF;
END $$;

-- 3. ADD status COLUMN IF IT DOESN'T EXIST
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'admin_users' AND column_name = 'status') THEN
    ALTER TABLE admin_users ADD COLUMN status VARCHAR(50) DEFAULT 'active';
  END IF;
END $$;

-- 4. CONFIGURE corporativo@morises.com AS SUPER ADMIN
-- First, try to find the user in auth.users
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get user_id from auth.users
  SELECT id INTO v_user_id 
  FROM auth.users 
  WHERE email = 'corporativo@morises.com'
  LIMIT 1;

  -- Upsert into admin_users
  INSERT INTO admin_users (email, name, role, status, user_id, updated_at)
  VALUES (
    'corporativo@morises.com',
    'Administrador WEEK-CHAIN',
    'super_admin',
    'active',
    v_user_id,
    NOW()
  )
  ON CONFLICT (email) 
  DO UPDATE SET
    role = 'super_admin',
    status = 'active',
    user_id = COALESCE(admin_users.user_id, v_user_id),
    updated_at = NOW();

EXCEPTION WHEN OTHERS THEN
  -- If user doesn't exist in auth.users yet, just create admin_users entry
  INSERT INTO admin_users (email, name, role, status, updated_at)
  VALUES (
    'corporativo@morises.com',
    'Administrador WEEK-CHAIN',
    'super_admin',
    'active',
    NOW()
  )
  ON CONFLICT (email) 
  DO UPDATE SET
    role = 'super_admin',
    status = 'active',
    updated_at = NOW();
END $$;

-- 5. CREATE TRIGGER TO AUTO-CREATE PROFILES WHEN USER REGISTERS
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile for new user
  INSERT INTO public.profiles (
    id,
    email,
    display_name,
    avatar_url,
    role,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url',
    'user',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = NEW.email,
    updated_at = NOW();

  -- If this is corporativo@morises.com, sync with admin_users
  IF NEW.email = 'corporativo@morises.com' THEN
    UPDATE public.admin_users
    SET user_id = NEW.id, updated_at = NOW()
    WHERE email = 'corporativo@morises.com' AND user_id IS NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF NOT EXISTS on_auth_user_created_profile ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_profile();

-- 6. SYNC EXISTING AUTH USERS WITH PROFILES
INSERT INTO public.profiles (id, email, display_name, role, created_at, updated_at)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', u.email),
  'user',
  u.created_at,
  NOW()
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO NOTHING;

-- 7. SYNC user_id FOR EXISTING ADMIN_USERS
UPDATE public.admin_users au
SET user_id = u.id
FROM auth.users u
WHERE au.email = u.email
  AND au.user_id IS NULL;

-- 8. VERIFICATION QUERIES
-- Check admin configuration
SELECT 
  email,
  name,
  role,
  status,
  user_id,
  CASE 
    WHEN user_id IS NOT NULL THEN 'Vinculado con auth.users ✓'
    ELSE 'NO vinculado con auth.users ✗'
  END as auth_status
FROM admin_users
WHERE email = 'corporativo@morises.com';

-- Check testimonials
SELECT COUNT(*) as total_testimonials, 
       COUNT(*) FILTER (WHERE is_approved = true) as approved_testimonials
FROM testimonials;

-- Check profiles
SELECT COUNT(*) as total_profiles FROM profiles;

-- Success message
DO $$ 
BEGIN 
  RAISE NOTICE '✓ WEEK-CHAIN PRODUCTION FIX COMPLETED SUCCESSFULLY';
  RAISE NOTICE '✓ Testimonials table created with 3 demo entries';
  RAISE NOTICE '✓ Admin user configured: corporativo@morises.com';
  RAISE NOTICE '✓ Auto-profile creation trigger installed';
  RAISE NOTICE '✓ Existing users synced';
END $$;
