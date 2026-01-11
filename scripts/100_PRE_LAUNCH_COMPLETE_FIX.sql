-- ============================================================================
-- WEEK-CHAIN PRE-LAUNCH COMPLETE FIX
-- Run this BEFORE tomorrow's test run with the team
-- ============================================================================
-- This script fixes ALL critical issues for corporativo@morises.com access
-- and email automation system
-- ============================================================================

-- PART 1: Fix admin_users table and corporativo@ access
-- ============================================================================

-- Add user_id column to admin_users if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'admin_users' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE admin_users ADD COLUMN user_id UUID REFERENCES auth.users(id);
    COMMENT ON COLUMN admin_users.user_id IS 'References auth.users for proper authentication';
  END IF;
END $$;

-- Create admin_audit_log if doesn't exist
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES admin_users(id),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin ON admin_audit_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created ON admin_audit_log(created_at DESC);

-- Enable RLS on admin_audit_log
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view audit logs
DROP POLICY IF EXISTS admin_can_view_audit_logs ON admin_audit_log;
CREATE POLICY admin_can_view_audit_logs ON admin_audit_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND status = 'active'
    )
  );

-- PART 2: Create automatic profile creation trigger
-- ============================================================================

-- Function to auto-create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_referral_code TEXT;
BEGIN
  -- Generate unique referral code
  v_referral_code := UPPER(LEFT(MD5(RANDOM()::TEXT || NEW.id::TEXT), 8));
  
  -- Ensure code is unique
  WHILE EXISTS (SELECT 1 FROM profiles WHERE referral_code = v_referral_code) LOOP
    v_referral_code := UPPER(LEFT(MD5(RANDOM()::TEXT || NEW.id::TEXT), 8));
  END LOOP;

  -- Create profile
  INSERT INTO public.profiles (
    id,
    email,
    display_name,
    avatar_url,
    role,
    referral_code,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    CASE 
      WHEN NEW.email = 'corporativo@morises.com' THEN 'admin'
      ELSE 'user'
    END,
    v_referral_code,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- PART 3: Sync existing auth.users with profiles
-- ============================================================================

-- Sync existing users that don't have profiles
INSERT INTO public.profiles (
  id,
  email,
  display_name,
  role,
  referral_code,
  created_at,
  updated_at
)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', SPLIT_PART(u.email, '@', 1)),
  CASE 
    WHEN u.email = 'corporativo@morises.com' THEN 'admin'
    ELSE 'user'
  END,
  UPPER(LEFT(MD5(RANDOM()::TEXT || u.id::TEXT), 8)),
  u.created_at,
  NOW()
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO NOTHING;

-- PART 4: Configure corporativo@morises.com as super admin
-- ============================================================================

-- Ensure corporativo@morises.com has admin role in profiles
UPDATE profiles 
SET role = 'admin',
    updated_at = NOW()
WHERE email = 'corporativo@morises.com';

-- Get or create admin_users entry for corporativo@morises.com
DO $$
DECLARE
  v_user_id UUID;
  v_admin_id UUID;
BEGIN
  -- Get user_id from auth.users
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'corporativo@morises.com';

  IF v_user_id IS NULL THEN
    RAISE NOTICE 'corporativo@morises.com not found in auth.users. User needs to sign up first with Google OAuth.';
  ELSE
    -- Check if admin_users entry exists
    SELECT id INTO v_admin_id
    FROM admin_users
    WHERE email = 'corporativo@morises.com';

    IF v_admin_id IS NULL THEN
      -- Create new admin_users entry
      INSERT INTO admin_users (
        email,
        name,
        role,
        status,
        user_id,
        created_at,
        updated_at
      ) VALUES (
        'corporativo@morises.com',
        'Corporativo WEEK-CHAIN',
        'super_admin',
        'active',
        v_user_id,
        NOW(),
        NOW()
      );
      RAISE NOTICE 'Created admin_users entry for corporativo@morises.com';
    ELSE
      -- Update existing entry
      UPDATE admin_users
      SET user_id = v_user_id,
          role = 'super_admin',
          status = 'active',
          updated_at = NOW()
      WHERE email = 'corporativo@morises.com';
      RAISE NOTICE 'Updated admin_users entry for corporativo@morises.com';
    END IF;
  END IF;
END $$;

-- PART 5: Email Automation Tables
-- ============================================================================

-- Create email_templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_type TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,
  variables JSONB DEFAULT '[]'::jsonb,
  active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_email_templates_type ON email_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_email_templates_active ON email_templates(active);

-- Create email_logs table
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_type TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  recipient_id UUID REFERENCES profiles(id),
  subject TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
  provider TEXT DEFAULT 'resend',
  provider_message_id TEXT,
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  bounced_at TIMESTAMPTZ,
  variables JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_created ON email_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_template ON email_logs(template_type);

-- Create email_unsubscribes table
CREATE TABLE IF NOT EXISTS email_unsubscribes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES profiles(id),
  reason TEXT,
  unsubscribed_at TIMESTAMPTZ DEFAULT now(),
  ip_address INET,
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_email_unsubscribes_email ON email_unsubscribes(email);

-- Create materialized view for email analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS email_analytics AS
SELECT
  template_type,
  DATE(created_at) as date,
  COUNT(*) as total_sent,
  COUNT(*) FILTER (WHERE status = 'delivered') as delivered,
  COUNT(*) FILTER (WHERE status = 'failed') as failed,
  COUNT(*) FILTER (WHERE status = 'bounced') as bounced,
  COUNT(*) FILTER (WHERE opened_at IS NOT NULL) as opened,
  COUNT(*) FILTER (WHERE clicked_at IS NOT NULL) as clicked,
  ROUND(
    (COUNT(*) FILTER (WHERE opened_at IS NOT NULL)::NUMERIC / 
     NULLIF(COUNT(*) FILTER (WHERE status = 'delivered'), 0)) * 100, 
    2
  ) as open_rate,
  ROUND(
    (COUNT(*) FILTER (WHERE clicked_at IS NOT NULL)::NUMERIC / 
     NULLIF(COUNT(*) FILTER (WHERE opened_at IS NOT NULL), 0)) * 100, 
    2
  ) as click_rate
FROM email_logs
GROUP BY template_type, DATE(created_at);

CREATE UNIQUE INDEX IF NOT EXISTS idx_email_analytics_unique 
  ON email_analytics (template_type, date);

-- Function to refresh email analytics
CREATE OR REPLACE FUNCTION refresh_email_analytics()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY email_analytics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if email is unsubscribed
CREATE OR REPLACE FUNCTION is_email_unsubscribed(p_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM email_unsubscribes WHERE email = p_email
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PART 6: Enable RLS on email tables
-- ============================================================================

ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_unsubscribes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_templates
DROP POLICY IF EXISTS admin_full_access_email_templates ON email_templates;
CREATE POLICY admin_full_access_email_templates ON email_templates
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND status = 'active'
    )
  );

