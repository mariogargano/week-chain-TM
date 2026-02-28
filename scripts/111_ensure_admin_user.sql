-- Ensure corporativo@morises.com has admin role in users table
-- This runs idempotently - if user exists, updates role; if not, waits for signup

UPDATE public.users
SET role = 'admin', updated_at = NOW()
WHERE email = 'corporativo@morises.com' AND role != 'admin';

-- Ensure admin_users entry exists for admin email
-- admin_users columns: id, role, email, password_hash, name, updated_at, created_at
-- Add unique constraint on email if not exists, then upsert
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'admin_users_email_unique'
  ) THEN
    ALTER TABLE public.admin_users ADD CONSTRAINT admin_users_email_unique UNIQUE (email);
  END IF;
END $$;

-- Make password_hash nullable (admin uses Supabase Auth, not local password)
ALTER TABLE public.admin_users ALTER COLUMN password_hash DROP NOT NULL;

INSERT INTO public.admin_users (id, email, role, name, created_at, updated_at)
VALUES (gen_random_uuid(), 'corporativo@morises.com', 'super_admin', 'Admin Principal', NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET role = 'super_admin', updated_at = NOW();

-- Also ensure profiles table has admin role
UPDATE public.profiles
SET role = 'admin', updated_at = NOW()
WHERE email = 'corporativo@morises.com' AND (role IS NULL OR role != 'admin');
