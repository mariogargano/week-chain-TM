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
      buyer_wallet,
      buyer_email,
      buyer_name,
      property_id,
      total_price_usdc,
      discount_percentage = 10,
      final_price_usdc,
      payment_method,
      transaction_hash,
      conekta_order_id,
    } = body

    console.log("[v0] Creating full property purchase:", { property_id, buyer_wallet, final_price_usdc })

    // Verificar que la propiedad existe
    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .select("*, presale_sold")
      .eq("id", property_id)
      .single()

    if (propertyError || !property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 })
    }

    // Calcular cuántos reembolsos se necesitan
    const { data: existingVouchers } = await supabase
      .from("purchase_vouchers")
      .select("amount_usdc")
      .eq("property_id", property_id)
      .in("status", ["confirmed", "redeemed"])

    const weeks_to_refund = existingVouchers?.length || 0
    const total_refund_amount = existingVouchers?.reduce((sum, v) => sum + Number.parseFloat(v.amount_usdc), 0) || 0

    // Crear el registro de compra total
    const { data: fullPurchase, error: purchaseError } = await supabase
      .from("full_property_purchases")
      .insert({
        buyer_wallet,
        buyer_email,
        buyer_name,
        property_id,
        total_price_usdc,
        discount_percentage,
        final_price_usdc,
        payment_method,
        payment_status: payment_method === "usdc_crypto" ? "completed" : "pending",
        status: weeks_to_refund > 0 ? "processing" : "completed",
        weeks_to_refund,
        total_refund_amount_usdc: total_refund_amount,
        transaction_hash,
        conekta_order_id,
        payment_completed_at: payment_method === "usdc_crypto" ? new Date().toISOString() : null,
      })
      .select()
      .single()

    if (purchaseError) {
      console.error("[v0] Error creating full purchase:", purchaseError)
      return NextResponse.json({ error: purchaseError.message }, { status: 500 })
    }

    // Si hay holders existentes, iniciar proceso de reembolso
    if (weeks_to_refund > 0) {
      const { data: refundsCreated, error: refundError } = await supabase.rpc("initiate_holder_refunds", {
        p_full_purchase_id: fullPurchase.id,
        p_compensation_percentage: 5, // 5% de compensación adicional
      })

      if (refundError) {
        console.error("[v0] Error initiating refunds:", refundError)
      } else {
        console.log("[v0] Refunds initiated:", refundsCreated)
      }
    }

    // Actualizar todas las semanas de la propiedad
    const { error: weeksError } = await supabase
      .from("weeks")
      .update({
        status: "sold",
        owner_wallet: buyer_wallet,
      })
      .eq("property_id", property_id)

    if (weeksError) {
      console.error("[v0] Error updating weeks:", weeksError)
    }

    // Actualizar estado de la propiedad
    const { error: propertyUpdateError } = await supabase
      .from("properties")
      .update({
        status: "sold_complete",
        presale_sold: 52,
        presale_progress: 100,
      })
      .eq("id", property_id)

    if (propertyUpdateError) {
      console.error("[v0] Error updating property:", propertyUpdateError)
    }

    return NextResponse.json({
      success: true,
      full_purchase: fullPurchase,
      refunds_to_process: weeks_to_refund,
      message:
        weeks_to_refund > 0
          ? `Compra total creada. Se procesarán ${weeks_to_refund} reembolsos a holders existentes.`
          : "Compra total completada exitosamente.",
    })
  } catch (error) {
    console.error("[v0] API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
