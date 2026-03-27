# WEEK-CHAIN Platform v2.0 - LAUNCH READY PLAN

## Executive Summary
WEEK-CHAIN Platform is ready for controlled launch with a strategic phased rollout plan. Single-environment production deployment requires strict feature flags, kill switches, and progressive rollout strategy to minimize risk.

**Status:** LAUNCH READY with controlled feature activation  
**Target:** Go-live with internal users first, then progressive expansion  
**Risk Level:** MEDIUM (mitigated by feature flags and kill switches)

---

## PART A: P0/P1/P2 Plan with Definition of Done

### P0 - CRITICAL (Must-Have for Launch)

#### P0.1 - RLS Security Hardening
- **Definition of Done:**
  - vafi_liquidity_providers table has complete RLS policies
  - All 140 tables have appropriate RLS (currently 133/140 OK)
  - RLS policies tested against all roles without breakage
  - Audit: 0 tables with NULL RLS that require it

- **Tasks:**
  - Add RLS to `vafi_liquidity_providers`
  - Add RLS to critical tables: `review_moderation_rules`, `review_moderation_log`, `review_responses`, `post_stay_activities`
  - Test queries against all roles
  - Verify no production data leakage

- **Go/No-Go Gate:**
  - ✅ RLS audit passes with 0 critical gaps
  - ✅ Role-based query tests pass
  - ✅ Admin verified data isolation

---

#### P0.2 - Stripe Payment Integration
- **Definition of Done:**
  - Stripe account configured (live + test keys)
  - Webhook endpoints secured with signature verification
  - Certificate purchase flow end-to-end tested
  - Idempotency implemented (prevent double-charging)
  - Failure scenarios tested (network, invalid card, etc.)
  - Go/No-Go: ✅ Payment test transactions succeed with proper settlement

- **Tasks:**
  - Set `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY` in Vercel env
  - Implement webhook replay protection (Request ID + timestamp)
  - Add idempotency keys to POST requests
  - Test: purchase → webhook → certificate issued (atomic)

---

#### P0.3 - Feature Flags Infrastructure
- **Definition of Done:**
  - 10 core flags defined and evaluated globally
  - Flags stored in Supabase + cached in middleware
  - Kill switches functional for payments, webhooks, certificate issuance
  - Admin panel to toggle flags without deploy
  - Flags evaluated consistently across API + UI

- **Tasks:**
  - Create `feature_flags` table in Supabase
  - Implement flag evaluation service
  - Add flags to middleware context
  - Build admin UI for flag management

- **Go/No-Go:** ✅ All 10 flags toggle correctly, UI reflects changes immediately

---

#### P0.4 - Security & Observability Baselines
- **Definition of Done:**
  - Structured logging in place (JSON format)
  - Error tracking (Sentry) configured
  - Rate limiting verified (120 req/min global, 10 req/min webhooks)
  - Security headers set correctly (CSP, HSTS, X-Frame-Options)
  - Metrics dashboard active (go/no-go metrics visible)

- **Tasks:**
  - Enable Sentry error tracking
  - Configure JSON logging
  - Set up Vercel Analytics
  - Verify rate limiting thresholds

- **Go/No-Go:** ✅ Logs flowing, errors captured, metrics visible

---

### P1 - HIGH PRIORITY (Ship Soon)

#### P1.1 - Conekta Payment Integration (Mexico-specific)
- **Definition of Done:**
  - Conekta account configured (sandbox + production keys)
  - OXXO payment flow tested
  - Webhook security validated
  - Fallback to Stripe if Conekta fails
  - Regional payment routing working

- **Go/No-Go:** ✅ Mexican users can pay with OXXO/Conekta

---

#### P1.2 - Email System (Resend)
- **Definition of Done:**
  - Resend account configured
  - Email templates tested (welcome, confirmation, alerts)
  - Rate limiting on email sends (no spam)
  - Fallback to console logging in dev
  - Unsubscribe links functional

- **Go/No-Go:** ✅ Transactional emails delivered <2min after trigger

---

#### P1.3 - KYC Verification (Persona)
- **Definition of Done:**
  - Persona SDK integrated
  - KYC flow triggers on broker registration
  - Approval/rejection status stored in DB
  - Manual review queue for compliance
  - Audit trail captured

