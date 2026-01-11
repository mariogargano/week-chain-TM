-- ============================================================================
-- WEEK-CHAIN CRITICAL GO-LIVE FIX
-- ============================================================================
-- Execute this script IMMEDIATELY before beta test
-- Fixes all 6 critical blocking issues
-- ============================================================================

-- ============================================================================
-- ISSUE #1 & #2: CREATE MISSING TABLES
-- ============================================================================

-- Create testimonials table (ISSUE #1)
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_first_name TEXT NOT NULL,
  author_last_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  certificate_code TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  review_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create public_destinations_catalog table (ISSUE #2)
CREATE TABLE IF NOT EXISTS public.public_destinations_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location_group TEXT NOT NULL, -- 'caribe', 'pacifico', 'colonial', etc.
  description TEXT,
  image_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_destinations_catalog ENABLE ROW LEVEL SECURITY;

-- RLS Policies (read-only for public, admin can manage)
CREATE POLICY "Public can read approved testimonials"
  ON public.testimonials FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Admin can manage testimonials"
  ON public.testimonials FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Public can read destinations"
  ON public.public_destinations_catalog FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admin can manage destinations"
  ON public.public_destinations_catalog FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Insert demo data
INSERT INTO public.testimonials (author_first_name, author_last_name, author_email, certificate_code, rating, review_text, is_approved, approved_at) VALUES
  ('María', 'González', 'maria.g@email.com', 'WC-2024-1234-ABCD', 5, 'Excelente experiencia con WEEK-CHAIN. El proceso de solicitud fue claro y transparente. Recomendado.', true, NOW()),
  ('Carlos', 'Ramírez', 'carlos.r@email.com', 'WC-2024-5678-EFGH', 5, 'El servicio cumple con lo prometido. La plataforma es fácil de usar y el equipo responde rápido.', true, NOW()),
  ('Ana', 'Martínez', 'ana.m@email.com', 'WC-2024-9012-IJKL', 4, 'Buena experiencia en general. El dashboard es intuitivo y facilita gestionar las solicitudes.', true, NOW())
ON CONFLICT DO NOTHING;

INSERT INTO public.public_destinations_catalog (name, location_group, description, image_url, is_featured, display_order) VALUES
  ('Playa del Carmen', 'caribe', 'Riviera Maya - Caribe Mexicano', '/playa-del-carmen.jpg', true, 1),
  ('Tulum', 'caribe', 'Playas vírgenes y zona arqueológica', '/tulum-beach.jpg', true, 2),
  ('Cancún', 'caribe', 'Destino turístico premium del Caribe', '/cancun-paradise.jpg', true, 3),
  ('Puerto Vallarta', 'pacifico', 'Costa del Pacífico Mexicano', '/puerto-vallarta-beach.png', true, 4),
  ('Los Cabos', 'pacifico', 'Baja California Sur', '/los-cabos-golf.jpg', true, 5),
  ('Mérida', 'colonial', 'Capital cultural de Yucatán', '/merida-colonial.jpg', false, 6)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- ISSUE #5, #6, #7, #8: CONSENT ENFORCEMENT SYSTEM
-- ============================================================================

-- Create user_consents table for tracking ALL consents
CREATE TABLE IF NOT EXISTS public.user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL, -- 'terms', 'privacy', 'reservation', 'activation', 'offer_acceptance'
  consent_version TEXT NOT NULL, -- e.g., 'v1.0', '2025-01-01'
  consent_text_hash TEXT NOT NULL, -- SHA-256 hash of exact text shown
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Immutable: once recorded, cannot be changed
  CONSTRAINT no_updates CHECK (true)
);

-- Enable RLS
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own consents"
  ON public.user_consents FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own consents"
  ON public.user_consents FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admin can view all consents"
  ON public.user_consents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Prevent updates and deletes (append-only table)
CREATE POLICY "No one can update consents"
  ON public.user_consents FOR UPDATE
  USING (false);

CREATE POLICY "No one can delete consents"
  ON public.user_consents FOR DELETE
  USING (false);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_consents_user_id ON public.user_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_consents_consent_type ON public.user_consents(consent_type);
CREATE INDEX IF NOT EXISTS idx_user_consents_accepted_at ON public.user_consents(accepted_at DESC);

-- Helper function to check if user has valid consent
CREATE OR REPLACE FUNCTION public.has_valid_consent(
  p_user_id UUID,
  p_consent_type TEXT,
  p_required_version TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_consents
    WHERE user_id = p_user_id
      AND consent_type = p_consent_type
      AND (p_required_version IS NULL OR consent_version = p_required_version)
    ORDER BY accepted_at DESC
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get latest consent
CREATE OR REPLACE FUNCTION public.get_latest_consent(
  p_user_id UUID,
  p_consent_type TEXT
)
RETURNS TABLE (
  consent_version TEXT,
  accepted_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT uc.consent_version, uc.accepted_at
  FROM public.user_consents uc
  WHERE uc.user_id = p_user_id
    AND uc.consent_type = p_consent_type
  ORDER BY uc.accepted_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- CONFIGURE ADMIN USER
-- ============================================================================

-- Ensure admin_users table has user_id column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'admin_users' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.admin_users ADD COLUMN user_id UUID REFERENCES auth.users(id);
  END IF;
END $$;

-- Configure corporativo@morises.com as super admin
INSERT INTO public.admin_users (email, name, role, user_id)
SELECT 
  'corporativo@morises.com',
  'Corporativo Morises',
  'super_admin',
  id
FROM auth.users
WHERE email = 'corporativo@morises.com'
ON CONFLICT (email) 
DO UPDATE SET 
  role = 'super_admin',
  user_id = (SELECT id FROM auth.users WHERE email = 'corporativo@morises.com'),
  updated_at = NOW();

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify tables exist
DO $$
BEGIN
  RAISE NOTICE 'Testimonials table exists: %', 
    (SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'testimonials'));
  RAISE NOTICE 'Destinations catalog table exists: %', 
    (SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'public_destinations_catalog'));
  RAISE NOTICE 'User consents table exists: %', 
    (SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_consents'));
  RAISE NOTICE 'Admin user configured: %', 
    (SELECT EXISTS (SELECT 1 FROM public.admin_users WHERE email = 'corporativo@morises.com'));
END $$;
