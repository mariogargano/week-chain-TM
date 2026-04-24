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
      // Si la tabla no existe aún, devolver array vacío en lugar de datos demo
      return NextResponse.json({
        destinations: [],
        total_count: 0,
        timestamp: new Date().toISOString(),
        disclaimer:
          "Todas las solicitudes están sujetas a disponibilidad mediante flujo REQUEST → OFFER → CONFIRM. No constituyen reservas garantizadas.",
      })
    }

    return NextResponse.json({
      destinations: destinations || [],
      total_count: destinations?.length || 0,
      timestamp: new Date().toISOString(),
      disclaimer:
        "Todas las solicitudes están sujetas a disponibilidad mediante flujo REQUEST → OFFER → CONFIRM. No constituyen reservas garantizadas.",
    })
  } catch {
    return NextResponse.json(
      {
        destinations: [],
        total_count: 0,
        timestamp: new Date().toISOString(),
        disclaimer:
          "Todas las solicitudes están sujetas a disponibilidad mediante flujo REQUEST → OFFER → CONFIRM. No constituyen reservas garantizadas.",
      },
      { status: 200 },
    )
  }
}
