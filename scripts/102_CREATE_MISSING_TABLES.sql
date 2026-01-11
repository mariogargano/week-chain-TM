-- ========================================
-- CRITICAL: Missing Tables for Platform
-- Run this FIRST before launching
-- ========================================

-- ========================================
-- 1. TESTIMONIALS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_first_name TEXT NOT NULL,
  city TEXT,
  pax INTEGER CHECK (pax IN (2, 4, 6, 8)),
  tier_label TEXT,
  quote TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) DEFAULT 5,
  photo_url TEXT,
  video_url TEXT,
  is_approved BOOLEAN DEFAULT FALSE,
  consent_given BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES public.admin_users(id)
);

CREATE INDEX IF NOT EXISTS idx_testimonials_approved ON public.testimonials(is_approved, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_testimonials_user_id ON public.testimonials(user_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_rating ON public.testimonials(rating);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view approved testimonials"
  ON public.testimonials FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Users can insert their own testimonials"
  ON public.testimonials FOR INSERT
  WITH CHECK (auth.uid() = user_id AND consent_given = true);

CREATE POLICY "Users can view their own testimonials"
  ON public.testimonials FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all testimonials"
  ON public.testimonials FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_testimonials_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER testimonials_updated_at
  BEFORE UPDATE ON public.testimonials
  FOR EACH ROW
  EXECUTE FUNCTION update_testimonials_timestamp();

-- Seed some demo testimonials (PROFECO-compliant)
INSERT INTO public.testimonials (author_first_name, city, pax, tier_label, quote, rating, is_approved, consent_given, approved_at)
VALUES 
  ('Carlos', 'Ciudad de México', 4, '4 PAX / 2 Estancias', 'Excelente experiencia con el servicio. El proceso de REQUEST → OFFER fue muy claro y transparente.', 5, true, true, NOW()),
  ('María', 'Guadalajara', 2, '2 PAX / 1 Estancia', 'Sistema muy transparente. Me gustó que todo esté sujeto a disponibilidad y las opciones fueron geniales.', 5, true, true, NOW()),
  ('Roberto', 'Monterrey', 6, '6 PAX / 3 Estancias', 'Perfecto para familias. Usamos 2 de nuestras 3 estancias anuales y todo funcionó excelente.', 5, true, true, NOW())
ON CONFLICT DO NOTHING;

-- ========================================
-- 2. DESTINATIONS CATALOG TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.public_destinations_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_name TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'México',
  region TEXT,
  city TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  coordinates JSONB, -- {lat: 20.xxx, lng: -105.xxx}
  popular_properties INTEGER DEFAULT 0,
  average_season TEXT,
  highlights TEXT[],
  best_months TEXT[],
  is_featured BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_destinations_country ON public.public_destinations_catalog(country);
CREATE INDEX IF NOT EXISTS idx_destinations_featured ON public.public_destinations_catalog(is_featured, display_order);
CREATE INDEX IF NOT EXISTS idx_destinations_city ON public.public_destinations_catalog(city);

ALTER TABLE public.public_destinations_catalog ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can view destinations
CREATE POLICY "Anyone can view destinations catalog"
  ON public.public_destinations_catalog FOR SELECT
  USING (true);

-- Admins can manage
CREATE POLICY "Admins can manage destinations catalog"
  ON public.public_destinations_catalog FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Seed Mexican destinations
INSERT INTO public.public_destinations_catalog (
  destination_name, country, region, city, description, popular_properties, 
  average_season, highlights, best_months, is_featured, display_order
)
VALUES 
  (
    'Playa del Carmen', 'México', 'Quintana Roo', 'Playa del Carmen',
    'Paraíso caribeño con playas de arena blanca y agua turquesa',
    15, 'Alta', 
    ARRAY['Playas vírgenes', 'Vida nocturna', 'Buceo', 'Quinta Avenida'],
    ARRAY['Diciembre', 'Enero', 'Febrero', 'Marzo'],
    true, 1
  ),
  (
    'Tulum', 'México', 'Quintana Roo', 'Tulum',
    'Ruinas mayas frente al mar y ambiente bohemio',
    12, 'Alta',
    ARRAY['Ruinas mayas', 'Cenotes', 'Playas eco-friendly', 'Gastronomía'],
    ARRAY['Noviembre', 'Diciembre', 'Enero', 'Febrero'],
    true, 2
  ),
  (
    'Cancún', 'México', 'Quintana Roo', 'Cancún',
    'Destino turístico de clase mundial con hoteles de lujo',
    20, 'Alta',
    ARRAY['Zona Hotelera', 'Isla Mujeres', 'Vida nocturna', 'Deportes acuáticos'],
    ARRAY['Diciembre', 'Enero', 'Febrero', 'Marzo', 'Abril'],
    true, 3
  ),
  (
    'Puerto Vallarta', 'México', 'Jalisco', 'Puerto Vallarta',
    'Encanto colonial con hermosas playas en el Pacífico',
    10, 'Media-Alta',
    ARRAY['Malecón', 'Playa Los Muertos', 'Zona Romántica', 'Gastronomía'],
    ARRAY['Noviembre', 'Diciembre', 'Enero', 'Febrero', 'Marzo'],
    true, 4
  ),
  (
    'Los Cabos', 'México', 'Baja California Sur', 'Los Cabos',
    'Lujo y aventura en el encuentro de dos mares',
    8, 'Alta',
    ARRAY['El Arco', 'Playas', 'Golf', 'Pesca deportiva'],
    ARRAY['Octubre', 'Noviembre', 'Diciembre', 'Enero'],
    true, 5
  ),
  (
    'Mérida', 'México', 'Yucatán', 'Mérida',
    'Ciudad colonial con acceso a cenotes y ruinas mayas',
    6, 'Media',
    ARRAY['Centro histórico', 'Cenotes', 'Uxmal', 'Gastronomía yucateca'],
    ARRAY['Noviembre', 'Diciembre', 'Enero', 'Febrero'],
    false, 6
  )
ON CONFLICT DO NOTHING;

-- ========================================
-- VERIFICATION QUERY
-- ========================================
-- Run this to verify tables exist:
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('testimonials', 'public_destinations_catalog');
