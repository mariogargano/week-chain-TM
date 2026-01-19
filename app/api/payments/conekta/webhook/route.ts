import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { verifyConektaSignature } from "@/lib/conekta/signature-verifier"
import { createPurchaseVoucher } from "@/lib/vouchers/service"
import { logger } from "@/lib/config/logger"

export async function POST(request: Request) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get("x-conekta-signature")

    // Security check: Verify signature
    if (!verifyConektaSignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const event = JSON.parse(rawBody)
    logger.info("Conekta webhook received and verified", { type: event.type })

    // Use service role client for webhook processing as it's server-to-server
    // and needs to bypass RLS for system updates
    const { createServiceRoleClient } = await import("@/lib/supabase/server")
    const supabase = createServiceRoleClient()

    // Handle successful payment
    if (event.type === "order.paid") {
      const order = event.data.object

      // Update payment status
      const { error: updateError } = await supabase
        .from("fiat_payments")
        .update({
          status: "succeeded",
          succeeded_at: new Date().toISOString(),
          conekta_charge_id: order.charges?.data[0]?.id,
        })
        .eq("conekta_order_id", order.id)

      if (updateError) {
        logger.error("Error updating fiat payment", { error: updateError, orderId: order.id })
      }

      // Get payment info to create voucher
      const { data: fiatPayment } = await supabase
        .from("fiat_payments")
        .select("*")
        .eq("conekta_order_id", order.id)
        .single()

      if (fiatPayment) {
        const isPartialPayment = fiatPayment.metadata?.is_partial_payment === true
        const paymentGroupId = fiatPayment.metadata?.payment_group_id

        if (isPartialPayment && paymentGroupId) {
          logger.info("Processing partial payment", {
            groupId: paymentGroupId,
            sequence: fiatPayment.metadata?.sequence_number,
          })

          // Check if all payments in the group are completed
          const { data: allPayments } = await supabase
            .from("fiat_payments")
            .select("*")
            .eq("metadata->>payment_group_id", paymentGroupId)

          if (allPayments) {
            const totalPayments = fiatPayment.metadata?.total_in_sequence || 1
            const completedPayments = allPayments.filter((p) => p.status === "succeeded").length

            logger.info("Partial payment group status", {
              groupId: paymentGroupId,
              completed: completedPayments,
              total: totalPayments,
            })

            // If all payments are completed, confirm the voucher
            if (completedPayments === totalPayments) {
              logger.info("All partial payments completed, confirming voucher", { groupId: paymentGroupId })

              const { data: voucher } = await supabase
                .from("purchase_vouchers")
                .select("*")
                .eq("metadata->>payment_group_id", paymentGroupId)
                .single()

              if (voucher && voucher.status === "pending") {
                await supabase
                  .from("purchase_vouchers")
                  .update({
                    status: "confirmed",
                    confirmed_at: new Date().toISOString(),
                  })
                  .eq("id", voucher.id)

                logger.info("Voucher confirmed for completed partial payments", {
                  voucherId: voucher.id,
                  groupId: paymentGroupId,
                })
              }
            }
          }
        } else {
          // Direct voucher creation using service function instead of internal API call
          try {
            const result = await createPurchaseVoucher(supabase, {
              user_wallet: fiatPayment.user_wallet,
              property_id: fiatPayment.property_id,
              week_id: fiatPayment.week_id,
              week_number: order.metadata.week_number,
              payment_method: `conekta_${fiatPayment.payment_method}`,
              amount_usdc: fiatPayment.usdc_equivalent,
              amount_paid_currency: fiatPayment.currency,
              amount_paid: fiatPayment.amount,
              conekta_order_id: order.id,
            })

            if (result.success) {
              await supabase.from("fiat_payments").update({ voucher_id: result.voucher.id }).eq("id", fiatPayment.id)
              logger.info("Voucher created and linked to payment", {
                paymentId: fiatPayment.id,
                voucherId: result.voucher.id
              })
            }
          } catch (voucherError: any) {
            logger.error("Failed to create voucher from webhook", {
              error: voucherError.message,
              orderId: order.id
            })
          }
        }
      }
    }

    // Handle payment failure
    if (event.type === "order.payment_failed" || event.type === "charge.declined") {
      const order = event.data.object

      await supabase
        .from("fiat_payments")
        .update({
          status: "failed",
          failed_at: new Date().toISOString(),
        })
        .eq("conekta_order_id", order.id)

      logger.info("Payment failure recorded", { orderId: order.id, type: event.type })
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    logger.error("Conekta webhook error", { error: error.message })
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}
