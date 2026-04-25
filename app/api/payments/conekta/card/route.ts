import { type NextRequest, NextResponse } from "next/server"
import { createConektaOrder, type ConektaOrderRequest } from "@/lib/conekta/client"
import { createClient } from "@supabase/supabase-js"
import { getEnvironment } from "@/lib/config/environment"

function getSupabase() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

/**
 * PCI-DSS REQUIREMENT: This endpoint only accepts an opaque Conekta.js token
 * (tok_...). It must NEVER receive raw card numbers (PANs). If a raw card number
 * is detected we reject the request immediately with 422 to prevent accidental
 * storage or logging of cardholder data.
 *
 * Clients must tokenize the card using Conekta.js on the browser before calling
 * this endpoint. See: https://developers.conekta.com/docs/tokenization
 */
function looksLikeRawPAN(value: unknown): boolean {
  if (typeof value !== "string") return false
  // Strip spaces/dashes and check if it is 13-19 digits (covers Visa/MC/Amex/Discover)
  const digits = value.replace(/[\s-]/g, "")
  return /^\d{13,19}$/.test(digits)
}

export async function POST(request: NextRequest) {
  const env = getEnvironment()

  try {
    const body = await request.json()
    const { amount, currency, customer, card, metadata } = body

    // Validate required fields
    if (!amount || !customer?.email || !card?.token_id) {
      return NextResponse.json(
        { success: false, error: "Missing required fields. 'card.token_id' must be a Conekta.js token, not a raw card number." },
        { status: 400 }
      )
    }

    // Security gate: reject if the caller accidentally sent a raw PAN instead of a token.
    // Conekta tokens start with "tok_"; raw PANs are 13–19 digit strings.
    if (looksLikeRawPAN(card.token_id) || (typeof card.token_id === "string" && !card.token_id.startsWith("tok_"))) {
      return NextResponse.json(
        { success: false, error: "Invalid token format. Use Conekta.js to tokenize the card on the client before submitting." },
        { status: 422 }
      )
    }

    // Create Conekta order with tokenized card payment
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
            token_id: card.token_id, // Opaque Conekta.js token — never a raw PAN
          },
        },
      ],
      metadata: {
        ...metadata,
        payment_type: "card",
      },
    }

    const order = await createConektaOrder(orderData)

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
