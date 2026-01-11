-- Email Automation System - Complete Setup with Test Flow
-- This script creates all necessary tables, functions, and seed data for the email automation system

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS public.email_logs CASCADE;
DROP TABLE IF EXISTS public.email_unsubscribes CASCADE;
DROP TABLE IF EXISTS public.email_templates CASCADE;
DROP MATERIALIZED VIEW IF EXISTS public.email_analytics CASCADE;

-- ====================================
-- 1. EMAIL TEMPLATES TABLE
-- ====================================
CREATE TABLE public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- 'welcome', 'certificate_purchased', 'reservation_request_submitted', etc.
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT, -- HTML version of email
  body_json JSONB, -- React Email JSON structure
  variables TEXT[] DEFAULT '{}', -- Array of required variables like {{userName}}, {{certificateId}}
  metadata JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  version INTEGER DEFAULT 1,
  
  -- Ensure only one active template per type
  CONSTRAINT unique_active_template UNIQUE (type, is_active) WHERE is_active = true
);

-- ====================================
-- 2. EMAIL LOGS TABLE
-- ====================================
CREATE TABLE public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.email_templates(id) ON DELETE SET NULL,
  template_type TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  recipient_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  body_html TEXT,
  variables_used JSONB DEFAULT '{}',
  
  -- Delivery tracking
  sent_at TIMESTAMPTZ DEFAULT now(),
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  bounced_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  
  -- Status
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed')),
  failed BOOLEAN DEFAULT false,
  error_message TEXT,
  
  -- Provider info
  provider_message_id TEXT,
  provider_response JSONB,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ====================================
-- 3. EMAIL UNSUBSCRIBES TABLE
-- ====================================
CREATE TABLE public.email_unsubscribes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  unsubscribed_from TEXT[] DEFAULT '{}', -- Specific email types unsubscribed from
  unsubscribed_at TIMESTAMPTZ DEFAULT now(),
  reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ====================================
-- 4. EMAIL ANALYTICS MATERIALIZED VIEW
-- ====================================
CREATE MATERIALIZED VIEW public.email_analytics AS
SELECT 
  template_type,
  COUNT(*) as total_sent,
  COUNT(CASE WHEN delivered_at IS NOT NULL THEN 1 END) as delivered,
  COUNT(CASE WHEN opened_at IS NOT NULL THEN 1 END) as opened,
  COUNT(CASE WHEN clicked_at IS NOT NULL THEN 1 END) as clicked,
  COUNT(CASE WHEN bounced_at IS NOT NULL THEN 1 END) as bounced,
  COUNT(CASE WHEN failed THEN 1 END) as failed,
  ROUND(
    (COUNT(CASE WHEN opened_at IS NOT NULL THEN 1 END)::NUMERIC / 
     NULLIF(COUNT(CASE WHEN delivered_at IS NOT NULL THEN 1 END), 0) * 100)::NUMERIC, 
    2
  ) as open_rate,
  ROUND(
    (COUNT(CASE WHEN clicked_at IS NOT NULL THEN 1 END)::NUMERIC / 
     NULLIF(COUNT(CASE WHEN opened_at IS NOT NULL THEN 1 END), 0) * 100)::NUMERIC, 
    2
  ) as click_rate,
  MIN(sent_at) as first_sent,
  MAX(sent_at) as last_sent
FROM public.email_logs
GROUP BY template_type;

-- Create index for refresh
CREATE UNIQUE INDEX ON public.email_analytics (template_type);

-- ====================================
-- 5. INDEXES FOR PERFORMANCE
-- ====================================
CREATE INDEX idx_email_templates_type ON public.email_templates(type);
CREATE INDEX idx_email_templates_status ON public.email_templates(status);
CREATE INDEX idx_email_templates_active ON public.email_templates(is_active);

CREATE INDEX idx_email_logs_recipient ON public.email_logs(recipient_email);
CREATE INDEX idx_email_logs_template ON public.email_logs(template_id);
CREATE INDEX idx_email_logs_type ON public.email_logs(template_type);
CREATE INDEX idx_email_logs_status ON public.email_logs(status);
CREATE INDEX idx_email_logs_sent_at ON public.email_logs(sent_at DESC);
CREATE INDEX idx_email_logs_user ON public.email_logs(recipient_user_id);

