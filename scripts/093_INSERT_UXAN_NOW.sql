-- ===================================================================
-- UXAN Property Insertion Script
-- ===================================================================
-- Purpose: Insert UXAN as a showcase property in the properties table
-- Model: REQUEST → OFFER → CONFIRM (no individual weeks)
-- ===================================================================

BEGIN;

-- Insert UXAN property
INSERT INTO public.properties (
  id,
  name,
  description,
  location,
  location_group,
  image_url,
  status,
  total_weeks,
  weeks_sold,
  unlock_status,
  unlock_order,
  created_at,
  updated_at
)
VALUES (
  gen_random_uuid(),
  'UXAN',
  'Ubicación privilegiada en la Riviera Maya, a 1 hora de Playa del Carmen y 2 horas del aeropuerto de Cancún. Arquitectura orgánica con estructuras de madera tipo domo, interiores bohemio-lujosos con materiales naturales (ratán, madera, jute, concreto pulido). Espacios dramáticos con techos altos y ventanales geométricos. Fusión perfecta de diseño contemporáneo con influencias mayas tradicionales.',
  'Tulum, Quintana Roo, México',
  'RIVIERA MAYA',
  '/images/12.jpeg',
  'available',
  52,
  0,
  'active',
  999,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Verification query
SELECT 
  id, 
  name, 
  location,
  location_group,
  status,
  created_at
FROM public.properties 
WHERE name = 'UXAN';

COMMIT;

-- ===================================================================
-- IMPORTANT: Execute this script in Supabase SQL Editor
-- Location: Connect > SQL Editor in v0 sidebar
-- ===================================================================
