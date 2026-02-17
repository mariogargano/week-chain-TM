import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: destinations, error } = await supabase
      .from("public_destinations_catalog")
      .select("*")
      .order("location_group", { ascending: true })
      .order("name", { ascending: true })

    if (error) {
      console.error("[v0] Error fetching destinations catalog:", error)

      // If table doesn't exist, return mock data instead of error
      if (error.code === "42P01") {
        console.warn("[v0] Table public_destinations_catalog doesn't exist yet. Returning mock data.")
        return NextResponse.json({
          destinations: getMockDestinations(),
          total_count: 6,
          timestamp: new Date().toISOString(),
          disclaimer: "Datos demo. Ejecute el script SQL 200_EXECUTE_THIS_FIRST.sql para crear las tablas reales.",
        })
      }

      return NextResponse.json({ error: "Failed to fetch destinations" }, { status: 500 })
    }

    return NextResponse.json({
      destinations: destinations || [],
      total_count: destinations?.length || 0,
      timestamp: new Date().toISOString(),
      disclaimer:
        "Todas las solicitudes están sujetas a disponibilidad mediante flujo REQUEST → OFFER → CONFIRM. No constituyen reservas garantizadas.",
    })
  } catch (err) {
    console.error("[v0] Unexpected error in destinations catalog:", err)
    return NextResponse.json(
      {
        destinations: getMockDestinations(),
        total_count: 6,
        timestamp: new Date().toISOString(),
        disclaimer: "Datos demo. Error al conectar con la base de datos.",
      },
      { status: 200 },
    )
  }
}

function getMockDestinations() {
  return [
    {
      id: "1",
      name: "Playa del Carmen Resort",
      location: "Playa del Carmen, Quintana Roo",
      location_group: "México - Caribe",
      description: "Resort todo incluido en la Riviera Maya",
      image_url: "/playa-del-carmen.jpg",
      base_price_usd: 1200,
      availability_percentage: 85,
      legal_disclaimer: "Destino de referencia sujeto a disponibilidad",
      is_active: true,
    },
    {
      id: "2",
      name: "Tulum Beach Club",
      location: "Tulum, Quintana Roo",
      location_group: "México - Caribe",
      description: "Club de playa exclusivo",
      image_url: "/tulum-beach.jpg",
      base_price_usd: 1500,
      availability_percentage: 70,
      legal_disclaimer: "Destino de referencia sujeto a disponibilidad",
      is_active: true,
    },
    {
      id: "3",
      name: "Cancún Paradise",
      location: "Cancún, Quintana Roo",
      location_group: "México - Caribe",
      description: "Hotel zona hotelera",
      image_url: "/cancun-paradise.jpg",
      base_price_usd: 1100,
      availability_percentage: 90,
      legal_disclaimer: "Destino de referencia sujeto a disponibilidad",
      is_active: true,
    },
    {
      id: "4",
      name: "Puerto Vallarta Marina",
      location: "Puerto Vallarta, Jalisco",
      location_group: "México - Pacífico",
      description: "Resort frente al mar",
      image_url: "/puerto-vallarta-beach.png",
      base_price_usd: 1300,
      availability_percentage: 75,
      legal_disclaimer: "Destino de referencia sujeto a disponibilidad",
      is_active: true,
    },
    {
      id: "5",
      name: "Los Cabos Golf Resort",
      location: "Los Cabos, Baja California Sur",
      location_group: "México - Pacífico",
      description: "Campo de golf profesional",
      image_url: "/los-cabos-golf.jpg",
      base_price_usd: 1600,
      availability_percentage: 65,
      legal_disclaimer: "Destino de referencia sujeto a disponibilidad",
      is_active: true,
    },
    {
      id: "6",
      name: "Mérida Colonial",
      location: "Mérida, Yucatán",
      location_group: "México - Cultural",
      description: "Hotel boutique histórico",
      image_url: "/merida-colonial.jpg",
      base_price_usd: 900,
      availability_percentage: 95,
      legal_disclaimer: "Destino de referencia sujeto a disponibilidad",
      is_active: true,
    },
  ]
}
