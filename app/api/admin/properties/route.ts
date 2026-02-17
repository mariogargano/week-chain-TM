import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const walletAddress = request.headers.get("x-wallet-address")

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address required" }, { status: 401 })
    }

    const supabase = await createClient()

    const { data: roleInfo, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("wallet_address", walletAddress)
      .single()

    if (roleError || !roleInfo || roleInfo.role !== "admin") {
      console.error("[v0] Authorization failed:", roleError || "Not admin")
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 })
    }

    console.log("[v0] Admin access verified for wallet:", walletAddress)

    const body = await request.json()

    const { data: property, error } = await supabase
      .from("properties")
      .insert({
        name: body.name,
        location: body.location,
        description: body.description,
        valor_total_usd: body.valor_total_usd,
        image_url: body.image_url,
        status: body.status || "active",
        recaudado_actual: 0,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Property creation error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Property created:", property.id)

    // Create 52 weeks for the property
    const weeks = []
    const pricePerWeek = Math.floor(body.valor_total_usd / 52)

    for (let i = 1; i <= 52; i++) {
      weeks.push({
        property_id: property.id,
        week_number: i,
        status: "available",
        price: pricePerWeek,
        season: i <= 13 ? "baja" : i <= 26 ? "media" : i <= 39 ? "alta" : "empresa",
        start_date: new Date(2025, 0, i * 7).toISOString(),
        end_date: new Date(2025, 0, (i + 1) * 7).toISOString(),
      })
    }

    const { error: weeksError } = await supabase.from("weeks").insert(weeks)

    if (weeksError) {
      console.error("[v0] Weeks creation error:", weeksError)
      return NextResponse.json({ error: "Property created but weeks failed: " + weeksError.message }, { status: 500 })
    }

    console.log("[v0] Created 52 weeks for property:", property.id)

    return NextResponse.json({ success: true, property })
  } catch (error) {
    console.error("[v0] API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
