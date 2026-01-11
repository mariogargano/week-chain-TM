# WEEK-CHAIN Legal-First NFT Minting - Testing Guide

## Prerequisites

Before testing, ensure you have:

1. All environment variables configured (see `.env.example`)
2. Supabase database with migrations applied
3. Legalario webhook secret configured
4. Solana keypair for minting (devnet or mainnet)

## Environment Setup

```bash
# Copy environment template
cp .env.example .env.local

# Fill in required values:
# - LEGALARIO_WEBHOOK_SECRET
# - SOLANA_KEYPAIR_BASE64
# - SUPABASE credentials
# - Stripe keys

# Validate environment
npm run validate-env
```

## Test 1: Environment Validation

```bash
# Should pass with all required env vars
npm run validate-env

# Expected output:
# ✅ Environment variables validated successfully
```

## Test 2: Health Check

```bash
curl -X GET http://localhost:3000/api/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:00:00.000Z",
  "environment": "development",
  "solana_network": "devnet",
  "checks": {
    "database": "healthy",
    "legalario": "configured",
    "stripe": "configured",
    "solana": "configured"
  }
}
```

## Test 3: Legalario Webhook - Invalid Signature

```bash
# This should fail with 401
curl -X POST http://localhost:3000/api/legalario/webhook \
  -H "Content-Type: application/json" \
  -H "x-legalario-signature: invalid_signature" \
  -H "x-legalario-timestamp: $(date +%s)" \
  -d '{
    "event": "contract.certified",
    "data": {
      "contract_id": "test-123",
      "folio": "MX-2025-001",
      "sha256": "abc123...",
      "certified_at": "2025-01-15T10:00:00Z",
      "status": "certified"
    }
  }'

# Expected response:
{
  "error": "Invalid signature",
  "details": "Signature verification failed"
}
```

## Test 4: Legalario Webhook - Valid Signature

To generate a valid HMAC signature:

```bash
# Generate signature using openssl
TIMESTAMP=$(date +%s)
PAYLOAD='{"event":"contract.certified","data":{"contract_id":"550e8400-e29b-41d4-a716-446655440000","folio":"MX-2025-001","sha256":"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855","certified_at":"2025-01-15T10:00:00Z","status":"certified"}}'
SIGNATURE=$(echo -n "${TIMESTAMP}.${PAYLOAD}" | openssl dgst -sha256 -hmac "your_webhook_secret" -hex | cut -d' ' -f2)

curl -X POST http://localhost:3000/api/legalario/webhook \
  -H "Content-Type: application/json" \
  -H "x-legalario-signature: ${SIGNATURE}" \
  -H "x-legalario-timestamp: ${TIMESTAMP}" \
  -d "${PAYLOAD}"
```

Expected response:
```json
{
  "success": true,
  "message": "Contract certification processed",
  "contract_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

## Test 5: Rate Limiting

```bash
# Send 11 requests within 1 minute (should get rate limited)
for i in {1..11}; do
  echo "Request $i"
  curl -X POST http://localhost:3000/api/legalario/webhook \
    -H "Content-Type: application/json" \
    -H "x-legalario-signature: test" \
    -H "x-legalario-timestamp: $(date +%s)" \
    -d '{"test": true}'
  echo ""
done

# Request 11 should return:
{
  "error": "Rate limit exceeded"
}
# With headers:
# X-RateLimit-Limit: 10
# X-RateLimit-Remaining: 0
# X-RateLimit-Reset: 2025-01-15T10:01:00.000Z
```

## Test 6: Database Guard - Mint Without Certification

```bash
# This should fail with trigger exception
curl -X POST http://localhost:3000/api/nft/mint \
  -H "Content-Type: application/json" \
  -d '{
    "contract_id": "non-certified-contract-id",
    "recipient_address": "5zWM7...abc"
  }'

# Expected error:
{
  "error": "Contract not certified under NOM-151"
}
```

## Test 7: Complete Flow - Certification to Mint

### Step 1: Create a test contract in database

```sql
-- Run in Supabase SQL editor
INSERT INTO legal_contracts (
  id, 
  series_id, 
  user_id, 
  voucher_id, 
  nom151_folio,
  sha256_hash,
  status
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'B1',
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM vouchers LIMIT 1),
  'PENDING',
  'pending',
  'draft'
);
```

### Step 2: Simulate Legalario certification webhook

```bash
TIMESTAMP=$(date +%s)
CONTRACT_ID="550e8400-e29b-41d4-a716-446655440000"
PAYLOAD="{\"event\":\"contract.certified\",\"data\":{\"contract_id\":\"${CONTRACT_ID}\",\"folio\":\"MX-2025-001\",\"sha256\":\"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855\",\"certified_at\":\"2025-01-15T10:00:00Z\",\"status\":\"certified\"}}"
SIGNATURE=$(echo -n "${TIMESTAMP}.${PAYLOAD}" | openssl dgst -sha256 -hmac "${LEGALARIO_WEBHOOK_SECRET}" -hex | cut -d' ' -f2)

curl -X POST http://localhost:3000/api/legalario/webhook \
  -H "Content-Type: application/json" \
  -H "x-legalario-signature: ${SIGNATURE}" \
  -H "x-legalario-timestamp: ${TIMESTAMP}" \
  -d "${PAYLOAD}"
```

### Step 3: Verify contract is certified

```sql
SELECT * FROM legal_contracts 
WHERE id = '550e8400-e29b-41d4-a716-446655440000';

