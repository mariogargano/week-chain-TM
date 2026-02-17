import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")

    let query = supabase
      .from("reservations")
      .select(`
        *,
        weeks (
          id,
          week_number,
          season,
          nft_token_id
        ),
        properties (
          id,
          name,
          location,
          image_url
        ),
        nft_management (
          id,
          management_fee_percentage,
          auto_accept_bookings
        )
      `)
      .not("nft_management", "is", null)
      .order("created_at", { ascending: false })

    if (status) {
      query = query.eq("status", status)
    }

    const { data: reservations, error } = await query

    if (error) throw error

    return NextResponse.json({ reservations })
  } catch (error: any) {
    console.error("[v0] Error fetching management reservations:", error)
    return NextResponse.json({ error: error.message || "Error al obtener reservas" }, { status: 500 })
  }
}