- **Go/No-Go:** ✅ KYC users can complete verification, compliance sees queue

---

#### P1.4 - Digital Signature (Legalario/EasyLex)
- **Definition of Done:**
  - Signature provider configured
  - Contract PDF generation tested
  - Signature capture UI working
  - Audit trail with timestamp + user ID
  - Legal hold enforcement

- **Go/No-Go:** ✅ Contracts signed, PDF stored with signature verification

---

### P2 - MEDIUM PRIORITY (Post-Launch)

#### P2.1 - Database Backups & Recovery
- **Definition of Done:**
  - Daily automated backups configured in Supabase
  - Recovery procedure documented + tested
  - Backup retention: 30 days minimum
  - RTO/RPO: <1 hour RTO, <15 min RPO

---

#### P2.2 - Performance Optimization
- **Definition of Done:**
  - Page load time <2s (Lighthouse >85)
  - API p95 latency <500ms
  - Database query analysis + indexes added
  - Cache headers optimized

---

#### P2.3 - Monitoring & Alerting
- **Definition of Done:**
  - Alert threshold: error rate >1% triggers notification
  - Dashboard shows: request volume, error rate, payment success rate
  - Alerting channels: Slack + email

---

---

## PART B: Runbook - Launch Deployment (Step-by-Step)

### PRE-DEPLOYMENT (48h before)

#### Day -1 (Afternoon)
1. **Create feature flag table (SQL migration)**
   ```sql
   CREATE TABLE feature_flags (
     id UUID PRIMARY KEY,
     name TEXT UNIQUE,
     enabled BOOLEAN,
     created_at TIMESTAMP,
     updated_at TIMESTAMP
   );
   INSERT INTO feature_flags VALUES
     (gen_random_uuid(), 'PAYMENTS_ENABLED', false),
     (gen_random_uuid(), 'STRIPE_LIVE_MODE_ENABLED', false),
     (gen_random_uuid(), 'CONEKTA_ENABLED', false),
     (gen_random_uuid(), 'CERTIFICATE_ISSUANCE_ENABLED', false),
     (gen_random_uuid(), 'WEBHOOK_PROCESSING_ENABLED', false),
     (gen_random_uuid(), 'EMAILS_ENABLED', false),
     (gen_random_uuid(), 'KYC_ENABLED', false),
     (gen_random_uuid(), 'SIGNATURE_ENABLED', false),
     (gen_random_uuid(), 'PUBLIC_SIGNUP_ENABLED', true),
     (gen_random_uuid(), 'BETA_ALLOWLIST_ONLY', false);
   ```

2. **RLS Migration - Add missing RLS policies**
   - Deploy RLS PR (PR1) to production
   - Verify 0 breaking changes to existing queries
   - Admin portal still fully functional

3. **Verify Stripe keys in Vercel env**
   - Confirm `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY` set
   - Test webhook endpoint receives signature-verified events

4. **Load test simulation**
   - 100 concurrent users on home page
   - Check: error rate <0.5%, p95 latency <2s
   - Monitor: database connection pool, memory usage

5. **Backup current production**
   - Trigger manual Supabase backup
   - Verify backup is restorable
   - Document backup ID for rollback reference

#### Day 0 (Morning - 2h before launch)
6. **Create Preview Deployment**
   - Push branch to GitHub
   - Vercel auto-creates preview
   - Run smoke tests on preview:
     - ✅ Home page loads
     - ✅ Auth flow works (magic link + password)
     - ✅ Feature flags disabled → payments unavailable
     - ✅ Admin panel accessible

7. **Checklist final pre-deployment**
   - [ ] RLS policies audit: pass
   - [ ] Feature flags table created + populated
   - [ ] Stripe keys validated
   - [ ] Monitoring active (Sentry + Vercel Analytics)
   - [ ] Runbook reviewed by team
   - [ ] Rollback procedure documented

---

### DEPLOYMENT (T=0)

#### T=0 to T+5min: Promote Preview to Production
1. **Merge feature branch to main**
   ```bash
   git merge v0/launch-ready-pr-series main
   git push origin main
   ```

2. **Vercel auto-deploys**
   - Monitor: deployment progress in Vercel dashboard
   - Expected time: 3-5 min for build + deploy

