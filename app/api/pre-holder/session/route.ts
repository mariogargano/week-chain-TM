import { type NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic"

function getStripe() {
  const Stripe = require("stripe").default
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-11-20.acacia",
  })
}

/**
 * GET /api/pre-holder/session?session_id=cs_xxx
 * Returns minimal non-sensitive metadata from a Stripe Checkout session
 * to populate the success page. Exposes only holder_number, name, email.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get("session_id")

  if (!sessionId || !sessionId.startsWith("cs_")) {
    return NextResponse.json({ error: "Invalid session_id" }, { status: 400 })
  }

  try {
    const stripe = getStripe()
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    // Only expose data from our own pre_holder flow
    if (session.metadata?.flow !== "pre_holder") {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    return NextResponse.json({
      holder_number: session.metadata?.holder_number || null,
      name: session.metadata?.name || null,
      email: session.metadata?.email || session.customer_email || null,
    })
  } catch (err: any) {
    console.error("[pre-holder/session] Error:", err.message)
    return NextResponse.json({ error: "Session not found" }, { status: 404 })
  }
}
