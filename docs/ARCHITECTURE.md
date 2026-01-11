# WEEK-CHAIN Legal-First NFT Minting Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     LEGAL-FIRST ARCHITECTURE                    │
└─────────────────────────────────────────────────────────────────┘

1. CONTRACT CERTIFICATION (Legalario)
   ↓
2. WEBHOOK VALIDATION (HMAC + Rate Limit)
   ↓
3. DATABASE UPDATE (NOM-151 Data)
   ↓
4. MINT AUTHORIZATION (Guard Check)
   ↓
5. NFT MINTING (Umi/Metaplex)
   ↓
6. EVIDENCE GENERATION (ZIP Package)
   ↓
7. STORAGE (Supabase + Arweave)
```

## Components

### 1. Environment Validation (`lib/config/env-schema.ts`)
- **Technology**: Zod schema validation
- **Purpose**: Ensures all required env vars are present and valid
- **Validation**: Runs on startup, blocks production if invalid
- **Features**:
  - Type-safe environment access
  - URL validation
  - API key format checking
  - Cached validation results

### 2. Legalario Webhook Handler (`app/api/legalario/webhook/route.ts`)
- **Security Layers**:
  1. Rate limiting (10 req/min per IP)
  2. IP allowlist (production only)
  3. HMAC-SHA256 signature verification
  4. Timestamp validation (5-minute tolerance)
  5. Timing-safe comparison
- **Events Handled**:
  - `contract.certified`
  - `contract.rejected`
  - `contract.updated`
- **Logging**: Complete audit trail in `webhook_logs` table

### 3. Signature Verifier (`lib/legalario/signature-verifier.ts`)
- **Algorithm**: HMAC-SHA256
- **Format**: `HMAC(secret, timestamp + "." + payload)`
- **Security**:
  - Timing-safe comparison (prevents timing attacks)
  - Timestamp validation (prevents replay attacks)
  - Comprehensive error logging

### 4. Rate Limiter (`lib/legalario/rate-limiter.ts`)
- **Limit**: 10 requests per minute per IP
- **Implementation**: In-memory Map with automatic cleanup
- **Response Headers**:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

### 5. IP Allowlist (`lib/legalario/ip-allowlist.ts`)
- **Mode**: Production only (development allows all)
- **Configuration**: Hardcoded list of Legalario IPs
- **Fallback**: localhost for local testing

### 6. Database Guards (`scripts/037_nft_mints_and_guards.sql`)
- **Trigger**: `trg_guard_mint_requires_cert`
- **Function**: `guard_mint_requires_certification()`
- **Validation**:
  - Contract status must be 'certified'
  - `folio` must not be NULL
  - `sha256_hash` must not be NULL
  - `certified_at` must not be NULL
- **Effect**: Blocks INSERT to `nft_mints` if not certified

### 7. NFT Minter (`lib/solana/nft-minter.ts`)
- **Technology**: Umi + @metaplex-foundation/mpl-token-metadata
- **Metadata**: Includes NOM-151 certification data
- **Process**:
  1. Load minting authority keypair
  2. Generate new mint address
  3. Create NFT with metadata URI
  4. Set royalties (5%)
  5. Return mint address + signature

### 8. Metadata Uploader (`lib/solana/metadata-uploader.ts`)
- **Storage**: Arweave via Irys uploader
- **Format**: JSON with NOM-151 fields
- **Structure**:
  ```json
  {
    "name": "Property Name - Week X",
    "symbol": "WEEK",
    "description": "...",
    "image": "...",
    "nom151": {
      "folio": "MX-2025-001",
      "sha256": "abc123...",
      "certified_at": "2025-01-15T10:00:00Z"
    }
  }
  ```

### 9. Evidence Generator (`lib/evidence/zip-generator.ts`)
- **Package Contents**:
  - contract.pdf (signed legal document)
  - certificate.pdf (NOM-151 certification)
  - metadata.json (NFT metadata)
  - transaction_receipt.txt (blockchain proof)
  - README.txt (verification instructions)
- **Storage**: Supabase Storage (`legal-documents` bucket)
- **Path**: `evidence/{contract_id}/evidence-package-{timestamp}.zip`

### 10. Middleware Security (`middleware.ts`)
- **Rate Limiting**: 120 req/min general, 10 req/min for webhooks
- **Security Headers**:
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Strict-Transport-Security` (production)
  - `Content-Security-Policy`
  - `X-XSS-Protection`
