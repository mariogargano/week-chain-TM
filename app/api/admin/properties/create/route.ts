import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/config/environment";

// Modelo de negocio WEEK-CHAIN:
// - 52 semanas por propiedad al año
// - 48 semanas vendibles como SVC
// - 4 semanas reservadas (mantenimiento/empresa)
// - Precio UNIFORME por semana (sin temporadas)

const TOTAL_WEEKS = 52
const SELLABLE_WEEKS = 48
const RESERVED_WEEKS = 4

// Las semanas reservadas son: 1 (Año Nuevo), 26 (mitad de año), 52 (Navidad), y una de mantenimiento
const RESERVED_WEEK_NUMBERS = [1, 26, 51, 52]

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    // Get property data from request
    const propertyData = await request.json()

    // Validate required fields
    if (!propertyData.name || !propertyData.location || !propertyData.valor_total_usd) {
      return NextResponse.json(
        { error: "Faltan campos requeridos: nombre, ubicacion y valor total" },
        { status: 400 }
      )
    }

    // Calculate uniform price per week (based on 48 sellable weeks)
    const pricePerWeek = propertyData.valor_total_usd / SELLABLE_WEEKS

    let ownerId = user?.id

    // Demo mode handling
    if (isDemoMode() && !user) {
      ownerId = "00000000-0000-0000-0000-000000000000"
    } else if (!user) {
      return NextResponse.json({ error: "No autorizado. Debes iniciar sesion." }, { status: 401 })
    } else {
      // Verify admin role in production
      const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single()
      if (!profile || profile.role !== "admin") {
        return NextResponse.json(
          { error: "No autorizado. Solo los administradores pueden crear propiedades." },
          { status: 403 }
        )
      }
    }

    // Create property
    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .insert({
        name: propertyData.name,
        location: propertyData.location,
        description: propertyData.description || null,
        image_url: propertyData.image_url || null,
        valor_total_usd: propertyData.valor_total_usd,
        price: pricePerWeek, // Precio uniforme por semana
        recaudado_actual: 0,
        weeks_target: SELLABLE_WEEKS, // 48 semanas vendibles
        weeks_sold: 0,
        status: "active",
        property_type: propertyData.property_type || "villa",
        bedrooms: propertyData.bedrooms || null,
        bathrooms: propertyData.bathrooms || null,
        max_pax: propertyData.max_pax || 6,
        square_meters: propertyData.square_meters || null,
        amenities: propertyData.amenities || [],
        owner_id: ownerId,
        // Metadata del modelo de capacidad
        pricing_strategy: "uniform", // Sin temporadas
        total_weeks: TOTAL_WEEKS,
        sellable_weeks: SELLABLE_WEEKS,
        reserved_weeks: RESERVED_WEEKS,
      })
      .select()
      .single()

    if (propertyError) {
      console.error("[v0] Error creating property:", propertyError)
      throw propertyError
    }

    // Create 52 weeks with uniform pricing
    const currentYear = new Date().getFullYear()
    const weeks = Array.from({ length: TOTAL_WEEKS }, (_, i) => {
      const weekNumber = i + 1
      const isReserved = RESERVED_WEEK_NUMBERS.includes(weekNumber)

      return {
        property_id: property.id,
        week_number: weekNumber,
        price: pricePerWeek, // Precio uniforme para todas las semanas
        status: isReserved ? "reserved" : "available", // 4 reservadas, 48 disponibles
        season: null, // SIN temporadas en el modelo WEEK-CHAIN
        year: currentYear,
        is_sellable: !isReserved,
        reserved_reason: isReserved ? "maintenance_company" : null,
      }
    })

    const { error: weeksError } = await supabase.from("weeks").insert(weeks)

    if (weeksError) {
      console.error("[v0] Error creating weeks:", weeksError)
      // Rollback: delete property if weeks creation failed
      await supabase.from("properties").delete().eq("id", property.id)
      throw weeksError
    }

    return NextResponse.json({
      success: true,
      data: {
        ...property,
        weeks_created: {
          total: TOTAL_WEEKS,
          sellable: SELLABLE_WEEKS,
          reserved: RESERVED_WEEKS,
          price_per_week: pricePerWeek,
        },
      },
      message: `Propiedad creada exitosamente con ${SELLABLE_WEEKS} semanas SVC vendibles y ${RESERVED_WEEKS} semanas reservadas`,
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Error al crear la propiedad"
    console.error("[v0] Error in property creation:", error)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
