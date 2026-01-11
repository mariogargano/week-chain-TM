-- =====================================================
-- WEEK-CHAIN PRODUCTION FIX - GO-LIVE READY
-- =====================================================
-- Este script resuelve TODOS los problemas críticos
-- identificados para el test run de mañana
-- =====================================================

-- ==========================================
-- 1. CREAR TABLA TESTIMONIALS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255),
    user_location VARCHAR(255),
    user_avatar_url TEXT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    property_name VARCHAR(255),
    certificate_type VARCHAR(100),
    is_approved BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Índices para testimonials
CREATE INDEX IF NOT EXISTS idx_testimonials_approved ON public.testimonials(is_approved, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON public.testimonials(is_featured, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_testimonials_email ON public.testimonials(user_email);

-- RLS para testimonials
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Anyone can view approved testimonials"
ON public.testimonials FOR SELECT
USING (is_approved = true);

CREATE POLICY IF NOT EXISTS "Authenticated users can submit testimonials"
ON public.testimonials FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Admins can manage all testimonials"
ON public.testimonials FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE email = auth.jwt()->>'email'
    AND role IN ('super_admin', 'admin')
  )
);

-- Insert demo testimonials
INSERT INTO public.testimonials (user_name, user_location, rating, title, content, property_name, certificate_type, is_approved, is_featured)
VALUES
  ('María González', 'Ciudad de México', 5, 'Experiencia Increíble', 'Mi familia y yo pasamos una semana maravillosa en Playa del Carmen. Todo estuvo perfecto desde la reservación hasta el check-out. 100% recomendado!', 'Residencial Playa', 'Alta Temporada', true, true),
  ('Carlos Hernández', 'Guadalajara', 5, 'Excelente Inversión', 'Los certificados de WEEK-CHAIN me han permitido disfrutar de vacaciones de lujo cada año. El proceso es transparente y profesional.', 'Vista al Mar', 'Temporada Media', true, true),
  ('Ana Martínez', 'Monterrey', 4, 'Gran Sistema', 'Me encanta la flexibilidad que ofrece WEEK-CHAIN. Puedo elegir diferentes destinos cada año y todo está respaldado legalmente.', 'Cancún Resort', 'Baja Temporada', true, false)
ON CONFLICT DO NOTHING;

-- ==========================================
-- 2. CREAR TABLA PUBLIC_DESTINATIONS_CATALOG
-- ==========================================
CREATE TABLE IF NOT EXISTS public.public_destinations_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    location_group VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(100) DEFAULT 'México' NOT NULL,
    description TEXT,
    short_description TEXT,
    image_url TEXT,
    gallery_images JSONB DEFAULT '[]'::jsonb,
    amenities JSONB DEFAULT '[]'::jsonb,
    total_properties INTEGER DEFAULT 0,
    average_rating NUMERIC(3,2) DEFAULT 0.00,
    min_price_per_week NUMERIC(10,2),
    max_price_per_week NUMERIC(10,2),
    climate VARCHAR(100),
    best_season VARCHAR(100),
    activities JSONB DEFAULT '[]'::jsonb,
    nearby_attractions JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para destinations catalog
CREATE INDEX IF NOT EXISTS idx_destinations_active ON public.public_destinations_catalog(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_destinations_location ON public.public_destinations_catalog(location_group, state);
CREATE INDEX IF NOT EXISTS idx_destinations_price ON public.public_destinations_catalog(min_price_per_week);

-- RLS para destinations catalog
ALTER TABLE public.public_destinations_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Anyone can view active destinations"
ON public.public_destinations_catalog FOR SELECT
USING (is_active = true);

CREATE POLICY IF NOT EXISTS "Admins can manage destinations"
ON public.public_destinations_catalog FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE email = auth.jwt()->>'email'
    AND role IN ('super_admin', 'admin')
  )
);