CREATE INDEX idx_email_unsubscribes_email ON public.email_unsubscribes(email);
CREATE INDEX idx_email_unsubscribes_user ON public.email_unsubscribes(user_id);

-- ====================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ====================================

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_unsubscribes ENABLE ROW LEVEL SECURITY;

-- Email Templates Policies
CREATE POLICY "Admins can manage all email templates"
  ON public.email_templates
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Anyone can view active templates"
  ON public.email_templates
  FOR SELECT
  USING (is_active = true AND status = 'active');

-- Email Logs Policies
CREATE POLICY "Admins can view all email logs"
  ON public.email_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can view their own email logs"
  ON public.email_logs
  FOR SELECT
  USING (recipient_user_id = auth.uid());

CREATE POLICY "Service role can insert email logs"
  ON public.email_logs
  FOR INSERT
  WITH CHECK (true);

-- Email Unsubscribes Policies
CREATE POLICY "Users can manage their own unsubscribes"
  ON public.email_unsubscribes
  FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Service role can check unsubscribes"
  ON public.email_unsubscribes
  FOR SELECT
  USING (true);

-- ====================================
-- 7. HELPER FUNCTIONS
-- ====================================

-- Function to check if email is unsubscribed
CREATE OR REPLACE FUNCTION public.is_email_unsubscribed(p_email TEXT, p_template_type TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
  v_unsubscribed BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM public.email_unsubscribes
    WHERE email = p_email
    AND (
      p_template_type IS NULL 
      OR p_template_type = ANY(unsubscribed_from)
      OR array_length(unsubscribed_from, 1) IS NULL -- Unsubscribed from all
    )
  ) INTO v_unsubscribed;
  
  RETURN v_unsubscribed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to refresh email analytics
CREATE OR REPLACE FUNCTION public.refresh_email_analytics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.email_analytics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================
-- 8. TRIGGER FOR UPDATED_AT
-- ====================================
CREATE OR REPLACE FUNCTION public.update_email_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_email_templates_timestamp
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_email_templates_updated_at();

-- ====================================
-- 9. SEED DEFAULT PROFECO-COMPLIANT TEMPLATES
-- ====================================

-- Template 1: Welcome Email
INSERT INTO public.email_templates (type, name, subject, body_html, variables, status, is_active) VALUES
('welcome', 'Bienvenida WEEK-CHAIN', 'Bienvenido a WEEK-CHAIN - Tu Certificado Digital de Uso Vacacional', 
'<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #1e293b;">¡Bienvenido a WEEK-CHAIN, {{userName}}!</h1>
  <p>Gracias por unirte a nuestra plataforma de Certificados Digitales de Uso Vacacional (SVC).</p>
  
  <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="color: #0f172a; margin-top: 0;">⚠️ Aviso Legal Importante</h3>
    <p style="margin: 10px 0;"><strong>WEEK-CHAIN NO es:</strong></p>
    <ul style="margin: 10px 0;">
      <li>Propiedad inmobiliaria ni fraccionamiento</li>
      <li>Tiempo compartido tradicional</li>
      <li>Inversión financiera ni genera rendimientos</li>
      <li>Garantía de destinos específicos</li>
    </ul>
    <p style="margin: 10px 0;"><strong>WEEK-CHAIN SÍ es:</strong></p>
    <ul style="margin: 10px 0;">
      <li>Sistema de certificados digitales con derechos temporales de USO (hasta 15 años)</li>
      <li>Solicitudes de uso sujetas a disponibilidad (REQUEST → OFFER → CONFIRM)</li>
      <li>Sin cuotas de mantenimiento anuales</li>
    </ul>
  </div>
  
  <p>Tu próximo paso: Completa tu perfil y explora los destinos participantes.</p>
  
  <a href="{{dashboardUrl}}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
    Ir a Mi Dashboard
  </a>
  
  <p style="font-size: 12px; color: #64748b; margin-top: 30px;">
    Si tienes preguntas, consulta nuestro <a href="{{faqUrl}}">Centro de Ayuda</a>.
  </p>
</div>',
ARRAY['userName', 'dashboardUrl', 'faqUrl'],
'active', true);

