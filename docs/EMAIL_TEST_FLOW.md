# Email Automation System - Test Flow Exhaustivo

Este documento describe el test flow completo del sistema de email automation de WEEK-CHAIN, incluyendo verificaciones de admin y user flow.

## 🚀 Setup Inicial

### 1. Verificar Tablas en Base de Datos

Ejecuta el script SQL para crear las tablas:

\`\`\`bash
# Desde el dashboard de Supabase o pgAdmin
psql -h [HOST] -U [USER] -d [DATABASE] -f scripts/092_email_automation_tables.sql
\`\`\`

Verifica que se crearon las tablas:
- `email_templates` (5 templates seeded)
- `email_logs`
- `email_unsubscribes`
- Vista: `email_analytics`

### 2. Configurar Environment Variables

Asegúrate de tener en `.env.local`:

\`\`\`env
RESEND_API_KEY=re_xxxxx
NEXT_PUBLIC_SITE_URL=https://your-domain.com
\`\`\`

## 📧 ADMIN FLOW TEST

### Paso 1: Acceso al Dashboard de Email Automation

1. **Login como Admin**
   - Ve a `/auth/sign-in`
   - Ingresa con credenciales de admin
   - Verifica rol `admin` en `profiles` table

2. **Navegar a Email Automation**
   - Click en "Email Automation" en el AdminSidebar
   - URL: `/dashboard/admin/email-automation`
   
   **Verificar:**
   - ✅ Se muestran 4 cards de estadísticas
   - ✅ Total Enviados: 0 (inicial)
   - ✅ Open Rate: 0.00%
   - ✅ Templates Activos: 5
   - ✅ Unsubscribes: 0

### Paso 2: Ver Templates Disponibles

1. **Tab "Templates"**
   - Click en tab "Templates"
   
   **Verificar:**
   - ✅ Se muestra link a ver todos los templates
   - ✅ Click redirige a `/dashboard/admin/email-templates`

2. **Lista de Templates**
   - Deberías ver 5 templates:
     1. WELCOME - "Bienvenida a WEEK-CHAIN"
     2. CERTIFICATE_PURCHASED - "Confirmación de Compra de Certificado SVC"
     3. RESERVATION_REQUEST_SUBMITTED - "Solicitud de Reserva Recibida"
     4. RESERVATION_OFFER_AVAILABLE - "Oferta de Reserva Disponible"
     5. RESERVATION_CONFIRMED - "Reserva Confirmada - Información de Acceso"
   
   **Verificar cada template:**
   - ✅ Status: published
   - ✅ Is Active: true
   - ✅ Tiene subject válido
   - ✅ Body HTML contiene disclaimers PROFECO-compliant

### Paso 3: Test de Envío de Email

1. **Navegar a Test Page**
   - Click en botón "Test Email" (top right)
   - URL: `/dashboard/admin/email-automation/test`

2. **Configurar Test**
   - Email destinatario: `tu-email@example.com`
   - Template type: "Welcome Email"
   - Click "Enviar Email de Prueba"
   
   **Verificar:**
   - ✅ Loading state se muestra
   - ✅ Success alert aparece con Message ID
   - ✅ Email llega a inbox en ~30 segundos

3. **Verificar Email Recibido**
   
   **Contenido del email WELCOME:**
   - ✅ Subject: "¡Bienvenido a WEEK-CHAIN, Juan!"
   - ✅ Header con gradiente purple
   - ✅ Saludo personalizado: "Hola Juan"
   - ✅ Lista de próximos pasos
   - ✅ Botón CTA: "Ir a Mi Dashboard"
   - ✅ Disclaimer PROFECO completo y visible
   - ✅ Footer con links a Help Center y T&C
   - ✅ Diseño responsive (prueba en mobile)

4. **Probar Todos los Templates**
   - Repite paso 2-3 para cada tipo:
     - WELCOME ✅
     - CERTIFICATE_PURCHASED ✅
     - RESERVATION_REQUEST_SUBMITTED ✅
     - RESERVATION_OFFER_AVAILABLE ✅
     - RESERVATION_CONFIRMED ✅
   
   **Verificar cada uno:**
   - ✅ Variables se reemplazan correctamente
   - ✅ Formato HTML correcto
   - ✅ Disclaimer PROFECO presente
   - ✅ Links funcionan
   - ✅ Imágenes cargan (si aplica)

### Paso 4: Verificar Logs

1. **Ver Email Logs**
   - Volver a `/dashboard/admin/email-automation`
   - Click en tab "Recent Logs"
   
   **Verificar:**
   - ✅ Se muestran los 5 emails enviados
   - ✅ Cada log muestra:
     - Email destinatario
     - Subject correcto
     - Badge "Sent" (verde)
     - Timestamp actual
   - ✅ Ordenados por más reciente primero

2. **Verificar en Base de Datos**
   
   \`\`\`sql
   SELECT * FROM email_logs ORDER BY sent_at DESC LIMIT 10;
   \`\`\`
   
   **Verificar:**
   - ✅ 5 filas insertadas
   - ✅ `provider_message_id` presente (Resend ID)
   - ✅ `failed` = false
   - ✅ `template_type` correcto
   - ✅ `metadata` contiene `test_mode: true`

### Paso 5: Analytics

1. **Refresh Analytics View**
   
   \`\`\`sql
   SELECT refresh_email_analytics();
   SELECT * FROM email_analytics;
   \`\`\`
   
   **Verificar:**
   - ✅ Vista actualizada con datos
   - ✅ Cada template_type tiene fila
   - ✅ `total_sent` = 1 por template
   - ✅ `open_rate` = 0.00 (aún no abiertos)

2. **Ver Analytics en UI**
   - Tab "Analytics" en `/dashboard/admin/email-automation`
   
   **Verificar:**
   - ✅ Se muestran 5 filas (una por template)
   - ✅ Contadores correctos
   - ✅ Badge muestra 0.00% open rate
   - ✅ Last sent timestamp correcto

## 👥 USER FLOW TEST (ROC Completo)

Este test simula el flujo ROC completo desde la perspectiva del usuario.

### Paso 1: Usuario Registra Cuenta

1. **Sign Up**
   - Ve a `/auth/sign-up`
   - Email: `test-user@example.com`
   - Completa registro
   
   **Verificar:**
   - ✅ Cuenta creada en auth.users
   - ✅ Profile creado en profiles table
   - ✅ **Email WELCOME automático enviado**

2. **Verificar Email WELCOME**
   - Check inbox de `test-user@example.com`
   
   **Verificar:**
   - ✅ Email llega en <1 minuto
   - ✅ Subject: "¡Bienvenido a WEEK-CHAIN, [Nombre]!"
   - ✅ Contenido personalizado
   - ✅ Link al dashboard funciona
   - ✅ Disclaimer PROFECO presente

### Paso 2: Usuario Compra Certificado

1. **Simular Compra**
   - Como admin, crea certificado para el usuario:
   
   \`\`\`sql
   INSERT INTO certificate_products_v2 (user_id, tier, pax, status)
   VALUES ('[USER_ID]', 'gold', 4, 'active');
   \`\`\`

2. **Trigger Email CERTIFICATE_PURCHASED**
   - Ejecuta desde admin test:
   
   \`\`\`bash
   POST /api/email/test
   {
     "recipient_email": "test-user@example.com",
     "template_type": "CERTIFICATE_PURCHASED"
   }
   \`\`\`
   
   **Verificar Email:**
   - ✅ Subject: "✅ Certificado SVC WC-2025-001234 Adquirido"
   - ✅ Número de certificado visible
   - ✅ Tier y PAX correctos
   - ✅ QR code presente
   - ✅ Fechas de vigencia (2025-2039)
   - ✅ Explicación de cómo usar certificado
   - ✅ Disclaimer: NO es propiedad, NO garantiza destinos

### Paso 3: Usuario Solicita Reserva (REQUEST)

1. **Submit Reservation Request**
   - Usuario llena formulario de solicitud
   - Destino: Cancún
   - Fechas: 15-22 Marzo 2025
   - 4 huéspedes
   
2. **Sistema Envía Confirmación de Solicitud**
   
   **Trigger:**
   \`\`\`typescript
   await sendAutomatedEmail(
     'RESERVATION_REQUEST_SUBMITTED',
     'test-user@example.com',
     {
       user_first_name: 'Juan',
       booking_number: 'BK-2025-5678',
       requested_destination: 'Cancún, México',
       check_in_date: '15 Marzo 2025',
       check_out_date: '22 Marzo 2025',
       guests_count: 4
     }
   )
   \`\`\`
   
   **Verificar Email:**
   - ✅ Subject: "📝 Solicitud BK-2025-5678 Recibida"
   - ✅ Badge "EN PROCESO"
   - ✅ Detalles de solicitud correctos
   - ✅ Timeline de 4 pasos mostrado
   - ✅ Disclaimer: "Esta es una SOLICITUD, no confirmación"
   - ✅ Menciona 24-48h para respuesta

### Paso 4: Sistema Envía Oferta (OFFER)

**Simular que sistema encontró disponibilidad:**

1. **Trigger Offer Email**
   
   \`\`\`typescript
   await sendAutomatedEmail(
     'RESERVATION_OFFER_AVAILABLE',
     'test-user@example.com',
     {
       user_first_name: 'Juan',
       booking_number: 'BK-2025-5678',
       offer_expires_at: '18 Marzo 2025 14:00',
       hours_until_expiry: 48,
       property_name: 'Villa Paradise Cancún',
       property_destination: 'Cancún, Quintana Roo, México',
       check_in_date: '15 Marzo 2025',
       check_out_date: '22 Marzo 2025',
       property_check_in_time: '15:00',
       property_check_out_time: '11:00',
       property_pax: 6,
       property_bedrooms: 3,
       property_bathrooms: 2,
       offer_accept_url: 'https://week-chain.com/booking/accept/ABC123'
     }
   )
   \`\`\`
   
   **Verificar Email:**
   - ✅ Subject: "🎁 Oferta Disponible para BK-2025-5678 - Expira en 48h"
   - ✅ Urgency banner rojo con countdown
   - ✅ Property card con foto y detalles
   - ✅ Amenidades listadas
   - ✅ Botón CTA verde "ACEPTAR OFERTA AHORA"
   - ✅ Link funciona y redirige correctamente
   - ✅ Disclaimer: "Debes ACEPTAR o RECHAZAR antes de expiración"
   - ✅ Políticas de no reembolso claras

### Paso 5: Usuario Confirma (CONFIRM)

1. **Usuario hace click en "Aceptar Oferta"**
   - Link del email redirige a página de confirmación
   - Usuario confirma su elección

2. **Sistema Envía Confirmación Final**
   
   \`\`\`typescript
   await sendAutomatedEmail(
     'RESERVATION_CONFIRMED',
     'test-user@example.com',
     {
       user_full_name: 'Juan Pérez',
       booking_number: 'BK-2025-5678',
       property_name: 'Villa Paradise Cancún',
       check_in_date: '15 Marzo 2025',
       check_out_date: '22 Marzo 2025',
       property_check_in_time: '15:00',
       property_check_out_time: '11:00',
       property_address: 'Av. Bonampak 123, Zona Hotelera, Cancún',
       property_access_instructions: 'Código de acceso: 1234. Llaves en caja fuerte junto a la puerta.',
       company_whatsapp: '+52 55 1234 5678',
       site_url: 'https://week-chain.com'
     }
   )
   \`\`\`
   
   **Verificar Email:**
   - ✅ Subject: "✅ Confirmación BK-2025-5678 - Villa Paradise Cancún"
   - ✅ Confirmation box verde con "CONFIRMADO"
   - ✅ Info grid con check-in/check-out
   - ✅ Access card con dirección e instrucciones
   - ✅ Códigos de acceso visibles
   - ✅ Checklist pre-llegada
   - ✅ Botones: "Ver Detalles" y "Descargar PDF"
   - ✅ Disclaimer: "NO reembolsable ni transferible"
   - ✅ Políticas de daños y reglas

## 🔍 Verificaciones Finales

### Database Integrity

\`\`\`sql
-- Verificar todos los logs
SELECT 
  template_type,
  COUNT(*) as emails_sent,
  COUNT(CASE WHEN failed = false THEN 1 END) as successful
FROM email_logs
GROUP BY template_type;
\`\`\`

**Resultado esperado:**
- WELCOME: 1 sent, 1 successful
- CERTIFICATE_PURCHASED: 1 sent, 1 successful
- RESERVATION_REQUEST_SUBMITTED: 1 sent, 1 successful
- RESERVATION_OFFER_AVAILABLE: 1 sent, 1 successful
- RESERVATION_CONFIRMED: 1 sent, 1 successful

### Analytics Refresh

\`\`\`sql
SELECT refresh_email_analytics();
SELECT * FROM email_analytics;
\`\`\`

**Verificar:**
- ✅ 5 filas (una por template usado)
- ✅ total_sent = 1 para cada uno
- ✅ delivered count correcto
- ✅ open_rate actualizado (si emails fueron abiertos)

### Unsubscribe Test

1. **Simular Unsubscribe**
   
   \`\`\`sql
   INSERT INTO email_unsubscribes (email, reason)
   VALUES ('test-user@example.com', 'No longer interested');
   \`\`\`

2. **Intentar Enviar Email**
   - Desde test page, intenta enviar a `test-user@example.com`
   
   **Verificar:**
   - ✅ Error: "Recipient has unsubscribed"
   - ✅ Email NO se envía
   - ✅ Se registra en logs como skipped

## 📊 Métricas de Éxito

El test flow se considera exitoso si:

- [x] 5 templates seeded correctamente
- [x] Admin puede ver dashboard de email automation
- [x] Test emails se envían correctamente
- [x] Logs se registran en base de datos
- [x] Analytics view funciona
- [x] ROC flow completo funciona (REQUEST → OFFER → CONFIRM)
- [x] Todos los disclaimers PROFECO están presentes
- [x] Variables se reemplazan correctamente
- [x] Unsubscribe functionality funciona
- [x] HTML rendering es correcto en todos los clientes

## 🐛 Troubleshooting

### Email no llega

1. Verificar Resend API key
2. Check spam folder
3. Ver logs en Resend dashboard
4. Verificar email_logs table para errors

### Variables no se reemplazan

1. Check template en database
2. Verificar nombres de variables coinciden
3. Ver `template-renderer.ts` logs

### RLS errors

1. Verificar policies en Supabase
2. Check user role en profiles
3. Ver si service_role key está configurado

## ✅ Conclusión

Este test flow verifica exhaustivamente que el sistema de email automation de WEEK-CHAIN funciona end-to-end, cumple con PROFECO, y soporta todo el flujo ROC de forma automática y confiable.