-- Should show:
-- status: 'certified'
-- folio: 'MX-2025-001'
-- sha256_hash: 'e3b0c44...'
-- certified_at: '2025-01-15T10:00:00Z'
```

### Step 4: Mint NFT

```bash
curl -X POST http://localhost:3000/api/nft/mint \
  -H "Content-Type: application/json" \
  -d '{
    "contract_id": "550e8400-e29b-41d4-a716-446655440000",
    "recipient_address": "5zWM7ZRmEiCF8AHPThC2D3Pq4RTjWKcZHEVLWdXzL3zE"
  }'

# Expected response:
{
  "success": true,
  "mint_address": "9XYZ...",
  "tx_signature": "3KJH...",
  "metadata_uri": "https://arweave.net/...",
  "explorer_url": "https://explorer.solana.com/address/9XYZ...?cluster=devnet",
  "contract_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Step 5: Verify NFT on Solana Explorer

```bash
# Open the explorer_url from previous response
# Verify:
# - Mint address exists
# - Metadata URI is accessible
# - NOM-151 data is in metadata
```

### Step 6: Check Evidence Package

```bash
# Query Supabase Storage
curl "https://<project-ref>.supabase.co/storage/v1/object/public/legal-documents/evidence/${CONTRACT_ID}/evidence-package-*.zip"

# Download and unzip to verify contents:
# - contract.pdf
# - certificate.pdf
# - metadata.json
# - transaction_receipt.txt
# - README.txt
```

## Test 8: IP Allowlist (Production Only)

In production, webhook should only accept requests from Legalario IPs:

```bash
# From unauthorized IP (should fail in production)
curl -X POST https://your-domain.com/api/legalario/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# Expected response (in production):
{
  "error": "Forbidden"
}
```

## Test 9: Verify Webhook Logs

```sql
-- Check webhook_logs table
SELECT * FROM webhook_logs 
WHERE source = 'legalario' 
ORDER BY created_at DESC 
LIMIT 10;

-- Should show:
-- - All webhook attempts
-- - IP addresses
-- - Signatures
-- - Verification results
-- - Processing time
```

## Test 10: Database Trigger Test

```sql
-- Attempt to insert NFT mint without certified contract
-- This should fail with exception
INSERT INTO nft_mints (
  contract_id,
  mint_address,
  recipient_address,
  metadata_uri,
  tx_signature
) VALUES (
  '00000000-0000-0000-0000-000000000000', -- Non-existent contract
  'test-mint',
  'test-recipient',
  'test-uri',
  'test-sig'
);

-- Expected error:
-- ERROR: NOM-151 certification required before minting
```

## Performance Benchmarks

Expected performance metrics:

- Webhook processing: < 100ms
- Signature verification: < 10ms
- NFT minting: 2-5 seconds (including Arweave upload)
- Evidence ZIP generation: < 500ms

## Security Checklist

- ✅ HMAC signature verification
- ✅ Timestamp validation (5-minute tolerance)
- ✅ Timing-safe comparison
- ✅ Rate limiting (10 req/min per IP)
- ✅ IP allowlist (production)
- ✅ Database guards (NOM-151 required)
- ✅ Service role isolation
- ✅ Comprehensive logging
- ✅ Security headers in middleware
- ✅ Environment validation with Zod

## Troubleshooting

### Issue: "Invalid signature"
- Verify `LEGALARIO_WEBHOOK_SECRET` matches Legalario configuration
- Check timestamp is within 5-minute tolerance
- Ensure payload is not modified between signing and verification

### Issue: "NOM-151 certification required"
- Verify contract status is 'certified' in database
- Ensure `folio`, `sha256_hash`, and `certified_at` are not NULL
- Check trigger is enabled: `SELECT * FROM pg_trigger WHERE tgname = 'trg_guard_mint_requires_cert';`

### Issue: "Rate limit exceeded"
- Wait 1 minute for rate limit to reset
- Check if multiple IPs are being used (load balancer)
- Verify rate limit configuration in `lib/legalario/rate-limiter.ts`

### Issue: "Metadata upload failed"
- Check Solana RPC is accessible
- Verify keypair has sufficient SOL for Arweave upload
- Ensure Irys (Arweave) service is operational

## Production Deployment Checklist

Before deploying to production:

1. ✅ Set `NODE_ENV=production`
2. ✅ Configure `LEGALARIO_WEBHOOK_SECRET` (production value)
3. ✅ Set `SOLANA_NETWORK=mainnet-beta`
4. ✅ Update Legalario IP allowlist in `lib/legalario/ip-allowlist.ts`
5. ✅ Test with Legalario sandbox first
6. ✅ Run all SQL migrations
7. ✅ Verify all environment variables with `npm run validate-env`
8. ✅ Enable Supabase RLS policies
9. ✅ Configure Stripe webhook secret
10. ✅ Test complete flow end-to-end

## Monitoring

Key metrics to monitor:

- Webhook success/failure rate
- NFT minting success rate
- Rate limit hits
- Signature verification failures
- Database guard exceptions
- Average processing time
- Arweave upload failures

Query for monitoring:

```sql
-- Webhook success rate (last 24 hours)
SELECT 
  COUNT(*) FILTER (WHERE response_status = 200) as success_count,
  COUNT(*) FILTER (WHERE response_status != 200) as failure_count,
  AVG(duration_ms) as avg_duration_ms
FROM webhook_logs
WHERE source = 'legalario'
  AND created_at > NOW() - INTERVAL '24 hours';