-- Template 2: Certificate Purchased
INSERT INTO public.email_templates (type, name, subject, body_html, variables, status, is_active) VALUES
('certificate_purchased', 'Compra de Certificado Confirmada', 'Certificado WEEK-CHAIN Activado - {{certificateId}}',
'<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #10b981;">✓ Certificado Digital Activado</h1>
  <p>Hola {{userName}},</p>
  <p>Tu certificado digital de uso vacacional ha sido activado exitosamente.</p>
  
  <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #10b981;">
    <h3 style="margin-top: 0;">Detalles del Certificado:</h3>
    <p><strong>ID:</strong> {{certificateId}}</p>
    <p><strong>Tipo:</strong> {{certificateType}}</p>
    <p><strong>Vigencia:</strong> {{validityYears}} años (hasta {{expiryDate}})</p>
    <p><strong>Solicitudes anuales:</strong> {{annualRequests}}</p>
  </div>
  
  <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
    <p style="margin: 0;"><strong>⚠️ Recordatorio Legal:</strong> Este certificado otorga derechos temporales de SOLICITUD de uso vacacional, NO propiedad. Todas las solicitudes están sujetas a disponibilidad según la red de destinos participantes.</p>
  </div>
  
  <a href="{{certificateUrl}}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
    Ver Mi Certificado
  </a>
  
  <p style="margin-top: 30px;">¿Listo para solicitar tu primera experiencia vacacional?</p>
  <a href="{{requestUrl}}" style="display: inline-block; background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px;">
    Hacer Solicitud
  </a>
</div>',
ARRAY['userName', 'certificateId', 'certificateType', 'validityYears', 'expiryDate', 'annualRequests', 'certificateUrl', 'requestUrl'],
'active', true);

-- Template 3: Reservation Request Submitted
INSERT INTO public.email_templates (type, name, subject, body_html, variables, status, is_active) VALUES
('reservation_request_submitted', 'Solicitud de Uso Recibida', 'Solicitud #{{requestId}} Recibida - En Proceso',
'<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #3b82f6;">Solicitud Recibida</h1>
  <p>Hola {{userName}},</p>
  <p>Hemos recibido tu solicitud de uso vacacional. Nuestro equipo está revisando la disponibilidad en la red de destinos participantes.</p>
  
  <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="margin-top: 0;">Detalles de tu Solicitud:</h3>
    <p><strong>ID Solicitud:</strong> {{requestId}}</p>
    <p><strong>Destino Preferido:</strong> {{preferredDestination}}</p>
    <p><strong>Fechas Solicitadas:</strong> {{requestedDates}}</p>
    <p><strong>Personas:</strong> {{numberOfGuests}} huéspedes</p>
  </div>
  
  <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
    <p style="margin: 0;"><strong>⏳ Importante:</strong> Esta es una SOLICITUD, no una reserva confirmada. Te notificaremos cuando tengamos ofertas disponibles que coincidan con tus criterios. La disponibilidad no está garantizada.</p>
  </div>
  
  <p><strong>Próximos Pasos:</strong></p>
  <ol>
    <li>Revisaremos disponibilidad (24-72 horas)</li>
    <li>Te enviaremos OFERTAS disponibles si hay coincidencias</li>
    <li>Podrás CONFIRMAR la oferta que mejor te convenga</li>
  </ol>
  
  <a href="{{requestStatusUrl}}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
    Ver Estado de Solicitud
  </a>
</div>',
ARRAY['userName', 'requestId', 'preferredDestination', 'requestedDates', 'numberOfGuests', 'requestStatusUrl'],
'active', true);

-- Template 4: Reservation Offer Available
INSERT INTO public.email_templates (type, name, subject, body_html, variables, status, is_active) VALUES
('reservation_offer_available', 'Oferta Disponible para tu Solicitud', '¡Oferta Disponible! - Solicitud #{{requestId}}',
'<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #10b981;">🎉 ¡Tenemos una Oferta para Ti!</h1>
  <p>Hola {{userName}},</p>
  <p>Buenas noticias: Hemos encontrado disponibilidad para tu solicitud #{{requestId}}.</p>
  
  <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #10b981;">
    <h3 style="margin-top: 0;">Oferta Disponible:</h3>
    <p><strong>Propiedad:</strong> {{propertyName}}</p>
    <p><strong>Ubicación:</strong> {{location}}</p>
    <p><strong>Fechas:</strong> {{offerDates}}</p>
    <p><strong>Huéspedes:</strong> {{numberOfGuests}} personas</p>
    <p><strong>Vence:</strong> {{offerExpiresAt}}</p>
  </div>
  
  <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
    <p style="margin: 0;"><strong>⏰ Esta oferta expira en {{hoursUntilExpiry}} horas.</strong> Confirma pronto para asegurar tu experiencia vacacional.</p>
  </div>
  
  <a href="{{confirmOfferUrl}}" style="display: inline-block; background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold;">
    Confirmar Oferta Ahora
  </a>
  
  <p style="margin-top: 20px;">
    <a href="{{viewDetailsUrl}}" style="color: #3b82f6; text-decoration: underline;">Ver Detalles Completos</a> | 
    <a href="{{declineUrl}}" style="color: #64748b; text-decoration: underline;">No me interesa</a>
  </p>
</div>',
ARRAY['userName', 'requestId', 'propertyName', 'location', 'offerDates', 'numberOfGuests', 'offerExpiresAt', 'hoursUntilExpiry', 'confirmOfferUrl', 'viewDetailsUrl', 'declineUrl'],
'active', true);

