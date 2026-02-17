-- Insert admin wallets with their roles
INSERT INTO admin_wallets (wallet_address, role, name, created_at, updated_at)
VALUES 
  ('B75BwNbSJtzcVX2wMtDj2GMttUCQ78rKuzxUQ6Q6rGS7', 'admin', 'Administrator', NOW(), NOW()),
  ('EZ2xgEBYyJNegSAjyf29VUNYG1Y3Hqj7JmPsRg4HS6Hp', 'management', 'Management Team', NOW(), NOW()),
  ('BCbje7Frx21KMzvCFKkaANHNryVYVKCJrGyXbXXoxZ9c', 'broker', 'Broker', NOW(), NOW()),
  ('BVcSbgw8p97CHkjyxC5czz5WTV9apBkg8tXPvww4vfow', 'notaria', 'Notaría', NOW(), NOW())
ON CONFLICT (wallet_address) 
DO UPDATE SET 
  role = EXCLUDED.role,
  name = EXCLUDED.name,
  updated_at = NOW();
