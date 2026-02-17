-- Script to expand destinations catalog with 12 PROFECO-compliant properties
-- Version: 1.0
-- Created: 2024

-- First, ensure we have clean data by removing any demo/test properties
DELETE FROM properties WHERE name LIKE '%Demo%' OR name LIKE '%Test%';

-- Insert 12 diverse international properties for WEEK-CHAIN SVC platform
-- All properties include PROFECO-safe disclaimers in description

-- MEXICO PROPERTIES (4 destinations)

INSERT INTO properties (
  id,
  name,
  location,
  location_group,
  description,
  valor_total_usd,
  price,
  image_url,
  status,
  created_at,
  updated_at,
  total_weeks,
  weeks_sold
) VALUES (
  gen_random_uuid(),
  'Beachfront Resort Cancún',
  'Cancún, Quintana Roo, México',
  'MEXICO',
  'Resort frente al mar en la Zona Hotelera de Cancún. AVISO IMPORTANTE: Este certificado otorga derechos personales y temporales de solicitud de uso vacacional, NO constituye propiedad ni tiempo compartido. Todas las solicitudes están sujetas a disponibilidad y confirmación mediante el proceso REQUEST → OFFER → CONFIRM. No garantiza acceso a fechas, temporadas o destinos específicos.',
  2500000,
  5000,
  '/luxury-beachfront-resort-cancun-mexico.jpg',
  'available',
  NOW(),
  NOW(),
  52,
  0
),
(
  gen_random_uuid(),
  'Boutique Eco Resort Tulum',
  'Tulum, Quintana Roo, México',
  'MEXICO',
  'Resort ecológico boutique cerca de ruinas mayas y playas. AVISO: Derechos de solicitud temporal (hasta 15 años), NO es inversión ni propiedad. Sujeto a disponibilidad sin garantía de destinos específicos. Sistema REQUEST → OFFER → CONFIRM aplicable.',
  1800000,
  3800,
  '/boutique-eco-resort-tulum-mexico.jpg',
  'available',
  NOW(),
  NOW(),
  52,
  0
),
(
  gen_random_uuid(),
  'Modern Condo Puerto Vallarta',
  'Puerto Vallarta, Jalisco, México',
  'MEXICO',
  'Condominio moderno con vista al mar en la zona romántica. DISCLAIMER LEGAL: Certificado de solicitud de uso vacacional temporal (máx. 15 años). NO es tiempo compartido ni propiedad fraccionada. Sin garantías de ROI, rentas o valor futuro. Disponibilidad sujeta a confirmación.',
  1500000,
  3200,
  '/modern-condo-puerto-vallarta-mexico.jpg',
  'available',
  NOW(),
  NOW(),
  52,
  0
),
(
  gen_random_uuid(),
  'Luxury Villa Los Cabos',
  'Los Cabos, Baja California Sur, México',
  'MEXICO',
  'Villa de lujo con acceso a playa privada y servicios premium. IMPORTANTE: Sistema de Certificado Vacacional (SVC) otorga derechos personales de solicitud temporal. NO transfiere propiedad ni constituye inversión. Proceso: REQUEST → OFFER → CONFIRM. Sin garantías de disponibilidad específica.',
  3200000,
  6500,
  '/luxury-villa-los-cabos-mexico.jpg',
  'available',
  NOW(),
  NOW(),
  52,
  0
);

-- USA PROPERTIES (3 destinations)

INSERT INTO properties (
  id,
  name,
  location,
  location_group,
  description,
  valor_total_usd,
  price,
  image_url,
  status,
  created_at,
  updated_at,
  total_weeks,
  weeks_sold
) VALUES (
  gen_random_uuid(),
  'Oceanfront Condo Miami Beach',
  'Miami Beach, Florida, USA',
  'USA',
  'Modern oceanfront condo in South Beach with pool and gym. LEGAL NOTICE: Smart Vacational Certificate grants temporary personal usage rights (up to 15 years). NOT real estate ownership, timeshare, or investment. Subject to availability without guarantees. REQUEST → OFFER → CONFIRM process applies.',
  4500000,
  9000,
  '/modern-oceanfront-condo-miami-beach.jpg',
  'available',
  NOW(),
  NOW(),
  52,
  0
),
(
  gen_random_uuid(),
  'Luxury Resort Orlando',
  'Orlando, Florida, USA',
  'USA',
  'Family resort near major theme parks with full amenities. DISCLAIMER: Temporary usage request rights only. NO ownership, NO investment, NO guaranteed returns. All bookings subject to availability confirmation via REQUEST → OFFER → CONFIRM workflow.',
  3800000,
  7500,
  '/luxury-resort-near-disney-orlando.jpg',
  'available',
  NOW(),
  NOW(),
  52,
  0
),
(
  gen_random_uuid(),
  'Downtown Loft San Francisco',
  'San Francisco, California, USA',
  'USA',
  'Contemporary loft in downtown SF near tech hub. IMPORTANT: SVC provides temporary personal vacation usage rights (max 15 years). Not property transfer, timeshare or financial instrument. Availability-dependent. No specific destination guarantees.',
  5200000,
  10500,
  '/downtown-loft-san-francisco.jpg',
  'available',
  NOW(),
  NOW(),
  52,
  0
);