-- Template 5: Reservation Confirmed
INSERT INTO public.email_templates (type, name, subject, body_html, variables, status, is_active) VALUES
('reservation_confirmed', 'Uso Vacacional Confirmado', '✓ Confirmado - {{propertyName}} | {{dates}}',
'<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #10b981;">✓ Uso Vacacional Confirmado</h1>
  <p>Hola {{userName}},</p>
  <p>Tu uso vacacional ha sido confirmado exitosamente. ¡Prepárate para disfrutar!</p>
  
  <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #10b981;">
    <h3 style="margin-top: 0;">Detalles de tu Estancia:</h3>
    <p><strong>Código de Confirmación:</strong> {{confirmationCode}}</p>
    <p><strong>Propiedad:</strong> {{propertyName}}</p>
    <p><strong>Dirección:</strong> {{propertyAddress}}</p>
    <p><strong>Check-in:</strong> {{checkInDate}} - {{checkInTime}}</p>
    <p><strong>Check-out:</strong> {{checkOutDate}} - {{checkOutTime}}</p>
    <p><strong>Huéspedes:</strong> {{numberOfGuests}} personas</p>
  </div>
  
  <div style="background: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
    <h4 style="margin-top: 0;">Información de Contacto:</h4>
    <p><strong>Operador:</strong> {{operatorName}}</p>
    <p><strong>Teléfono:</strong> {{operatorPhone}}</p>
    <p><strong>Email:</strong> {{operatorEmail}}</p>
  </div>
  
  <a href="{{downloadVoucherUrl}}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px;">
    Descargar Voucher
  </a>
  
  <a href="{{viewItineraryUrl}}" style="display: inline-block; background: #64748b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px;">
    Ver Itinerario Completo
  </a>
  
  <p style="margin-top: 30px; font-size: 14px; color: #64748b;">
    ¿Necesitas hacer cambios? Contacta a tu operador al menos 48 horas antes del check-in.
  </p>
</div>',
ARRAY['userName', 'confirmationCode', 'propertyName', 'propertyAddress', 'checkInDate', 'checkInTime', 'checkOutDate', 'checkOutTime', 'numberOfGuests', 'operatorName', 'operatorPhone', 'operatorEmail', 'downloadVoucherUrl', 'viewItineraryUrl'],
'active', true);

-- ====================================
-- 10. GRANT PERMISSIONS
-- ====================================
GRANT SELECT ON public.email_templates TO authenticated;
GRANT ALL ON public.email_templates TO service_role;

GRANT SELECT ON public.email_logs TO authenticated;
GRANT ALL ON public.email_logs TO service_role;

GRANT SELECT, INSERT ON public.email_unsubscribes TO authenticated;
GRANT ALL ON public.email_unsubscribes TO service_role;

GRANT SELECT ON public.email_analytics TO authenticated;
GRANT ALL ON public.email_analytics TO service_role;

-- ====================================
-- SETUP COMPLETE
-- ====================================
COMMENT ON TABLE public.email_templates IS 'PROFECO-compliant email templates for WEEK-CHAIN ROC flow';
COMMENT ON TABLE public.email_logs IS 'Comprehensive email delivery tracking and analytics';
COMMENT ON TABLE public.email_unsubscribes IS 'User unsubscribe preferences and history';
COMMENT ON MATERIALIZED VIEW public.email_analytics IS 'Aggregated email performance metrics by template type';
