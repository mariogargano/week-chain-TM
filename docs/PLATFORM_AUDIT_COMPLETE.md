# WEEK-CHAIN Platform Audit Report
Generated: 2024

## Executive Summary

This audit covers all major flows and admin capabilities for the WEEK-CHAIN platform.

---

## 1. ADMIN ACCESS (corporativo@morises.com)

### Status: CONFIGURED

**How it works:**
1. `corporativo@morises.com` must have `role = 'super_admin'` in the `users` table
2. Middleware checks role via `checkAdminAuth()` in `/lib/auth/admin-guard.ts`
3. Fallback: `NEXT_PUBLIC_ADMIN_EMAIL` env var grants admin access

**Admin Dashboard Routes:**
- `/dashboard/admin` - Main admin dashboard with KPIs
- `/dashboard/admin/users` - User management
- `/dashboard/admin/payments` - Payment management & reconciliation
- `/dashboard/admin/certificates` - Certificate management (suspend, transfer)
- `/dashboard/admin/kyc-approvals` - KYC approval queue
- `/dashboard/admin/properties` - Property management
- `/dashboard/admin/intermediaries` - Agent/broker management
- `/dashboard/admin/capacity` - Capacity monitoring
- `/dashboard/admin/finanzas` - Financial reports

**Required Setup:**
```sql
-- Run in Supabase SQL Editor
UPDATE users 
SET role = 'super_admin' 
WHERE email = 'corporativo@morises.com';
```

---

## 2. AGENT/INTERMEDIARY REGISTRATION FLOW

### Status: IMPLEMENTED

**Flow:**
1. User signs up normally at `/auth`
2. User clicks "Activar Modo Agente" in their dashboard OR signs up with referral link
3. User completes intermediary form at `/intermediary/register`
4. User receives unique referral code (e.g., `WC123ABC`)
5. User shares link: `week-chain.com?ref=WC123ABC`

**Agent Dashboard:**
- `/dashboard/intermediary` - Agent dashboard with:
  - Referral link
  - Statistics (clicks, leads, sales, commissions)
  - Commission status (holding, available, paid)
  - KYC status

**Commission Logic:**
- 4% commission on certificate sales via referral
- 14-day holding period (cooling-off window)
- Paid bi-weekly (1st and 15th) via Stripe Connect
- Requires agent KYC approval before payout

**Files:**
- `app/intermediary/register/page.tsx` - Registration form
- `app/dashboard/intermediary/page.tsx` - Agent dashboard
- `app/api/intermediary/route.ts` - Agent API
- `lib/flows/referral-attribution.ts` - Attribution logic

---

## 3. CERTIFICATE PURCHASE FLOW

### Status: IMPLEMENTED

**Flow:**
1. User browses certificates at `/pricing` or `/comprar`
2. User selects SVC plan (PAX2, PAX4, PAX6, PAX8)
3. Payment via Stripe (card) or Conekta (OXXO, SPEI, card)
4. On payment success:
   - Certificate created with status `pending_kyc`
   - User redirected to KYC verification (Persona)
5. On KYC approval:
   - Certificate activated (`status = 'active'`)
   - User receives confirmation email
   - User can download PDF certificate

**Payment Routes:**
- `app/api/payments/stripe/checkout/route.ts`
- `app/api/payments/conekta/card/route.ts`
- `app/api/payments/conekta/oxxo/route.ts`
- `app/api/payments/conekta/spei/route.ts`

**Webhook Routes:**
- `app/api/webhooks/stripe/route.ts`
- `app/api/webhooks/conekta/route.ts`
- `app/api/webhooks/persona/route.ts`

---

## 4. APPLE WALLET / GOOGLE PAY PASS

### Status: PARTIAL (HTML Fallback)

**Current Implementation:**
- `app/api/wallet/apple-pass/route.ts` - Generates HTML/image representation
- User can "Add to Wallet" which saves an image/shortcut