- **Session Management**: Supabase auth session refresh

## Data Flow

### Certification Flow

```
Legalario API
    ↓ (certifies contract)
Webhook POST
    ↓ (HMAC signature)
Rate Limiter
    ↓ (10 req/min check)
IP Allowlist
    ↓ (production only)
Signature Verifier
    ↓ (HMAC + timestamp)
Webhook Handler
    ↓ (parse payload)
Database Update
    ↓ (Supabase Service Role)
legal_contracts table
    ↓ (status = 'certified')
Ready for Minting
```

### Minting Flow

```
Mint API Request
    ↓ (contract_id + recipient)
Database Guard
    ↓ (check certification)
Contract Verified
    ↓ (NOM-151 valid)
Create Metadata
    ↓ (with NOM-151 data)
Upload to Arweave
    ↓ (get metadata URI)
Mint NFT on Solana
    ↓ (Umi + Metaplex)
Update Database
    ↓ (mint_address + tx)
Generate Evidence ZIP
    ↓ (contract + cert + metadata)
Upload to Supabase
    ↓ (storage bucket)
Complete
```

## Database Schema

### legal_contracts
- `id`: UUID (primary key)
- `series_id`: TEXT (property series)
- `user_id`: UUID (FK to auth.users)
- `voucher_id`: UUID (FK to vouchers)
- `nom151_folio`: TEXT (unique, NOM-151 folio number)
- `sha256_hash`: TEXT (document hash)
- `status`: TEXT ('draft', 'certified', 'minted')
- `certified_at`: TIMESTAMPTZ
- `metadata`: JSONB (mint data)

### nft_mints
- `id`: UUID (primary key)
- `contract_id`: UUID (FK to legal_contracts)
- `mint_address`: TEXT (unique, Solana address)
- `recipient_address`: TEXT
- `metadata_uri`: TEXT (Arweave URI)
- `tx_signature`: TEXT
- `status`: TEXT ('pending', 'minted', 'failed')
- `minted_at`: TIMESTAMPTZ

### webhook_logs
- `id`: UUID (primary key)
- `source`: TEXT ('legalario', 'stripe', etc.)
- `event_type`: TEXT
- `request_data`: JSONB
- `response_status`: INTEGER
- `duration_ms`: INTEGER
- `created_at`: TIMESTAMPTZ

## Security Measures

1. **HMAC Signature Verification**
   - Algorithm: SHA-256
   - Secret: Minimum 32 characters
   - Timing-safe comparison

2. **Replay Attack Prevention**
   - Timestamp validation
   - 5-minute tolerance window
   - Signature includes timestamp

3. **Rate Limiting**
   - Per-IP tracking
   - 10 requests per minute for webhooks
   - Automatic cleanup of expired records

4. **IP Allowlist**
   - Production-only enforcement
   - Configurable IP ranges
   - Localhost allowed for development

5. **Database Guards**
   - PostgreSQL trigger functions
   - Certification validation
   - Atomicity guaranteed

6. **Service Role Isolation**
   - Webhooks use service_role key
   - Regular routes use anon key + RLS
   - Strict RLS policies

7. **Comprehensive Logging**
   - All webhook attempts logged
   - IP, User-Agent, signature tracked
   - Success/failure metrics
   - Processing time recorded

## Performance Considerations

- **Webhook Processing**: < 100ms target
- **Signature Verification**: < 10ms
- **NFT Minting**: 2-5 seconds (Arweave upload)
- **ZIP Generation**: < 500ms
- **Rate Limit Check**: < 1ms (in-memory)

## Monitoring & Alerts

Key metrics to track:
1. Webhook success rate
2. Signature verification failures
3. Rate limit hits
4. Database guard exceptions
5. NFT minting failures
6. Average processing time
7. Arweave upload failures

## Deployment Requirements

1. All environment variables configured
2. Database migrations applied
3. Supabase Storage bucket created
4. Solana keypair funded (for Arweave uploads)
5. Legalario webhook URL configured
6. IP allowlist updated for production
7. Monitoring and alerts configured
