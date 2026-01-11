-- Property Owner System Schema
-- This creates the complete database structure for property owners to submit properties,
-- sign contracts, and track their sales

-- Add property_owner role to users table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_enum') THEN
    CREATE TYPE user_role_enum AS ENUM ('user', 'admin', 'broker', 'notaria', 'management', 'property_owner');
  ELSE
    ALTER TYPE user_role_enum ADD VALUE IF NOT EXISTS 'property_owner';
  END IF;
END $$;

-- Property submissions table (before approval)
CREATE TABLE IF NOT EXISTS property_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Property Details
  property_name TEXT NOT NULL,
  property_description TEXT,
  property_location TEXT NOT NULL,
  property_address TEXT NOT NULL,
  property_type TEXT NOT NULL, -- villa, apartment, house, etc.
  total_area_sqm NUMERIC,
  bedrooms INTEGER,
  bathrooms INTEGER,
  amenities JSONB DEFAULT '[]'::jsonb,
  
  -- Financial Details
  total_value_usd NUMERIC NOT NULL,
  weeks_to_tokenize INTEGER NOT NULL DEFAULT 52,
  price_per_week_usd NUMERIC NOT NULL,
  
  -- Images and Documents
  images JSONB DEFAULT '[]'::jsonb, -- array of image URLs
  property_documents JSONB DEFAULT '[]'::jsonb, -- title deeds, etc.
  
  -- Contract and Legal
  contract_pdf_url TEXT,
  contract_signed_by_owner BOOLEAN DEFAULT FALSE,
  contract_signed_at TIMESTAMP WITH TIME ZONE,
  owner_signature_data TEXT, -- digital signature
  
  -- Approval Workflow
  status TEXT NOT NULL DEFAULT 'draft', -- draft, submitted, notary_review, admin_review, approved, rejected
  submitted_at TIMESTAMP WITH TIME ZONE,
  notary_reviewed_by UUID REFERENCES users(id),
  notary_reviewed_at TIMESTAMP WITH TIME ZONE,
  notary_status TEXT, -- approved, rejected, needs_changes
  notary_comments TEXT,
  admin_reviewed_by UUID REFERENCES users(id),
  admin_reviewed_at TIMESTAMP WITH TIME ZONE,
  admin_status TEXT, -- approved, rejected, needs_changes
  admin_comments TEXT,
  rejection_reason TEXT,
  
  -- Once approved, link to actual property
  approved_property_id UUID REFERENCES properties(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Property owner profiles (extended info)
CREATE TABLE IF NOT EXISTS property_owner_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
  -- Personal/Company Info
  company_name TEXT,
  tax_id TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  postal_code TEXT,
  
  -- Banking Info (encrypted in production)
  bank_name TEXT,
  bank_account_number TEXT,
  bank_routing_number TEXT,
  
  -- Verification
  identity_verified BOOLEAN DEFAULT FALSE,
  identity_document_url TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES users(id),
  
  -- Stats
  total_properties_submitted INTEGER DEFAULT 0,
  total_properties_approved INTEGER DEFAULT 0,
  total_revenue_usd NUMERIC DEFAULT 0,
  
  -- Virtual Office
  virtual_office_enabled BOOLEAN DEFAULT FALSE,
  virtual_office_id TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Property sales tracking for owners
CREATE TABLE IF NOT EXISTS property_owner_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Sales Data
  week_id UUID REFERENCES weeks(id),
  week_number INTEGER,
  sale_date TIMESTAMP WITH TIME ZONE NOT NULL,
  sale_price_usd NUMERIC NOT NULL,
  buyer_wallet TEXT,
  
  -- Revenue Distribution
  owner_revenue_usd NUMERIC NOT NULL, -- what owner receives
  platform_fee_usd NUMERIC NOT NULL,
  platform_fee_percentage NUMERIC NOT NULL,
  
  -- Payment
  payment_status TEXT DEFAULT 'pending', -- pending, processing, paid, failed
  payment_transaction_hash TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contract templates
CREATE TABLE IF NOT EXISTS contract_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name TEXT NOT NULL,
  template_type TEXT NOT NULL, -- property_listing, management_agreement, etc.
  template_content TEXT NOT NULL, -- HTML/PDF template with placeholders
  version TEXT NOT NULL DEFAULT '1.0',
  active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Signed contracts log
CREATE TABLE IF NOT EXISTS signed_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES property_submissions(id) ON DELETE CASCADE,
  contract_template_id UUID REFERENCES contract_templates(id),
  signer_id UUID NOT NULL REFERENCES users(id),
  signer_role TEXT NOT NULL, -- owner, notary, admin
  
  -- Contract Data
  contract_pdf_url TEXT NOT NULL,
  signature_data TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  
  signed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Notifications for property owners
CREATE TABLE IF NOT EXISTS owner_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  notification_type TEXT NOT NULL, -- submission_received, notary_approved, admin_approved, sale_made, payment_received
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT, -- where to navigate when clicked
  
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Related entities
  submission_id UUID REFERENCES property_submissions(id),
  property_id UUID REFERENCES properties(id),
  sale_id UUID REFERENCES property_owner_sales(id),
  
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_property_submissions_owner ON property_submissions(owner_id);
CREATE INDEX IF NOT EXISTS idx_property_submissions_status ON property_submissions(status);
CREATE INDEX IF NOT EXISTS idx_property_owner_sales_owner ON property_owner_sales(owner_id);
CREATE INDEX IF NOT EXISTS idx_property_owner_sales_property ON property_owner_sales(property_id);
CREATE INDEX IF NOT EXISTS idx_owner_notifications_owner ON owner_notifications(owner_id);
CREATE INDEX IF NOT EXISTS idx_owner_notifications_read ON owner_notifications(read);

-- RLS Policies
ALTER TABLE property_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_owner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_owner_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE owner_notifications ENABLE ROW LEVEL SECURITY;

-- Property submissions policies
CREATE POLICY "Owners can view their own submissions"
  ON property_submissions FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can create submissions"
  ON property_submissions FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their draft submissions"
  ON property_submissions FOR UPDATE
  USING (auth.uid() = owner_id AND status = 'draft');

CREATE POLICY "Notaries can view submitted properties"
  ON property_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'notaria'
    )
  );

