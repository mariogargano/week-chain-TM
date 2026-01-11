import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { logger } from "@/lib/config/logger"
import { getEnvironment } from "@/lib/config/environment"
import { WebhookLogger } from "@/lib/webhooks/logger"

const env = getEnvironment()

export async function POST(req: NextRequest) {
  const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || undefined
  const userAgent = req.headers.get("user-agent") || undefined
  let webhookId: string | null = null

  try {
    const body = await req.json()
    const eventType = body.type
    const eventId = body.data?.object?.id || body.id || "unknown"

    logger.info("Conekta webhook received:", eventType)

    webhookId = await WebhookLogger.log({
      source: "conekta",
      eventId,
      eventType,
      payload: body,
      ipAddress,
      userAgent,
      signatureValid: true,
    })

    const supabase = await createClient()

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
    const { week_id, user_id, property_id, payment_group_id } = metadata

    logger.info("Processing paid order:", {
      order_id: order.id,
      week_id,
      user_id,
      amount: order.amount / 100,
    })

    const { error: paymentError } = await supabase
      .from("payments")
      .update({
        status: "completed",
        conekta_order_id: order.id,
        updated_at: new Date().toISOString(),
      })
      .eq("conekta_order_id", order.id)

    if (paymentError) {
      logger.error("Error updating payment record:", paymentError)
      return
    }

    if (payment_group_id) {
      const { data: groupPayments } = await supabase
        .from("payments")
        .select("status")
        .eq("payment_group_id", payment_group_id)

      const allCompleted = groupPayments?.every((p: any) => p.status === "completed")

      if (allCompleted) {
        const { data: voucher, error: voucherError } = await supabase
          .from("vouchers")
          .insert({
            user_id,
            week_id,
            property_id,
            voucher_code: `CONEKTA-${order.id.slice(-8).toUpperCase()}`,
            amount_paid: order.amount / 100,
            payment_method: "conekta",
            status: "active",
          })
          .select()
          .single()

        if (voucherError) {
          logger.error("Error creating voucher:", voucherError)
          return
        }

        logger.info("All partial payments completed. Voucher created:", voucher.voucher_code)
      }
    } else {
      const { data: voucher, error: voucherError } = await supabase
        .from("vouchers")
        .insert({
          user_id,
          week_id,
          property_id,
          voucher_code: `CONEKTA-${order.id.slice(-8).toUpperCase()}`,
          amount_paid: order.amount / 100,
          payment_method: "conekta",
          status: "active",
        })
        .select()
        .single()

      if (voucherError) {
        logger.error("Error creating voucher:", voucherError)
        return
      }

      logger.info("Voucher created successfully:", voucher.voucher_code)
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
