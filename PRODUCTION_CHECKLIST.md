# WEEK-CHAIN Production Deployment Checklist

## Pre-Deployment Validation

### Environment Configuration
- [ ] All environment variables configured in Vercel
- [ ] Run `npm run validate-env` to check configuration
- [ ] Review warnings and errors from environment validator
- [ ] Confirm `NODE_ENV=production`

### Payment Processors
- [ ] Stripe production keys configured
  - [ ] `STRIPE_SECRET_KEY` (sk_live_...)
  - [ ] `STRIPE_PUBLISHABLE_KEY` (pk_live_...)
  - [ ] `STRIPE_WEBHOOK_SECRET` configured
  - [ ] Webhook endpoint registered: `/api/payments/fiat/webhook`
  - [ ] Test payment flow end-to-end

- [ ] Conekta production keys configured
  - [ ] `CONEKTA_SECRET_KEY` (production key)
  - [ ] Webhook endpoint registered: `/api/payments/conekta/webhook`
  - [ ] Test OXXO payment flow
  - [ ] Test SPEI payment flow
  - [ ] Test card payment flow

### KYC & Compliance
- [ ] KYC provider selected and configured
  - [ ] Persona: `PERSONA_API_KEY`, `PERSONA_TEMPLATE_ID`
  - [ ] OR Sumsub: `SUMSUB_APP_TOKEN`, `SUMSUB_SECRET_KEY`
  - [ ] Webhook configured: `/api/kyc/webhook`
  - [ ] Test verification flow

- [ ] Mifiel configured for NOM-151
  - [ ] `MIFIEL_API_KEY`
  - [ ] `MIFIEL_API_SECRET`
  - [ ] `MIFIEL_WEBHOOK_USER`
  - [ ] `MIFIEL_WEBHOOK_SECRET`
  - [ ] Webhook configured: `/api/legal/mifiel-webhook`

### Email & Notifications
- [ ] Resend configured
  - [ ] `RESEND_API_KEY`
  - [ ] Test welcome email
  - [ ] Test purchase confirmation
  - [ ] Test reservation confirmation

### Blockchain
- [ ] Smart contracts deployed to Solana mainnet-beta
- [ ] Program IDs updated in `lib/solana/config.ts`
- [ ] Treasury wallets configured
- [ ] Test escrow flow
- [ ] Test NFT minting

### Database
- [ ] Supabase production database
- [ ] All SQL scripts executed
- [ ] Row Level Security (RLS) policies enabled
- [ ] Backup strategy configured

### Legal & Compliance
- [ ] Company legally constituted (S.A.P.I. de C.V.)
- [ ] Contract registered with PROFECO (NOM-029)
- [ ] Sandbox Regulatorio application submitted to CNBV
- [ ] Privacy policy published (LFPDPPP compliant)
- [ ] Terms of service published
- [ ] AML policies implemented

### Security
- [ ] All debug logs removed from production build
- [ ] API rate limiting configured
- [ ] CORS policies configured
- [ ] Security headers configured
- [ ] SSL/TLS certificates valid

### Monitoring
- [ ] Error tracking configured (Sentry recommended)
- [ ] Analytics configured (PostHog)
- [ ] Uptime monitoring configured
- [ ] Payment webhook monitoring

### Testing
- [ ] End-to-end payment flow (card, OXXO, SPEI, USDC)
- [ ] KYC verification flow
- [ ] Contract certification flow
- [ ] NFT minting flow
- [ ] Email notifications
- [ ] Mobile responsiveness
- [ ] Cross-browser compatibility

## Deployment Steps

1. **Pre-deployment**
   ```bash
   npm run build
   npm run validate-env
   npm run test
   ```

2. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

3. **Post-deployment verification**
   - [ ] Check environment status at `/api/health`
   - [ ] Verify all webhooks are receiving events
   - [ ] Test one transaction end-to-end
   - [ ] Monitor error logs for 24 hours

4. **Go-live announcement**
   - [ ] Update status page
   - [ ] Notify stakeholders
   - [ ] Monitor closely for first 48 hours

## Rollback Plan

If critical issues are detected:

1. Revert to previous deployment in Vercel
2. Investigate issue in staging environment
3. Fix and re-deploy
4. Document incident for post-mortem

## Support Contacts

- Technical Lead: [Contact]
- Legal Compliance: [Contact]
- Payment Support: [Contact]
- Emergency Hotline: [Number]
```

```json file="" isHidden
