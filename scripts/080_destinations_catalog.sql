-- Create destinations catalog table
CREATE TABLE IF NOT EXISTS public.destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  location_group TEXT NOT NULL, -- Mexico, USA, Canada, Brazil, Europe
  country_code TEXT NOT NULL, -- MX, US, CA, BR, IT, AL
  description TEXT,
  image_url TEXT,
  property_type TEXT, -- Resort, Condo, Villa, etc
  base_price_usd NUMERIC,
  availability_percentage NUMERIC DEFAULT 100,
  status TEXT DEFAULT 'available', -- available, coming_soon, waitlist
  featured BOOLEAN DEFAULT false,
  legal_disclaimer TEXT,
  metadata JSONB DEFAULT '{}',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_destinations_status ON public.destinations(status);
CREATE INDEX IF NOT EXISTS idx_destinations_location_group ON public.destinations(location_group);
CREATE INDEX IF NOT EXISTS idx_destinations_featured ON public.destinations(featured);

-- Enable RLS
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;

-- Public can view available destinations
CREATE POLICY "Anyone can view available destinations"
  ON public.destinations
  FOR SELECT
  USING (status IN ('available', 'coming_soon', 'waitlist'));

-- Admins can manage all destinations
CREATE POLICY "Admins can manage all destinations"
  ON public.destinations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE email = auth.jwt() ->> 'email'
      AND role = 'super_admin'
    )
  );

-- Seed 15 destinations with PROFECO-compliant disclaimers
INSERT INTO public.destinations (name, location, location_group, country_code, description, image_url, property_type, base_price_usd, availability_percentage, status, featured, legal_disclaimer, display_order) VALUES
-- MEXICO (5 destinos)
('AFLORA Tulum - Resort Ecológico', 'Tulum, Quintana Roo', 'México', 'MX', 'Resort boutique en la Riviera Maya con acceso a playa privada y cenotes naturales. Arquitectura sustentable integrada a la selva.', '/boutique-eco-resort-tulum-mexico.jpg', 'Resort Ecológico', 8500, 75, 'available', true, 'Solicitud sujeta a disponibilidad. No constituye propiedad ni inversión.', 1),
('Residencias Marina Cancún', 'Cancún, Quintana Roo', 'México', 'MX', 'Condominios frente al mar en zona hotelera con amenidades de lujo y acceso a club de playa exclusivo.', '/luxury-beachfront-resort-cancun-mexico.jpg', 'Condominio Resort', 7800, 60, 'available', true, 'Solicitud sujeta a disponibilidad. No constituye propiedad ni inversión.', 2),
('Hacienda Colonial Mérida', 'Mérida, Yucatán', 'México', 'MX', 'Hacienda restaurada en el corazón de Yucatán. Arquitectura colonial con amenidades modernas y acceso a rutas arqueológicas.', '/placeholder.svg?height=400&width=600', 'Hacienda Boutique', 6500, 80, 'available', false, 'Solicitud sujeta a disponibilidad. No constituye propiedad ni inversión.', 3),
('Vista Bahía Puerto Vallarta', 'Puerto Vallarta, Jalisco', 'México', 'MX', 'Departamentos con vista panorámica a Bahía de Banderas. Marina integrada y club de golf nearby.', '/placeholder.svg?height=400&width=600', 'Condominio Vista', 7200, 70, 'available', false, 'Solicitud sujeta a disponibilidad. No constituye propiedad ni inversión.', 4),
('Oasis Los Cabos', 'San José del Cabo, Baja California Sur', 'México', 'MX', 'Resort todo incluido en corredor turístico con acceso a playa, spa de clase mundial y campo de golf championship.', '/placeholder.svg?height=400&width=600', 'Resort Todo Incluido', 9200, 55, 'available', true, 'Solicitud sujeta a disponibilidad. No constituye propiedad ni inversión.', 5),