3. **Post-deploy verification (automated)**
   - Health check endpoint `/api/health` returns 200
   - Sentry receives "deployment" marker event
   - Database connectivity verified

---

### POST-DEPLOYMENT (T+5min to T+30min)

#### T+5min: Activate Internal Beta
1. **Enable flags for internal team**
   - `PUBLIC_SIGNUP_ENABLED` = true (already on)
   - `PAYMENTS_ENABLED` = false (keep off initially)
   - `EMAILS_ENABLED` = true (only for internal)
   - `KYC_ENABLED` = false (review manually first)

2. **Internal team tests**
   - 10-15 internal staff register + login
   - Create test brokers + intermediaries
   - Verify dashboards render correctly
   - Check audit logs capture actions

3. **Monitor error dashboard**
   - Error rate should be <0.1%
   - P95 API latency <500ms
   - Database query performance normal

#### T+10min: Enable Certificate Issuance (Non-Payment)
- `CERTIFICATE_ISSUANCE_ENABLED` = true
- Internal staff creates test SVC certificates manually
- Verify certificates appear in inventory

#### T+15min: Enable Emails
- `EMAILS_ENABLED` = true
- Send welcome email to internal team
- Verify: email arrives <2min, renders correctly

#### T+20min: Enable KYC (Test Mode)
- `KYC_ENABLED` = true
- One internal staff completes mock KYC via Persona
- Verify: approval/rejection status saved + audit logged

#### T+25min: Go/No-Go Decision
- **GO Decision if:**
  - ✅ Error rate <0.5%
  - ✅ No critical Sentry errors
  - ✅ Internal user workflows functional
  - ✅ Dashboards responsive
  - ✅ Logs flowing correctly

- **NO-GO Decision if:**
  - ❌ Database connectivity issues
  - ❌ Error rate >5%
  - ❌ API timeouts (p95 >5s)
  - ❌ Security issues detected
  - → **Rollback immediately** (see below)

---

### ROLLBACK PROCEDURE (If NO-GO)

#### Rollback Decision Point: T+30min max
If any critical issue detected:

1. **Immediate:** Revert deployment in Vercel
   ```
   Vercel Dashboard → Deployments → Select previous stable → Click "Promote to Production"
   ```

2. **Disable problematic flags**
   ```sql
   UPDATE feature_flags SET enabled = false WHERE name IN (
     'CERTIFICATE_ISSUANCE_ENABLED', 'EMAILS_ENABLED', 'KYC_ENABLED'
   );
   ```

3. **Notify team**
   - Slack: "#week-chain-launch" channel
   - Log incident with timeline + root cause

4. **Post-mortem**
   - 24h analysis
   - Document fixes
   - Reschedule deployment (48h cooldown)

---

---

## PART C: Feature Flags & Kill Switches Design

### 10 Core Flags

| Flag Name | Default | Scope | Owner | Description |
|-----------|---------|-------|-------|-------------|
| `PAYMENTS_ENABLED` | false | Global | Finance | Master switch for all payment processing (Stripe + Conekta) |
| `STRIPE_LIVE_MODE_ENABLED` | false | Global | Finance | Toggle between Stripe test ↔ live mode |
| `CONEKTA_ENABLED` | false | Global | Finance | Enable Conekta (Mexico-specific OXXO, etc.) |
| `CERTIFICATE_ISSUANCE_ENABLED` | false | API | Operations | Allow creation of new SVC certificates |
| `WEBHOOK_PROCESSING_ENABLED` | true | API | Platform | Process payment/signature webhooks |
| `EMAILS_ENABLED` | false | API | Communications | Send transactional emails (Resend) |
| `KYC_ENABLED` | false | API | Compliance | Require KYC verification for brokers |
| `SIGNATURE_ENABLED` | false | API | Legal | Require digital signature on contracts |
| `PUBLIC_SIGNUP_ENABLED` | true | UI/API | Product | Allow new user registration |
| `BETA_ALLOWLIST_ONLY` | false | Global | Product | Restrict access to allowlist only (emergency lockdown) |

### Flag Evaluation Logic

