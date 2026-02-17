import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const eventType = body.event_type

    console.log("[v0] PayPal webhook received:", eventType)

    const supabase = await createClient()

    switch (eventType) {
      case "CHECKOUT.ORDER.APPROVED":
        // Order approved by customer
        console.log("[v0] PayPal order approved:", body.resource?.id)
        break

      case "PAYMENT.CAPTURE.COMPLETED":
        // Payment captured successfully
        const captureId = body.resource?.id
        const orderId = body.resource?.supplementary_data?.related_ids?.order_id

        console.log("[v0] PayPal payment captured:", { captureId, orderId })

        if (orderId) {
          await supabase
            .from("escrow_deposits")
            .update({
              status: "confirmed",
              confirmed_at: new Date().toISOString(),
              tx_hash: captureId,
            })
            .eq("payment_reference", orderId)
        }
        break

      case "PAYMENT.CAPTURE.DENIED":
      case "PAYMENT.CAPTURE.REFUNDED":
        // Payment denied or refunded
        const refOrderId = body.resource?.supplementary_data?.related_ids?.order_id
        if (refOrderId) {
          await supabase.from("escrow_deposits").update({ status: "failed" }).eq("payment_reference", refOrderId)
        }
        break

      default:
        console.log("[v0] Unhandled PayPal webhook event:", eventType)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error("[v0] PayPal webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
