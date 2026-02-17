-- Script para asegurar acceso de admin y verificar roles
-- Ejecutar este script para configurar correctamente el acceso de administrador

-- 1. Asegurar que el wallet del admin esté en admin_wallets
INSERT INTO admin_wallets (wallet_address, role, name, created_at, updated_at)
VALUES 
  ('B75BwNbSJtzcVX2wMtDj2GMttUCQ78rKuzxUQ6Q6rGS7', 'admin', 'Admin Principal', NOW(), NOW())
ON CONFLICT (wallet_address) 
DO UPDATE SET 
  role = 'admin',
  updated_at = NOW();

-- 2. Asegurar que el wallet esté en la tabla users
INSERT INTO users (id, wallet_address, email, full_name, role, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'B75BwNbSJtzcVX2wMtDj2GMttUCQ78rKuzxUQ6Q6rGS7', 'admin@week-chain.com', 'Admin Principal', 'admin', NOW(), NOW())
ON CONFLICT (wallet_address) 
DO UPDATE SET 
  role = 'admin',
  updated_at = NOW();

-- 3. Asegurar que el wallet esté en la tabla profiles
INSERT INTO profiles (id, username, display_name, role, created_at, updated_at)
SELECT 
  u.id,
  'admin',
  'Admin Principal',
  'admin',
  NOW(),
  NOW()
FROM users u
WHERE u.wallet_address = 'B75BwNbSJtzcVX2wMtDj2GMttUCQ78rKuzxUQ6Q6rGS7'
ON CONFLICT (id) 
DO UPDATE SET 
  role = 'admin',
  updated_at = NOW();

-- 4. Crear función para verificar rol de usuario
CREATE OR REPLACE FUNCTION get_user_role(wallet TEXT)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Primero buscar en admin_wallets
  SELECT role INTO user_role
  FROM admin_wallets
  WHERE wallet_address = wallet
  LIMIT 1;
  
  IF user_role IS NOT NULL THEN
    RETURN user_role;
  END IF;
  
  -- Luego buscar en users
  SELECT role INTO user_role
  FROM users
  WHERE wallet_address = wallet
  LIMIT 1;
  
  IF user_role IS NOT NULL THEN
    RETURN user_role;
  END IF;
  
  -- Finalmente buscar en profiles
  SELECT p.role INTO user_role
  FROM profiles p
  JOIN users u ON u.id = p.id
  WHERE u.wallet_address = wallet
  LIMIT 1;
  
  -- Si no se encuentra, retornar 'user' por defecto
  RETURN COALESCE(user_role, 'user');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Crear vista para monitoreo de roles
CREATE OR REPLACE VIEW v_user_roles AS
SELECT 
  COALESCE(u.wallet_address, aw.wallet_address) as wallet_address,
  COALESCE(u.full_name, aw.name, p.display_name) as name,
  COALESCE(aw.role, u.role, p.role, 'user') as role,
  CASE 
    WHEN aw.wallet_address IS NOT NULL THEN 'admin_wallets'
    WHEN u.wallet_address IS NOT NULL THEN 'users'
    WHEN p.id IS NOT NULL THEN 'profiles'
    ELSE 'none'
  END as source_table,
  GREATEST(u.updated_at, aw.updated_at, p.updated_at) as last_updated
FROM users u
FULL OUTER JOIN admin_wallets aw ON u.wallet_address = aw.wallet_address
FULL OUTER JOIN profiles p ON u.id = p.id;

-- 6. Verificar que el admin tiene acceso
SELECT 
  wallet_address,
  name,
  role,
  source_table
FROM v_user_roles
WHERE wallet_address = 'B75BwNbSJtzcVX2wMtDj2GMttUCQ78rKuzxUQ6Q6rGS7';