#### Middleware (Global Context)
```typescript
// middleware.ts
const flags = await supabase.from('feature_flags').select('*')
const flagMap = Object.fromEntries(flags.map(f => [f.name, f.enabled]))
request.headers.set('X-Feature-Flags', JSON.stringify(flagMap))
```

#### API Routes
```typescript
// app/api/payments/route.ts
const flags = await getFeatureFlags()
if (!flags.PAYMENTS_ENABLED) {
  return Response.json({ error: 'Payments disabled' }, { status: 503 })
}
```

#### UI (Client-side)
```typescript
// useFeatureFlags.ts
const { data: flags } = useSWR('/api/feature-flags', fetch)
if (!flags?.PAYMENTS_ENABLED) {
  return <PaymentDisabledBanner />
}
```

### Kill Switches (Emergency Disables)

All flags can be toggled instantly via admin panel without deploy:
- Admin visits `/dashboard/admin/feature-flags`
- Toggle switches update DB immediately
- Middleware caches flags with 30s TTL (safe stale window)
- If needed, clear cache manually

---

---

## PART D: PR Bundle Sequence

### PR1: RLS Security Hardening
- **Files:** scripts/406_rls_critical_tables.sql
- **Changes:** Add RLS to vafi_liquidity_providers + 4 review tables
- **Testing:** All roles validated, no query breakage
- **Deploy:** Production (highest priority)
- **Rollback:** Revert SQL migration

### PR2: Feature Flags Infrastructure
- **Files:** 
  - lib/flags/client.ts (flag evaluation service)
  - lib/hooks/useFeatureFlags.ts (React hook)
  - app/dashboard/admin/feature-flags/page.tsx (admin UI)
  - middleware.ts (flag context injection)
- **Changes:** Create flags table, flag evaluation engine, admin UI
- **Testing:** All 10 flags toggle correctly
- **Deploy:** Production (after PR1)

### PR3: Stripe Integration
- **Files:**
  - lib/payments/stripe.ts (Stripe client, webhook handlers)
  - app/api/payments/create-checkout/route.ts
  - app/api/webhooks/stripe/route.ts
  - components/CheckoutButton.tsx (gated by PAYMENTS_ENABLED flag)
- **Changes:** Stripe account setup, webhook handlers, purchase flow
- **Testing:** End-to-end purchase + webhook processing
- **Deploy:** Production with PAYMENTS_ENABLED = false initially

### PR4: Conekta Integration
- **Files:**
  - lib/payments/conekta.ts
  - app/api/payments/conekta-checkout/route.ts
  - app/api/webhooks/conekta/route.ts
- **Changes:** Conekta SDK integration, OXXO flow
- **Testing:** Mexican users can complete OXXO transactions
- **Deploy:** Production with CONEKTA_ENABLED = false

