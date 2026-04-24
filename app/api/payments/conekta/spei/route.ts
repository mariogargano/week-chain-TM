import { type NextRequest, NextResponse } from "next/server"
import { createConektaOrder, type ConektaOrderRequest } from "@/lib/conekta/client"
import { createClient } from "@supabase/supabase-js"

function getSupabase() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, currency, customer, metadata } = body

    // Validate required fields
    if (!amount || !customer?.email) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Create Conekta order with SPEI payment
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
            type: "spei",
            expires_at: Math.floor(Date.now() / 1000) + 259200, // 3 days
          },
        },
      ],
      metadata: {
        ...metadata,
        payment_type: "spei",
      },
    }

    const order = await createConektaOrder(orderData)

    // Get the SPEI payment details from the charge
    const charge = order.charges?.data?.[0]
    const speiDetails = charge?.payment_method

    const supabase = getSupabase()
    // Record pending payment in escrow_deposits
    await supabase.from("escrow_deposits").insert({
      amount_usdc: amount / 100 / 17.5, // Convert MXN cents to USD
      status: "pending",
      user_wallet: customer.email,
      transaction_hash: order.id,
      escrow_address: "conekta_escrow_contable",
      metadata: {
        conekta_order_id: order.id,
        payment_method: "spei",
        clabe: speiDetails?.clabe,
        ...metadata,
      },
    })

    return NextResponse.json({
      success: true,
      order_id: order.id,
      clabe: speiDetails?.clabe,
      bank: speiDetails?.bank || "STP",
      expires_at: new Date(Date.now() + 259200000).toISOString(), // 3 days
    })
  } catch (error: any) {
    console.error("Conekta SPEI payment error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create SPEI payment" },
      { status: 500 },
    )
  }
}
