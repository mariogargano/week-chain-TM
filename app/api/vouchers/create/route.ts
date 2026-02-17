import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
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
    } = body

    // Generar código de voucher único
    const { data: voucherCodeData, error: codeError } = await supabase.rpc("generate_voucher_code", {
      p_property_id: property_id,
      p_week_number: week_number,
    })

    if (codeError) {
      console.error("[v0] Error generating voucher code:", codeError)
      return NextResponse.json({ error: "Failed to generate voucher code" }, { status: 500 })
    }

    const voucher_code = voucherCodeData as string

    // Crear el voucher
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
        status: payment_method === "usdc_crypto" ? "confirmed" : "pending", // Crypto confirmado inmediatamente
        issued_at: new Date().toISOString(),
        confirmed_at: payment_method === "usdc_crypto" ? new Date().toISOString() : null,
      })
      .select()
      .single()

    if (voucherError) {
      console.error("[v0] Error creating voucher:", voucherError)
      return NextResponse.json({ error: voucherError.message }, { status: 500 })
    }

    // Actualizar la semana con el voucher
    const { error: weekError } = await supabase
      .from("weeks")
      .update({
        status: "reserved",
        owner_wallet: user_wallet,
      })
      .eq("id", week_id)

    if (weekError) {
      console.error("[v0] Error updating week:", weekError)
    }

    // Crear reservación asociada
    const { data: reservation, error: reservationError } = await supabase
      .from("reservations")
      .insert({
        week_id,
        property_id,
        user_wallet,
        status: "confirmed",
        week_tokens_deposited: false, // Ya no usamos tokens
        nft_issued: false, // Se emitirá cuando se canjee el voucher
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
      console.error("[v0] Error creating reservation:", reservationError)
    }

    return NextResponse.json({
      success: true,
      voucher,
      reservation,
      message: "Purchase voucher created successfully",
    })
  } catch (error) {
    console.error("[v0] API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