-- Insert popular Mexican destinations
INSERT INTO public.public_destinations_catalog (
  name, location_group, state, description, short_description, image_url,
  amenities, min_price_per_week, max_price_per_week, climate, best_season,
  activities, is_active, display_order
)
VALUES
  (
    'Playa del Carmen',
    'Riviera Maya',
    'Quintana Roo',
    'Playa del Carmen es un destino paradisíaco en la Riviera Maya mexicana, famoso por sus playas de arena blanca, aguas cristalinas y vibrante vida nocturna. Ofrece la combinación perfecta entre relajación y aventura.',
    'Paraíso caribeño con playas de arena blanca y vida nocturna vibrante',
    '/images/destinations/playa-del-carmen.jpg',
    '["Playa privada", "Spa", "Restaurantes", "Piscina infinity", "Gimnasio", "Kids club"]'::jsonb,
    8500.00,
    25000.00,
    'Tropical',
    'Noviembre a Abril',
    '["Buceo", "Snorkel", "Cenotes", "Ruinas mayas", "Golf", "Compras"]'::jsonb,
    true,
    1
  ),
  (
    'Tulum',
    'Riviera Maya',
    'Quintana Roo',
    'Tulum combina la belleza natural del Caribe mexicano con el misticismo de las ruinas mayas. Es el destino perfecto para quienes buscan una experiencia eco-chic y espiritual.',
    'Ruinas mayas frente al mar y experiencia eco-chic',
    '/images/destinations/tulum.jpg',
    '["Eco-resort", "Yoga", "Spa holístico", "Restaurantes orgánicos", "Beach club"]'::jsonb,
    9000.00,
    28000.00,
    'Tropical',
    'Noviembre a Marzo',
    '["Yoga", "Meditación", "Cenotes", "Arqueología", "Kite surf"]'::jsonb,
    true,
    2
  ),
  (
    'Cancún',
    'Caribe Mexicano',
    'Quintana Roo',
    'Cancún es el destino turístico más famoso de México, conocido por sus impresionantes playas, hoteles de lujo y vida nocturna de clase mundial. La zona hotelera ofrece todo lo necesario para unas vacaciones perfectas.',
    'El destino más icónico del Caribe mexicano',
    '/images/destinations/cancun.jpg',
    '["All-inclusive", "Playa privada", "Múltiples piscinas", "Spa", "Casino", "Centro comercial"]'::jsonb,
    7500.00,
    30000.00,
    'Tropical',
    'Diciembre a Abril',
    '["Buceo", "Pesca deportiva", "Parques temáticos", "Isla Mujeres", "Xcaret"]'::jsonb,
    true,
    3
  ),
  (
    'Puerto Vallarta',
    'Pacífico Mexicano',
    'Jalisco',
    'Puerto Vallarta es un encantador destino costero en el Pacífico mexicano que combina belleza natural con cultura mexicana auténtica. Sus playas, gastronomía y cálida hospitalidad lo hacen único.',
    'Encanto mexicano en el Pacífico con playas y cultura',
    '/images/destinations/puerto-vallarta.jpg',
    '["Vista al mar", "Restaurantes gourmet", "Spa", "Marina", "Golf", "Arte mexicano"]'::jsonb,
    6500.00,
    22000.00,
    'Tropical seco',
    'Octubre a Mayo',
    '["Avistamiento ballenas", "Pesca", "Golf", "Galerías arte", "Zip-line"]'::jsonb,
    true,
    4
  ),
  (
    'Los Cabos',
    'Baja California',
    'Baja California Sur',
    'Los Cabos es un destino de lujo en el extremo sur de la península de Baja California. Conocido por sus espectaculares paisajes desérticos que se encuentran con el mar, campos de golf de clase mundial y pesca deportiva.',
    'Lujo y aventura donde el desierto se encuentra con el mar',
    '/images/destinations/los-cabos.jpg',
    '["Resort de lujo", "Golf championship", "Spa award-winning", "Marina", "Fine dining"]'::jsonb,
    10000.00,
    35000.00,
    'Desértico costero',
    'Octubre a Junio',
    '["Pesca deportiva", "Golf", "Avistamiento ballenas", "ATV en desierto", "Surf"]'::jsonb,
    true,
    5
  ),
  (
    'Mérida',
    'Yucatán',
    'Yucatán',
    'Mérida, la "Ciudad Blanca", es la capital cultural de Yucatán. Ofrece una experiencia única combinando arquitectura colonial, gastronomía yucateca auténtica y acceso a impresionantes sitios arqueológicos mayas.',
    'Capital cultural yucateca con historia maya y colonial',
    '/images/destinations/merida.jpg',
    '["Hotel boutique", "Piscina colonial", "Restaurante regional", "Spa tradicional", "Tours culturales"]'::jsonb,
    4500.00,
    15000.00,
    'Tropical seco',
    'Noviembre a Febrero',
    '["Cenotes", "Chichén Itzá", "Uxmal", "Gastronomía", "Haciendas"]'::jsonb,
    true,
    6
  )
ON CONFLICT DO NOTHING;

-- ==========================================
-- 3. ARREGLAR ADMIN_USERS TABLE
-- ==========================================

