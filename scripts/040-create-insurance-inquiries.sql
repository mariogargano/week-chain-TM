-- Create insurance_inquiries table for WEEK-INSURANCE contact form
CREATE TABLE IF NOT EXISTS insurance_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  country_city TEXT NOT NULL,
  property_link TEXT,
  property_type TEXT NOT NULL,
  units INTEGER,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE insurance_inquiries ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (public form)
CREATE POLICY "Anyone can submit insurance inquiry"
  ON insurance_inquiries FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only authenticated admins can read
CREATE POLICY "Admins can read insurance inquiries"
  ON insurance_inquiries FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role IN ('admin', 'admin_super', 'admin_ops')
    )
  );
