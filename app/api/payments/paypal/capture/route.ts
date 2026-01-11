import { type NextRequest, NextResponse } from "next/server"
import { capturePayPalOrder } from "@/lib/paypal/client"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const success = searchParams.get("success")
  const token = searchParams.get("token") // PayPal order ID
  const payerId = searchParams.get("PayerID")

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://week-chain.vercel.app"

  console.log("[v0] PayPal capture callback:", { success, token, payerId })

  if (success === "false" || !token) {
    // User cancelled or error
    return NextResponse.redirect(`${baseUrl}/properties/aflora-tulum/reservar?payment=cancelled`)
  }

  try {
    // Capture the payment
    const captureResult = await capturePayPalOrder(token)

    if (captureResult.status === "COMPLETED") {
      // Update database
      const supabase = await createClient()

      await supabase
        .from("escrow_deposits")
        .update({
          status: "confirmed",
          confirmed_at: new Date().toISOString(),
          tx_hash: captureResult.purchase_units?.[0]?.payments?.captures?.[0]?.id,
        })
        .eq("payment_reference", token)

      console.log("[v0] PayPal payment captured successfully:", token)

      // Redirect to success page
      return NextResponse.redirect(
        `${baseUrl}/properties/aflora-tulum/reservar?payment=success&method=paypal&order=${token}`,
      )
    } else {
      console.error("[v0] PayPal capture failed:", captureResult.status)
      return NextResponse.redirect(`${baseUrl}/properties/aflora-tulum/reservar?payment=failed`)
    }
  } catch (error: any) {
    console.error("[v0] PayPal capture error:", error)
    return NextResponse.redirect(`${baseUrl}/properties/aflora-tulum/reservar?payment=error`)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { order_id } = body

    if (!order_id) {
      return NextResponse.json({ success: false, error: "Order ID requerido" }, { status: 400 })
    }

    console.log("[v0] PayPal capture POST request:", order_id)

    const captureResult = await capturePayPalOrder(order_id)

    if (captureResult.status === "COMPLETED") {
      const supabase = await createClient()

      await supabase
        .from("escrow_deposits")
        .update({
          status: "confirmed",
          confirmed_at: new Date().toISOString(),
          tx_hash: captureResult.purchase_units?.[0]?.payments?.captures?.[0]?.id,
        })
        .eq("payment_reference", order_id)

      return NextResponse.json({
        success: true,
        status: "COMPLETED",
        capture_id: captureResult.purchase_units?.[0]?.payments?.captures?.[0]?.id,
      })
    }

    return NextResponse.json({
      success: false,
      status: captureResult.status,
      error: "El pago no se pudo completar",
    })
  } catch (error: any) {
    console.error("[v0] PayPal capture POST error:", error)
    return NextResponse.json({ success: false, error: error.message || "Error al capturar pago" }, { status: 500 })
  }
}
