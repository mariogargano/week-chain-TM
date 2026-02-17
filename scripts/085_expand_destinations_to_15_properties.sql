-- Expand destinations catalog from 12 to 15 properties with PROFECO disclaimers
-- All properties follow REQUEST → OFFER → CONFIRM workflow

-- Add 3 more high-quality destinations to existing catalog

INSERT INTO properties (
  id,
  name,
  description,
  location,
  location_group,
  status,
  total_weeks,
  weeks_sold,
  price,
  valor_total_usd,
  image_url,
  created_at,
  updated_at
) VALUES
-- Property 13: Whistler Mountain Lodge, Canada
(
  'fdbf0f3e-c5b4-4c8f-9d3e-8a1b2c3d4e5f'::uuid,
  'Whistler Mountain Lodge',
  'Lodge de montaña con acceso directo a pistas de esquí de clase mundial. Ubicado en Whistler Village con vistas panorámicas a las montañas. Incluye spa, restaurante gourmet y ski-in/ski-out. Ideal para invierno y verano con actividades todo el año.',
  'Whistler, BC, Canadá',
  'North America',
  'active',
  52,
  0,
  4200.00,
  218400.00,
  '/whistler-mountain-lodge-canada.jpg',
  NOW(),
  NOW()
),
-- Property 14: Amalfi Coast Villa, Italy
(
  '1e2f3g4h-5i6j-7k8l-9m0n-1o2p3q4r5s6t'::uuid,
  'Amalfi Coast Villa',
  'Villa mediterránea con terraza panorámica sobre el Mar Tirreno. Arquitectura tradicional italiana con jardines en terrazas, piscina infinity y acceso privado a playa. A minutos de Positano y Amalfi. Incluye servicio de chef opcional.',
  'Costa Amalfitana, Campania, Italia',
  'Europe',
  'active',
  52,
  0,
  5800.00,
  301600.00,
  '/amalfi-coast-villa-italy.jpg',
  NOW(),
  NOW()
),
-- Property 15: Playa del Carmen Beachfront Condo, Mexico
(
  '2f3g4h5i-6j7k-8l9m-0n1o-2p3q4r5s6t7u'::uuid,
  'Playa del Carmen Beachfront Condo',
  'Condominio frente al mar en la famosa 5ta Avenida de Playa del Carmen. Vista directa al Caribe mexicano, a pasos de restaurantes, tiendas y vida nocturna. Amenidades incluyen piscina en rooftop, gimnasio y seguridad 24/7.',
  'Playa del Carmen, Quintana Roo, México',
  'North America',
  'active',
  52,
  0,
  3800.00,
  197600.00,
  '/playa-del-carmen-beachfront-condo.jpg',
  NOW(),
  NOW()
);

-- Update public_destinations_catalog view to include new properties
DROP VIEW IF EXISTS public_destinations_catalog;

CREATE OR REPLACE VIEW public_destinations_catalog AS
SELECT 
  p.id,
  p.name,
  p.description,
  p.location,
  p.location_group,
  p.image_url,
  p.status,
  p.price as base_price_usd,
  p.total_weeks,
  p.weeks_sold,
  -- Calculate availability percentage
  CASE 
    WHEN p.total_weeks > 0 THEN 
      ROUND((100.0 * (p.total_weeks - p.weeks_sold) / p.total_weeks), 1)
    ELSE 0
  END as availability_percentage,
  -- PROFECO-compliant disclaimer
  'Las solicitudes de uso vacacional están sujetas a disponibilidad y confirmación mediante el flujo REQUEST → OFFER → CONFIRM. Este catálogo NO garantiza la disponibilidad de destinos específicos. Los certificados WEEK-CHAIN otorgan derechos personales y temporales de solicitud (no propiedad). No constituyen tiempo compartido, inversión ni generan rendimientos garantizados.' as legal_disclaimer,
  p.created_at,
  p.updated_at
FROM properties p
WHERE p.status = 'active'
ORDER BY p.location_group, p.name;

-- Grant access to public
GRANT SELECT ON public_destinations_catalog TO anon, authenticated;

-- Add helpful comments
COMMENT ON VIEW public_destinations_catalog IS 'Catálogo público de 15 destinos participantes WEEK-CHAIN con disclaimers PROFECO-compliant. Todos los destinos operan bajo REQUEST → OFFER → CONFIRM workflow sin garantías de disponibilidad específica.';

COMMENT ON COLUMN public_destinations_catalog.availability_percentage IS 'Porcentaje indicativo de disponibilidad. NO garantiza confirmación de solicitudes.';

COMMENT ON COLUMN public_destinations_catalog.legal_disclaimer IS 'Disclaimer legal obligatorio según regulaciones PROFECO. Debe mostrarse junto a cada propiedad en UI pública.';
