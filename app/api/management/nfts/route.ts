import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Obtener todos los NFTs bajo management
    const { data: managedNFTs, error } = await supabase
      .from("nft_management")
      .select(`
        *,
        weeks (
          id,
          week_number,
          season,
          status,
          owner_wallet,
          nft_token_id
        ),
        properties (
          id,
          name,
          location,
          image_url
        )
      `)
      .eq("management_enabled", true)
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ managedNFTs })
  } catch (error: any) {
    console.error("[v0] Error fetching managed NFTs:", error)
    return NextResponse.json({ error: error.message || "Error al obtener NFTs bajo management" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { week_id, management_fee_percentage, auto_accept_bookings, pricing_strategy } = body

    // Obtener información de la semana
    const { data: week, error: weekError } = await supabase
      .from("weeks")
      .select("*, properties(*)")
      .eq("id", week_id)
      .single()

    if (weekError) throw weekError

    // Crear registro de management
    const { data: management, error: managementError } = await supabase
      .from("nft_management")
      .insert({
        week_id,
        property_id: week.property_id,
        owner_wallet: week.owner_wallet,
        management_enabled: true,
        management_started_at: new Date().toISOString(),
        management_fee_percentage: management_fee_percentage || 15,
        auto_accept_bookings: auto_accept_bookings !== false,
        pricing_strategy: pricing_strategy || "dynamic",
      })
      .select()
      .single()

    if (managementError) throw managementError

    return NextResponse.json({ management })
  } catch (error: any) {
    console.error("[v0] Error enabling management:", error)
    return NextResponse.json({ error: error.message || "Error al activar management" }, { status: 500 })
  }
}
