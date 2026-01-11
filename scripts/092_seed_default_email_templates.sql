-- Seed default email templates for WEEK-CHAIN
-- These templates follow PROFECO-compliant language

-- 1. Welcome Email
INSERT INTO email_templates (type, name, subject, body_html, body_json, variables, status, is_active, metadata)
VALUES (
  'welcome',
  'Bienvenida a WEEK-CHAIN',
  'Bienvenido a WEEK-CHAIN - Sistema de Certificados Vacacionales',
  '<html><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #1e293b;">¡Bienvenido a WEEK-CHAIN!</h1>
    </div>
    <p>Hola {{user_name}},</p>
    <p>Te damos la bienvenida al sistema de Smart Vacational Certificates de WEEK-CHAIN.</p>
    <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0;">Aviso Legal Importante</h3>
      <p style="font-size: 14px; line-height: 1.6; color: #475569;">
        Los Smart Vacational Certificates (SVC) otorgan <strong>derechos personales y temporales de solicitud de uso vacacional</strong> por hasta 15 años, sujetos a disponibilidad. 
        NO constituyen propiedad inmobiliaria, inversión financiera, ni tiempo compartido tradicional. 
        El acceso a destinos NO está garantizado y opera bajo el modelo REQUEST → OFFER → CONFIRM.
      </p>
    </div>
    <div style="margin: 30px 0;">
      <a href="{{dashboard_url}}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
        Ir a Mi Dashboard
      </a>
    </div>
    <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
    <hr style="border: 1px solid #e2e8f0; margin: 30px 0;">
    <p style="font-size: 12px; color: #64748b;">
      <a href="{{unsubscribe_url}}" style="color: #64748b;">Cancelar suscripción</a>
    </p>
  </body></html>',
  '{"type":"doc","content":[{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"¡Bienvenido a WEEK-CHAIN!"}]}]}',
  ARRAY['user_name', 'dashboard_url', 'unsubscribe_url'],
  'active',
  true,
  '{"description": "Email de bienvenida para nuevos usuarios", "language": "es"}'::jsonb
);

-- 2. Certificate Purchase Confirmation
INSERT INTO email_templates (type, name, subject, body_html, body_json, variables, status, is_active, metadata)
VALUES (
  'certificate_purchased',
  'Confirmación de Activación de Certificado',
  'Certificado Digital Activado - {{certificate_id}}',
  '<html><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #10b981;">✓ Certificado Activado</h1>
    </div>
    <p>Hola {{user_name}},</p>
    <p>Tu Smart Vacational Certificate ha sido activado exitosamente.</p>
    <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #059669;">Detalles del Certificado</h3>
      <p><strong>ID:</strong> {{certificate_id}}</p>
      <p><strong>Monto:</strong> {{amount_usd}} USD</p>
      <p><strong>Fecha de Pago:</strong> {{payment_date}}</p>
    </div>
    <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px;">
        <strong>⚠️ Recordatorio:</strong> Este certificado otorga derechos de <strong>solicitud</strong> de uso vacacional por 15 años. 
        El acceso a destinos específicos está sujeto a disponibilidad y NO está garantizado.
      </p>
    </div>
    <div style="margin: 30px 0;">
      <a href="{{dashboard_url}}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
        Ver Mi Certificado
      </a>
    </div>
    <hr style="border: 1px solid #e2e8f0; margin: 30px 0;">
    <p style="font-size: 12px; color: #64748b;">
      <a href="{{unsubscribe_url}}" style="color: #64748b;">Cancelar suscripción</a>
    </p>
  </body></html>',
  '{}',
  ARRAY['user_name', 'certificate_id', 'amount_usd', 'payment_date', 'dashboard_url', 'unsubscribe_url'],
  'active',
  true,
  '{"description": "Confirmación de activación de certificado digital", "language": "es"}'::jsonb
);

-- 3. Reservation Request Submitted
INSERT INTO email_templates (type, name, subject, body_html, body_json, variables, status, is_active, metadata)
VALUES (
  'reservation_request_submitted',
  'Solicitud de Reserva Recibida',
  'Tu Solicitud de Reserva ha sido Recibida - {{booking_reference}}',
  '<html><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #1e293b;">Solicitud Recibida</h1>
    <p>Hola {{user_name}},</p>
    <p>Hemos recibido tu solicitud de reserva para:</p>
    <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p><strong>Propiedad:</strong> {{property_name}}</p>
      <p><strong>Ubicación:</strong> {{property_location}}</p>
      <p><strong>Check-in:</strong> {{check_in_date}}</p>
      <p><strong>Check-out:</strong> {{check_out_date}}</p>
      <p><strong>Referencia:</strong> {{booking_reference}}</p>
    </div>
    <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px;">
        <strong>Proceso:</strong> REQUEST → OFFER → CONFIRM<br>
        Tu solicitud será evaluada según disponibilidad. Recibirás una oferta si hay espacio disponible en las fechas solicitadas.
      </p>
    </div>
    <p>Te notificaremos dentro de 24-48 horas sobre el estado de tu solicitud.</p>
    <hr style="border: 1px solid #e2e8f0; margin: 30px 0;">
    <p style="font-size: 12px; color: #64748b;">
      <a href="{{unsubscribe_url}}" style="color: #64748b;">Cancelar suscripción</a>
    </p>
  </body></html>',
  '{}',
  ARRAY['user_name', 'property_name', 'property_location', 'check_in_date', 'check_out_date', 'booking_reference', 'unsubscribe_url'],
  'active',
  true,
  '{"description": "Confirmación de recepción de solicitud de reserva", "language": "es"}'::jsonb
);