CREATE POLICY "Admins can view all submissions"
  ON property_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can update submissions"
  ON property_submissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Owner profiles policies
CREATE POLICY "Owners can view their own profile"
  ON property_owner_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Owners can update their own profile"
  ON property_owner_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Owners can insert their own profile"
  ON property_owner_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Sales policies
CREATE POLICY "Owners can view their own sales"
  ON property_owner_sales FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Admins can view all sales"
  ON property_owner_sales FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Notifications policies
CREATE POLICY "Owners can view their own notifications"
  ON owner_notifications FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can update their own notifications"
  ON owner_notifications FOR UPDATE
  USING (auth.uid() = owner_id);

-- Insert default contract template
INSERT INTO contract_templates (template_name, template_type, template_content, version)
VALUES (
  'Standard Property Listing Agreement',
  'property_listing',
  '<html><body><h1>Property Listing Agreement</h1><p>This agreement is between {{owner_name}} and Week-Chain Platform...</p></body></html>',
  '1.0'
) ON CONFLICT DO NOTHING;

-- Function to create notification when submission status changes
CREATE OR REPLACE FUNCTION notify_owner_on_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != OLD.status THEN
    INSERT INTO owner_notifications (
      owner_id,
      notification_type,
      title,
      message,
      link,
      submission_id
    ) VALUES (
      NEW.owner_id,
      'status_change',
      'Property Submission Status Updated',
      'Your property submission "' || NEW.property_name || '" status changed to: ' || NEW.status,
      '/dashboard/owner/submissions/' || NEW.id,
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER property_submission_status_change
  AFTER UPDATE ON property_submissions
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION notify_owner_on_status_change();

-- Function to update owner profile stats
CREATE OR REPLACE FUNCTION update_owner_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    UPDATE property_owner_profiles
    SET 
      total_properties_approved = total_properties_approved + 1,
      updated_at = NOW()
    WHERE user_id = NEW.owner_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_owner_stats_on_approval
  AFTER UPDATE ON property_submissions
  FOR EACH ROW
  WHEN (NEW.status = 'approved' AND OLD.status != 'approved')
  EXECUTE FUNCTION update_owner_stats();