**For Real .pkpass Files (Apple Wallet):**
Required:
1. Apple Developer Account ($99/year)
2. PassKit certificates (`.p12` file)
3. `passkit-generator` npm package
4. Environment variables:
   - `APPLE_PASS_TYPE_IDENTIFIER`
   - `APPLE_TEAM_IDENTIFIER`
   - `APPLE_PASS_CERTIFICATE` (base64 encoded)
   - `APPLE_PASS_CERTIFICATE_PASSWORD`

**For Google Pay Pass:**
Required:
1. Google Pay API for Passes
2. Service account credentials
3. `@google-pay/passes` npm package

**Recommendation:**
Create `lib/wallet/apple-pass-generator.ts` and `lib/wallet/google-pay-generator.ts` 
once certificates are obtained.

---

## 5. KYC FLOW (PERSONA)

### Status: IMPLEMENTED

**Flow:**
1. User completes purchase
2. User redirected to Persona verification
3. Persona processes facial recognition + document verification
4. Webhook receives result at `app/api/webhooks/persona/route.ts`
5. On approval:
   - Certificate activated
   - Email sent to user
   - User marked as `holder_verified`

**Required Environment Variables:**
- `PERSONA_API_KEY`
- `PERSONA_WEBHOOK_SECRET`
- `PERSONA_TEMPLATE_ID`

---

## 6. EMAIL SYSTEM

### Status: IMPLEMENTED

**Provider:** Resend

**Templates:**
- KYC Approved
- KYC Rejected
- Estancia Confirmed
- Commission Paid
- Welcome Email

**Files:**
- `lib/email/templates.ts` - HTML templates
- `lib/email/send.ts` - Send functions

**Required Environment Variables:**
- `RESEND_API_KEY`

---

## 7. DATABASE SCHEMA CHECK

### Required Tables:
- `users` - User accounts with role field
- `certificates` - SVC certificates
- `payments` - Payment records
- `intermediaries` - Agent registrations
- `commissions` - Commission tracking
- `properties` - Property inventory
- `weeks` / `property_availability` - Week availability
- `estancias` - Booking records
- `admin_users` - Admin access records
- `audit_logs` - Audit trail

### RLS Policies:
- Users can only see their own data
- Admins can see all data
- Super admins can modify settings

---

## 8. CRITICAL FIXES APPLIED

1. **Next.js 15 async params** - Fixed 4 API routes to use `Promise<{ params }>` pattern
2. **checkAdminAuth signature** - Fixed testimonials approve route
3. **TypeScript strict mode** - 894 warnings (mostly implicit any, non-blocking)

---

## 9. CHECKLIST FOR PRODUCTION

### Environment Variables Required:
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Conekta
CONEKTA_API_KEY=
CONEKTA_WEBHOOK_SECRET=

# Persona (KYC)
PERSONA_API_KEY=
PERSONA_WEBHOOK_SECRET=
PERSONA_TEMPLATE_ID=

# Email (Resend)
RESEND_API_KEY=

# Admin
NEXT_PUBLIC_ADMIN_EMAIL=corporativo@morises.com

# Apple Wallet (optional)
APPLE_PASS_TYPE_IDENTIFIER=
APPLE_TEAM_IDENTIFIER=
APPLE_PASS_CERTIFICATE=
APPLE_PASS_CERTIFICATE_PASSWORD=
```

### Database Setup:
1. Run all migrations in `/scripts/migrations/`
2. Ensure `corporativo@morises.com` has `role = 'super_admin'`
3. Enable RLS on all tables
4. Create indexes for performance

### Webhook URLs to Configure:
- Stripe: `https://yourdomain.com/api/webhooks/stripe`
- Conekta: `https://yourdomain.com/api/webhooks/conekta`
- Persona: `https://yourdomain.com/api/webhooks/persona`

---

## 10. TESTING CHECKLIST

- [ ] Register new user
- [ ] Purchase certificate (Stripe card)
- [ ] Complete KYC (Persona)
- [ ] Verify certificate activated
- [ ] Download PDF certificate
- [ ] Try Add to Wallet
- [ ] Register as agent
- [ ] Generate referral link
- [ ] Purchase via referral link
- [ ] Verify commission attributed
- [ ] Admin: approve KYC
- [ ] Admin: view payments
- [ ] Admin: manage certificates
- [ ] Admin: view capacity
