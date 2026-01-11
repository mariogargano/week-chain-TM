-- Email Automation System - Complete Tables and Data
-- Creates all tables for email automation and seeds default templates

-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.email_logs CASCADE;
DROP TABLE IF EXISTS public.email_templates CASCADE;
DROP TABLE IF EXISTS public.email_unsubscribes CASCADE;
DROP MATERIALIZED VIEW IF EXISTS public.email_analytics CASCADE;

-- 1. Email Templates Table
CREATE TABLE public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN (
    'WELCOME',
    'CERTIFICATE_PURCHASED',
    'RESERVATION_REQUEST_SUBMITTED',
    'RESERVATION_OFFER_AVAILABLE',
    'RESERVATION_CONFIRMED',
    'RESERVATION_REJECTED',
    'RESERVATION_CANCELLED',
    'RESERVATION_REMINDER',
    'PAYMENT_RECEIVED',
    'PAYMENT_FAILED',
    'CERTIFICATE_EXPIRING',
    'CERTIFICATE_EXPIRED',
    'SYSTEM_ALERT'
  )),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_json JSONB,
  variables JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  is_active BOOLEAN DEFAULT false,
  version INTEGER DEFAULT 1,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure only one active template per type
CREATE UNIQUE INDEX email_templates_one_active_per_type 
ON public.email_templates (type) 
WHERE is_active = true AND status = 'published';

-- 2. Email Logs Table
CREATE TABLE public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.email_templates(id),
  template_type TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT,
  provider TEXT DEFAULT 'resend',
  provider_message_id TEXT,
  sent_at TIMESTAMPTZ DEFAULT now(),
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  bounced_at TIMESTAMPTZ,
  failed BOOLEAN DEFAULT false,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX email_logs_recipient_idx ON public.email_logs(recipient_email);
CREATE INDEX email_logs_sent_at_idx ON public.email_logs(sent_at DESC);
CREATE INDEX email_logs_template_type_idx ON public.email_logs(template_type);

-- 3. Email Unsubscribes Table
CREATE TABLE public.email_unsubscribes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  unsubscribed_at TIMESTAMPTZ DEFAULT now(),
  reason TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX email_unsubscribes_email_idx ON public.email_unsubscribes(email);

-- 4. Email Analytics Materialized View
CREATE MATERIALIZED VIEW public.email_analytics AS
SELECT 
  template_type,
  COUNT(*) as total_sent,
  COUNT(CASE WHEN delivered_at IS NOT NULL THEN 1 END) as delivered,
  COUNT(CASE WHEN opened_at IS NOT NULL THEN 1 END) as opened,
  COUNT(CASE WHEN clicked_at IS NOT NULL THEN 1 END) as clicked,
  COUNT(CASE WHEN bounced_at IS NOT NULL THEN 1 END) as bounced,
  COUNT(CASE WHEN failed = true THEN 1 END) as failed,
  ROUND(COUNT(CASE WHEN opened_at IS NOT NULL THEN 1 END)::numeric / NULLIF(COUNT(*), 0) * 100, 2) as open_rate,
  ROUND(COUNT(CASE WHEN clicked_at IS NOT NULL THEN 1 END)::numeric / NULLIF(COUNT(*), 0) * 100, 2) as click_rate,
  MAX(sent_at) as last_sent
FROM public.email_logs
GROUP BY template_type;

CREATE INDEX email_analytics_template_type_idx ON public.email_analytics(template_type);

-- RLS Policies
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_unsubscribes ENABLE ROW LEVEL SECURITY;

-- Email Templates Policies
CREATE POLICY "Admins can manage all email templates"
ON public.email_templates FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Anyone can view active published templates"
ON public.email_templates FOR SELECT
USING (is_active = true AND status = 'published');

-- Email Logs Policies
CREATE POLICY "Admins can view all email logs"
ON public.email_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "System can insert email logs"
ON public.email_logs FOR INSERT
WITH CHECK (true);