-- USA (4 destinos)
('Miami Beach Oceanfront', 'Miami Beach, Florida', 'USA', 'US', 'Condominio de lujo en icónico South Beach con acceso directo al océano y amenidades de 5 estrellas.', '/modern-oceanfront-condo-miami-beach.jpg', 'Condominio Oceanfront', 12500, 45, 'available', true, 'Request subject to availability. Does not constitute property or investment.', 6),
('Disney Vacation Villas', 'Orlando, Florida', 'USA', 'US', 'Villas familiares cerca de parques temáticos con piscina privada, cocina completa y transporte incluido.', '/luxury-resort-near-disney-orlando.jpg', 'Villa Familiar', 8900, 65, 'available', false, 'Request subject to availability. Does not constitute property or investment.', 7),
('Manhattan Sky Residences', 'Nueva York, NY', 'USA', 'US', 'Lofts modernos en Midtown Manhattan con vistas panorámicas. Acceso a rooftop lounge y servicios de concierge 24/7.', '/placeholder.svg?height=400&width=600', 'Loft Urbano', 15000, 30, 'waitlist', true, 'Request subject to availability. Does not constitute property or investment.', 8),
('Napa Valley Wine Estate', 'Napa, California', 'USA', 'US', 'Villa en viñedo boutique con tours de cata privados, vistas a valle y acceso a cocina gourmet.', '/placeholder.svg?height=400&width=600', 'Villa Viñedo', 11200, 50, 'coming_soon', false, 'Request subject to availability. Does not constitute property or investment.', 9),

-- CANADA (2 destinos)
('Vancouver Downtown Suites', 'Vancouver, British Columbia', 'Canadá', 'CA', 'Suites ejecutivas en downtown con vistas a montañas y harbor. Walking distance a Gastown y Stanley Park.', '/mountain-view-condo-vancouver.jpg', 'Suite Ejecutiva', 9800, 55, 'available', false, 'Request subject to availability. Does not constitute property or investment.', 10),
('Toronto Waterfront Lofts', 'Toronto, Ontario', 'Canadá', 'CA', 'Lofts modernos en harbourfront con acceso al Entertainment District y servicios premium.', '/downtown-luxury-apartment-toronto.jpg', 'Loft Waterfront', 10500, 60, 'available', false, 'Request subject to availability. Does not constitute property or investment.', 11),

-- BRAZIL (2 destinos)
('Copacabana Beach Resort', 'Río de Janeiro', 'Brasil', 'BR', 'Resort frente a la icónica Playa de Copacabana con vista al Cristo Redentor y amenidades brasileñas auténticas.', '/beachfront-resort-copacabana-rio-de-janeiro.jpg', 'Resort Playero', 7500, 70, 'available', true, 'Solicitação sujeita a disponibilidade. Não constitui propriedade ou investimento.', 12),
('Penthouse São Paulo', 'São Paulo', 'Brasil', 'BR', 'Penthouses modernos en Avenida Paulista con acceso a lo mejor de la ciudad cultural y financiera de Brasil.', '/modern-penthouse-sao-paulo-brazil.jpg', 'Penthouse Urbano', 8200, 65, 'available', false, 'Solicitação sujeita a disponibilidade. Não constitui propriedade ou investimento.', 13),

-- EUROPE (2 destinos)
('Tuscan Countryside Villa', 'Florencia, Toscana', 'Italia', 'IT', 'Villa tradicional toscana rodeada de viñedos con piscina infinity, cocina italiana y tours de vino incluidos.', '/tuscan-villa-countryside-italy.jpg', 'Villa Toscana', 13500, 40, 'coming_soon', true, 'Richiesta soggetta a disponibilità. Non costituisce proprietà o investimento.', 14),
('Albanian Riviera Beach Club', 'Sarandë, Vlorë', 'Albania', 'AL', 'Resort exclusivo en la Riviera Albanesa emergente con playas vírgenes del Mar Jónico y gastronomía mediterránea.', '/beachfront-resort-albanian-riviera.jpg', 'Beach Club Resort', 6800, 75, 'available', false, 'Kërkesa në varësi të disponueshmërisë. Nuk përbën pronë ose investim.', 15);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_destinations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER set_destinations_updated_at
  BEFORE UPDATE ON public.destinations
  FOR EACH ROW
  EXECUTE FUNCTION update_destinations_updated_at();
