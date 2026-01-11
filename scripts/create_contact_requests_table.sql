-- Create contact_requests table for Phase C
CREATE TABLE IF NOT EXISTS public.contact_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  category TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'archived')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  assigned_to UUID REFERENCES public.admin_users(id),
  user_id UUID REFERENCES auth.users(id),
  ip_address TEXT,
  user_agent TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES public.admin_users(id),
  resolution_notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_contact_requests_email ON public.contact_requests(email);
CREATE INDEX IF NOT EXISTS idx_contact_requests_status ON public.contact_requests(status);
CREATE INDEX IF NOT EXISTS idx_contact_requests_category ON public.contact_requests(category);
CREATE INDEX IF NOT EXISTS idx_contact_requests_assigned_to ON public.contact_requests(assigned_to);
CREATE INDEX IF NOT EXISTS idx_contact_requests_created_at ON public.contact_requests(created_at DESC);

-- Add RLS policies
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

-- Users can create their own contact requests
CREATE POLICY "Users can create contact requests" ON public.contact_requests
  FOR INSERT
  WITH CHECK (true);

-- Users can view their own contact requests (if authenticated)
CREATE POLICY "Users can view own contact requests" ON public.contact_requests
  FOR SELECT
  USING (
    user_id = auth.uid() 
    OR user_id IS NULL
  );

-- Admins can view all contact requests
CREATE POLICY "Admins can view all contact requests" ON public.contact_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE id = auth.uid()
    )
  );

-- Admins can update contact requests
CREATE POLICY "Admins can update contact requests" ON public.contact_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE id = auth.uid()
    )
  );

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_contact_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contact_requests_updated_at_trigger
  BEFORE UPDATE ON public.contact_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_contact_requests_updated_at();

-- Add comment
COMMENT ON TABLE public.contact_requests IS 'Stores user contact form submissions with status tracking and admin assignment';
