-- Demo Data for Investor Presentations
-- Creates sample properties and weeks for testing the complete flow

-- Insert demo property
INSERT INTO properties (
  id,
  name,
  location,
  description,
  total_weeks,
  base_price_usdc,
  image_url,
  status,
  presale_progress,
  created_at
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Villa Paraíso Cancún',
  'Cancún, Quintana Roo, México',
  'Lujosa villa frente al mar con 4 habitaciones, piscina privada y acceso directo a la playa. Perfecta para vacaciones familiares inolvidables.',
  52,
  5000.00,
  '/placeholder.svg?height=400&width=600',
  'active',
  15,
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  location = EXCLUDED.location,
  description = EXCLUDED.description,
  total_weeks = EXCLUDED.total_weeks,
  base_price_usdc = EXCLUDED.base_price_usdc,
  image_url = EXCLUDED.image_url,
  status = EXCLUDED.status,
  presale_progress = EXCLUDED.presale_progress;

-- Insert demo weeks (first 10 weeks for testing)
INSERT INTO weeks (property_id, week_number, start_date, end_date, price_usdc, season, status)
SELECT 
  '11111111-1111-1111-1111-111111111111',
  week_num,
  DATE '2025-01-01' + (week_num - 1) * INTERVAL '7 days',
  DATE '2025-01-01' + week_num * INTERVAL '7 days',
  CASE 
    WHEN week_num IN (1,2,51,52) THEN 10000.00  -- Ultra Alta
    WHEN week_num BETWEEN 12 AND 16 THEN 7500.00 -- Alta
    WHEN week_num BETWEEN 20 AND 30 THEN 5000.00 -- Media
    ELSE 3500.00 -- Baja
  END,
  CASE 
    WHEN week_num IN (1,2,51,52) THEN 'ultra_high'
    WHEN week_num BETWEEN 12 AND 16 THEN 'high'
    WHEN week_num BETWEEN 20 AND 30 THEN 'medium'
    ELSE 'low'
  END,
  'available'
FROM generate_series(1, 52) AS week_num
ON CONFLICT (property_id, week_number) DO UPDATE SET
  price_usdc = EXCLUDED.price_usdc,
  season = EXCLUDED.season,
  status = EXCLUDED.status;

-- Create demo user if not exists (for testing)
-- Note: This is just for reference, actual user creation happens through Supabase Auth
COMMENT ON TABLE properties IS 'Demo property ID: 11111111-1111-1111-1111-111111111111';
