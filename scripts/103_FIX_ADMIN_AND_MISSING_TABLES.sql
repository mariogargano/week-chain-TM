-- =====================================================
-- WEEK-CHAIN: Fix Admin Access & Create Missing Tables
-- =====================================================
-- Este script arregla el acceso al admin panel y crea las tablas faltantes

-- =====================================================
-- 1. FIX ADMIN_USERS TABLE
-- =====================================================

-- Add user_id column if missing (for linking to auth.users)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'admin_users' 
                 AND column_name = 'user_id') THEN
    ALTER TABLE admin_users ADD COLUMN user_id UUID REFERENCES auth.users(id);
    ALTER TABLE admin_users ADD COLUMN status TEXT DEFAULT 'active';
    CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
    CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
  END IF;
END $$;

-- Add admin audit log table
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_email TEXT,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_log_actor ON admin_audit_log(actor_email);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created ON admin_audit_log(created_at DESC);

-- Setup corporativo@morises.com as super admin
DO $$
DECLARE
  admin_auth_user_id UUID;
BEGIN
  -- Get auth.users id for corporativo@morises.com
  SELECT id INTO admin_auth_user_id 
  FROM auth.users 
  WHERE email = 'corporativo@morises.com'
  LIMIT 1;

  -- Upsert admin_users entry
  INSERT INTO admin_users (
    email,
    name,
    role,
    status,
    user_id,
    created_at,
    updated_at
  ) VALUES (
    'corporativo@morises.com',
    'Administrador WEEK-CHAIN',
    'super_admin',
    'active',
    admin_auth_user_id,
    NOW(),
    NOW()
  )
  ON CONFLICT (email) 
  DO UPDATE SET 
    role = 'super_admin',
    status = 'active',
    user_id = COALESCE(admin_users.user_id, admin_auth_user_id),
    updated_at = NOW();

  RAISE NOTICE 'Admin user configured for corporativo@morises.com';
END $$;

-- =====================================================
-- 2. CREATE TESTIMONIALS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  author_name TEXT NOT NULL,
  author_email TEXT,
  author_location TEXT,
  author_avatar_url TEXT,
  testimonial_text TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  certificate_type TEXT, -- silver, gold, platinum, signature
  destination TEXT,
  is_approved BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  rejected_reason TEXT,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_testimonials_approved ON testimonials(is_approved, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_testimonials_user ON testimonials(user_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_status ON testimonials(status);

-- Enable RLS
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view approved testimonials"
  ON testimonials FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Users can insert own testimonials"
  ON testimonials FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own testimonials"
  ON testimonials FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all testimonials"
  ON testimonials FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND status = 'active'
    )
  );

-- Insert demo testimonials
INSERT INTO testimonials (
  author_name,
  author_location,
  testimonial_text,
  rating,
  certificate_type,
  destination,
  is_approved,
  approved_at,
  status
) VALUES
(
  'María González',
  'Ciudad de México',
  'Experiencia increíble en Playa del Carmen. El proceso fue transparente y profesional. Recomiendo WEEK-CHAIN 100%.',
  5,
  'gold',
  'Playa del Carmen',
  true,
  NOW(),
  'approved'
),
(
  'Carlos Rodríguez',
  'Guadalajara',
  'El mejor sistema de certificados vacacionales que he usado. Todo digital, rápido y confiable.',
  5,
  'platinum',
  'Tulum',
  true,
  NOW(),
  'approved'
),
(
  'Ana Martínez',
  'Monterrey',
  'Muy satisfecha con mi certificado Silver. Las propiedades son excelentes y el servicio es de primera.',
  4,
  'silver',
  'Cancún',
  true,
  NOW(),
  'approved'
);