-- CANADA PROPERTIES (2 destinations)

INSERT INTO properties (
  id,
  name,
  location,
  location_group,
  description,
  valor_total_usd,
  price,
  image_url,
  status,
  created_at,
  updated_at,
  total_weeks,
  weeks_sold
) VALUES (
  gen_random_uuid(),
  'Mountain View Condo Vancouver',
  'Vancouver, British Columbia, Canada',
  'CANADA',
  'Ski-in/ski-out condo with mountain and city views. AVISO LEGAL: Certificado otorga derechos temporales de solicitud (hasta 15 años). NO es propiedad ni inversión. Sujeto a disponibilidad mediante REQUEST → OFFER → CONFIRM. Sin garantías de fechas específicas.',
  4200000,
  8500,
  '/mountain-view-condo-vancouver.jpg',
  'available',
  NOW(),
  NOW(),
  52,
  0
),
(
  gen_random_uuid(),
  'Luxury Apartment Toronto',
  'Toronto, Ontario, Canada',
  'CANADA',
  'Downtown luxury apartment near CN Tower and attractions. DISCLAIMER: Temporary vacation usage request system. NOT real estate, NOT timeshare. No ROI guarantees. Availability-based confirmation required via platform workflow.',
  3900000,
  7800,
  '/downtown-luxury-apartment-toronto.jpg',
  'available',
  NOW(),
  NOW(),
  52,
  0
);

-- BRAZIL PROPERTIES (2 destinations)

INSERT INTO properties (
  id,
  name,
  location,
  location_group,
  description,
  valor_total_usd,
  price,
  image_url,
  status,
  created_at,
  updated_at,
  total_weeks,
  weeks_sold
) VALUES (
  gen_random_uuid(),
  'Beachfront Resort Copacabana',
  'Rio de Janeiro, Brasil',
  'BRAZIL',
  'Iconic beachfront resort in Copacabana with ocean views. AVISO: Direitos pessoais e temporais de solicitação (até 15 anos). NÃO é propriedade nem investimento. Sujeito à disponibilidade via REQUEST → OFFER → CONFIRM. Sem garantias de datas específicas.',
  3500000,
  7000,
  '/beachfront-resort-copacabana-rio-de-janeiro.jpg',
  'available',
  NOW(),
  NOW(),
  52,
  0
),
(
  gen_random_uuid(),
  'Modern Penthouse São Paulo',
  'São Paulo, Brasil',
  'BRAZIL',
  'Luxury penthouse in business district with city views. IMPORTANTE: Sistema de certificado vacacional temporal. NÃO transfere propriedade nem constitui investimento. Disponibilidade sujeita a confirmação sem garantias específicas.',
  4100000,
  8200,
  '/modern-penthouse-sao-paulo-brazil.jpg',
  'available',
  NOW(),
  NOW(),
  52,
  0
);

-- EUROPE PROPERTIES (2 destinations)

INSERT INTO properties (
  id,
  name,
  location,
  location_group,
  description,
  valor_total_usd,
  price,
  image_url,
  status,
  created_at,
  updated_at,
  total_weeks,
  weeks_sold
) VALUES (
  gen_random_uuid(),
  'Tuscan Villa Countryside',
  'Tuscany, Italy',
  'EUROPE',
  'Historic villa in Tuscan countryside with vineyard views. LEGAL NOTE: Temporary personal vacation request rights (up to 15 years). NOT property ownership, timeshare, or investment vehicle. Subject to availability without specific guarantees.',
  5500000,
  11000,
  '/tuscan-villa-countryside-italy.jpg',
  'available',
  NOW(),
  NOW(),
  52,
  0
),
(
  gen_random_uuid(),
  'Beachfront Resort Albanian Riviera',
  'Albanian Riviera, Albania',
  'EUROPE',
  'Exclusive beachfront resort on pristine Albanian coast. DISCLAIMER: Smart Vacational Certificate provides temporal usage request system only. NO ownership rights, NO investment guarantees. REQUEST → OFFER → CONFIRM workflow applies.',
  2800000,
  5600,
  '/beachfront-resort-albanian-riviera.jpg',
  'available',
  NOW(),
  NOW(),
  52,
  0
);

-- Create view for public-facing destination catalog with disclaimers
CREATE OR REPLACE VIEW public_destinations_catalog AS
SELECT 
  id,
  name,
  location,
  location_group as region,
  SUBSTRING(description, 1, 150) as short_description,
  description as full_description_with_disclaimer,
  image_url,
  status,
  total_weeks,
  weeks_sold,
  ROUND((weeks_sold::numeric / NULLIF(total_weeks, 0)) * 100, 2) as occupancy_percentage,
  CASE 
    WHEN status = 'available' THEN true
    ELSE false
  END as accepting_requests
FROM properties
WHERE status IN ('available', 'coming_soon')
ORDER BY location_group, name;

-- Grant public read access to destination catalog view
GRANT SELECT ON public_destinations_catalog TO anon, authenticated;

COMMENT ON VIEW public_destinations_catalog IS 'Public-facing catalog of WEEK-CHAIN vacation destinations with PROFECO-compliant disclaimers. All properties listed are subject to REQUEST → OFFER → CONFIRM availability confirmation workflow.';
