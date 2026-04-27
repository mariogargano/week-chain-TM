import { type NextRequest, NextResponse } from "next/server"
import { createCommissionFromOrder } from "@/lib/flows/commission-creation"
import { reverseCommission } from "@/lib/flows/anti-fraud-hold"
import { emitCertificate } from "@/lib/flows/certificate-emission"
import { createClient } from "@/lib/supabase/server"
import crypto from "crypto"

export const dynamic = "force-dynamic"

function getStripe() {
  const Stripe = require("stripe").default
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-11-20.acacia",
  })
}

export async function POST(req: NextRequest) {
  const stripe = getStripe()

  const body = await req.text()
  const sig = req.headers.get("stripe-signature")!

  let event: any

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    // SECURITY: Do not expose Stripe error details. Just log locally and return generic error.
    console.error("[stripe-webhook] Signature verification failed:", err?.message || String(err))
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  const supabase = await createClient()

  // ------- IDEMPOTENCY CHECK -------
  const eventId = event.id
  const { data: existingEvent } = await supabase
    .from("webhook_events")
    .select("id, processed")
    .eq("source", "stripe")
    .eq("event_id", eventId)
    .maybeSingle()

  if (existingEvent?.processed) {
    return NextResponse.json({ received: true, duplicate: true })
  }

  // Log the event (will insert or skip if already exists due to UNIQUE)
  await supabase.from("webhook_events").upsert(
    {
      source: "stripe",
      event_id: eventId,
      event_type: event.type,
      payload: event.data.object,
      processed: false,
    },
    { onConflict: "source,event_id" }
  )

  // ------- CHECKOUT COMPLETED -------
  if (event.type === "checkout.session.completed") {
    const session = event.data.object

    const userId = session.metadata?.user_id
    const userEmail = session.customer_email || session.metadata?.user_email
    const productId = session.metadata?.product_id
    const maxPax = session.metadata?.max_pax ? parseInt(session.metadata.max_pax) : null
    const maxEstancias = session.metadata?.max_estancias ? parseInt(session.metadata.max_estancias) : null
    const amount = session.amount_total! / 100
    const stripeSessionId = session.id

    if (userId && (productId || maxPax)) {
      try {
        // STEP A: Upsert user_certificates_v2 (idempotent on stripe_session_id)
        const startDate = new Date()
        const endDate = new Date()
        endDate.setFullYear(endDate.getFullYear() + 15)
        const annualResetDate = new Date()
        annualResetDate.setFullYear(annualResetDate.getFullYear() + 1)
        const pax = maxPax || 2
        const estancias = maxEstancias || 1

        const { data: cert, error: certError } = await supabase
          .from("user_certificates_v2")
          .upsert(
            {
              user_id: userId,
              product_id: productId || null,
              max_pax: pax,
              max_estancias_per_year: estancias,
              purchase_price_usd: amount,
              start_date: startDate.toISOString().split("T")[0],
              end_date: endDate.toISOString().split("T")[0],
              annual_entitlement_estancias: estancias,
              annual_used_estancias: 0,
              annual_reset_at: annualResetDate.toISOString().split("T")[0],
              status: "active",
              order_id: stripeSessionId,
              stripe_session_id: stripeSessionId,
            },
            { onConflict: "stripe_session_id" }
          )
          .select()
          .single()

        if (certError) {
          console.error("[stripe-wh] Error upserting user_certificates_v2:", certError)
        } else {
          // STEP B1: Emit certificate with new flow (Phase 2)
          try {
            const svcType = (maxPax === 4 ? "PAX4" : maxPax === 6 ? "PAX6" : maxPax === 8 ? "PAX8" : "PAX2") as
              | "PAX2"
              | "PAX4"
              | "PAX6"
              | "PAX8"
            await emitCertificate({
              userId,
              svcType,
              checkoutSessionId: stripeSessionId,
              amount,
              currency: session.currency?.toUpperCase() || "USD",
            })
          } catch (emitError) {
            console.error("[stripe-wh] Certificate emission error (non-fatal):", emitError)
            // Don't fail the whole webhook - certificate_v2 was already created
          }

          // STEP B2: Upsert week_token linked to certificate
          const certIdShort = `WC-${new Date().getFullYear()}-${cert.id.slice(0, 5).toUpperCase()}`
          const hashPayload = `${cert.id}:${userId}:${stripeSessionId}:${Date.now()}`
          const blockchainHash = crypto.createHash("sha256").update(hashPayload).digest("hex")

          const { error: tokenError } = await supabase
            .from("week_tokens")
            .upsert(
              {
                user_id: userId,
                user_certificate_v2_id: cert.id,
                certificate_id: certIdShort,
                blockchain_hash: blockchainHash,
                qr_code: `https://weekchain.com/verify/${certIdShort}`,
                status: "active",
                metadata: {
                  provider: "stripe",
                  session_id: stripeSessionId,
                  pax,
                  estancias,
                },
              },
              { onConflict: "user_certificate_v2_id" }
            )

          if (tokenError) {
            console.error("[stripe-wh] Error upserting week_token:", tokenError)
          } else {
            // Create certificate_visual_state
            const { data: token } = await supabase
              .from("week_tokens")
              .select("id")
              .eq("user_certificate_v2_id", cert.id)
              .single()

            if (token) {
              await supabase
                .from("certificate_visual_state")
                .upsert(
                  {
                    certificate_id: token.id,
                    current_status: "active",
                    last_reservation_date: null,
                    last_property_name: null,
                    reservations_count: 0,
                  },
                  { onConflict: "certificate_id" }
                )
            }
          }
        }

        // Commission creation
        const certificateTier = productId
          ? `PAX${pax}_EST${estancias}`
          : session.metadata?.certificate_tier

        await createCommissionFromOrder({
          orderId: stripeSessionId,
          buyerUserId: userId,
          buyerEmail: userEmail,
          certificateTier,
          saleAmount: amount,
        })
      } catch (error) {
        console.error("[stripe-wh] Error processing checkout completion:", error)
      }
    }
  }

  // ------- REFUND -------
  if (event.type === "charge.refunded") {
    const charge = event.data.object
    const orderId = charge.payment_intent as string

    try {
      await reverseCommission(orderId, "Charge refunded")
    } catch (error) {
      console.error("[stripe-wh] Error reversing commission:", error)
    }
  }

  // ------- DISPUTE -------
  if (event.type === "charge.dispute.created") {
    const dispute = event.data.object
    const orderId = dispute.payment_intent as string

    try {
      await reverseCommission(orderId, "Dispute/chargeback created")
    } catch (error) {
      console.error("[stripe-wh] Error reversing commission:", error)
    }
  }

  // Mark event as processed
  await supabase
    .from("webhook_events")
    .update({ processed: true, processed_at: new Date().toISOString() })
    .eq("source", "stripe")
    .eq("event_id", eventId)

  return NextResponse.json({ received: true })
}