-- Email Unsubscribes Policies
CREATE POLICY "Anyone can unsubscribe"
ON public.email_unsubscribes FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view unsubscribes"
ON public.email_unsubscribes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Helper Functions
CREATE OR REPLACE FUNCTION refresh_email_analytics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY email_analytics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_email_template_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER email_templates_updated_at
BEFORE UPDATE ON public.email_templates
FOR EACH ROW
EXECUTE FUNCTION update_email_template_timestamp();

-- Seed Default Templates (PROFECO-Compliant)
INSERT INTO public.email_templates (type, name, subject, body_html, variables, status, is_active) VALUES

-- 1. Welcome Email
('WELCOME', 'Bienvenida a WEEK-CHAIN', 
'¡Bienvenido a WEEK-CHAIN, {{user_first_name}}!',
'<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: white; padding: 30px; border: 1px solid #e1e1e1; border-top: none; }
    .cta { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
    .disclaimer { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; font-size: 12px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>¡Bienvenido a WEEK-CHAIN!</h1>
      <p>Tu Sistema de Certificados Vacacionales Digitales</p>
    </div>
    <div class="content">
      <p>Hola <strong>{{user_first_name}}</strong>,</p>
      
      <p>Gracias por unirte a WEEK-CHAIN. Tu cuenta ha sido creada exitosamente.</p>
      
      <p><strong>Próximos pasos:</strong></p>
      <ul>
        <li>Completa tu perfil de usuario</li>
        <li>Explora nuestro catálogo de destinos participantes</li>
        <li>Conoce los diferentes niveles de certificados SVC</li>
      </ul>
      
      <a href="{{site_url}}/dashboard" class="cta">Ir a Mi Dashboard</a>
      
      <div class="disclaimer">
        <strong>Aviso Legal Importante:</strong> WEEK-CHAIN opera un sistema de Smart Vacational Certificates (SVC) que otorga derechos personales y temporales de uso vacacional por hasta 15 años, sujetos a disponibilidad. Los SVC NO constituyen propiedad inmobiliaria, NO son tiempo compartido tradicional, NO son instrumentos financieros de inversión, y NO garantizan acceso a destinos específicos. El modelo REQUEST → OFFER → CONFIRM asegura transparencia total.
      </div>
      
      <p>¿Necesitas ayuda? Contáctanos en <a href="mailto:{{company_email}}">{{company_email}}</a></p>
    </div>
    <div class="footer">
      <p>© 2025 WEEK-CHAIN. Todos los derechos reservados.</p>
      <p><a href="{{site_url}}/help">Centro de Ayuda</a> | <a href="{{site_url}}/legal/terms">Términos y Condiciones</a></p>
    </div>
  </div>
</body>
</html>',
'["user_first_name", "site_url", "company_email"]'::jsonb,
'published', true),

-- 2. Certificate Purchased
('CERTIFICATE_PURCHASED', 'Confirmación de Compra de Certificado SVC',
'✅ Certificado SVC {{certificate_number}} Adquirido',
'<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: white; padding: 30px; border: 1px solid #e1e1e1; }
    .certificate-box { background: #f8f9fa; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
    .qr-code { max-width: 200px; margin: 20px auto; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
    .info-item { padding: 10px; background: #f8f9fa; border-radius: 6px; }
    .info-item strong { display: block; color: #667eea; margin-bottom: 5px; }
    .disclaimer { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; font-size: 12px; }
    .cta { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 ¡Certificado Adquirido!</h1>
      <p>Tu Smart Vacational Certificate está listo</p>
    </div>
    <div class="content">
      <p>Hola <strong>{{user_full_name}}</strong>,</p>
      
      <p>Confirmamos la adquisición de tu certificado SVC. Los detalles están a continuación:</p>
      
      <div class="certificate-box">
        <h2>{{certificate_number}}</h2>
        <p><strong>Nivel:</strong> {{certificate_tier}} ({{certificate_pax}} PAX)</p>
        <img src="{{certificate_qr_url}}" alt="QR Certificate" class="qr-code" />
      </div>
      
      <div class="info-grid">
        <div class="info-item">
          <strong>Inicio de Vigencia</strong>
          {{certificate_start_date}}
        </div>
        <div class="info-item">
          <strong>Fin de Vigencia</strong>
          {{certificate_end_date}}
        </div>
      </div>
      
      <a href="{{site_url}}/dashboard/user/certificate" class="cta">Ver Mi Certificado</a>
      
      <div class="disclaimer">
        <strong>Aviso Legal:</strong> Este certificado otorga derechos personales y temporales de solicitud de uso vacacional por hasta 15 años. NO constituye propiedad inmobiliaria ni tiempo compartido. El acceso a destinos está sujeto a disponibilidad y confirmación mediante el flujo REQUEST → OFFER → CONFIRM. WEEK-CHAIN NO garantiza destinos específicos ni fechas predeterminadas.
      </div>
      
      <p><strong>¿Cómo funciona mi certificado?</strong></p>
      <ol>
        <li>Solicita tu reserva con 60-90 días de anticipación</li>
        <li>Espera la oferta de destinos disponibles (hasta 48h)</li>
        <li>Confirma tu preferencia antes del vencimiento</li>
        <li>Recibe acceso al alojamiento confirmado</li>
      </ol>
    </div>
  </div>
</body>
</html>',
'["user_full_name", "certificate_number", "certificate_tier", "certificate_pax", "certificate_start_date", "certificate_end_date", "certificate_qr_url", "site_url"]'::jsonb,
'published', true),

-- 3. Reservation Request Submitted
('RESERVATION_REQUEST_SUBMITTED', 'Solicitud de Reserva Recibida',
'📝 Solicitud {{booking_number}} Recibida',
'<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: white; padding: 30px; border: 1px solid #e1e1e1; }
    .status-badge { display: inline-block; background: #3b82f6; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: bold; margin: 10px 0; }
    .timeline { margin: 20px 0; padding-left: 20px; border-left: 3px solid #3b82f6; }
    .timeline-item { padding: 10px 0; position: relative; }
    .timeline-item.active::before { content: "●"; position: absolute; left: -27px; color: #3b82f6; font-size: 20px; }
    .disclaimer { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📝 Solicitud Recibida</h1>
      <p>Estamos procesando tu solicitud de reserva</p>
    </div>
    <div class="content">
      <p>Hola <strong>{{user_first_name}}</strong>,</p>
      
      <p>Hemos recibido tu solicitud de reserva. Aquí están los detalles:</p>
      
      <p><span class="status-badge">EN PROCESO</span></p>
      
      <p><strong>Número de Solicitud:</strong> {{booking_number}}<br>
      <strong>Destino Solicitado:</strong> {{requested_destination}}<br>
      <strong>Check-in:</strong> {{check_in_date}}<br>
      <strong>Check-out:</strong> {{check_out_date}}<br>
      <strong>Huéspedes:</strong> {{guests_count}} personas</p>
      
      <div class="timeline">
        <div class="timeline-item active"><strong>Paso 1:</strong> Solicitud recibida ✓</div>
        <div class="timeline-item"><strong>Paso 2:</strong> Búsqueda de disponibilidad (24-48h)</div>
        <div class="timeline-item"><strong>Paso 3:</strong> Oferta enviada para confirmación</div>
        <div class="timeline-item"><strong>Paso 4:</strong> Reserva confirmada</div>
      </div>
      
      <div class="disclaimer">
        <strong>Importante:</strong> Esta es una SOLICITUD de reserva, no una confirmación. WEEK-CHAIN buscará disponibilidad en destinos participantes y te enviará una oferta en las próximas 24-48 horas. La disponibilidad NO está garantizada y depende de la red de propiedades participantes. Si aceptas la oferta dentro del plazo indicado, procederemos con la confirmación final.
      </div>
      
      <p>Recibirás un email cuando tengamos una oferta disponible para ti.</p>
    </div>
  </div>
</body>
</html>',
'["user_first_name", "booking_number", "requested_destination", "check_in_date", "check_out_date", "guests_count"]'::jsonb,
'published', true),

-- 4. Reservation Offer Available
('RESERVATION_OFFER_AVAILABLE', 'Oferta de Reserva Disponible - Acción Requerida',
'🎁 Oferta Disponible para {{booking_number}} - Expira en {{hours_until_expiry}}h',
'<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: white; padding: 30px; border: 1px solid #e1e1e1; }
    .property-card { border: 2px solid #f59e0b; border-radius: 10px; padding: 20px; margin: 20px 0; background: #fffbeb; }
    .property-image { width: 100%; border-radius: 8px; margin-bottom: 15px; }
    .amenities { display: flex; flex-wrap: wrap; gap: 10px; margin: 15px 0; }
    .amenity { background: white; padding: 6px 12px; border-radius: 15px; font-size: 12px; }
    .urgency { background: #dc2626; color: white; padding: 15px; border-radius: 6px; text-align: center; margin: 20px 0; font-weight: bold; }
    .cta { background: #10b981; color: white; padding: 15px 40px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; font-size: 18px; font-weight: bold; }
    .disclaimer { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎁 ¡Oferta Disponible!</h1>
      <p>Tenemos un alojamiento para ti</p>
    </div>
    <div class="content">
      <p>Hola <strong>{{user_first_name}}</strong>,</p>
      
      <p>¡Buenas noticias! Encontramos disponibilidad para tu solicitud <strong>{{booking_number}}</strong>.</p>
      
      <div class="urgency">
        ⏰ Esta oferta expira el {{offer_expires_at}} ({{hours_until_expiry}} horas)
      </div>
      
      <div class="property-card">
        <h2>{{property_name}}</h2>
        <p>📍 {{property_destination}}</p>
        <p><strong>Check-in:</strong> {{check_in_date}} a las {{property_check_in_time}}<br>
        <strong>Check-out:</strong> {{check_out_date}} a las {{property_check_out_time}}</p>
        <p><strong>Capacidad:</strong> {{property_pax}} personas<br>
        <strong>Recámaras:</strong> {{property_bedrooms}} | <strong>Baños:</strong> {{property_bathrooms}}</p>
        <div class="amenities">
          <span class="amenity">✓ Piscina</span>
          <span class="amenity">✓ WiFi</span>
          <span class="amenity">✓ A/C</span>
          <span class="amenity">✓ Cocina</span>
        </div>
      </div>
      
      <div style="text-align: center;">
        <a href="{{offer_accept_url}}" class="cta">ACEPTAR OFERTA AHORA</a>
      </div>
      
      <div class="disclaimer">
        <strong>Acción Requerida:</strong> Debes ACEPTAR o RECHAZAR esta oferta antes de la fecha de expiración. Si no respondes, la oferta caducará automáticamente y deberás enviar una nueva solicitud. Al aceptar, confirmas tu reserva definitiva y el uso de tu certificado SVC para este periodo.
      </div>
      
      <p><strong>Importante:</strong> Al confirmar esta oferta:</p>
      <ul>
        <li>Tu certificado SVC se aplicará para estas fechas</li>
        <li>Recibirás instrucciones de acceso a la propiedad</li>
        <li>La reserva NO es reembolsable ni transferible</li>
        <li>Aplican políticas de cancelación estándar</li>
      </ul>
    </div>
  </div>
</body>
</html>',
'["user_first_name", "booking_number", "offer_expires_at", "hours_until_expiry", "property_name", "property_destination", "check_in_date", "check_out_date", "property_check_in_time", "property_check_out_time", "property_pax", "property_bedrooms", "property_bathrooms", "offer_accept_url"]'::jsonb,
'published', true),

-- 5. Reservation Confirmed
('RESERVATION_CONFIRMED', 'Reserva Confirmada - Información de Acceso',
'✅ Confirmación {{booking_number}} - {{property_name}}',
'<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: white; padding: 30px; border: 1px solid #e1e1e1; }
    .confirmation-box { background: #d1fae5; border: 2px solid #10b981; border-radius: 10px; padding: 25px; margin: 20px 0; text-align: center; }
    .access-card { background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
    .info-item { padding: 15px; background: #f8f9fa; border-radius: 6px; }
    .info-item strong { display: block; color: #667eea; margin-bottom: 5px; }
    .checklist { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; }
    .checklist ul { margin: 10px 0; padding-left: 20px; }
    .disclaimer { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; font-size: 12px; }
    .cta { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 5px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ ¡Reserva Confirmada!</h1>
      <p>Todo listo para tu estadía</p>
    </div>
    <div class="content">
      <p>Hola <strong>{{user_full_name}}</strong>,</p>
      
      <div class="confirmation-box">
        <h2 style="color: #059669; margin: 0;">🎉 CONFIRMADO</h2>
        <p style="font-size: 20px; margin: 10px 0;"><strong>{{booking_number}}</strong></p>
        <p>{{property_name}}</p>
      </div>
      
      <div class="info-grid">
        <div class="info-item">
          <strong>Check-in</strong>
          {{check_in_date}}<br>
          {{property_check_in_time}}
        </div>
        <div class="info-item">
          <strong>Check-out</strong>
          {{check_out_date}}<br>
          {{property_check_out_time}}
        </div>
      </div>
      
      <div class="access-card">
        <h3>🔑 Información de Acceso</h3>
        <p><strong>Dirección:</strong> {{property_address}}</p>
        <p><strong>Instrucciones:</strong> {{property_access_instructions}}</p>
        <p><strong>Contacto de Emergencia:</strong> {{company_whatsapp}}</p>
      </div>
      
      <div class="checklist">
        <h3>✓ Antes de tu llegada:</h3>
        <ul>
          <li>Confirma tu horario de llegada (check-in: {{property_check_in_time}})</li>
          <li>Descarga tu confirmación y códigos de acceso</li>
          <li>Revisa las amenidades y servicios incluidos</li>
          <li>Guarda el número de WhatsApp de soporte: {{company_whatsapp}}</li>
          <li>Lee las políticas de la propiedad</li>
        </ul>
      </div>
      
      <div style="text-align: center;">
        <a href="{{site_url}}/dashboard/user/reservations/{{booking_number}}" class="cta">Ver Detalles Completos</a>
        <a href="{{site_url}}/dashboard/user/reservations/{{booking_number}}/download" class="cta">Descargar PDF</a>
      </div>
      
      <div class="disclaimer">
        <strong>Políticas Importantes:</strong> Esta reserva utiliza tu certificado SVC para el periodo indicado. NO es reembolsable ni transferible. El check-in anticipado o check-out tardío están sujetos a disponibilidad y pueden tener costo adicional. Cualquier daño a la propiedad será responsabilidad del titular del certificado. El incumplimiento de las reglas de la propiedad puede resultar en terminación inmediata sin reembolso.
      </div>
      
      <p>¡Disfruta tu estadía y no dudes en contactarnos si necesitas asistencia!</p>
    </div>
  </div>
</body>
</html>',
'["user_full_name", "booking_number", "property_name", "check_in_date", "check_out_date", "property_check_in_time", "property_check_out_time", "property_address", "property_access_instructions", "company_whatsapp", "site_url"]'::jsonb,
'published', true);

-- Refresh analytics view
REFRESH MATERIALIZED VIEW email_analytics;
