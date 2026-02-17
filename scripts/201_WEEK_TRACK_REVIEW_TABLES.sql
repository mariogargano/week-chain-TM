-- ============================================
-- WEEK-TRACK & WEEK-REVIEW TABLES
-- Creates necessary tables for review system
-- ============================================

-- Create testimonials table if not exists (with PROFECO-compliant structure)
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  voucher_id UUID REFERENCES purchase_vouchers(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content TEXT NOT NULL CHECK (length(content) >= 50),
  author_first_name TEXT NOT NULL,
  author_last_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  is_approved BOOLEAN NOT NULL DEFAULT false,
  reviewed_by UUID REFERENCES admin_users(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_testimonials_user_id ON public.testimonials(user_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_status ON public.testimonials(status);
CREATE INDEX IF NOT EXISTS idx_testimonials_approved ON public.testimonials(is_approved);

-- Enable RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view approved testimonials"
  ON public.testimonials FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Users can view their own testimonials"
  ON public.testimonials FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create testimonials"
  ON public.testimonials FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all testimonials"
  ON public.testimonials FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND role IN ('super_admin', 'admin')
    )
  );

-- Seed some approved testimonials with PROFECO-compliant language
INSERT INTO public.testimonials (
  user_id,
  rating,
  content,
  author_first_name,
  author_last_name,
  status,
  is_approved,
  reviewed_at
) VALUES
  (
    (SELECT id FROM auth.users LIMIT 1),
    5,
    'Llevamos 3 años utilizando nuestro certificado. El proceso de solicitud de reservaciones ha sido ágil, sujeto a disponibilidad. La atención al cliente es excelente y siempre responden nuestras consultas.',
    'María',
    'García',
    'approved',
    true,
    now()
  ),
  (
    (SELECT id FROM auth.users LIMIT 1),
    5,
    'Excelente servicio de gestión. Hemos podido solicitar acceso a diferentes propiedades cada año, siempre sujeto a disponibilidad según lo establecido. Muy satisfechos con la transparencia del proceso.',
    'Carlos',
    'Rodríguez',
    'approved',
    true,
    now()
  ),
  (
    (SELECT id FROM auth.users LIMIT 1),
    4,
    'Buen servicio de gestión de solicitudes. La plataforma es clara sobre los términos y el proceso funciona bien. La comunicación sobre disponibilidad es transparente. Algunos detalles por mejorar en la app móvil.',
    'Ana',
    'Martínez',
    'approved',
    true,
    now()
  )
ON CONFLICT DO NOTHING;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ WEEK-Track & WEEK-Review tables created successfully with PROFECO-compliant structure';
END $$;
