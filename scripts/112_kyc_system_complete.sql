-- Ensure kyc_users table exists with all needed columns
CREATE TABLE IF NOT EXISTS public.kyc_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'missing' CHECK (status IN ('missing', 'pending', 'approved', 'failed')),
  persona_inquiry_id TEXT,
  persona_session_token TEXT,
  kyc_updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT kyc_users_user_id_unique UNIQUE (user_id)
);

-- Add missing columns if table already exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'kyc_users' AND column_name = 'persona_session_token') THEN
    ALTER TABLE public.kyc_users ADD COLUMN persona_session_token TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'kyc_users' AND column_name = 'kyc_updated_at') THEN
    ALTER TABLE public.kyc_users ADD COLUMN kyc_updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
  -- Ensure status has the right default
  ALTER TABLE public.kyc_users ALTER COLUMN status SET DEFAULT 'missing';
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_kyc_users_user_id ON public.kyc_users(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_users_persona_inquiry_id ON public.kyc_users(persona_inquiry_id);
CREATE INDEX IF NOT EXISTS idx_kyc_users_status ON public.kyc_users(status);

-- RLS
ALTER TABLE public.kyc_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own kyc" ON public.kyc_users;
CREATE POLICY "Users can read own kyc" ON public.kyc_users
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage kyc" ON public.kyc_users;
CREATE POLICY "Service role can manage kyc" ON public.kyc_users
  FOR ALL USING (true) WITH CHECK (true);
