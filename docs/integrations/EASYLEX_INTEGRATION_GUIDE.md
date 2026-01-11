# EasyLex Integration Guide - NOM-151 Compliance

## Overview

EasyLex is a PSC (Prestador de Servicios de Certificación) platform for electronic signatures and digital evidence compliant with NOM-151-SCFI-2016 in Mexico.

## Architecture

```
┌─────────────────┐
│  WEEK-CHAIN App │
└────────┬────────┘
         │
         │ 1. Create document
         ▼
┌─────────────────┐
│  EasyLex API    │
│  (Sandbox/Prod) │
└────────┬────────┘
         │
         │ 2. Get sign URL
         ▼
┌─────────────────┐
│ EasyLex Widget  │
│   (iframe)      │
└────────┬────────┘
         │
         │ 3. Webhook
         ▼
┌─────────────────┐
│  /api/easylex   │
│    /webhook     │
└────────┬────────┘
         │
         │ 4. Update DB
         ▼
┌─────────────────┐
│ evidence_events │
│   + SHA-256     │
└─────────────────┘
```

## Environment Variables

Add to your `.env.local`:

```bash
# EasyLex Configuration
EASYLEX_API_URL=https://sandboxapi.easylex.com
EASYLEX_WIDGET_URL=https://sandboxwg.easylex.com
EASYLEX_API_KEY=your_api_key_here
EASYLEX_WEBHOOK_SECRET=your_webhook_secret_here
EASYLEX_ENVIRONMENT=sandbox  # or 'production'
```

## Usage Examples

### 1. Create Signature Request

```typescript
import { easylexClient } from "@/lib/easylex/client"

const response = await easylexClient.createDocument({
  documentId: "cert-123",
  documentName: "Certificado WEEK-CHAIN #001",
  documentContent: base64PdfContent,
  signers: [
    {
      name: "Juan Pérez",
      email: "juan@example.com",
      role: "Titular",
      order: 1,
    },
  ],
  metadata: {
    certificateId: "cert-123",
    propertyName: "UXAN",
  },
  webhookUrl: "https://yourapp.com/api/easylex/webhook",
})

console.log("Sign URL:", response.signUrl)
```

### 2. Embed Widget in UI

```tsx
import { EasylexSignatureWidget } from "@/components/easylex-signature-widget"

export default function SignaturePage() {
  return (
    <EasylexSignatureWidget
      documentId="cert-123"
      signerId="signer-456"
      onComplete={(success) => {
        if (success) {
          console.log("Document signed successfully")
        }
      }}
      onError={(error) => {
        console.error("Signature error:", error)
      }}
    />
  )
}
```

### 3. Handle Webhooks

Webhooks are automatically processed by `/app/api/easylex/webhook/route.ts`.

### 4. Get Evidence Package

```typescript
const evidenceBlob = await easylexClient.getEvidencePackage("cert-123")

// Save to storage
const evidenceUrl = await uploadToVercelBlob(evidenceBlob)
```

## Integration Points

### Certificate Activation Flow

1. User requests certificate activation
2. Generate PDF contract with certificate details
3. Call `easylexClient.createDocument()` to initiate signature
4. Display `EasylexSignatureWidget` to user
5. User completes biometric verification + signature
6. EasyLex webhook notifies completion
7. Store NOM-151 hash and evidence package URL
8. Update certificate status to `active`

### Reservation Confirmation Flow

1. Admin confirms reservation offer
2. Generate reservation contract PDF
3. Send signature request to user via EasyLex
4. User signs electronically
5. Webhook confirms signature
6. Reservation status → `confirmed`

## NOM-151 Compliance

EasyLex provides:

1. **SHA-256 hashing** of signed documents
2. **Timestamping** with RFC 3161 compliant timestamps
3. **Biometric verification** (selfie + ID)
4. **Evidence packages** with complete audit trail
5. **Digital certificates** from authorized PSC

All events are logged to `evidence_events` table with:
- Canonical payload (sorted JSON)
- SHA-256 hash
- IP address + user agent
- Timestamp
- Entity references

## Testing

### Sandbox Mode

The integration uses sandbox URLs by default:
- API: `https://sandboxapi.easylex.com`
- Widget: `https://sandboxwg.easylex.com`

Test credentials are provided by EasyLex support.

### Production Mode

Set `EASYLEX_ENVIRONMENT=production` and update URLs:
- API: `https://api.easylex.com`
- Widget: `https://widget.easylex.com`

## Troubleshooting

### Webhook Signature Verification Failed

- Check `EASYLEX_WEBHOOK_SECRET` matches dashboard value
- Verify timestamp tolerance (5 minutes)
- Check request headers: `x-easylex-signature`, `x-easylex-timestamp`

### Widget Not Loading

- Check CORS configuration
- Verify iframe sandbox attributes
- Check API key validity

### Document Creation Fails

- Verify PDF is valid base64
- Check signer email format
- Ensure document name is unique

## Security Best Practices

1. Always verify webhook signatures
2. Use HTTPS for webhook URLs
3. Store API keys in environment variables
4. Enable rate limiting on webhook endpoint
5. Log all signature events to `evidence_events`

## Support

For EasyLex API support, contact:
- Email: soporte@easylex.com
- Docs: https://easylex.com/api/documentacion
