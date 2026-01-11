import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { isProductAvailable, getProductById, getProductBySpec } from "@/lib/capacity-engine/pax-products"

export const dynamic = "force-dynamic"

function getStripe() {
  const Stripe = require("stripe").default
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-11-20.acacia",
  })
}

export async function POST(req: Request) {
  try {
    const stripe = getStripe()

    const supabase = await createClient()
    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError || !userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    let product

    if (body.productId) {
      // Direct product ID
      product = await getProductById(body.productId)
    } else if (body.maxPax && body.estancias) {
      // PAX-based selection
      product = await getProductBySpec(body.maxPax, body.estancias)
    } else {
      return NextResponse.json(
        {
          error: "Missing required fields: either productId or maxPax+estancias required",
        },
        { status: 400 },
      )
    }

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const { successUrl, cancelUrl } = body

    console.log(`[v0] Checking availability for product: ${product.display_name}`)

    const availability = await isProductAvailable(product.id)

    if (!availability.available) {
      console.log(`[v0] BLOCKED: ${product.display_name} - ${availability.reason}`)
      return NextResponse.json(
        {
          error: "CAPACITY_BLOCKED",
          message: availability.reason || "Este certificado no está disponible actualmente.",
          waitlistEnabled: availability.waitlistEnabled,
          productId: product.id,
          maxPax: product.max_pax,
          estancias: product.max_estancias_per_year,
        },
        { status: 403 },
      )
    }

    console.log(
      `[v0] Availability check passed. Remaining: ${availability.remainingForProduct} for product, ${availability.remainingTotal} total`,
    )

    const { data: profile } = await supabase
      .from("users")
      .select("email, full_name")
      .eq("id", userData.user.id)
      .single()

    const session = await stripe.checkout.sessions.create({
      customer_email: profile?.email || userData.user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Certificado Digital WEEK-CHAIN`,
              description: `Hasta ${product.max_pax} personas • ${product.max_estancias_per_year} estancia${product.max_estancias_per_year > 1 ? "s" : ""} por año • 15 años de vigencia • Sujeto a disponibilidad`,
            },
            unit_amount: product.price_usd * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/user/certificate?success=true`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/user/certificate?canceled=true`,
      metadata: {
        user_id: userData.user.id,
        user_email: profile?.email || userData.user.email,
        product_id: product.id,
        max_pax: product.max_pax.toString(),
        max_estancias: product.max_estancias_per_year.toString(),
        price_usd: product.price_usd.toString(),
        capacity_check: "passed",
      },
    })

    console.log(`[v0] Checkout session created: ${session.id}`)

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
      product: {
        id: product.id,
        maxPax: product.max_pax,
        estancias: product.max_estancias_per_year,
        priceUsd: product.price_usd,
      },
    })
  } catch (error: any) {
    console.error("[v0] Error creating checkout:", error)
    return NextResponse.json({ error: error.message || "Failed to create checkout" }, { status: 500 })
  }
}
