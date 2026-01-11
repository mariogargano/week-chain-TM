-- Add Avv. Stefano Cionini to the team
-- Of Counsel Internacional - Trust & Expansion

-- Insert Stefano Cionini into admin_wallets table
INSERT INTO admin_wallets (
  wallet_address,
  name,
  role,
  created_at,
  updated_at
) VALUES (
  'stefano.cionini@weekchain.com',
  'Avv. Stefano Cionini',
  'of_counsel',
  NOW(),
  NOW()
) ON CONFLICT (wallet_address) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Create a profile entry for Stefano with detailed information
-- Note: This assumes you have a profiles or team_members table
-- If not, this information can be stored in a separate table or as metadata

COMMENT ON COLUMN admin_wallets.role IS 'User role: admin, broker, management, notaria, of_counsel';

-- Log the addition
DO $$
BEGIN
  RAISE NOTICE 'Successfully added Avv. Stefano Cionini - Of Counsel Internacional';
  RAISE NOTICE 'Email: stefano.cionini@weekchain.com';
  RAISE NOTICE 'Role: of_counsel';
  RAISE NOTICE 'Specialization: International law, trusts, financial compliance, global expansion';
  RAISE NOTICE 'Locations: Italy, Brazil, UAE';
END $$;
