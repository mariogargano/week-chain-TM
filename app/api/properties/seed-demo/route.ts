import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Demo properties data
    const demoProperties = [
      {
        name: "Aflora Tulum",
        location: "Tulum, Quintana Roo",
        description: "Exclusivo desarrollo sustentable en el corazón de Tulum con acceso a playa privada",
        valor_total_usd: 210000,
        price: 4038,
        image_url: "/luxury-beach-resort-tulum.jpg",
        status: "active",
        presale_target: 52,
        presale_sold: 0,
        presale_progress: 0,
        property_duration_years: 10,
      },
      {
        name: "Villa Paraíso Cancún",
        location: "Cancún, Quintana Roo",
        description: "Villa de lujo frente al mar Caribe con amenidades de clase mundial",
        valor_total_usd: 185000,
        price: 3558,
        image_url: "/luxury-villa-cancun-beach.jpg",
        status: "active",
        presale_target: 52,
        presale_sold: 0,
        presale_progress: 0,
        property_duration_years: 10,
      },
      {
        name: "Penthouse Polanco",
        location: "Polanco, CDMX",
        description: "Penthouse de lujo en el corazón de Polanco con vistas panorámicas",
        valor_total_usd: 175000,
        price: 3365,
        image_url: "/luxury-penthouse-mexico-city.jpg",
        status: "active",
        presale_target: 52,
        presale_sold: 0,
        presale_progress: 0,
        property_duration_years: 10,
      },
      {
        name: "Casa Colonial San Miguel",
        location: "San Miguel de Allende, Guanajuato",
        description: "Hermosa casa colonial restaurada en el centro histórico",
        valor_total_usd: 145000,
        price: 2788,
        image_url: "/colonial-house-san-miguel-allende.jpg",
        status: "active",
        presale_target: 52,
        presale_sold: 0,
        presale_progress: 0,
        property_duration_years: 10,
      },
      {
        name: "Cabaña Valle de Bravo",
        location: "Valle de Bravo, Estado de México",
        description: "Cabaña de montaña con vista al lago y bosque privado",
        valor_total_usd: 120000,
        price: 2308,
        image_url: "/mountain-cabin-lake-view-mexico.jpg",
        status: "active",
        presale_target: 52,
        presale_sold: 0,
        presale_progress: 0,
        property_duration_years: 10,
      },
      {
        name: "Loft Condesa",
        location: "Condesa, CDMX",
        description: "Loft moderno en el barrio más trendy de la Ciudad de México",
        valor_total_usd: 95000,
        price: 1827,
        image_url: "/modern-loft-condesa-mexico.jpg",
        status: "active",
        presale_target: 52,
        presale_sold: 0,
        presale_progress: 0,
        property_duration_years: 10,
      },
      {
        name: "Casa Playa del Carmen",
        location: "Playa del Carmen, Quintana Roo",
        description: "Casa moderna a pasos de la famosa Quinta Avenida",
        valor_total_usd: 165000,
        price: 3173,
        image_url: "/modern-house-playa-del-carmen.jpg",
        status: "active",
        presale_target: 52,
        presale_sold: 0,
        presale_progress: 0,
        property_duration_years: 10,
      },
      {
        name: "Residencia Los Cabos",
        location: "Los Cabos, Baja California Sur",
        description: "Residencia de lujo con vista al mar de Cortés y campo de golf",
        valor_total_usd: 195000,
        price: 3750,
        image_url: "/luxury-residence-los-cabos-ocean.jpg",
        status: "active",
        presale_target: 52,
        presale_sold: 0,
        presale_progress: 0,
        property_duration_years: 10,
      },
    ]

    // Insert properties
    const { data: insertedProperties, error: propertiesError } = await supabase
      .from("properties")
      .insert(demoProperties)
      .select()

    if (propertiesError) {
      console.error("Error inserting properties:", propertiesError)
      return NextResponse.json({ error: propertiesError.message }, { status: 500 })
    }

    // Create 52 weeks for each property
    const weeksData = []
    for (const property of insertedProperties) {
      for (let weekNum = 1; weekNum <= 52; weekNum++) {
        // Determine season based on week number
        let season = "baja"
        if ([1, 2, 51, 52].includes(weekNum)) {
          season = "pico" // New Year and Christmas
        } else if (weekNum >= 12 && weekNum <= 16) {
          season = "alta" // Spring break
        } else if (weekNum >= 24 && weekNum <= 32) {
          season = "alta" // Summer
        } else if (weekNum >= 48 && weekNum <= 50) {
          season = "media" // Pre-Christmas
        }

        // Calculate price based on season
        let seasonMultiplier = 1.0
        if (season === "pico") seasonMultiplier = 1.5
        else if (season === "alta") seasonMultiplier = 1.3
        else if (season === "media") seasonMultiplier = 1.1

        const weekPrice = Math.round(property.price * seasonMultiplier)

        weeksData.push({
          property_id: property.id,
          week_number: weekNum,
          season,
          price: weekPrice,
          status: "available",
          nft_minted: false,
          rental_enabled: false,
        })
      }
    }

    const { error: weeksError } = await supabase.from("weeks").insert(weeksData)

    if (weeksError) {
      console.error("Error inserting weeks:", weeksError)
      return NextResponse.json({ error: weeksError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Successfully created ${insertedProperties.length} properties with ${weeksData.length} weeks`,
    })
  } catch (error: any) {
    console.error("Error seeding demo properties:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
