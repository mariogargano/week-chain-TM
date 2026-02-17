import { type NextRequest, NextResponse } from "next/server"
import { createConektaOrder, type ConektaOrderRequest } from "@/lib/conekta/client"
import { createClient } from "@supabase/supabase-js"
import { calculateOxxoPartialPayments } from "@/lib/payments/oxxo-partial"

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

    // Convert from cents to MXN
    const amountMXN = amount / 100

    const partialPayments = calculateOxxoPartialPayments(amountMXN)
    const requiresMultiplePayments = partialPayments.length > 1

    // Create a payment group ID for tracking multiple payments
    const paymentGroupId = `oxxo_group_${Date.now()}_${Math.random().toString(36).substring(7)}`

    // Create an order for each partial payment
    const createdPayments = []
    const supabase = getSupabase()

    for (const payment of partialPayments) {
      const orderData: ConektaOrderRequest = {
        currency: currency || "MXN",
        customer_info: {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
        },
        line_items: [
          {
            name: requiresMultiplePayments
              ? `Semana ${metadata.weekNumber} - ${metadata.propertyName} (Pago ${payment.sequence}/${payment.total})`
              : `Semana ${metadata.weekNumber} - ${metadata.propertyName}`,
            unit_price: Math.round(payment.amount * 100), // Conekta uses cents
            quantity: 1,
          },
        ],
        charges: [
          {
            payment_method: {
              type: "oxxo_cash",
              expires_at: Math.floor(Date.now() / 1000) + 259200, // 3 days
            },
          },
        ],
        metadata: {
          ...metadata,
          payment_type: "oxxo",
          payment_group_id: paymentGroupId,
          payment_sequence: payment.sequence,
          payment_total: payment.total,
          is_partial_payment: requiresMultiplePayments,
        },
      }

      const order = await createConektaOrder(orderData)

      // Get the OXXO payment details from the charge
      const charge = order.charges?.data?.[0]
      const oxxoReference = charge?.payment_method?.reference
      const barcodeUrl = charge?.payment_method?.barcode_url

      createdPayments.push({
        order_id: order.id,
        reference: oxxoReference,
        barcode_url: barcodeUrl,
        amount: payment.amount,
        sequence: payment.sequence,
        total: payment.total,
      })

      // Record pending payment in escrow_deposits
      await supabase.from("escrow_deposits").insert({
        amount_usdc: payment.amount / 17.5, // Convert MXN to USD
        status: "pending",
        user_wallet: customer.email,
        transaction_hash: order.id,
        escrow_address: "conekta_escrow_contable",
        metadata: {
          conekta_order_id: order.id,
          payment_method: "oxxo",
          reference: oxxoReference,
          payment_group_id: paymentGroupId,
          payment_sequence: payment.sequence,
          payment_total: payment.total,
          is_partial_payment: requiresMultiplePayments,
          ...metadata,
        },
      })
    }

    return NextResponse.json({
      success: true,
      payment_group_id: paymentGroupId,
      is_partial: requiresMultiplePayments,
      total_payments: partialPayments.length,
      total_amount: amountMXN,
      payments: createdPayments,
      expires_at: new Date(Date.now() + 259200000).toISOString(), // 3 days
    })
  } catch (error: any) {
    console.error("Conekta OXXO payment error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create OXXO payment" },
      { status: 500 },
    )
  }
}