-- RLS Policies for email_logs
DROP POLICY IF EXISTS admin_view_all_email_logs ON email_logs;
CREATE POLICY admin_view_all_email_logs ON email_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND status = 'active'
    )
  );

DROP POLICY IF EXISTS users_view_own_email_logs ON email_logs;
CREATE POLICY users_view_own_email_logs ON email_logs
  FOR SELECT
  USING (recipient_id = auth.uid());

-- RLS Policies for email_unsubscribes
DROP POLICY IF EXISTS users_manage_own_unsubscribe ON email_unsubscribes;
CREATE POLICY users_manage_own_unsubscribe ON email_unsubscribes
  FOR ALL
  USING (user_id = auth.uid());

-- PART 7: Seed default email templates (PROFECO-compliant)
-- ============================================================================

INSERT INTO email_templates (template_type, name, subject, body_html, body_text, variables, active) VALUES

-- Welcome email
('welcome', 'Bienvenida WEEK-CHAIN', 
 'Bienvenido a WEEK-CHAIN - Tu Certificado de Uso Vacacional',
 '<html><body><h1>¡Bienvenido a WEEK-CHAIN!</h1><p>Hola {{name}},</p><p>Gracias por registrarte en WEEK-CHAIN. Tu cuenta ha sido creada exitosamente.</p><p><strong>Importante:</strong> Los certificados WEEK-CHAIN otorgan derechos de solicitud de uso vacacional temporal (15 años). No constituyen propiedad inmobiliaria ni tiempo compartido.</p><p>Para completar tu perfil y explorar nuestros certificados disponibles, ingresa a tu dashboard.</p><p>Equipo WEEK-CHAIN</p></body></html>',
 'Bienvenido a WEEK-CHAIN\n\nHola {{name}},\n\nGracias por registrarte en WEEK-CHAIN.\n\nImportante: Los certificados otorgan derechos de solicitud de uso vacacional temporal (15 años). No constituyen propiedad inmobiliaria.\n\nEquipo WEEK-CHAIN',
 '["name", "email"]'::jsonb,
 true),

-- Certificate purchased
('certificate_purchased', 'Confirmación de Activación de Certificado',
 'Tu Certificado WEEK-CHAIN ha sido activado',
 '<html><body><h1>¡Certificado Activado!</h1><p>Hola {{name}},</p><p>Tu certificado {{certificate_name}} ha sido activado exitosamente.</p><p><strong>Detalles:</strong></p><ul><li>Certificado: {{certificate_name}}</li><li>PAX: {{pax}}</li><li>Vigencia: 15 años</li></ul><p><strong>Aviso Legal:</strong> Este certificado otorga derecho de solicitud de uso vacacional en propiedades participantes sujeto a disponibilidad. No constituye propiedad ni garantiza acceso en fechas específicas.</p><p>Puedes solicitar reservaciones desde tu dashboard.</p></body></html>',
 null,
 '["name", "certificate_name", "pax"]'::jsonb,
 true),