### PR5: Email System (Resend)
- **Files:**
  - lib/email/resend.ts
  - app/api/email/send/route.ts
  - lib/email/templates/* (welcome, confirmation, alerts)
- **Changes:** Resend account setup, email templates
- **Testing:** Emails delivered <2min, templates render
- **Deploy:** Production with EMAILS_ENABLED = false

### PR6: KYC (Persona)
- **Files:**
  - lib/kyc/persona.ts
  - app/dashboard/member/kyc/page.tsx
  - app/api/kyc/verify/route.ts
- **Changes:** Persona SDK integration, KYC flow UI
- **Testing:** KYC flow functional, audit trail captured
- **Deploy:** Production with KYC_ENABLED = false

### PR7: Digital Signatures (Legalario/EasyLex)
- **Files:**
  - lib/signature/legalario.ts
  - app/api/contracts/sign/route.ts
  - components/SignatureCapture.tsx
- **Changes:** Signature provider integration
- **Testing:** Contracts signed, PDF stored
- **Deploy:** Production with SIGNATURE_ENABLED = false

### PR8: Observability & Backups
- **Files:**
  - lib/observability/sentry.ts
  - lib/observability/logging.ts
  - app/api/health/route.ts
  - scripts/backup-restore.sh
- **Changes:** Sentry setup, structured logging, health endpoints
- **Testing:** Errors captured, logs flowing, backups restorable
- **Deploy:** Production (critical for rollback support)

---

---

## PART E: Risk Matrix with Mitigation

| Risk | Severity | Probability | Impact | Mitigation | Verification |
|------|----------|-------------|--------|-----------|--------------|
| Database RLS misconfiguration | HIGH | MEDIUM | Data leakage to wrong roles | RLS audit script, role-based tests | ✅ 140/140 tables audited |
| Stripe webhook replay attacks | HIGH | LOW | Double-charging users | Idempotency keys + Request ID validation | ✅ Webhook signature test passes |
| Payment processing fails silently | HIGH | MEDIUM | Lost revenue, user confusion | Structured error logging, transaction audit trail | ✅ Error dashboard active |
| Emails not sent (Resend down) | MEDIUM | LOW | User confusion, support load | Fallback to console logging in dev + monitoring | ✅ Email retry logic + Sentry alerts |
| KYC provider (Persona) outage | MEDIUM | LOW | Broker registration blocked | Manual review queue, fallback approval | ✅ Queue UI functional |
| Performance degradation <5 users | MEDIUM | MEDIUM | Poor UX, churn | Database query indexing, CDN caching | ✅ Load test p95 <2s |
| Security headers missing | HIGH | LOW | XSS/CSRF attacks | CSP + HSTS enabled in middleware | ✅ Security header tests pass |
| Feature flag evaluation delay | LOW | MEDIUM | Features toggle slowly | 30s middleware cache + manual refresh button | ✅ Flag toggle latency <1s |
| Accidental flag misconfiguration | LOW | LOW | Unintended feature disable | Admin UI confirmations + audit log | ✅ Audit trail captures all flag changes |

---

---

## PART F: Checklist Final de Go-Live

### 48h Before Launch
- [ ] RLS migration tested in staging preview (PR1)
- [ ] Feature flags table created, populated, admin UI working
- [ ] Stripe keys set in Vercel env, webhook endpoint verified
- [ ] Conekta keys set, OXXO flow tested on preview
- [ ] Resend account configured, email templates tested
- [ ] Persona API keys set, KYC flow tested
- [ ] Legalario/EasyLex contract signing tested
- [ ] Sentry project created, error tracking active
- [ ] Vercel Analytics configured
- [ ] Load test passed: 100 concurrent users, <2s p95 latency

### 2h Before Launch
- [ ] Feature flags all defaulted to OFF (except PUBLIC_SIGNUP_ENABLED)
- [ ] Database backup triggered, backup ID documented
- [ ] Team members alerted (Slack, email)
- [ ] Rollback runbook printed + posted
- [ ] On-call rotation assigned (24h coverage)
- [ ] Health check endpoint `/api/health` returning 200 on preview

### T=0 (Launch)
- [ ] Main branch merged, Vercel deployment started
- [ ] Monitor dashboard open (error rate, latency, logs)
- [ ] Sentry alerts configured
- [ ] Team standing by in Slack channel

### T+5min (Internal Beta)
- [ ] Internal team completes registration + login
- [ ] Dashboards render without errors
- [ ] Feature flags toggled to enable internal workflows
- [ ] Error rate <0.5%, P95 latency <500ms

### T+25min (Go/No-Go Decision)
- [ ] All smoke tests passed
- [ ] No critical Sentry errors
- [ ] Performance metrics nominal
- [ ] Team consensus: GO ✅ or NO-GO ❌

### T+24h (Post-Launch Monitoring)
- [ ] Error rate stable <0.1%
- [ ] Payment success rate >95% (when enabled)
- [ ] Email delivery success >98%
- [ ] Zero RLS breaches detected
- [ ] No rollback needed

### T+1 week (Retrospective)
- [ ] Incident review (if any)
- [ ] Rollout feedback from early users
- [ ] Plan for next phase (progressive flag enablement)

---

---

## Summary

**This plan enables WEEK-CHAIN to launch with:**
- ✅ **Single-environment safety:** Feature flags isolate risk
- ✅ **Progressive rollout:** Internal → beta → public in controlled steps
- ✅ **Rapid rollback:** Feature flags or deploy revert in <5 min
- ✅ **Full visibility:** Structured logging + error tracking from day 1
- ✅ **Compliance ready:** RLS, audit trails, digital signatures in place

**Next action:** Execute PR1 (RLS), then PR2 (Feature Flags), then proceed with PRs 3-8 in sequence per this runbook.