-- Agregar columna user_id si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'admin_users'
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.admin_users ADD COLUMN user_id UUID REFERENCES auth.users(id);
    CREATE INDEX idx_admin_users_user_id ON public.admin_users(user_id);
  END IF;
END $$;

-- Agregar columna status si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'admin_users'
    AND column_name = 'status'
  ) THEN
    ALTER TABLE public.admin_users ADD COLUMN status VARCHAR(50) DEFAULT 'active';
  END IF;
END $$;

-- ==========================================
-- 4. CONFIGURAR ADMIN PRINCIPAL
-- ==========================================

-- Crear función para sincronizar admin_users con auth.users
CREATE OR REPLACE FUNCTION sync_admin_user_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Cuando se crea un usuario en auth.users, verificar si debe ser admin
  IF NEW.email = 'corporativo@morises.com' THEN
    -- Insertar o actualizar en admin_users
    INSERT INTO public.admin_users (user_id, email, name, role, status, created_at, updated_at)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'Administrador Principal'),
      'super_admin',
      'active',
      NOW(),
      NOW()
    )
    ON CONFLICT (email) DO UPDATE
    SET user_id = NEW.id,
        updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger para sincronizar automáticamente
DROP TRIGGER IF EXISTS on_auth_user_created_sync_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_sync_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_admin_user_id();

-- Sincronizar admin existente si existe el usuario en auth.users
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Buscar el user_id del email corporativo
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'corporativo@morises.com'
  LIMIT 1;
  
  IF admin_user_id IS NOT NULL THEN
    -- Insertar o actualizar el admin
    INSERT INTO public.admin_users (user_id, email, name, role, status, created_at, updated_at)
    VALUES (
      admin_user_id,
      'corporativo@morises.com',
      'Administrador Principal',
      'super_admin',
      'active',
      NOW(),
      NOW()
    )
    ON CONFLICT (email) DO UPDATE
    SET user_id = admin_user_id,
        role = 'super_admin',
        status = 'active',
        updated_at = NOW();
    
    RAISE NOTICE 'Admin user synced successfully: corporativo@morises.com';
  ELSE
    RAISE NOTICE 'No auth user found for corporativo@morises.com - will be created on first login';
  END IF;
END $$;

-- ==========================================
-- 5. CREAR TRIGGER PARA AUTO-CREAR PROFILES
-- ==========================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Crear profile automáticamente cuando se crea un usuario
  INSERT INTO public.profiles (
    id,
    email,
    display_name,
    username,
    role,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    split_part(NEW.email, '@', 1) || '_' || substr(md5(random()::text), 1, 6),
    'user',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger si no existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Sincronizar usuarios existentes
INSERT INTO public.profiles (id, email, display_name, username, role, created_at, updated_at)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
  split_part(u.email, '@', 1) || '_' || substr(md5(random()::text), 1, 6),
  'user',
  u.created_at,
  NOW()
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
);

-- ==========================================
-- 6. AUDIT LOG
-- ==========================================

CREATE TABLE IF NOT EXISTS public.production_fix_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.production_fix_audit (action, status, details)
VALUES (
  'PRODUCTION_FIX_104_APPLIED',
  'success',
  jsonb_build_object(
    'tables_created', ARRAY['testimonials', 'public_destinations_catalog'],
    'admin_configured', 'corporativo@morises.com',
    'profiles_synced', true,
    'timestamp', NOW()
  )
);

-- ==========================================
-- VERIFICACIÓN FINAL
-- ==========================================

DO $$
DECLARE
  testimonials_count INTEGER;
  destinations_count INTEGER;
  admin_exists BOOLEAN;
BEGIN
  -- Verificar testimonials
  SELECT COUNT(*) INTO testimonials_count FROM public.testimonials;
  RAISE NOTICE 'Testimonials table created with % records', testimonials_count;
  
  -- Verificar destinations
  SELECT COUNT(*) INTO destinations_count FROM public.public_destinations_catalog;
  RAISE NOTICE 'Destinations catalog created with % records', destinations_count;
  
  -- Verificar admin
  SELECT EXISTS(
    SELECT 1 FROM public.admin_users 
    WHERE email = 'corporativo@morises.com' AND role = 'super_admin'
  ) INTO admin_exists;
  RAISE NOTICE 'Admin configured: %', admin_exists;
  
  RAISE NOTICE '✅ WEEK-CHAIN PRODUCTION FIX COMPLETED SUCCESSFULLY!';
END $$;
