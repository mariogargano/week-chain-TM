-- Ensure corporativo@morises.com has admin role in users table
-- This runs idempotently - if user exists, updates role; if not, waits for signup

UPDATE public.users
SET role = 'admin', updated_at = NOW()
WHERE email = 'corporativo@morises.com' AND role != 'admin';

-- Ensure admin_users entry exists for admin email
INSERT INTO public.admin_users (email, role, permissions)
VALUES ('corporativo@morises.com', 'super_admin', '{"full_access": true}'::jsonb)
ON CONFLICT (email) DO UPDATE SET role = 'super_admin', permissions = '{"full_access": true}'::jsonb;

-- Also ensure profiles table has admin role
UPDATE public.profiles
SET role = 'admin', updated_at = NOW()
WHERE email = 'corporativo@morises.com' AND (role IS NULL OR role != 'admin');
