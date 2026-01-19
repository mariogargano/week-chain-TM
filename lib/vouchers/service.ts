import { SupabaseClient } from "@supabase/supabase-js"
import { logger } from "@/lib/config/logger"

export interface CreateVoucherParams {
  user_wallet: string
  property_id: string
  week_id: string
  week_number: number
  payment_method: string
  amount_usdc: number
  amount_paid_currency?: string
  amount_paid?: number
  escrow_deposit_id?: string
  conekta_order_id?: string
  payment_transaction_hash?: string
}

/**
 * Service to handle voucher creation and related logic
 * This can be called from both API routes and webhooks
 */
export async function createPurchaseVoucher(supabase: SupabaseClient, params: CreateVoucherParams) {
  try {
    const {
      user_wallet,
      property_id,
      week_id,
      week_number,
      payment_method,
      amount_usdc,
      amount_paid_currency,
      amount_paid,
      escrow_deposit_id,
      conekta_order_id,
      payment_transaction_hash,
    } = params

    logger.info("Creating purchase voucher", { user_wallet, property_id, week_id })

    // Generate unique voucher code using SQL RPC
    const { data: voucherCodeData, error: codeError } = await supabase.rpc("generate_voucher_code", {
      p_property_id: property_id,
      p_week_number: week_number,
    })

    if (codeError) {
      logger.error("Error generating voucher code", { error: codeError })
      throw new Error("Failed to generate voucher code")
    }

    const voucher_code = voucherCodeData as string

    // Create the voucher
    const { data: voucher, error: voucherError } = await supabase
      .from("purchase_vouchers")
      .insert({
        voucher_code,
        user_wallet,
        property_id,
        week_id,
        week_number,
        payment_method,
        amount_usdc,
        amount_paid_currency: amount_paid_currency || "USDC",
        amount_paid: amount_paid || amount_usdc,
        escrow_deposit_id,
        conekta_order_id,
        payment_transaction_hash,
        status: payment_method === "usdc_crypto" ? "confirmed" : "pending",
        issued_at: new Date().toISOString(),
        confirmed_at: payment_method === "usdc_crypto" ? new Date().toISOString() : null,
      })
      .select()
      .single()

    if (voucherError) {
      logger.error("Error inserting purchase voucher", { error: voucherError })
      throw new Error(voucherError.message)
    }

    // Update the week with the voucher info
    const { error: weekError } = await supabase
      .from("weeks")
      .update({
        status: "reserved",
        owner_wallet: user_wallet,
      })
      .eq("id", week_id)

    if (weekError) {
      logger.error("Error updating week status", { error: weekError, week_id })
    }

    // Create associated reservation
    const { data: reservation, error: reservationError } = await supabase
      .from("reservations")
      .insert({
        week_id,
        property_id,
        user_wallet,
        status: "confirmed",
        week_tokens_deposited: false,
        nft_issued: false,
        usdc_equivalent: amount_usdc,
        metadata: {
          voucher_id: voucher.id,
          voucher_code: voucher_code,
          payment_method,
        },
      })
      .select()
      .single()

    if (reservationError) {
      logger.error("Error creating reservation", { error: reservationError })
    }

    return {
      success: true,
      voucher,
      reservation,
    }
  } catch (error: any) {
    logger.error("Voucher service error", { error: error.message })
    throw error
  }
}
