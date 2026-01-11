import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { createConektaClient } from "@/lib/conekta/client"
import { logger } from "@/lib/config/logger"
import { calculateOxxoPartialPayments, getPartialPaymentMessage } from "@/lib/payments/oxxo-partial"
import { randomUUID } from "crypto"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const body = await request.json()
    const { amount, property_id, week_id, week_number, property_name, user_email, user_name } = body

    logger.info("Creating OXXO partial payments", { amount, week_id })

    const conekta = createConektaClient()
    const isDemoMode = conekta.isDemoModeActive()

    const exchange_rate = 17.5
    const amount_mxn = amount * exchange_rate
    const amount_usd = amount

    // Calculate partial payments
    const partialPayments = calculateOxxoPartialPayments(amount_mxn)

    logger.info("Partial payments calculated", {
      totalAmount: amount_mxn,
      payments: partialPayments.length,
    })

    const paymentGroupId = randomUUID()

    logger.info("Payment group ID generated", { groupId: paymentGroupId })

    // Create Conekta orders for each partial payment
    const orders = []
    const paymentRecords = []

    for (const payment of partialPayments) {
      const orderData = {
        currency: "MXN",
        customer_info: {
          name: user_name || "Cliente",
          email: user_email || user?.email || "guest@weekchain.com",
        },
        line_items: [
          {
            name: `${property_name} - Semana ${week_number} (Pago ${payment.sequence}/${payment.total})`,
            unit_price: Math.round(payment.amount * 100),
            quantity: 1,
          },
        ],
        charges: [
          {
            payment_method: {
              type: "oxxo_cash",
              expires_at: Math.floor(Date.now() / 1000) + 3 * 24 * 60 * 60, // 3 days
            },
          },
        ],
        metadata: {
          property_id,
          week_id,
          week_number: week_number.toString(),
          payment_group_id: paymentGroupId,
          sequence_number: payment.sequence.toString(),
          total_in_sequence: payment.total.toString(),
        },
      }

      const order = await conekta.createOrder(orderData)
      orders.push(order)

      logger.info("Conekta order created for partial payment", {
        orderId: order.id,
        sequence: payment.sequence,
        amount: payment.amount,
      })

      if (!isDemoMode) {
        const paymentRecord = {
          user_wallet: user?.id || "guest",
          user_email: user_email || user?.email || "",
          processor: "conekta",
          conekta_order_id: order.id,
          amount: payment.amount,
          currency: "MXN",
          payment_method: "oxxo",
          usdc_equivalent: amount_usd / payment.total,
          exchange_rate,
          status: "requires_action",
          property_id,
          week_id,
          metadata: {
            week_number,
            property_name,
            order_id: order.id,
            // Group information stored in metadata
            payment_group_id: paymentGroupId,
            sequence_number: payment.sequence,
            total_in_sequence: payment.total,
            is_partial_payment: true,
            total_amount_mxn: amount_mxn,
            total_amount_usd: amount_usd,
          },
        }

        const { data: savedPayment } = await supabase.from("fiat_payments").insert(paymentRecord).select().single()

        paymentRecords.push(savedPayment)
      }
    }

    const voucherCode = `WEEK-${property_id.slice(0, 8)}-W${week_number}-${Date.now()}`

    const { data: voucher } = await supabase
      .from("purchase_vouchers")
      .insert({
        user_wallet: user?.id || "guest",
        user_email: user_email || user?.email || "",
        week_id,
        property_id,
        week_number,
        amount_usdc: amount_usd,
        amount_paid: amount_usd,
        payment_method: "conekta_oxxo_partial",
        status: "pending",
        voucher_code: voucherCode,
        metadata: {
          payment_group_id: paymentGroupId,
          total_payments: partialPayments.length,
          total_amount_mxn: amount_mxn,
          payment_ids: paymentRecords.map((p) => p?.id).filter(Boolean),
        },
      })
      .select()
      .single()

    logger.info("Partial payments created successfully", {
      groupId: paymentGroupId,
      voucherId: voucher?.id,
      totalPayments: partialPayments.length,
    })

    return NextResponse.json({
      success: true,
      payment_group_id: paymentGroupId,
      voucher_id: voucher?.id,
      voucher_code: voucherCode,
      total_payments: partialPayments.length,
      orders: orders.map((order, idx) => ({
        order_id: order.id,
        sequence: idx + 1,
        amount: partialPayments[idx].amount,
        reference: order.charges?.data[0]?.payment_method?.reference,
      })),
      message: getPartialPaymentMessage(partialPayments),
      demo_mode: isDemoMode,
    })
  } catch (error) {
    logger.error("Error creating partial payments", { error })
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    )
  }
}
