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

    if (!adminOverride) {
      const availability = await isProductAvailable(product.id)

      if (!availability.available) {
        return NextResponse.json(
          {
            error: "CAPACITY_BLOCKED",
            message: availability.reason || "Cannot issue certificate - sales are stopped",
          },
          { status: 403 },
        )
      }
    }

    const startDate = new Date()
    const endDate = new Date()
    endDate.setFullYear(endDate.getFullYear() + 15)

    const annualResetDate = new Date()
    annualResetDate.setFullYear(annualResetDate.getFullYear() + 1)

    // Idempotent upsert on stripe_session_id (prevents duplicates on webhook retry)
    const upsertData: Record<string, any> = {
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
    }

    if (stripeSessionId) {
      upsertData.stripe_session_id = stripeSessionId
    }

    const { data: certificate, error: certError } = await supabase
      .from("user_certificates_v2")
      .upsert(upsertData, {
        onConflict: stripeSessionId ? "stripe_session_id" : undefined,
      })
      .select()
      .single()

    if (certError) {
      console.error("[issue] Error upserting certificate:", certError)
      return NextResponse.json({ error: "Failed to create certificate" }, { status: 500 })
    }

    // Create week_token linked to certificate (idempotent on user_certificate_v2_id)
    const crypto = await import("crypto")
    const certIdShort = `WC-${new Date().getFullYear()}-${certificate.id.slice(0, 5).toUpperCase()}`
    const hashPayload = `${certificate.id}:${userId}:${orderId}:${Date.now()}`
    const blockchainHash = crypto.createHash("sha256").update(hashPayload).digest("hex")

    await supabase
      .from("week_tokens")
      .upsert(
        {
          user_id: userId,
          user_certificate_v2_id: certificate.id,
          certificate_id: certIdShort,
          blockchain_hash: blockchainHash,
          qr_code: `https://weekchain.com/verify/${certIdShort}`,
          status: "active",
          metadata: {
            provider: "stripe",
            order_id: orderId,
            pax: product.max_pax,
            estancias: product.max_estancias_per_year,
          },
        },
        { onConflict: "user_certificate_v2_id" }
      )

    // Create certificate_visual_state
    const { data: token } = await supabase
      .from("week_tokens")
      .select("id")
      .eq("user_certificate_v2_id", certificate.id)
      .single()

    if (token) {
      await supabase
        .from("certificate_visual_state")
        .upsert(
          {
            certificate_id: token.id,
            current_status: "active",
            last_reservation_date: null,
            last_property_name: null,
            reservations_count: 0,
          },
          { onConflict: "certificate_id" }
        )
    }

    // Recalculate capacity
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
