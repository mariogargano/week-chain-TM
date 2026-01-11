# NOM-151 Implementation Guide - WEEK-CHAIN

## Overview

This guide documents the complete NOM-151 compliant evidence system implementation in WEEK-CHAIN.

## System Architecture

### 1. Evidence Events Table

**Location:** `scripts/4000_EVIDENCE_EVENTS_SYSTEM.sql`

**Purpose:** Immutable audit trail with SHA-256 hashing for legal compliance

**Schema:**
```sql
evidence_events (
  id UUID PRIMARY KEY,
  event_type TEXT,           -- Type of event (certificate_activated, etc.)
  entity_type TEXT,          -- Entity type (certificate, reservation, etc.)
  entity_id UUID,            -- Reference to entity
  user_id UUID,              -- User who triggered event
  actor_role TEXT,           -- Role of actor (member, admin, system)
  payload_canonical JSONB,   -- Canonicalized event data
  hash_sha256 TEXT,          -- SHA-256 hash of canonical payload
  document_version TEXT,     -- Version of legal document (if applicable)
  occurred_at TIMESTAMP,     -- When event occurred
  ip_address TEXT,           -- IP address of actor
  user_agent TEXT,           -- Browser/client user agent
  created_at TIMESTAMP
)
```

### 2. Canonicalization Library

**Location:** `lib/legal/canonicalizeEvent.ts`

**Purpose:** Ensures deterministic hashing by normalizing event payloads

**Key Functions:**
- `canonicalizeEvent()` - Normalizes and hashes event
- `verifyEventIntegrity()` - Verifies stored hash matches payload
- `logEvidenceEvent()` - Logs event to database

**Canonicalization Rules:**
1. Sort all object keys alphabetically
2. Convert dates to ISO strings
3. Convert numbers to strings
4. Remove undefined values
5. Generate SHA-256 hash of JSON string

### 3. Evidence Helpers

**Location:** `lib/legal/evidence-helpers.ts`

**Purpose:** High-level functions for logging specific business events

**Available Helpers:**
- `logCertificateActivation()` - When user activates certificate
- `logReservationRequest()` - When user requests reservation
- `logOfferGeneration()` - When admin generates offer
- `logOfferAcceptance()` - When user accepts offer
- `logConsentAcceptance()` - When user accepts terms/privacy
- `logCertificateIssuance()` - When system issues certificate

## Integration Points

### Critical API Endpoints

**1. Certificate Activation**
```typescript
// app/api/certificates/activate/route.ts
import { logCertificateActivation } from '@/lib/legal/evidence-helpers'

export async function POST(request: Request) {
  // ... existing activation logic ...
  
  // Log evidence event
  const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
  const userAgent = request.headers.get('user-agent')
  
  await logCertificateActivation({
    certificateId: certificate.id,
    userId: user.id,
    certificateNumber: certificate.certificate_number,
    tier: certificate.tier,
    ipAddress,
    userAgent,
  })
}
```

**2. Reservation Request**
```typescript
// app/api/reservations/request/route.ts
import { logReservationRequest } from '@/lib/legal/evidence-helpers'

export async function POST(request: Request) {
  // ... existing reservation logic ...
  
  await logReservationRequest({
    reservationId: reservation.id,
    userId: user.id,
    certificateId: body.certificateId,
    destinationId: body.destinationId,
    checkIn: body.checkIn,
    checkOut: body.checkOut,
    guests: body.guests,
    ipAddress: request.headers.get('x-forwarded-for'),
    userAgent: request.headers.get('user-agent'),
  })
}
```

**3. Offer Acceptance**
```typescript
// app/api/offers/accept/route.ts
import { logOfferAcceptance } from '@/lib/legal/evidence-helpers'

export async function POST(request: Request) {
  // ... existing offer acceptance logic ...
  
  await logOfferAcceptance({
    offerId: offer.id,
    userId: user.id,
    reservationId: offer.reservation_id,
    price: offer.price,
    ipAddress: request.headers.get('x-forwarded-for'),
    userAgent: request.headers.get('user-agent'),
  })
}
```

## Testing & Verification

### 1. Execute SQL Script

```bash
# In Supabase SQL Editor
psql -f scripts/4000_EVIDENCE_EVENTS_SYSTEM.sql
```

### 2. Test Canonicalization

```typescript
import { canonicalizeEvent, verifyEventIntegrity } from '@/lib/legal/canonicalizeEvent'

// Create test event
const event = {
  event_type: 'test_event',
  entity_type: 'test',
  entity_id: '123e4567-e89b-12d3-a456-426614174000',
  user_id: '123e4567-e89b-12d3-a456-426614174001',
  payload: {
    field1: 'value1',
    field2: 123,
    field3: new Date(),
  },
}

// Canonicalize
const { canonical, hash } = canonicalizeEvent(event)
console.log('Hash:', hash)

// Verify integrity
const isValid = verifyEventIntegrity(canonical, hash)
console.log('Valid:', isValid) // Should be true
```

### 3. Query Evidence Events

```sql
-- View all evidence events
SELECT * FROM evidence_events ORDER BY occurred_at DESC LIMIT 100;

-- View certificate activations
SELECT * FROM evidence_events WHERE event_type = 'certificate_activated';

-- View events for specific user
SELECT * FROM evidence_events WHERE user_id = 'USER_ID';

-- Verify hash integrity (should return no rows if all valid)
SELECT id, event_type, occurred_at 
FROM evidence_events 
WHERE hash_sha256 != encode(digest(payload_canonical::text, 'sha256'), 'hex');
```

## Compliance Checklist

- [x] SHA-256 hashing of all critical events
- [x] Immutable audit trail (append-only table)
- [x] IP address and user agent logging
- [x] Deterministic canonicalization
- [x] RLS policies for data protection
- [x] Helper functions for easy integration
- [ ] PSC integration for official timestamps (Phase 3)
- [ ] Automated compliance reports (Phase 3)

## NOM-151 Requirements Met

1. **Article 89 BIS - Digital Evidence**
   - ✅ SHA-256 cryptographic hashing
   - ✅ Timestamp preservation
   - ✅ Tamper detection

2. **Article 1803 - Electronic Consent**
   - ✅ Evidence of consent acceptance
   - ✅ IP address and user agent logging
   - ✅ Document version tracking

3. **NOM-029 - Data Integrity**
   - ✅ Immutable audit trail
   - ✅ Deterministic hash generation
   - ✅ Integrity verification

## Maintenance

### Adding New Event Types

1. Add event type constant to `lib/legal/evidence-helpers.ts`
2. Create helper function following existing pattern
3. Integrate into relevant API endpoint
4. Document in this guide

### Querying Evidence

Admin dashboard should display evidence events for:
- User consent history
- Certificate lifecycle
- Reservation flow
- Offer generation/acceptance

## Production Deployment

1. Execute SQL script in production Supabase
2. Verify table creation and RLS policies
3. Test canonicalization with sample data
4. Monitor evidence_events table growth
5. Setup automated backups (evidence is legal record)

## Support

For questions or issues with NOM-151 compliance, contact:
- Technical: dev@week-chain.com
- Legal: legal@week-chain.com
