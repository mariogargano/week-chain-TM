-- ========================================
-- PHASE A: Testimonials System
-- ========================================
-- Create testimonials table with RLS
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_first_name TEXT NOT NULL,
  city TEXT,
  pax INTEGER CHECK (pax IN (2, 4, 6, 8)),
  tier_label TEXT, -- e.g., "2 PAX / 1 Estancia"
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_testimonials_approved ON public.testimonials(is_approved, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_testimonials_user_id ON public.testimonials(user_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_rating ON public.testimonials(rating);

-- Enable RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view approved testimonials"
  ON public.testimonials
  FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Users can insert their own testimonials"
  ON public.testimonials
  FOR INSERT
  WITH CHECK (auth.uid() = user_id AND consent_given = true);

CREATE POLICY "Users can view their own testimonials"
  ON public.testimonials
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all testimonials"
  ON public.testimonials
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE id = auth.uid()
    )
  );

-- Function to update timestamps
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

-- Sample seed data (ONLY for testing - remove in production)
-- INSERT INTO public.testimonials (author_first_name, city, pax, tier_label, quote, rating, is_approved, consent_given, approved_at)
-- VALUES 
--   ('Carlos', 'Ciudad de México', 4, '4 PAX / 2 Estancias', 'Excelente servicio, pudimos disfrutar de unas vacaciones increíbles en Tulum. El proceso REQUEST → OFFER fue muy claro y rápido.', 5, true, true, NOW()),
--   ('María', 'Guadalajara', 2, '2 PAX / 1 Estancia', 'Sistema muy transparente, me encantó que todo esté sujeto a disponibilidad pero las opciones que nos ofrecieron fueron geniales.', 5, true, true, NOW()),
--   ('Roberto', 'Monterrey', 6, '6 PAX / 3 Estancias', 'Perfecto para familias grandes. Usamos 2 de nuestras 3 estancias anuales y fue una experiencia excelente.', 5, true, true, NOW());
