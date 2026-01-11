# Legalario Webhook Security Implementation

## Overview

This document describes the security measures implemented for the Legalario webhook endpoint to ensure compliance with NOM-151 and protect against unauthorized access.

## Security Layers

### 1. Rate Limiting
- **Limit**: 10 requests per minute per IP address
- **Purpose**: Prevent abuse and DDoS attacks
- **Implementation**: In-memory rate limiter with automatic cleanup
- **Response**: HTTP 429 with Retry-After header

### 2. IP Allowlist
- **Purpose**: Restrict webhook access to known Legalario servers
- **Configuration**: Update `lib/legalario/ip-allowlist.ts` with official IPs
- **Fallback**: Allows all IPs in development and when no IPs are configured
- **Future**: Add Legalario's published webhook IPs when available

### 3. Signature Verification
- **Method**: HMAC-SHA256 with timing-safe comparison
- **Secret**: `LEGALARIO_WEBHOOK_SECRET` environment variable (required)
- **Protection**: Prevents replay attacks and unauthorized webhooks
- **Response**: HTTP 401 for invalid signatures

### 4. Comprehensive Logging
All webhook requests are logged with:
- IP address
- User agent
- Signature validity
- Payload SHA256 digest
- Timestamp
- Processing result

### 5. Service Role Isolation
- Webhook endpoint uses dedicated service role client
- Other API routes use anon key with RLS enabled
- Minimizes service role exposure surface

## NOM-151 Certification Guard

### Database Trigger
A PostgreSQL trigger (`trg_guard_mint_requires_cert`) prevents NFT minting without proper certification:

**Required fields:**
- `status = 'certified'`
- `nom151_folio` (not null)
- `sha256_hash` (not null)
- `certified_at` (not null)

**Script**: `scripts/036_guard_mint_requires_certification.sql`

### Enforcement
Any attempt to mint an NFT without these requirements will fail with a descriptive error message.

## Environment Variables Required

```env
LEGALARIO_WEBHOOK_SECRET=your_webhook_secret_here
LEGALARIO_API_KEY=your_api_key_here
LEGALARIO_API_URL=https://api.legalario.com
```

## Monitoring

Check webhook logs in the admin dashboard:
- `/dashboard/admin/system-diagnostics`
- Review failed webhooks
- Monitor rate limit violations
- Track signature verification failures

## Testing

### Valid Webhook Test
```bash
curl -X POST https://your-domain.com/api/legalario/webhook \
  -H "x-legalario-signature: COMPUTED_HMAC_SHA256" \
  -H "Content-Type: application/json" \
  -d '{"contract_id":"123","status":"signed"}'
```

### Expected Responses
- **200**: Webhook processed successfully
- **401**: Invalid signature
- **403**: Unauthorized IP
- **429**: Rate limit exceeded
- **500**: Internal server error

## Maintenance

1. **Update IP Allowlist**: Add Legalario's official IPs when published
2. **Monitor Logs**: Review webhook logs regularly for suspicious activity
3. **Rotate Secrets**: Update `LEGALARIO_WEBHOOK_SECRET` periodically
4. **Cleanup**: Old webhook logs are automatically cleaned up after 90 days

## Security Checklist

- [x] Rate limiting implemented (10 req/min)
- [x] IP allowlist configured
- [x] HMAC-SHA256 signature verification
- [x] Timing-safe signature comparison
- [x] Comprehensive audit logging
- [x] Service role isolation
- [x] NOM-151 certification guard trigger
- [x] SHA256 payload digest logging
- [ ] Add Legalario's official webhook IPs (pending publication)

## Contact

For security concerns or to report vulnerabilities, contact: security@week-chain.com
