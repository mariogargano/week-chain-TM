import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { logger } from "@/lib/config/logger"
import { WebhookLogger } from "@/lib/webhooks/logger"
import crypto from "crypto"

function verifyConektaSignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env.CONEKTA_WEBHOOK_SECRET
  if (!secret) {
    logger.warn("CONEKTA_WEBHOOK_SECRET not set - skipping signature verification in dev")
    return process.env.NODE_ENV === "development"
  }
  if (!signatureHeader) return false

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex")

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, "hex"),
    Buffer.from(signatureHeader, "hex")
  )
}

export async function POST(req: NextRequest) {
  const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || undefined
  const userAgent = req.headers.get("user-agent") || undefined
  let webhookId: string | null = null

  try {
    const rawBody = await req.text()

    // Verify webhook signature
    const signatureHeader = req.headers.get("digest") || req.headers.get("x-conekta-signature")
    const signatureValid = verifyConektaSignature(rawBody, signatureHeader)

    if (!signatureValid) {
      logger.error("Conekta webhook signature verification failed")
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const body = JSON.parse(rawBody)
    const eventType = body.type
    const eventId = body.data?.object?.id || body.id || "unknown"

    logger.info("Conekta webhook received:", eventType)

    // Idempotency: check if this event was already processed
    const supabase = await createClient()
    const { data: existing } = await supabase
      .from("webhook_events")
      .select("id, processed")
      .eq("source", "conekta")
      .eq("event_id", eventId)
      .maybeSingle()

    if (existing?.processed) {
      logger.info("Conekta webhook already processed, skipping:", eventId)
      return NextResponse.json({ received: true, duplicate: true })
    }

    webhookId = await WebhookLogger.log({
      source: "conekta",
      eventId,
      eventType,
      payload: body,
      ipAddress,
      userAgent,
      signatureValid: true,
    })

    switch (eventType) {
      case "order.paid": {
        await handleOrderPaid(supabase, body.data.object)
        break
      }

      case "order.pending_payment": {
        await handleOrderPending(supabase, body.data.object)
        break
      }

      case "order.expired": {
        await handleOrderExpired(supabase, body.data.object)
        break
      }

      case "charge.paid": {
        await handleChargePaid(supabase, body.data.object)
        break
      }

      default:
        logger.debug("Unhandled Conekta event type:", eventType)
    }

    if (webhookId) {
      await WebhookLogger.markProcessed(webhookId)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    logger.error("Conekta webhook error:", error)

    if (webhookId) {
      await WebhookLogger.markFailed(webhookId, error.message)
    }

    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}

async function handleOrderPaid(supabase: any, order: any) {
  try {
    const metadata = order.metadata || {}
    const { week_id, user_id, property_id, payment_group_id, product_id, max_pax, max_estancias } = metadata
    const amountUsd = order.amount / 100

    logger.info("Processing paid order:", {
      order_id: order.id,
      user_id,
      amount: amountUsd,
    })

    // Update payment record
    await supabase
      .from("payments")
      .update({
        status: "completed",
        conekta_order_id: order.id,
        updated_at: new Date().toISOString(),
      })
      .eq("conekta_order_id", order.id)

    // STEP A: Upsert user_certificates_v2 (idempotent on provider_payment_id)
    if (user_id && (product_id || max_pax)) {
      const startDate = new Date()
      const endDate = new Date()
      endDate.setFullYear(endDate.getFullYear() + 15)
      const annualResetDate = new Date()
      annualResetDate.setFullYear(annualResetDate.getFullYear() + 1)
      const pax = max_pax ? parseInt(max_pax) : 2
      const estancias = max_estancias ? parseInt(max_estancias) : 1

      const { data: cert, error: certError } = await supabase
        .from("user_certificates_v2")
        .upsert(
          {
            user_id,
            product_id: product_id || null,
            max_pax: pax,
            max_estancias_per_year: estancias,
            purchase_price_usd: amountUsd,
            start_date: startDate.toISOString().split("T")[0],
            end_date: endDate.toISOString().split("T")[0],
            annual_entitlement_estancias: estancias,
            annual_used_estancias: 0,
            annual_reset_at: annualResetDate.toISOString().split("T")[0],
            status: "active",
            order_id: order.id,
            provider_payment_id: order.id,
          },
          { onConflict: "provider_payment_id" }
        )
        .select()
        .single()

      if (certError) {
        logger.error("Error upserting user_certificates_v2:", certError)
      } else {
        logger.info("Certificate created/updated:", cert.id)

        // STEP B: Upsert week_token (idempotent on user_certificate_v2_id)
        const crypto = await import("crypto")
        const certIdShort = `WC-${new Date().getFullYear()}-${cert.id.slice(0, 5).toUpperCase()}`
        const hashPayload = `${cert.id}:${user_id}:${order.id}:${Date.now()}`
        const blockchainHash = crypto.createHash("sha256").update(hashPayload).digest("hex")

        const { error: tokenError } = await supabase
          .from("week_tokens")
          .upsert(
            {
              user_id,
              user_certificate_v2_id: cert.id,
              certificate_id: certIdShort,
              blockchain_hash: blockchainHash,
              qr_code: `https://weekchain.com/verify/${certIdShort}`,
              status: "active",
              metadata: {
                provider: "conekta",
                order_id: order.id,
                pax,
                estancias,
              },
            },
            { onConflict: "user_certificate_v2_id" }
          )

        if (tokenError) {
          logger.error("Error upserting week_token:", tokenError)
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
          logger.info("Week token and visual state created for cert:", cert.id)
        }
      }
    }

    // Create voucher (legacy support)
    if (user_id && week_id) {
      await supabase
        .from("vouchers")
        .upsert(
          {
            user_id,
            week_id,
            property_id,
            voucher_code: `CONEKTA-${order.id.slice(-8).toUpperCase()}`,
            amount_paid: amountUsd,
            payment_method: "conekta",
            status: "active",
          },
          { onConflict: "voucher_code" }
        )
    }
  } catch (error) {
    logger.error("Error in handleOrderPaid:", error)
  }
}

async function handleOrderPending(supabase: any, order: any) {
  try {
    logger.info("Order pending payment:", order.id)

    const { error } = await supabase
      .from("payments")
      .update({
        status: "pending",
        conekta_order_id: order.id,
        updated_at: new Date().toISOString(),
      })
      .eq("conekta_order_id", order.id)

    if (error) {
      logger.error("Error updating pending order:", error)
    }
  } catch (error) {
    logger.error("Error in handleOrderPending:", error)
  }
}

async function handleOrderExpired(supabase: any, order: any) {
  try {
    logger.warn("Order expired:", order.id)

    const { error } = await supabase
      .from("payments")
      .update({
        status: "expired",
        conekta_order_id: order.id,
        updated_at: new Date().toISOString(),
      })
      .eq("conekta_order_id", order.id)

    if (error) {
      logger.error("Error updating expired order:", error)
    }
  } catch (error) {
    logger.error("Error in handleOrderExpired:", error)
  }
}

async function handleChargePaid(supabase: any, charge: any) {
  try {
    logger.info("Charge paid:", {
      charge_id: charge.id,
      amount: charge.amount / 100,
    })
  } catch (error) {
    logger.error("Error in handleChargePaid:", error)
  }
}