-- Reservation request submitted
('reservation_request_submitted', 'Solicitud de Reservación Recibida',
 'Hemos recibido tu solicitud de reservación',
 '<html><body><h1>Solicitud Recibida</h1><p>Hola {{name}},</p><p>Hemos recibido tu solicitud de reservación para {{property_name}}.</p><p><strong>Detalles:</strong></p><ul><li>Propiedad: {{property_name}}</li><li>Fechas: {{dates}}</li><li>Huéspedes: {{guests}}</li></ul><p>Nuestro equipo revisará la disponibilidad y te enviará una oferta en las próximas 48 horas.</p><p><strong>Recordatorio:</strong> La reservación está sujeta a disponibilidad y confirmación del operador.</p></body></html>',
 null,
 '["name", "property_name", "dates", "guests"]'::jsonb,
 true),

-- Reservation offer available
('reservation_offer_available', 'Oferta de Reservación Disponible',
 'Tu oferta de reservación está lista',
 '<html><body><h1>Oferta Disponible</h1><p>Hola {{name}},</p><p>Tenemos una oferta de reservación disponible para ti en {{property_name}}.</p><p><strong>Detalles de la Oferta:</strong></p><ul><li>Propiedad: {{property_name}}</li><li>Fechas: {{dates}}</li><li>Precio: {{price}}</li><li>Válida hasta: {{expires_at}}</li></ul><p>Ingresa a tu dashboard para revisar y confirmar la oferta.</p><p><strong>Nota:</strong> Esta oferta expira en {{hours_valid}} horas.</p></body></html>',
 null,
 '["name", "property_name", "dates", "price", "expires_at", "hours_valid"]'::jsonb,
 true),

-- Reservation confirmed
('reservation_confirmed', 'Reservación Confirmada',
 '¡Tu reservación en {{property_name}} está confirmada!',
 '<html><body><h1>Reservación Confirmada</h1><p>Hola {{name}},</p><p>¡Excelentes noticias! Tu reservación ha sido confirmada.</p><p><strong>Detalles:</strong></p><ul><li>Propiedad: {{property_name}}</li><li>Check-in: {{checkin_date}}</li><li>Check-out: {{checkout_date}}</li><li>Código de Confirmación: {{confirmation_code}}</li></ul><p>Te enviaremos las instrucciones de llegada 48 horas antes del check-in.</p><p>¡Que disfrutes tu estancia!</p></body></html>',
 null,
 '["name", "property_name", "checkin_date", "checkout_date", "confirmation_code"]'::jsonb,
 true)

ON CONFLICT (template_type) DO NOTHING;

-- PART 8: Create indexes for performance
-- ============================================================================

-- Indexes on profiles for admin checks
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Indexes on admin_users for auth checks
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_status ON admin_users(status);

-- PART 9: Verification queries
-- ============================================================================

-- Run these to verify everything is set up correctly
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE 'WEEK-CHAIN PRE-LAUNCH VERIFICATION';
  RAISE NOTICE '============================================';
  
  -- Check if corporativo@morises.com exists in auth.users
  SELECT COUNT(*) INTO v_count FROM auth.users WHERE email = 'corporativo@morises.com';
  RAISE NOTICE '1. corporativo@morises.com in auth.users: % (must sign up first with Google if 0)', v_count;
  
  -- Check if corporativo@ has admin role in profiles
  SELECT COUNT(*) INTO v_count FROM profiles WHERE email = 'corporativo@morises.com' AND role = 'admin';
  RAISE NOTICE '2. corporativo@ has admin role in profiles: %', v_count;
  
  -- Check if corporativo@ exists in admin_users
  SELECT COUNT(*) INTO v_count FROM admin_users WHERE email = 'corporativo@morises.com';
  RAISE NOTICE '3. corporativo@ in admin_users: %', v_count;
  
  -- Check email templates
  SELECT COUNT(*) INTO v_count FROM email_templates WHERE active = true;
  RAISE NOTICE '4. Active email templates: % (should be 5)', v_count;
  
  -- Check if trigger exists
  SELECT COUNT(*) INTO v_count FROM pg_trigger WHERE tgname = 'on_auth_user_created';
  RAISE NOTICE '5. Profile auto-creation trigger exists: % (should be 1)', v_count;
  
  -- Check admin_users has user_id column
  SELECT COUNT(*) INTO v_count 
  FROM information_schema.columns 
  WHERE table_name = 'admin_users' AND column_name = 'user_id';
  RAISE NOTICE '6. admin_users.user_id column exists: % (should be 1)', v_count;
  
  RAISE NOTICE '============================================';
  RAISE NOTICE 'If all checks pass, system is ready for test run';
  RAISE NOTICE '============================================';
END $$;

-- Final success message
DO $$
BEGIN
  RAISE NOTICE ' ';
  RAISE NOTICE '✅ PRE-LAUNCH SETUP COMPLETE!';
  RAISE NOTICE ' ';
  RAISE NOTICE 'Next steps for tomorrow''s test:';
  RAISE NOTICE '1. corporativo@morises.com must sign up via Google OAuth at /auth';
  RAISE NOTICE '2. After signup, they can access admin panel at /dashboard/admin';
  RAISE NOTICE '3. Email automation is ready for testing';
  RAISE NOTICE '4. All database tables are configured';
  RAISE NOTICE ' ';
END $$;
