import { type NextRequest, NextResponse } from "next/server"
import { createCommissionFromOrder } from "@/lib/flows/commission-creation"
import { reverseCommission } from "@/lib/flows/anti-fraud-hold"
import { createClient } from "@/lib/supabase/server"

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
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object

    const userId = session.metadata?.user_id
    const userEmail = session.customer_email || session.metadata?.user_email
    const certificateTier = session.metadata?.certificate_tier as any
    const orderId = session.id
    const amount = session.amount_total! / 100

    const productId = session.metadata?.product_id
    const maxPax = session.metadata?.max_pax ? Number.parseInt(session.metadata.max_pax) : null
    const maxEstancias = session.metadata?.max_estancias ? Number.parseInt(session.metadata.max_estancias) : null

    // Legacy support for tier-based purchases
    const certificateTierForCommission = productId ? `PAX${maxPax}_EST${maxEstancias}` : certificateTier

    console.log(`[v0] Stripe checkout completed for ${productId ? `product ${productId}` : `tier ${certificateTier}`}`)

    if (userId && userEmail && (productId || certificateTier)) {
      try {
        const supabase = await createClient()

        const issueResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/certificates/issue`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            productId,
            maxPax,
            estancias: maxEstancias,
            orderId,
            stripeSessionId: session.id,
            adminOverride: false,
          }),
        })

        if (!issueResponse.ok) {
          const errorData = await issueResponse.json()
          throw new Error(errorData.error || "Failed to issue certificate")
        }

        console.log(`[v0] Certificate issued successfully for order ${orderId}`)

        // Create commission (use product info for reference)
        await createCommissionFromOrder({
          orderId,
          buyerUserId: userId,
          buyerEmail: userEmail,
          certificateTier: certificateTierForCommission,
          saleAmount: amount,
        })
        console.log(`[v0] Commission created for order ${orderId}`)
      } catch (error) {
        console.error(`[v0] Error processing checkout completion:`, error)
      }
    }
  }

  if (event.type === "charge.refunded") {
    const charge = event.data.object
    const orderId = charge.payment_intent as string

    try {
      await reverseCommission(orderId, "Charge refunded")
      console.log(`[v0] Commission reversed for refund: ${orderId}`)
    } catch (error) {
      console.error(`[v0] Error reversing commission:`, error)
    }
  }

  if (event.type === "charge.dispute.created") {
    const dispute = event.data.object
    const orderId = dispute.payment_intent as string

    try {
      await reverseCommission(orderId, "Dispute/chargeback created")
      console.log(`[v0] Commission reversed for dispute: ${orderId}`)
    } catch (error) {
      console.error(`[v0] Error reversing commission:`, error)
    }
  }

  return NextResponse.json({ received: true })
}
