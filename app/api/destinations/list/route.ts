import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const region = searchParams.get("region") // Filter by MEXICO, USA, CANADA, BRAZIL, EUROPE
    const status = searchParams.get("status") || "available"

    const supabase = await createClient()

    let query = supabase
      .from("properties")
      .select("*")
      .in("status", ["available", "coming_soon"])
      .order("location_group", { ascending: true })
      .order("name", { ascending: true })

    if (region) {
      query = query.eq("location_group", region)
    }

    const { data: properties, error } = await query

    if (error) {
      console.error("[v0] Error fetching destinations:", error)
      return NextResponse.json({ error: "Failed to fetch destinations" }, { status: 500 })
    }

    // Group properties by region
    const groupedDestinations = properties?.reduce(
      (acc, property) => {
        const region = property.location_group || "OTHER"
        if (!acc[region]) {
          acc[region] = []
        }
        acc[region].push({
          id: property.id,
          name: property.name,
          location: property.location,
          region: property.location_group,
          description: property.description,
          imageUrl: property.image_url,
          status: property.status,
          totalWeeks: property.total_weeks,
          weeksSold: property.weeks_sold,
          occupancyPercentage: property.total_weeks
            ? Math.round((property.weeks_sold / property.total_weeks) * 100 * 100) / 100
            : 0,
          acceptingRequests: property.status === "available",
        })
        return acc
      },
      {} as Record<string, any[]>,
    )

    return NextResponse.json({
      success: true,
      destinations: groupedDestinations,
      total: properties?.length || 0,
      disclaimer:
        "Todos los destinos están sujetos a disponibilidad mediante el proceso REQUEST → OFFER → CONFIRM. Los certificados NO constituyen propiedad ni inversión.",
    })
  } catch (error) {
    console.error("[v0] Destinations API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
