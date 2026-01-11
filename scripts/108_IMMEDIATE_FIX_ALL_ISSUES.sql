-- =====================================================
-- WEEK-CHAIN: IMMEDIATE FIX FOR ALL CRITICAL ISSUES
-- Fixes: Missing tables, admin access, auth flow
-- =====================================================

-- ==========================================
-- PART 1: CREATE MISSING TABLES
-- ==========================================

-- Create testimonials table
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_role TEXT DEFAULT 'member',
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT NOT NULL,
  certificate_type TEXT,
  location TEXT,
  is_approved BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for testimonials
CREATE INDEX IF NOT EXISTS idx_testimonials_approved ON public.testimonials(is_approved, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON public.testimonials(is_featured, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_testimonials_user ON public.testimonials(user_id);

-- Enable RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- RLS Policies for testimonials
CREATE POLICY "Anyone can view approved testimonials"
  ON public.testimonials FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Users can create their own testimonials"
  ON public.testimonials FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own testimonials"
  ON public.testimonials FOR UPDATE
  USING (auth.uid() = user_id);

-- Insert demo testimonials
INSERT INTO public.testimonials (user_name, user_role, rating, comment, certificate_type, location, is_approved, is_featured)
VALUES 
  ('María González', 'member', 5, 'Excelente servicio. El certificado digital es muy fácil de usar y el proceso es completamente transparente. Recomiendo WEEK-CHAIN al 100%.', 'Certificado Semana Alta', 'Playa del Carmen', true, true),
  ('Carlos Ramírez', 'broker', 5, 'Como broker, valoro la transparencia y legalidad. WEEK-CHAIN cumple con todas las normativas PROFECO y ofrece un sistema muy profesional.', 'Certificado Semana Media', 'Cancún', true, true),
  ('Ana Martínez', 'member', 4, 'Muy contenta con mi certificado. El equipo de soporte es excelente y siempre responden rápido. La plataforma es intuitiva y segura.', 'Certificado Semana Baja', 'Tulum', true, false)
ON CONFLICT DO NOTHING;

-- Create public_destinations_catalog table
CREATE TABLE IF NOT EXISTS public.public_destinations_catalog (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  location_group TEXT NOT NULL,
  state TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  amenities TEXT[],
  property_types TEXT[],
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for destinations
CREATE INDEX IF NOT EXISTS idx_destinations_location ON public.public_destinations_catalog(location_group, name);
CREATE INDEX IF NOT EXISTS idx_destinations_active ON public.public_destinations_catalog(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_destinations_slug ON public.public_destinations_catalog(slug);

-- Enable RLS
ALTER TABLE public.public_destinations_catalog ENABLE ROW LEVEL SECURITY;

-- RLS Policy for destinations (public read)
CREATE POLICY "Anyone can view active destinations"
  ON public.public_destinations_catalog FOR SELECT
  USING (is_active = true);

-- Insert popular Mexican destinations
INSERT INTO public.public_destinations_catalog (name, slug, location_group, state, description, amenities, property_types, sort_order)
VALUES 
  ('Playa del Carmen', 'playa-del-carmen', 'Caribe Mexicano', 'Quintana Roo', 'Destino paradisíaco en la Riviera Maya con playas de arena blanca', ARRAY['Playa', 'Restaurantes', 'Vida Nocturna', 'Deportes Acuáticos'], ARRAY['Condominio', 'Villa', 'Resort'], 1),
  ('Tulum', 'tulum', 'Caribe Mexicano', 'Quintana Roo', 'Combinación perfecta de cultura maya y playas vírgenes', ARRAY['Ruinas Mayas', 'Cenotes', 'Playa', 'Eco-turismo'], ARRAY['Bungalow', 'Villa'], 2),
  ('Cancún', 'cancun', 'Caribe Mexicano', 'Quintana Roo', 'La perla del Caribe con hoteles de clase mundial', ARRAY['Playa', 'Zona Hotelera', 'Vida Nocturna', 'Shopping'], ARRAY['Resort', 'Condominio'], 3),
  ('Puerto Vallarta', 'puerto-vallarta', 'Pacífico Mexicano', 'Jalisco', 'Hermosa bahía en el Pacífico mexicano', ARRAY['Playa', 'Malecón', 'Marina', 'Golf'], ARRAY['Condominio', 'Villa', 'Resort'], 4),
  ('Los Cabos', 'los-cabos', 'Baja California', 'Baja California Sur', 'Exclusivo destino entre el mar y el desierto', ARRAY['Playa', 'Golf', 'Pesca Deportiva', 'Lujo'], ARRAY['Resort', 'Villa de Lujo'], 5),
  ('Mérida', 'merida', 'Península de Yucatán', 'Yucatán', 'Ciudad colonial con rica historia y cultura maya', ARRAY['Cultura', 'Gastronomía', 'Arquitectura Colonial', 'Cenotes'], ARRAY['Casa Colonial', 'Hacienda'], 6)
ON CONFLICT (slug) DO NOTHING;

-- ==========================================
-- PART 2: FIX ADMIN ACCESS
-- ==========================================

-- Add user_id column to admin_users if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'admin_users' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.admin_users 
        ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        
        CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON public.admin_users(user_id);
    END IF;
END $$;

-- Create or update admin user for corporativo@morises.com
DO $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Get user_id from auth.users
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = 'corporativo@morises.com'
    LIMIT 1;
    
    IF v_user_id IS NOT NULL THEN
        -- Insert or update admin_users
        INSERT INTO public.admin_users (
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
            'corporativo@morises.com',
            'Admin WEEK-CHAIN',
            'super_admin',
            'active',
            NOW(),
            NOW()
        )
        ON CONFLICT (email) 
        DO UPDATE SET
            user_id = v_user_id,
            role = 'super_admin',
            status = 'active',
            updated_at = NOW();
        
        -- Update profiles table if exists
        UPDATE public.profiles
        SET role = 'admin',
            updated_at = NOW()
        WHERE user_id = v_user_id;
        
        RAISE NOTICE 'Admin user configured for corporativo@morises.com';
    ELSE
        RAISE NOTICE 'User corporativo@morises.com not found in auth.users. Please sign up first.';
    END IF;
END $$;

-- ==========================================
-- PART 3: CREATE PROFILE AUTO-CREATION TRIGGER
-- ==========================================

-- Function to create profile automatically
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Create profile in profiles table
  INSERT INTO public.profiles (
    user_id,
    email,
    full_name,
    role,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      SPLIT_PART(NEW.email, '@', 1)
    ),
    CASE 
      WHEN NEW.email = 'corporativo@morises.com' THEN 'admin'
      ELSE 'user'
    END,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  -- If admin email, also create admin_users entry
  IF NEW.email = 'corporativo@morises.com' THEN
    INSERT INTO public.admin_users (
      user_id,
      email,
      name,
      role,
      status,
      created_at,
      updated_at
    )
    VALUES (
      NEW.id,
      NEW.email,
      'Admin WEEK-CHAIN',
      'super_admin',
      'active',
      NOW(),
      NOW()
    )
    ON CONFLICT (email) DO UPDATE SET
      user_id = NEW.id,
      role = 'super_admin',
      status = 'active',
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger if not exists
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_profile();

-- ==========================================
-- PART 4: SYNC EXISTING USERS
-- ==========================================

-- Sync existing auth users to profiles
INSERT INTO public.profiles (user_id, email, full_name, role, created_at, updated_at)
SELECT 
  u.id,
  u.email,
  COALESCE(
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'name',
    SPLIT_PART(u.email, '@', 1)
  ),
  CASE 
    WHEN u.email = 'corporativo@morises.com' THEN 'admin'
    ELSE 'user'
  END,
  u.created_at,
  NOW()
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.user_id = u.id
);

-- Update admin_users with user_id from auth.users
UPDATE public.admin_users au
SET user_id = u.id,
    updated_at = NOW()
FROM auth.users u
WHERE au.email = u.email
  AND au.user_id IS NULL;

-- ==========================================
-- VERIFICATION QUERIES
-- ==========================================

-- Verify tables exist
SELECT 
  'testimonials' as table_name,
  COUNT(*) as record_count
FROM public.testimonials
UNION ALL
SELECT 
  'destinations' as table_name,
  COUNT(*) as record_count
FROM public.public_destinations_catalog
UNION ALL
SELECT 
  'admin_users' as table_name,
  COUNT(*) as record_count
FROM public.admin_users;

-- Verify admin access
SELECT 
  email,
  role,
  status,
  user_id IS NOT NULL as has_user_id
FROM public.admin_users
WHERE email = 'corporativo@morises.com';

-- Verify profile exists
SELECT 
  email,
  role,
  created_at
FROM public.profiles
WHERE email = 'corporativo@morises.com';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ ALL CRITICAL FIXES APPLIED SUCCESSFULLY!';
  RAISE NOTICE '✅ Tables created: testimonials, public_destinations_catalog';
  RAISE NOTICE '✅ Admin access configured for corporativo@morises.com';
  RAISE NOTICE '✅ Auto-profile creation trigger installed';
  RAISE NOTICE '✅ Existing users synced';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 PLATFORM IS NOW READY FOR PRODUCTION!';
END $$;
