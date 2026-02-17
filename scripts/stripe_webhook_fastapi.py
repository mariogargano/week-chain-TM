"""
WEEK-CHAIN™ Stripe Webhook Handler (FastAPI)
Alternative Python implementation for handling Stripe webhooks

This is an optional FastAPI implementation that can be used instead of
the Next.js webhook handler if you prefer Python for webhook processing.

Setup:
1. Install dependencies: pip install fastapi stripe supabase-py python-dotenv
2. Set environment variables in .env
3. Run: uvicorn stripe_webhook_fastapi:app --reload
4. Configure Stripe webhook URL: https://your-domain.com/api/webhooks/stripe

Environment Variables Required:
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
"""

from fastapi import APIRouter, Request, Header, HTTPException
from supabase import create_client, Client
import os
import stripe
from datetime import datetime
from typing import Optional

# Initialize
router = APIRouter()
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
endpoint_secret = os.getenv("STRIPE_WEBHOOK_SECRET")

# Supabase client
supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)


@router.post("/api/webhooks/stripe")
async def stripe_webhook(
    request: Request,
    stripe_signature: Optional[str] = Header(None)
):
    """
    Handle Stripe webhook events for unified checkout
    Supports: Card, OXXO, and Solana Pay payments
    """
    payload = await request.body()
    
    try:
        # Verify webhook signature
        event = stripe.Webhook.construct_event(
            payload, stripe_signature, endpoint_secret
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        raise HTTPException(status_code=400, detail="Invalid signature")

    # Handle payment_intent.succeeded
    if event["type"] == "payment_intent.succeeded":
        payment_intent = event["data"]["object"]
        await handle_payment_success(payment_intent)

    # Handle payment_intent.payment_failed
    elif event["type"] == "payment_intent.payment_failed":
        payment_intent = event["data"]["object"]
        await handle_payment_failure(payment_intent)

    # Handle charge.refunded
    elif event["type"] == "charge.refunded":
        charge = event["data"]["object"]
        await handle_refund(charge)

    return {"ok": True}


async def handle_payment_success(payment_intent: dict):
    """Process successful payment and create voucher"""
    pi_id = payment_intent["id"]
    metadata = payment_intent.get("metadata", {})
    
    email = metadata.get("email")
    reference = metadata.get("reference")
    channel = metadata.get("channel", "card")
    amount = payment_intent["amount"] / 100
    currency = payment_intent["currency"]
    
    print(f"[WEBHOOK] Payment succeeded: {pi_id} | {channel} | ${amount} {currency}")
    
    # Update fiat_payments table
    result = supabase.table("fiat_payments").update({
        "status": "completed",
        "succeeded_at": datetime.utcnow().isoformat()
    }).eq("stripe_payment_intent_id", pi_id).execute()
    
    if result.data and len(result.data) > 0:
        fiat_payment = result.data[0]
        
        # Create voucher if week and property are specified
        if fiat_payment.get("week_id") and fiat_payment.get("property_id"):
            voucher_code = f"{channel.upper()}-{pi_id[-8:].upper()}"
            
            voucher_result = supabase.table("vouchers").insert({
                "user_id": fiat_payment["user_wallet"],
                "week_id": fiat_payment["week_id"],
                "property_id": fiat_payment["property_id"],
                "voucher_code": voucher_code,
                "amount_paid": fiat_payment["amount"],
                "payment_method": f"stripe_{channel}",
                "status": "active"
            }).execute()
            
            if voucher_result.data:
                voucher_id = voucher_result.data[0]["id"]
                # Link voucher to payment
                supabase.table("fiat_payments").update({
                    "voucher_id": voucher_id
                }).eq("id", fiat_payment["id"]).execute()
                
                print(f"[WEBHOOK] Voucher created: {voucher_code}")


async def handle_payment_failure(payment_intent: dict):
    """Handle failed payment"""
    pi_id = payment_intent["id"]
    error_message = payment_intent.get("last_payment_error", {}).get("message", "Unknown error")
    
    print(f"[WEBHOOK] Payment failed: {pi_id} | {error_message}")
    
    supabase.table("fiat_payments").update({
        "status": "failed",
        "failed_at": datetime.utcnow().isoformat(),
        "metadata": {"error_message": error_message}
    }).eq("stripe_payment_intent_id", pi_id).execute()


async def handle_refund(charge: dict):
    """Handle refund"""
    charge_id = charge["id"]
    amount_refunded = charge["amount_refunded"] / 100
    
    print(f"[WEBHOOK] Refund processed: {charge_id} | ${amount_refunded}")
    
    supabase.table("fiat_payments").update({
        "status": "refunded",
        "refund_amount": amount_refunded,
        "updated_at": datetime.utcnow().isoformat()
    }).eq("stripe_charge_id", charge_id).execute()


# FastAPI app setup (if running standalone)
if __name__ == "__main__":
    from fastapi import FastAPI
    import uvicorn
    
    app = FastAPI(title="WEEK-CHAIN Stripe Webhooks")
    app.include_router(router)
    
    uvicorn.run(app, host="0.0.0.0", port=8000)
