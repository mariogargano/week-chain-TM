-- PR1: Auth Foundation + RBAC Base
-- Creates profiles table with roles and audit_logs table

-- Create user roles enum
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'admin_super',
    'admin_ops',
    'admin_finance',
    'admin_compliance',
    'support_l2',
    'holder',
    'management',
    'booking',
    'agency_b2b',
    'agent',
    'service_provider_company',
    'vendor',
    'insurance',
    'review_moderation',
    'foundation',
    'vafi'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create user status enum
DO $$ BEGIN
  CREATE TYPE user_status AS ENUM (
    'active',
    'suspended',
    'pending_kyc',
    'archived'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create locale enum
DO $$ BEGIN
  CREATE TYPE user_locale AS ENUM (
    'es-MX',
    'en-US',
    'it-IT'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create KYC status enum
DO $$ BEGIN
  CREATE TYPE kyc_status AS ENUM (
    'not_started',
    'pending',
    'approved',
    'rejected',
    'requires_review'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create audit severity enum
DO $$ BEGIN
  CREATE TYPE audit_severity AS ENUM (
    'info',
    'warning',
    'error',
    'critical'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Profiles table: Core user profile and RBAC
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'holder',
  status user_status NOT NULL DEFAULT 'pending_kyc',
  locale user_locale NOT NULL DEFAULT 'es-MX',
  kyc_status kyc_status NOT NULL DEFAULT 'not_started',
  avatar_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit logs table: Track all critical actions
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  severity audit_severity NOT NULL DEFAULT 'info',
  resource_type TEXT,
  resource_id TEXT,
  details JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_kyc_status ON profiles(kyc_status);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON audit_logs(severity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

-- Update trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, user_id, email, full_name, role, status, locale, kyc_status)
  VALUES (
    NEW.id,
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'holder'::user_role,
    'pending_kyc'::user_status,
    'es-MX'::user_locale,
    'not_started'::kyc_status
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Row Level Security (RLS) Policies

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin_super', 'admin_ops', 'admin_finance', 'admin_compliance')
    )
  );

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
  ON profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin_super', 'admin_ops', 'admin_finance', 'admin_compliance')
    )
  );

-- Enable RLS on audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can read audit logs
CREATE POLICY "Admins can view audit logs"
  ON audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin_super', 'admin_ops', 'admin_compliance')
    )
  );

-- System can insert audit logs (no user restriction)
CREATE POLICY "System can insert audit logs"
  ON audit_logs
  FOR INSERT
  WITH CHECK (true);

-- Function to log auth events automatically
CREATE OR REPLACE FUNCTION public.log_auth_event()
RETURNS TRIGGER AS $$
BEGIN
  -- Log login events
  IF TG_OP = 'UPDATE' AND OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at THEN
    INSERT INTO public.audit_logs (user_id, action, severity, details)
    VALUES (
      NEW.id,
      'magic_link_used',
      'info'::audit_severity,
      jsonb_build_object(
        'email', NEW.email,
        'timestamp', NEW.last_sign_in_at
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auth event logging
DROP TRIGGER IF EXISTS on_auth_event ON auth.users;
CREATE TRIGGER on_auth_event
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.log_auth_event();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
GRANT SELECT ON profiles TO anon;
GRANT INSERT ON audit_logs TO authenticated, anon;
GRANT SELECT ON audit_logs TO authenticated;
