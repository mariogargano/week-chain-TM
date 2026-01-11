import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { initiateCertificatePurchase } from "@/lib/flows/certificate-purchase-flow"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const {
      certificateType,
      amountUsd,
      amountMxn,
      currency,
      exchangeRate,
      paymentMethod,
      termsAcceptanceId,
      privacyAcceptanceId,
    } = body

    // Validate required fields
    if (!certificateType || !amountUsd || !currency || !paymentMethod || !termsAcceptanceId || !privacyAcceptanceId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get IP and user agent for click-wrap proof
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    // Initiate purchase
    const purchase = await initiateCertificatePurchase({
      userId: user.id,
      certificateType,
      amountUsd,
      amountMxn,
      currency,
      exchangeRate,
      paymentMethod,
      termsAcceptanceId,
      privacyAcceptanceId,
      clickwrapData: {
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
        acceptedTermsVersion: "1.0",
        acceptedPrivacyVersion: "1.0",
      },
    })

    return NextResponse.json({
      success: true,
      purchaseId: purchase.id,
      certificateNumber: purchase.certificate_number,
      certificateCode: purchase.certificate_code,
    })
  } catch (error) {
    console.error("[v0] Certificate purchase error:", error)
    return NextResponse.json({ error: "Failed to initiate purchase" }, { status: 500 })
  }
}
