-- ============================================================================
-- WEEK-CHAIN PRODUCTION: SCRIPT DEFINITIVO - EJECUTAR PRIMERO
-- ============================================================================
-- Este script crea TODAS las tablas faltantes que bloquean la plataforma
-- INSTRUCCIONES: Ejecutar en Supabase Dashboard > SQL Editor
-- ============================================================================

-- 1. CREAR TABLA DE TESTIMONIOS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  destination TEXT,
  trip_date DATE,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para testimonios
CREATE INDEX IF NOT EXISTS idx_testimonials_approved ON public.testimonials(is_approved);
CREATE INDEX IF NOT EXISTS idx_testimonials_created ON public.testimonials(created_at DESC);

-- RLS para testimonios
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Testimonials are viewable by everyone"
  ON public.testimonials FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Users can create their own testimonials"
  ON public.testimonials FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Testimonios demo
INSERT INTO public.testimonials (name, email, rating, comment, destination, trip_date, is_approved)
VALUES 
  ('María González', 'maria@example.com', 5, 'Excelente experiencia con WEEK-CHAIN. Pude vacacionar en Playa del Carmen con mi familia sin complicaciones. El sistema de certificados es muy claro y transparente.', 'Playa del Carmen', '2024-07-15', true),
  ('Carlos Rodríguez', 'carlos@example.com', 5, 'La plataforma es muy intuitiva y el servicio de intermediación funcionó perfecto. Activé mi certificado y reservé mi semana en Tulum sin problemas.', 'Tulum', '2024-08-20', true),
  ('Ana Martínez', 'ana@example.com', 4, 'Muy buena experiencia. El proceso de REQUEST → OFFER → CONFIRM es transparente y profesional. Recomiendo WEEK-CHAIN a cualquiera que busque vacaciones accesibles.', 'Cancún', '2024-09-10', true)
ON CONFLICT DO NOTHING;

-- 2. CREAR TABLA DE DESTINOS (CATÁLOGO PÚBLICO)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.public_destinations_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  location_group TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  base_price_usd NUMERIC(10,2) DEFAULT 0,
  availability_percentage INTEGER DEFAULT 100,
  legal_disclaimer TEXT DEFAULT 'Destino de referencia. Disponibilidad sujeta a confirmación mediante flujo REQUEST → OFFER → CONFIRM. No constituye reserva garantizada.',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para destinos
CREATE INDEX IF NOT EXISTS idx_destinations_location ON public.public_destinations_catalog(location_group);
CREATE INDEX IF NOT EXISTS idx_destinations_active ON public.public_destinations_catalog(is_active);

-- RLS para destinos
ALTER TABLE public.public_destinations_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Destinations are viewable by everyone"
  ON public.public_destinations_catalog FOR SELECT
  USING (is_active = true);

-- Destinos demo (6 destinos mexicanos populares)
INSERT INTO public.public_destinations_catalog (name, location, location_group, description, image_url, base_price_usd, availability_percentage)
VALUES 
  ('Playa del Carmen Resort', 'Playa del Carmen, Quintana Roo', 'México - Caribe', 'Resort todo incluido en la Riviera Maya con acceso a playas paradisíacas', '/placeholder.svg?height=400&width=600', 1200, 85),
  ('Tulum Beach Club', 'Tulum, Quintana Roo', 'México - Caribe', 'Exclusivo club de playa con vistas a ruinas mayas y cenotes cercanos', '/placeholder.svg?height=400&width=600', 1500, 70),
  ('Cancún Paradise', 'Cancún, Quintana Roo', 'México - Caribe', 'Hotel zona hotelera con actividades acuáticas y entretenimiento nocturno', '/placeholder.svg?height=400&width=600', 1100, 90),
  ('Puerto Vallarta Marina', 'Puerto Vallarta, Jalisco', 'México - Pacífico', 'Resort frente al mar con marina privada y restaurantes gourmet', '/placeholder.svg?height=400&width=600', 1300, 75),
  ('Los Cabos Golf Resort', 'Los Cabos, Baja California Sur', 'México - Pacífico', 'Campo de golf profesional con vistas al océano y spa de lujo', '/placeholder.svg?height=400&width=600', 1600, 65),
  ('Mérida Colonial', 'Mérida, Yucatán', 'México - Cultural', 'Hotel boutique en centro histórico cerca de zonas arqueológicas', '/placeholder.svg?height=400&width=600', 900, 95)
ON CONFLICT DO NOTHING;

-- 3. VERIFICAR TABLA admin_users Y AGREGAR user_id SI FALTA
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'admin_users' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.admin_users ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON public.admin_users(user_id);
  END IF;
END $$;

-- 4. CONFIGURAR corporativo@morises.com COMO SUPER ADMIN
-- ============================================================================
-- Sincronizar con auth.users si existe
INSERT INTO public.admin_users (email, name, role, status, user_id)
SELECT 
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', 'Admin Principal'),
  'super_admin',
  'active',
  u.id
FROM auth.users u
WHERE u.email = 'corporativo@morises.com'
ON CONFLICT (email) 
DO UPDATE SET 
  role = 'super_admin',
  status = 'active',
  user_id = EXCLUDED.user_id,
  updated_at = NOW();

-- 5. CREAR TRIGGER PARA AUTO-CREAR PROFILES
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. VERIFICACIONES FINALES
-- ============================================================================
DO $$
DECLARE
  testimonials_count INTEGER;
  destinations_count INTEGER;
  admin_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO testimonials_count FROM public.testimonials;
  SELECT COUNT(*) INTO destinations_count FROM public.public_destinations_catalog;
  SELECT COUNT(*) INTO admin_count FROM public.admin_users WHERE email = 'corporativo@morises.com';
  
  RAISE NOTICE '✅ VERIFICACIÓN COMPLETADA:';
  RAISE NOTICE '   - Testimonios: % registros', testimonials_count;
  RAISE NOTICE '   - Destinos: % registros', destinations_count;
  RAISE NOTICE '   - Admin configurado: %', CASE WHEN admin_count > 0 THEN 'SÍ' ELSE 'NO' END;
END $$;

-- ============================================================================
-- FIN DEL SCRIPT - La plataforma debería funcionar ahora
-- ============================================================================
