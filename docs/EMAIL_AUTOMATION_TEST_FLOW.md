# WEEK-CHAIN Email Automation System - Test Flow Documentation

## Overview

Sistema completo de automatización de emails para WEEK-CHAIN con templates PROFECO-compliant, tracking de métricas, y admin UI completo.

## Architecture Components

### 1. Database Layer (Supabase)
- `email_templates` - Templates con versioning y HTML/JSON
- `email_logs` - Tracking de todos los emails enviados (opens, clicks, bounces)
- `email_unsubscribes` - Gestión de unsubscribes
- RLS policies para seguridad admin-only

### 2. Core Libraries
- `lib/email/template-renderer.ts` - Renderizado de variables {{name}}
- `lib/email/send-email.ts` - Envío via Resend con logging automático
- `lib/email/resend-client.ts` - Cliente Resend configurado

### 3. API Endpoints
- `GET /api/admin/email-templates` - Listar templates
- `POST /api/admin/email-templates` - Crear template
- `PUT /api/admin/email-templates/[id]` - Actualizar template
- `DELETE /api/admin/email-templates/[id]` - Eliminar template
- `GET /api/admin/email-logs` - Ver logs de emails
- `POST /api/email/test` - Enviar email de prueba

### 4. Admin UI
- `/dashboard/admin/email-templates` - Gestión de templates
- `/dashboard/admin/email-logs` - Visualización de métricas
- `/dashboard/admin/email-test` - Testing interactivo

## Test Flow - Admin

### Step 1: Setup Database
```bash
# Run SQL scripts in Supabase SQL Editor
1. scripts/090_email_automation_system.sql
2. scripts/092_seed_default_email_templates.sql
```

### Step 2: Verify Templates Created
1. Navigate to `/dashboard/admin/email-templates`
2. Should see 5 default templates:
   - Welcome Email
   - Certificate Purchased
   - Reservation Request Submitted
   - Reservation Offer Available
   - Reservation Confirmed

### Step 3: Send Test Email
1. Navigate to `/dashboard/admin/email-test`
2. Enter your test email address
3. Select "Welcome Email" template
4. Click "Send Test Email"
5. Check your inbox for email

### Step 4: Verify Email Logs
1. Navigate to `/dashboard/admin/email-logs`
2. Should see test email in logs table
3. Check metrics: Total Sent, Open Rate, Click Rate

### Step 5: Test Template Editing
1. Go back to `/dashboard/admin/email-templates`
2. Click "Edit" on Welcome Email
3. Modify subject or body HTML
4. Save and send another test
5. Verify changes reflected in received email

## Test Flow - User (Automated)

### Trigger 1: User Registration (Welcome Email)
```typescript
// In registration flow
await sendAutomatedEmail(
  'welcome',
  user.email,
  {
    user_name: user.full_name,
    dashboard_url: `${siteUrl}/dashboard`,
    unsubscribe_url: `${siteUrl}/unsubscribe/${user.id}`,
  }
)
```

### Trigger 2: Certificate Purchase
```typescript
// After successful payment
await sendAutomatedEmail(
  'certificate_purchased',
  user.email,
  {
    user_name: user.full_name,
    certificate_id: certificate.id,
    amount_usd: certificate.amount,
    payment_date: new Date().toLocaleDateString(),
    dashboard_url: `${siteUrl}/dashboard/certificate/${certificate.id}`,
    unsubscribe_url: `${siteUrl}/unsubscribe/${user.id}`,
  }
)
```

### Trigger 3: Reservation Request
```typescript
// When user submits booking request
await sendAutomatedEmail(
  'reservation_request_submitted',
  user.email,
  {
    user_name: user.full_name,
    property_name: property.name,
    property_location: property.location,
    check_in_date: booking.check_in,
    check_out_date: booking.check_out,
    booking_reference: booking.reference,
    unsubscribe_url: `${siteUrl}/unsubscribe/${user.id}`,
  }
)
```

### Trigger 4: Offer Available
```typescript
// When property becomes available
await sendAutomatedEmail(
  'reservation_offer_available',
  user.email,
  {
    user_name: user.full_name,
    property_name: property.name,
    property_location: property.location,
    check_in_date: booking.check_in,
    check_out_date: booking.check_out,
    booking_reference: booking.reference,
    offer_expires_at: expiresAt.toLocaleString(),
    confirm_url: `${siteUrl}/booking/confirm/${booking.id}`,
    unsubscribe_url: `${siteUrl}/unsubscribe/${user.id}`,
  }
)
```

### Trigger 5: Reservation Confirmed
```typescript
// After user accepts offer
await sendAutomatedEmail(
  'reservation_confirmed',
  user.email,
  {
    user_name: user.full_name,
    property_name: property.name,
    property_location: property.location,
    check_in_date: booking.check_in,
    check_out_date: booking.check_out,
    booking_reference: booking.reference,
    dashboard_url: `${siteUrl}/dashboard/bookings`,
    support_email: 'soporte@week-chain.com',
    support_phone: '+52 55 1234 5678',
    unsubscribe_url: `${siteUrl}/unsubscribe/${user.id}`,
  }
)
```

## Metrics & Analytics

### Email Logs Dashboard
- **Total Sent**: Count of successfully delivered emails
- **Open Rate**: Percentage of emails opened (tracked via pixel)
- **Click Rate**: Percentage with link clicks
- **Bounce Rate**: Failed deliveries (hard/soft bounces)

### Tracking Implementation
Resend automatically tracks:
- Opens (via 1x1 tracking pixel)
- Clicks (via link rewrites)
- Bounces (via SMTP feedback)
- Spam reports

## PROFECO Compliance

All email templates include:
1. ✅ Clear legal disclaimers
2. ✅ REQUEST → OFFER → CONFIRM flow explanation
3. ✅ No guaranteed access language
4. ✅ Temporary rights (15 years) disclosure
5. ✅ One-click unsubscribe links

## Environment Variables Required

```env
RESEND_API_KEY=re_xxxxx
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## Future Enhancements

- [ ] A/B testing de templates
- [ ] Scheduling (send later)
- [ ] Segmentation (por tier, location)
- [ ] Multi-language support automático
- [ ] Rich editor para templates (TipTap)
- [ ] Email sequence campaigns
- [ ] SMS integration (Twilio)
