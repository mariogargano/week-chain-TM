import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "6")
    const approved_only = searchParams.get("approved") !== "false"

    let query = supabase.from("testimonials").select("*").order("created_at", { ascending: false }).limit(limit)

    if (approved_only) {
      query = query.eq("is_approved", true)
    }

    const { data, error } = await query

    if (error) {
      console.error("[v0] Error fetching testimonials:", error)

      if (error.code === "42P01") {
        console.warn("[v0] Table testimonials doesn't exist yet. Returning mock data.")
        return NextResponse.json({
          testimonials: getMockTestimonials(),
          mock: true,
          message: "Ejecute el script SQL 200_EXECUTE_THIS_FIRST.sql para crear las tablas reales.",
        })
      }

      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ testimonials: data || [] })
  } catch (error) {
    console.error("[v0] Unexpected error in testimonials/list:", error)
    return NextResponse.json({
      testimonials: getMockTestimonials(),
      mock: true,
      message: "Error al conectar con la base de datos. Mostrando datos demo.",
    })
  }
}

function getMockTestimonials() {
  return [
    {
      id: "1",
      name: "María González",
      email: "maria@example.com",
      rating: 5,
      comment:
        "Excelente experiencia con WEEK-CHAIN. Pude vacacionar en Playa del Carmen con mi familia sin complicaciones. El sistema de certificados es muy claro y transparente.",
      destination: "Playa del Carmen",
      trip_date: "2024-07-15",
      is_approved: true,
      created_at: new Date("2024-07-20").toISOString(),
    },
    {
      id: "2",
      name: "Carlos Rodríguez",
      email: "carlos@example.com",
      rating: 5,
      comment:
        "La plataforma es muy intuitiva y el servicio de intermediación funcionó perfecto. Activé mi certificado y reservé mi semana en Tulum sin problemas.",
      destination: "Tulum",
      trip_date: "2024-08-20",
      is_approved: true,
      created_at: new Date("2024-08-25").toISOString(),
    },
    {
      id: "3",
      name: "Ana Martínez",
      email: "ana@example.com",
      rating: 4,
      comment:
        "Muy buena experiencia. El proceso de REQUEST → OFFER → CONFIRM es transparente y profesional. Recomiendo WEEK-CHAIN a cualquiera que busque vacaciones accesibles.",
      destination: "Cancún",
      trip_date: "2024-09-10",
      is_approved: true,
      created_at: new Date("2024-09-15").toISOString(),
    },
  ]
}
