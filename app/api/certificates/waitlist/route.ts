import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getProductById, getProductBySpec } from "@/lib/capacity-engine/pax-products"

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError || !userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { productId, maxPax, estancias, email, fullName } = body

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    let product
    if (productId) {
      product = await getProductById(productId)
    } else if (maxPax && estancias) {
      product = await getProductBySpec(maxPax, estancias)
    }

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    console.log(`[v0] Adding ${email} to waitlist for ${product.display_name}`)

    // Check if already on waitlist for this product
    const { data: existing } = await supabase
      .from("certificate_waitlist_v2")
      .select("id")
      .eq("email", email)
      .eq("product_id", product.id)
      .eq("status", "waiting")
      .single()

    if (existing) {
      return NextResponse.json({
        success: true,
        message: "Ya estás en la lista de espera para este certificado",
        alreadyExists: true,
      })
    }

    const { data: waitlistEntry, error: waitlistError } = await supabase
      .from("certificate_waitlist_v2")
      .insert({
        user_id: userData.user.id,
        product_id: product.id,
        max_pax: product.max_pax,
        max_estancias_per_year: product.max_estancias_per_year,
        email,
        full_name: fullName,
        status: "waiting",
      })
      .select()
      .single()

    if (waitlistError) {
      console.error("[v0] Error adding to waitlist:", waitlistError)
      return NextResponse.json({ error: "Failed to add to waitlist" }, { status: 500 })
    }

    console.log(`[v0] Successfully added to waitlist: ${waitlistEntry.id}`)

    return NextResponse.json({
      success: true,
      message: "Te hemos agregado a la lista de espera. Te notificaremos cuando haya disponibilidad.",
      waitlistId: waitlistEntry.id,
      product: {
        maxPax: product.max_pax,
        estancias: product.max_estancias_per_year,
        priceUsd: product.price_usd,
      },
    })
  } catch (error: any) {
    console.error("[v0] Error processing waitlist:", error)
    return NextResponse.json({ error: error.message || "Failed to process waitlist" }, { status: 500 })
  }
}
