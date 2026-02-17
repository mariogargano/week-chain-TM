import { type NextRequest, NextResponse } from "next/server"
import { createConektaOrder, type ConektaOrderRequest } from "@/lib/conekta/client"
import { createClient } from "@supabase/supabase-js"
import { getEnvironment } from "@/lib/config/environment"

function getSupabase() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

export async function POST(request: NextRequest) {
  const env = getEnvironment()
  console.log("[v0] Card payment API called", {
    conektaConfigured: !!env.conekta.secretKey,
    conektaDemoMode: env.conekta.isDemoMode,
    keyPrefix: env.conekta.secretKey ? env.conekta.secretKey.substring(0, 10) : "none",
  })

  try {
    const body = await request.json()
    const { amount, currency, customer, card, metadata } = body

    console.log("[v0] Card payment request:", {
      amount,
      currency,
      customerEmail: customer?.email,
      hasCard: !!card,
      metadata,
    })

    // Validate required fields
    if (!amount || !customer?.email || !card?.number) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Create Conekta order with card payment
    const orderData: ConektaOrderRequest = {
      currency: currency || "MXN",
      customer_info: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      },
      line_items: [
        {
          name: `Semana ${metadata.weekNumber} - ${metadata.propertyName}`,
          unit_price: amount,
          quantity: 1,
        },
      ],
      charges: [
        {
          payment_method: {
            type: "card",
            token_id: card.number, // In production, this would be a tokenized card
          },
        },
      ],
      metadata: {
        ...metadata,
        payment_type: "card",
      },
    }

    console.log("[v0] Creating Conekta order...")
    const order = await createConektaOrder(orderData)
    console.log("[v0] Conekta order created:", order.id, "status:", order.payment_status)

    if (order.payment_status === "paid") {
      const supabase = getSupabase()
      // Record the payment in escrow_deposits
      await supabase.from("escrow_deposits").insert({
        amount_usdc: amount / 100 / 17.5, // Convert MXN cents to USD
        status: "confirmed",
        user_wallet: customer.email,
        transaction_hash: order.id,
        escrow_address: "conekta_escrow_contable",
        metadata: {
          conekta_order_id: order.id,
          payment_method: "card",
          ...metadata,
        },
      })

      return NextResponse.json({
        success: true,
        orderId: order.id,
        status: order.payment_status,
      })
    }

    return NextResponse.json({
      success: false,
      error: "Payment not completed",
      status: order.payment_status,
    })
  } catch (error: any) {
    console.error("[v0] Conekta card payment error:", error)
    return NextResponse.json({ success: false, error: error.message || "Payment failed" }, { status: 500 })
  }
}
