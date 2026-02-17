import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { logger } from "@/lib/config/logger"

export async function POST() {
  try {
    const supabase = await createServerClient()

    const demoPropertyId = "11111111-1111-1111-1111-111111111111"

    const { data: existingProperty } = await supabase
      .from("properties")
      .select("id")
      .eq("id", demoPropertyId)
      .maybeSingle()

    if (existingProperty) {
      logger.info("Demo property already exists")
      return NextResponse.json({
        success: true,
        message: "Demo data already exists",
        propertyId: demoPropertyId,
      })
    }

    logger.info("Creating demo property and weeks...")

    const { error: propertyError } = await supabase.from("properties").insert({
      id: demoPropertyId,
      name: "Villa Paraíso Cancún (DEMO)",
      description:
        "Propiedad de demostración para inversionistas. Ubicada en la zona hotelera de Cancún con vista al mar Caribe.",
      location: "Cancún, Quintana Roo, México",
      image_url: "/luxury-beach-villa-cancun.jpg",
      price: 50000,
      valor_total_usd: 2600000,
      status: "active",
      presale_target: 48,
      presale_sold: 12,
      presale_deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      property_duration_years: 10,
      total_escrow_usdc: 600000,
      exit_status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (propertyError) {
      logger.error("Error creating demo property", { error: propertyError })
      throw propertyError
    }

    const weeks = []
    const seasonMultipliers = {
      "Ultra Alta": 2.0, // Weeks 51-52, 1-2 (Christmas/New Year)
      Alta: 1.5, // Weeks 3-16 (Winter/Spring)
      Media: 1.0, // Weeks 17-24, 41-50 (Spring/Fall)
      Baja: 0.7, // Weeks 25-40 (Summer)
    }

    const basePrice = 50000

    for (let weekNum = 1; weekNum <= 52; weekNum++) {
      let season = "Media"
      let multiplier = 1.0

      if ([51, 52, 1, 2].includes(weekNum)) {
        season = "Ultra Alta"
        multiplier = seasonMultipliers["Ultra Alta"]
      } else if (weekNum >= 3 && weekNum <= 16) {
        season = "Alta"
        multiplier = seasonMultipliers["Alta"]
      } else if (weekNum >= 25 && weekNum <= 40) {
        season = "Baja"
        multiplier = seasonMultipliers["Baja"]
      }

      const finalPrice = basePrice * multiplier

      // Calculate start and end dates for the week
      const startDate = new Date(2025, 0, 1 + (weekNum - 1) * 7)
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + 6)

      weeks.push({
        property_id: demoPropertyId,
        week_number: weekNum,
        season,
        price: finalPrice,
        status: weekNum <= 12 ? "sold" : "available",
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        nft_minted: false,
        rental_enabled: false,
        usage_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }

    const { error: weeksError } = await supabase.from("weeks").insert(weeks)

    if (weeksError) {
      logger.error("Error creating demo weeks", { error: weeksError })
      throw weeksError
    }

    logger.info("Demo data created successfully", {
      propertyId: demoPropertyId,
      weeksCreated: 52,
    })

    return NextResponse.json({
      success: true,
      message: "Demo data created successfully",
      propertyId: demoPropertyId,
      weeksCreated: 52,
    })
  } catch (error) {
    logger.error("Failed to seed demo data", { error })
    return NextResponse.json({ error: "Failed to seed demo data", details: error }, { status: 500 })
  }
}
