import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { isProductAvailable, getProductById } from "@/lib/capacity-engine/pax-products"
import { runCapacityEngineCalculation } from "@/lib/capacity-engine/engine"

export async function POST(req: Request) {
  try {
    const supabase = await createClient()

    // Only allow service role or admin to call this endpoint
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { userId, productId, maxPax, estancias, orderId, stripeSessionId, adminOverride = false } = body

    if (!userId || !orderId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    let product
    if (productId) {
      product = await getProductById(productId)
    } else if (maxPax && estancias) {
      const { getProductBySpec } = await import("@/lib/capacity-engine/pax-products")
      product = await getProductBySpec(maxPax, estancias)
    }

    if (!product) {
      return NextResponse.json({ error: "Certificate product not found" }, { status: 404 })
    }

    console.log(`[v0] Issuing certificate: ${product.display_name} for user ${userId}`)

    if (!adminOverride) {
      const availability = await isProductAvailable(product.id)

      if (!availability.available) {
        console.log(`[v0] BLOCKED: Cannot issue ${product.display_name} - ${availability.reason}`)
        return NextResponse.json(
          {
            error: "CAPACITY_BLOCKED",
            message: availability.reason || "Cannot issue certificate - sales are stopped",
          },
          { status: 403 },
        )
      }
    } else {
      console.log(`[v0] Admin override - skipping capacity check`)
    }

    const startDate = new Date()
    const endDate = new Date()
    endDate.setFullYear(endDate.getFullYear() + 15)

    const annualResetDate = new Date()
    annualResetDate.setFullYear(annualResetDate.getFullYear() + 1)

    const { data: certificate, error: certError } = await supabase
      .from("user_certificates_v2")
      .insert({
        user_id: userId,
        product_id: product.id,
        max_pax: product.max_pax,
        max_estancias_per_year: product.max_estancias_per_year,
        purchase_price_usd: product.price_usd,
        start_date: startDate.toISOString().split("T")[0],
        end_date: endDate.toISOString().split("T")[0],
        annual_entitlement_estancias: product.max_estancias_per_year,
        annual_used_estancias: 0,
        annual_reset_at: annualResetDate.toISOString().split("T")[0],
        status: "active",
        order_id: orderId,
        stripe_session_id: stripeSessionId,
      })
      .select()
      .single()

    if (certError) {
      console.error("[v0] Error creating certificate:", certError)
      return NextResponse.json({ error: "Failed to create certificate" }, { status: 500 })
    }

    console.log(`[v0] Certificate issued successfully: ${certificate.id}`)

    // Recalculate capacity
    console.log(`[v0] Recalculating capacity engine...`)
    await runCapacityEngineCalculation()

    return NextResponse.json({
      success: true,
      certificate: {
        id: certificate.id,
        maxPax: certificate.max_pax,
        estanciasPerYear: certificate.max_estancias_per_year,
        validUntil: certificate.end_date,
        displayName: `Hasta ${certificate.max_pax} personas • ${certificate.max_estancias_per_year} estancias/año`,
      },
    })
  } catch (error: any) {
    console.error("[v0] Error issuing certificate:", error)
    return NextResponse.json({ error: error.message || "Failed to issue certificate" }, { status: 500 })
  }
}
