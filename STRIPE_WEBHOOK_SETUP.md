# Stripe Webhook Setup Guide

## Overview

WEEK-CHAIN supports two webhook implementations:
1. **Next.js TypeScript** (default) - `/app/api/webhooks/stripe/route.ts`
2. **FastAPI Python** (optional) - `/scripts/stripe_webhook_fastapi.py`

Both implementations handle the unified checkout system with Card, OXXO, and Solana Pay.

## Next.js Webhook (Recommended)

### Setup

1. **Environment Variables**
   ```bash
   STRIPE_SECRET_KEY=sk_test_xxx
   STRIPE_WEBHOOK_SECRET=whsec_xxx
   ```

2. **Stripe Dashboard Configuration**
   - Go to: https://dashboard.stripe.com/webhooks
   - Click "Add endpoint"
   - URL: `https://your-domain.com/api/webhooks/stripe`
   - Events to listen for:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `charge.refunded`

3. **Local Testing**
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

### Features

- ✅ Signature verification
- ✅ Webhook event logging
- ✅ Supports both legacy and unified checkout
- ✅ Automatic voucher creation
- ✅ Handles Card, OXXO, and Solana Pay
- ✅ Error handling and retry logic

## FastAPI Webhook (Optional)

### When to Use

Use the FastAPI implementation if:
- You prefer Python for webhook processing
- You need custom Python-based business logic
- You want to separate webhook handling from Next.js

### Setup

1. **Install Dependencies**
   ```bash
   pip install fastapi stripe supabase-py python-dotenv uvicorn
   ```

2. **Environment Variables**
   Create `.env` file:
   ```bash
   STRIPE_SECRET_KEY=sk_test_xxx
   STRIPE_WEBHOOK_SECRET=whsec_xxx
   SUPABASE_URL=https://xxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=xxx
   ```

3. **Run the Server**
   ```bash
   uvicorn stripe_webhook_fastapi:app --reload --port 8000
   ```

4. **Configure Stripe**
   - URL: `https://your-domain.com/api/webhooks/stripe`
   - Or use ngrok for local testing: `ngrok http 8000`

### Features

- ✅ Python-based webhook processing
- ✅ Same functionality as Next.js version
- ✅ Easy to extend with custom logic
- ✅ Standalone or integrated deployment

## Webhook Flow

### 1. Payment Intent Created
```
User → Unified Checkout → /api/payments/unified/create-intent
                       → Stripe Payment Intent created
                       → fiat_payments record created (status: pending)
```

### 2. Payment Succeeded
```
Stripe → Webhook → payment_intent.succeeded
                → Update fiat_payments (status: completed)
                → Create voucher
                → Link voucher to payment
```

### 3. Payment Failed
```
Stripe → Webhook → payment_intent.payment_failed
                → Update fiat_payments (status: failed)
                → Log error message
```

## Database Schema

### fiat_payments Table
```sql
- id (uuid)
- user_wallet (text)
- user_email (text)
- stripe_payment_intent_id (text)
- amount (numeric)
- currency (text)
- payment_method (text) -- 'card', 'oxxo', 'solana_pay'
- status (text) -- 'pending', 'completed', 'failed', 'refunded'
- succeeded_at (timestamptz)
- failed_at (timestamptz)
- voucher_id (uuid) -- FK to vouchers table
- property_id (uuid)
- week_id (uuid)
- metadata (jsonb)
```

### vouchers Table
```sql
- id (uuid)
- user_id (text)
- week_id (uuid)
- property_id (uuid)
- voucher_code (text)
- amount_paid (numeric)
- payment_method (text)
- status (text)
```

## Testing

### Test Card Numbers
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0025 0000 3155
```

### Test OXXO
```
Amount: Any amount in MXN
Status: Simulated in test mode
```

### Verify Webhook
```bash
# Check webhook logs
curl https://your-domain.com/api/admin/webhooks

# Test webhook locally
stripe trigger payment_intent.succeeded
```

## Monitoring

### Stripe Dashboard
- View webhook delivery status
- Check failed webhooks
- Retry failed events

### Application Logs
```typescript
// Check webhook_events table
SELECT * FROM webhook_events 
WHERE source = 'stripe' 
ORDER BY created_at DESC;
```

## Troubleshooting

### Webhook Not Receiving Events
1. Check webhook URL is correct
2. Verify STRIPE_WEBHOOK_SECRET is set
3. Check firewall/security settings
4. Review Stripe dashboard for delivery errors

### Signature Verification Failed
1. Ensure STRIPE_WEBHOOK_SECRET matches dashboard
2. Check webhook endpoint is using raw body
3. Verify no middleware is modifying the request

### Payment Not Updating
1. Check fiat_payments table for record
2. Verify stripe_payment_intent_id matches
3. Review webhook_events table for errors
4. Check Supabase RLS policies

## Production Checklist

- [ ] STRIPE_WEBHOOK_SECRET configured
- [ ] Webhook URL uses HTTPS
- [ ] Events configured in Stripe dashboard
- [ ] Webhook signature verification enabled
- [ ] Error monitoring set up
- [ ] Retry logic tested
- [ ] Database indexes on stripe_payment_intent_id
- [ ] RLS policies configured correctly
