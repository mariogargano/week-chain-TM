# WEEK-CHAIN Security Guidelines

## Overview

This document outlines the security measures implemented in the WEEK-CHAIN platform and guidance for developers maintaining the codebase.

---

## Critical Security Areas

### 1. **Payment Processing (PCI-DSS Compliance)**

#### ✅ What We Do Right
- **Card data is NEVER handled server-side**: All card tokenization happens in the browser using Conekta.js.
- **Opaque tokens only**: The server only receives `tok_*` tokens from Conekta, never raw card numbers (PANs).
- **Token validation**: `app/api/payments/conekta/card/route.ts` validates that inputs are Conekta tokens, rejecting any suspected raw PANs with HTTP 422.
- **Stripe webhooks verified**: All Stripe events are verified using HMAC signature validation.

#### ⚠️ Security Checklist for Developers
- **NEVER** add a route that accepts `card.number`, `card.cvv`, or other raw card data.
- **ALWAYS** require Conekta.js tokenization on the client before sending to server.
- **Log safely**: Never log sensitive payment fields. Use structured logging with field masks.
- **Webhook verification**: All incoming webhooks (Stripe, Conekta) must verify signatures. No exceptions.

#### 🚫 Known Limitations
- **Solana Pay**: Verification endpoint is disabled (returns 503) pending on-chain validation implementation.
  Use Stripe for production payments.

---

### 2. **Authentication & Authorization**

#### ✅ What We Do Right
- **Supabase Auth**: Handles identity via OAuth + email/password with proven security.
- **Role-based access control**: Middleware enforces user roles on protected routes.
- **KYC for high-value operations**: Certificate transfers and commission payouts require KYC.

#### ⚠️ Security Checklist for Developers
- **No hardcoded secrets**: All secrets come from environment variables.
- **Middleware validation**: Check `middleware.ts` for role restrictions before adding new protected routes.
- **Session handling**: Use Supabase session cookies (HTTP-only, Secure, SameSite=Lax).
- **KYC before payout**: Commission payments require verified KYC status.

---

### 3. **Environment Variables & Secrets**

#### ✅ What We Do Right
- **Critical vars validated at startup**: Run `scripts/verify-env-production.ts` in CI/CD.
- **Error sanitization**: API error responses never leak `process.env` values.
- **Webhook secrets isolated**: Stored in `process.env`, never in code or logs.

#### ⚠️ Required Environment Variables

**Critical (must be set before deploy):**
```bash
STRIPE_SECRET_KEY                    # Stripe secret key
STRIPE_WEBHOOK_SECRET                # Stripe webhook signature secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY   # Stripe public key (OK to expose)
SUPABASE_URL                         # Supabase project URL
SUPABASE_ANON_KEY                    # Supabase anonymous key
RESEND_API_KEY                       # Resend email service API key
```

**Optional (features disabled without them):**
```bash
STRIPE_WEBHOOK_SECRET_PRE_HOLDER  # Pre-holder webhook (if enabled)
CONEKTA_API_KEY                   # Conekta payments (if using card payments)
SOLANA_RPC_URL                    # Solana verification (currently disabled)
```

#### 🚀 Verification Before Deploy
```bash
# Run this in your CI/CD pipeline:
pnpm exec tsx scripts/verify-env-production.ts
```

---

### 4. **Rate Limiting & DDoS Protection**

#### ⚠️ Known Limitation
- **Current rate limiting is basic**: IP-based rate limiting only. Easy to bypass with proxies.

#### ✅ For Production Scale
- **Recommended**: Integrate Upstash Redis for distributed rate limiting.
- **Alternative**: Use Vercel Rate Limiting middleware.
- **At minimum**: Configure CloudFlare or similar edge-level protection.

---

### 5. **Database Security**

#### ✅ What We Do Right
- **Row-level security (RLS)**: Supabase RLS policies restrict data access by user role.
- **Parameterized queries**: All database access via Supabase SDK (no raw SQL injection risk).
- **Secrets isolation**: `SUPABASE_ANON_KEY` only has read/write perms for user-scoped data.

#### ⚠️ Security Checklist for Developers
- **Check RLS policies**: Before adding new tables, implement row-level security.
- **Use Supabase client**: Never construct raw SQL strings.
- **Test with limited role**: Verify that non-admin users cannot access admin-only tables.

---

### 6. **Webhook Security**

#### ✅ What We Do Right
- **Signature verification**: All webhooks (Stripe, Conekta) verify incoming signatures.
- **Idempotency**: Webhook handlers store `event_id` to prevent duplicate processing.
- **Error sanitization**: Webhook errors return generic messages, never expose internals.

#### ⚠️ Checklist for New Webhook Handlers
1. ✅ Verify incoming signature (use service SDK or manual HMAC).
2. ✅ Check `webhook_events` table for duplicate `event_id`.
3. ✅ Mark event as `processed` after successful handling.
4. ✅ Return generic error message if signature fails (no details leaked).
5. ✅ Implement idempotent operations (safe to retry).

---

### 7. **Build & Deployment**

#### ✅ What We Do Right
- **Quality gates enabled**: TypeScript and ESLint errors block the build.
- **Reproducible builds**: Dockerfile uses `pnpm install --frozen-lockfile`.
- **No secrets in code**: Environment variables loaded at runtime.

#### ⚠️ Checklist for Developers
- **Never disable quality gates**: If TypeScript errors appear, fix them — don't set `ignoreBuildErrors: true`.
- **Use pnpm**: Project uses pnpm-lock.yaml. Never use npm/yarn directly.
- **Test locally**: Run `pnpm build` to verify no silent errors.

---

## Incident Response

### If You Suspect a Data Breach
1. **Stop the service**: Immediately stop accepting new requests.
2. **Notify the security team**: Contact `corporativo@morises.com`.
3. **Check logs**: Review `admin_activity`, `webhook_events`, and application logs.
4. **Revoke compromised credentials**: Update `process.env` variables in Vercel.
5. **Audit affected users**: Query affected records and notify users if data was exposed.

### If a CVE Affects Dependencies
1. **Run `pnpm audit`**: Identify vulnerable packages.
2. **Update or replace**: Use `pnpm up` or switch to maintained alternatives.
3. **Test thoroughly**: Run full test suite before deploying.
4. **Deploy emergency patch**: Push to production with priority.

---

## Security Monitoring Checklist

- [ ] **Environment validation**: `scripts/verify-env-production.ts` passes in CI/CD.
- [ ] **Build succeeds**: No TypeScript or ESLint errors.
- [ ] **Webhooks validated**: All incoming webhooks verify signatures.
- [ ] **Error messages safe**: No secrets in API error responses.
- [ ] **Database RLS enabled**: New tables have row-level security policies.
- [ ] **Rate limiting active**: Edge-level or application-level protection in place.
- [ ] **Logs clean**: No sensitive data in application logs.
- [ ] **Dependencies scanned**: `pnpm audit` shows no critical/high vulnerabilities.

---

## Questions?

For security-related questions or to report a vulnerability, contact:
- **Security Lead**: corporativo@morises.com
- **Development Team**: GitHub Issues (private repo)

**Do not disclose security vulnerabilities publicly. Use responsible disclosure.**
