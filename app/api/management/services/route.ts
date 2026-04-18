import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const nftManagementId = searchParams.get("nft_management_id")

    let query = supabase
      .from("management_services")
      .select(`
        *,
        nft_management (
          id,
          weeks (
            week_number,
            season
          ),
          properties (
            name,
            location
          )
        )
      `)
      .order("service_date", { ascending: false })

    if (nftManagementId) {
      query = query.eq("nft_management_id", nftManagementId)
    }

    const { data: services, error } = await query

    if (error) throw error

    return NextResponse.json({ services })
  } catch (error: any) {
    console.error("[v0] Error fetching management services:", error)
    return NextResponse.json({ error: error.message || "Error al obtener servicios" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { nft_management_id, service_type, service_date, service_provider, cost_usdc, notes } = body

    const { data: service, error } = await supabase
      .from("management_services")
      .insert({
        nft_management_id,
        service_type,
        service_date,
        service_provider,
        cost_usdc,
        notes,
        status: "scheduled",
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ service })
  } catch (error: any) {
    console.error("[v0] Error creating service:", error)
    return NextResponse.json({ error: error.message || "Error al crear servicio" }, { status: 500 })
  }
}
