import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { userId, consentType, consentVersion, consentTextHash } = body

    if (!userId || !consentType || !consentVersion || !consentTextHash) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify userId matches authenticated user
    if (userId !== user.id) {
      return NextResponse.json({ error: "User ID mismatch" }, { status: 403 })
    }

    // Get IP and user agent for audit trail
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    const { data: consent, error: consentError } = await supabase
      .from("user_consents")
      .insert({
        user_id: userId,
        consent_type: consentType,
        consent_version: consentVersion,
        consent_text_hash: consentTextHash,
        ip_address: ipAddress,
        user_agent: userAgent,
        metadata: {
          timestamp: new Date().toISOString(),
          source: "web_application",
        },
      })
      .select()
      .single()

    if (consentError) {
      console.error("[v0] Failed to record consent:", consentError)
      return NextResponse.json({ error: "Failed to record consent" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      consentId: consent.id,
      message: "Consent recorded successfully",
    })
  } catch (error: any) {
    console.error("[v0] Consent record error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