-- 4. Reservation Offer Available
INSERT INTO email_templates (type, name, subject, body_html, body_json, variables, status, is_active, metadata)
VALUES (
  'reservation_offer_available',
  'Oferta de Reserva Disponible',
  '¡Tenemos una Oferta para Tu Solicitud! - {{booking_reference}}',
  '<html><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #10b981;">¡Buenas Noticias!</h1>
    <p>Hola {{user_name}},</p>
    <p>Tenemos disponibilidad para tu solicitud de reserva:</p>
    <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0;">
      <p><strong>Propiedad:</strong> {{property_name}}</p>
      <p><strong>Ubicación:</strong> {{property_location}}</p>
      <p><strong>Check-in:</strong> {{check_in_date}}</p>
      <p><strong>Check-out:</strong> {{check_out_date}}</p>
    </div>
    <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px; color: #991b1b;">
        <strong>⚠️ Importante:</strong> Esta oferta expira en <strong>48 horas</strong>. 
        Debes confirmar tu reserva antes de {{offer_expires_at}} o la oferta será cancelada.
      </p>
    </div>
    <div style="margin: 30px 0; text-align: center;">
      <a href="{{confirm_url}}" style="background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-size: 16px;">
        Confirmar Reserva Ahora
      </a>
    </div>
    <hr style="border: 1px solid #e2e8f0; margin: 30px 0;">
    <p style="font-size: 12px; color: #64748b;">
      <a href="{{unsubscribe_url}}" style="color: #64748b;">Cancelar suscripción</a>
    </p>
  </body></html>',
  '{}',
  ARRAY['user_name', 'property_name', 'property_location', 'check_in_date', 'check_out_date', 'booking_reference', 'offer_expires_at', 'confirm_url', 'unsubscribe_url'],
  'active',
  true,
  '{"description": "Notificación de oferta disponible para reserva", "language": "es"}'::jsonb
);

-- 5. Reservation Confirmed
INSERT INTO email_templates (type, name, subject, body_html, body_json, variables, status, is_active, metadata)
VALUES (
  'reservation_confirmed',
  'Reserva Confirmada',
  'Reserva Confirmada - {{property_name}}',
  '<html><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #10b981;">✓ Reserva Confirmada</h1>
    <p>Hola {{user_name}},</p>
    <p>Tu reserva ha sido confirmada exitosamente.</p>
    <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0;">
      <h3 style="margin-top: 0;">Detalles de tu Reserva</h3>
      <p><strong>Propiedad:</strong> {{property_name}}</p>
      <p><strong>Ubicación:</strong> {{property_location}}</p>
      <p><strong>Check-in:</strong> {{check_in_date}}</p>
      <p><strong>Check-out:</strong> {{check_out_date}}</p>
      <p><strong>Referencia:</strong> {{booking_reference}}</p>
    </div>
    <p>Recibirás más información sobre check-in 7 días antes de tu llegada.</p>
    <div style="margin: 30px 0;">
      <a href="{{dashboard_url}}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
        Ver Mis Reservas
      </a>
    </div>
    <p>Si tienes preguntas, contáctanos a {{support_email}} o {{support_phone}}</p>
    <hr style="border: 1px solid #e2e8f0; margin: 30px 0;">
    <p style="font-size: 12px; color: #64748b;">
      <a href="{{unsubscribe_url}}" style="color: #64748b;">Cancelar suscripción</a>
    </p>
  </body></html>',
  '{}',
  ARRAY['user_name', 'property_name', 'property_location', 'check_in_date', 'check_out_date', 'booking_reference', 'dashboard_url', 'support_email', 'support_phone', 'unsubscribe_url'],
  'active',
  true,
  '{"description": "Confirmación de reserva exitosa", "language": "es"}'::jsonb
);

-- Set default values for common variables
COMMENT ON TABLE email_templates IS 'Email templates with HTML and JSON content for automated communications';
COMMENT ON COLUMN email_templates.variables IS 'Array of variable names used in template (e.g. user_name, property_name)';
