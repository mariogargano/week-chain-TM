import { type NextRequest, NextResponse } from "next/server"
import { createPayPalOrder } from "@/lib/paypal/client"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, currency = "MXN", customer, metadata } = body

    console.log("[v0] PayPal create order request:", { amount, currency, customer: customer?.email })

    // Validate required fields
    if (!amount || amount < 100) {
      return NextResponse.json({ success: false, error: "Monto inválido (mínimo 100)" }, { status: 400 })
    }

    if (!customer?.email || !customer?.name) {
      return NextResponse.json({ success: false, error: "Datos del cliente incompletos" }, { status: 400 })
    }

    // Get base URL for return/cancel URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.headers.get("origin") || "https://week-chain.vercel.app"

    // Create PayPal order
    const order = await createPayPalOrder({
      amount: amount / 100, // Convert from cents to dollars/pesos
      currency,
      description: `WEEK-CHAIN - ${metadata?.propertyName || "Compra de Semana"} - Semana ${metadata?.weekNumber || ""}`,
      returnUrl: `${baseUrl}/api/payments/paypal/capture?success=true`,
      cancelUrl: `${baseUrl}/api/payments/paypal/capture?success=false`,
      metadata: {
        ...metadata,
        customerEmail: customer.email,
        customerName: customer.name,
      },
    })

    // Get approval URL
    const approvalUrl = order.links?.find((link) => link.rel === "approve")?.href

    // Store pending order in database
    const supabase = await createClient()
    await supabase.from("escrow_deposits").insert({
      user_wallet: customer.email,
      amount_usdc: amount / 100,
      property_id: metadata?.propertyId || null,
      week_id: metadata?.weekId || null,
      status: "pending",
      payment_method: "paypal",
      payment_reference: order.id,
    })

    console.log("[v0] PayPal order created successfully:", order.id)

    return NextResponse.json({
      success: true,
      order_id: order.id,
      approval_url: approvalUrl,
      status: order.status,
    })
  } catch (error: any) {
    console.error("[v0] PayPal create order error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Error al crear orden de PayPal" },
      { status: 500 },
    )
  }
}
