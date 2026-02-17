import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { isDemoMode } from "@/lib/config/environment"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    console.log("[v0] Attempting to get user...")
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    console.log("[v0] User:", user ? { id: user.id, email: user.email } : null)
    console.log("[v0] Auth error:", authError)

    if (isDemoMode()) {
      console.log("[v0] Demo mode active - relaxing authentication requirements")

      if (!user) {
        console.log("[v0] No user found in demo mode, using demo user")
        // In demo mode, if no user is authenticated, use a demo user ID
        const demoUserId = "00000000-0000-0000-0000-000000000000"

        const propertyData = await request.json()
        console.log("[v0] Creating property with data:", propertyData)

        const { data: property, error: propertyError } = await supabase
          .from("properties")
          .insert({
            name: propertyData.name,
            location: propertyData.location,
            description: propertyData.description,
            image_url: propertyData.image_url || null,
            valor_total_usd: propertyData.valor_total_usd,
            price: propertyData.valor_total_usd / 52,
            recaudado_actual: 0,
            weeks_target: 52,
            weeks_sold: 0,
            status: "active",
            property_type: propertyData.property_type || "vacation_home",
            bedrooms: propertyData.bedrooms || null,
            bathrooms: propertyData.bathrooms || null,
            square_meters: propertyData.square_meters || null,
            amenities: propertyData.amenities || [],
            owner_id: demoUserId,
          })
          .select()
          .single()

        if (propertyError) {
          console.error("[v0] Error creating property:", propertyError)
          throw propertyError
        }

        console.log("[v0] Property created in demo mode:", property)

        // Create weeks
        const seasonalPricing = propertyData.seasonal_pricing || []
        const basePricePerWeek = propertyData.valor_total_usd / 52

        const weekMultipliers: Record<number, number> = {}
        seasonalPricing.forEach((season: any) => {
          season.weeks.forEach((weekNum: number) => {
            weekMultipliers[weekNum] = season.multiplier
          })
        })

        const weeks = Array.from({ length: 52 }, (_, i) => {
          const weekNumber = i + 1
          const multiplier = weekMultipliers[weekNumber] || 1.0
          const price = basePricePerWeek * multiplier

          let season = "mid"
          if (multiplier >= 2.0) season = "ultra-high"
          else if (multiplier >= 1.5) season = "high"
          else if (multiplier <= 0.7) season = "low"

          return {
            property_id: property.id,
            week_number: weekNumber,
            price: price,
            status: "available",
            season: season,
            year: new Date().getFullYear(),
          }
        })

        const { error: weeksError } = await supabase.from("weeks").insert(weeks)

        if (weeksError) {
          console.error("[v0] Error creating weeks:", weeksError)
          await supabase.from("properties").delete().eq("id", property.id)
          throw weeksError
        }

        console.log("[v0] Created 52 weeks for property in demo mode")

        return NextResponse.json({
          success: true,
          data: property,
          message: "Propiedad creada exitosamente en modo demo con 52 semanas tokenizadas",
        })
      }
    }

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado. Debes iniciar sesión." }, { status: 401 })
    }

    const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (!profile || profile.role !== "admin") {
      return NextResponse.json(
        { error: "No autorizado. Solo los administradores pueden crear propiedades." },
        { status: 403 },
      )
    }

    const propertyData = await request.json()

    console.log("[v0] Creating property with data:", propertyData)

    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .insert({
        name: propertyData.name,
        location: propertyData.location,
        description: propertyData.description,
        image_url: propertyData.image_url || null,
        valor_total_usd: propertyData.valor_total_usd,
        price: propertyData.valor_total_usd / 52,
        recaudado_actual: 0,
        weeks_target: 52,
        weeks_sold: 0,
        status: "active",
        property_type: propertyData.property_type || "vacation_home",
        bedrooms: propertyData.bedrooms || null,
        bathrooms: propertyData.bathrooms || null,
        square_meters: propertyData.square_meters || null,
        amenities: propertyData.amenities || [],
        owner_id: user.id,
      })
      .select()
      .single()

    if (propertyError) {
      console.error("[v0] Error creating property:", propertyError)
      throw propertyError
    }

    console.log("[v0] Property created:", property)

    const seasonalPricing = propertyData.seasonal_pricing || []
    const basePricePerWeek = propertyData.valor_total_usd / 52

    const weekMultipliers: Record<number, number> = {}
    seasonalPricing.forEach((season: any) => {
      season.weeks.forEach((weekNum: number) => {
        weekMultipliers[weekNum] = season.multiplier
      })
    })

    const weeks = Array.from({ length: 52 }, (_, i) => {
      const weekNumber = i + 1
      const multiplier = weekMultipliers[weekNumber] || 1.0
      const price = basePricePerWeek * multiplier

      let season = "mid"
      if (multiplier >= 2.0) season = "ultra-high"
      else if (multiplier >= 1.5) season = "high"
      else if (multiplier <= 0.7) season = "low"

      return {
        property_id: property.id,
        week_number: weekNumber,
        price: price,
        status: "available",
        season: season,
        year: new Date().getFullYear(),
      }
    })

    const { error: weeksError } = await supabase.from("weeks").insert(weeks)

    if (weeksError) {
      console.error("[v0] Error creating weeks:", weeksError)
      await supabase.from("properties").delete().eq("id", property.id)
      throw weeksError
    }

    console.log("[v0] Created 52 weeks for property")

    return NextResponse.json({
      success: true,
      data: property,
      message: "Propiedad creada exitosamente con 52 semanas tokenizadas",
    })
  } catch (error: any) {
    console.error("[v0] Error in property creation:", error)
    return NextResponse.json({ error: error.message || "Error al crear la propiedad" }, { status: 500 })
  }
}
