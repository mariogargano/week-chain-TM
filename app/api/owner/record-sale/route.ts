import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { property_id, week_id, week_number, sale_price_usd, buyer_wallet } = body

    // Get property owner
    const { data: property } = await supabase.from("properties").select("owner_id").eq("id", property_id).single()

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 })
    }

    // Calculate platform fee (10%)
    const platform_fee_percentage = 0.1
    const platform_fee_usd = sale_price_usd * platform_fee_percentage
    const owner_revenue_usd = sale_price_usd - platform_fee_usd

    // Record sale
    const { data: sale, error } = await supabase
      .from("property_owner_sales")
      .insert({
        property_id,
        owner_id: property.owner_id,
        week_id,
        week_number,
        sale_date: new Date().toISOString(),
        sale_price_usd,
        buyer_wallet,
        owner_revenue_usd,
        platform_fee_usd,
        platform_fee_percentage,
        payment_status: "pending",
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Create notification for owner
    await supabase.from("owner_notifications").insert({
      owner_id: property.owner_id,
      notification_type: "sale_made",
      title: "Nueva Venta Realizada",
      message: `Se ha vendido la semana #${week_number} por $${sale_price_usd.toLocaleString()}. Recibirás $${owner_revenue_usd.toLocaleString()} en tu cuenta.`,
      link: `/dashboard/owner/sales`,
      sale_id: sale.id,
    })

    // Update owner profile stats
    await supabase.rpc("increment_owner_revenue", {
      owner_user_id: property.owner_id,
      amount: owner_revenue_usd,
    })

    return NextResponse.json({ success: true, sale })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