-- =====================================================
-- 3. CREATE PUBLIC_DESTINATIONS_CATALOG TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public_destinations_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location_group TEXT NOT NULL, -- Caribe Mexicano, Pacífico, etc.
  country TEXT DEFAULT 'México',
  state TEXT,
  city TEXT,
  description TEXT,
  image_url TEXT,
  avg_temp_celsius NUMERIC(4,1),
  best_season TEXT,
  activities JSONB DEFAULT '[]'::jsonb,
  amenities JSONB DEFAULT '[]'::jsonb,
  properties_count INTEGER DEFAULT 0,
  popularity_score INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_destinations_active ON public_destinations_catalog(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_destinations_location ON public_destinations_catalog(location_group);

-- Insert 6 popular Mexican destinations
INSERT INTO public_destinations_catalog (
  name,
  location_group,
  country,
  state,
  city,
  description,
  avg_temp_celsius,
  best_season,
  activities,
  properties_count,
  is_active,
  display_order
) VALUES
(
  'Playa del Carmen',
  'Caribe Mexicano',
  'México',
  'Quintana Roo',
  'Playa del Carmen',
  'Destino caribeño con playas de arena blanca, cenotes y vida nocturna vibrante.',
  28.5,
  'Noviembre - Abril',
  '["Snorkel", "Buceo", "Excursiones a Tulum", "Vida nocturna", "Compras en 5ta Avenida"]'::jsonb,
  12,
  true,
  1
),
(
  'Tulum',
  'Caribe Mexicano',
  'México',
  'Quintana Roo',
  'Tulum',
  'Paraíso bohemio con ruinas mayas frente al mar y playas vírgenes.',
  27.8,
  'Noviembre - Marzo',
  '["Ruinas Mayas", "Cenotes", "Yoga", "Gastronomía", "Playas vírgenes"]'::jsonb,
  8,
  true,
  2
),
(
  'Cancún',
  'Caribe Mexicano',
  'México',
  'Quintana Roo',
  'Cancún',
  'Icónico destino con hoteles de lujo, playas turquesas y vida nocturna de clase mundial.',
  29.0,
  'Diciembre - Abril',
  '["Playas", "Parques acuáticos", "Isla Mujeres", "Compras", "Restaurantes"]'::jsonb,
  15,
  true,
  3
),
(
  'Puerto Vallarta',
  'Pacífico Mexicano',
  'México',
  'Jalisco',
  'Puerto Vallarta',
  'Encantador pueblo mágico con playas, malecón tradicional y Sierra Madre.',
  26.5,
  'Noviembre - Mayo',
  '["Malecón", "Zip-line", "Observación de ballenas", "Marina", "Centro histórico"]'::jsonb,
  10,
  true,
  4
),
(
  'Los Cabos',
  'Pacífico Mexicano',
  'México',
  'Baja California Sur',
  'Cabo San Lucas',
  'Destino premium con marinas, golf de clase mundial y El Arco emblemático.',
  25.0,
  'Octubre - Mayo',
  '["Golf", "Pesca deportiva", "El Arco", "Vida marina", "Resorts de lujo"]'::jsonb,
  9,
  true,
  5
),
(
  'Mérida',
  'Península de Yucatán',
  'México',
  'Yucatán',
  'Mérida',
  'Capital cultural con arquitectura colonial, cenotes cercanos y gastronomía yucateca.',
  27.2,
  'Noviembre - Febrero',
  '["Cenotes", "Ruinas mayas", "Gastronomía", "Haciendas", "Cultura"]'::jsonb,
  6,
  true,
  6
);

-- =====================================================
-- 4. CREATE TRIGGER FOR AUTO-PROFILE CREATION
-- =====================================================

CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile automatically when user signs up
  INSERT INTO public.profiles (
    id,
    email,
    username,
    display_name,
    role,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    SPLIT_PART(NEW.email, '@', 1), -- username from email
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    'user',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_auth_user();

-- =====================================================
-- 5. SYNC EXISTING AUTH USERS TO PROFILES
-- =====================================================

INSERT INTO public.profiles (
  id,
  email,
  username,
  display_name,
  role,
  created_at,
  updated_at
)
SELECT 
  au.id,
  au.email,
  SPLIT_PART(au.email, '@', 1),
  COALESCE(au.raw_user_meta_data->>'full_name', SPLIT_PART(au.email, '@', 1)),
  CASE 
    WHEN au.email = 'corporativo@morises.com' THEN 'admin'
    ELSE 'user'
  END,
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL;

-- =====================================================
-- 6. UPDATE ADMIN USER WITH AUTH ID
-- =====================================================

UPDATE admin_users
SET user_id = (
  SELECT id FROM auth.users WHERE email = 'corporativo@morises.com' LIMIT 1
)
WHERE email = 'corporativo@morises.com' AND user_id IS NULL;

-- =====================================================
-- 7. VERIFICATION QUERIES
-- =====================================================

-- Check admin setup
SELECT 
  'ADMIN SETUP' as check_type,
  email,
  role,
  status,
  user_id,
  CASE WHEN user_id IS NOT NULL THEN '✓ Linked to auth.users' ELSE '✗ NOT linked' END as auth_status
FROM admin_users
WHERE email = 'corporativo@morises.com';

-- Check testimonials
SELECT 
  'TESTIMONIALS' as check_type,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE is_approved = true) as approved_count
FROM testimonials;

-- Check destinations
SELECT 
  'DESTINATIONS' as check_type,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE is_active = true) as active_count
FROM public_destinations_catalog;

-- Check profiles
SELECT 
  'PROFILES' as check_type,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE role = 'admin') as admin_count
FROM profiles;

RAISE NOTICE '✓ Admin access fixed for corporativo@morises.com';
RAISE NOTICE '✓ Testimonials table created with demo data';
RAISE NOTICE '✓ Destinations catalog created with 6 Mexican destinations';
RAISE NOTICE '✓ Auto-profile creation trigger configured';
RAISE NOTICE '✓ All existing users synced to profiles';
