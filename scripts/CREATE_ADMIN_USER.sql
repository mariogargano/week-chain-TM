-- Insertar usuario administrador directamente en la tabla admin_users
-- Este script debe ejecutarse UNA SOLA VEZ

-- Primero, eliminar el admin existente si ya existe (para evitar duplicados)
DELETE FROM public.admin_users WHERE email = 'corporativo@morises.com';

-- Insertar el usuario administrador
-- Nota: El id debe coincidir con el user_id de auth.users de Supabase
INSERT INTO public.admin_users (id, email, name, role, password_hash, created_at, updated_at)
VALUES (
  gen_random_uuid(), -- Se generará automáticamente un UUID
  'corporativo@morises.com',
  'Administrador WEEK-CHAIN',
  'super_admin',
  '', -- Password hash vacío para usuarios OAuth/Email
  NOW(),
  NOW()
);

-- Verificar que se insertó correctamente
SELECT * FROM public.admin_users WHERE email = 'corporativo@morises.com';
