import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { validateConsent } from "@/lib/consent/validator"
import { logEvidenceEvent, extractRequestMetadata } from "@/lib/evidence/logger"

/**
 * Certificate Activation Endpoint
 * CRITICAL: Requires terms acceptance consent BEFORE activation
 * NOM-151: Logs evidence event with SHA-256 hash
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { certificateCode } = body

    if (!certificateCode) {
      return NextResponse.json({ error: "Certificate code is required" }, { status: 400 })
    }

    const consentValidation = await validateConsent(user.id, "activation")

    if (!consentValidation.valid) {
      return NextResponse.json(
        {
          error: "CONSENT_REQUIRED",
          message: "Debes aceptar los términos de activación antes de continuar",
          details: consentValidation.error,
        },
        { status: 403 },
      )
    }

    const { ip, userAgent } = extractRequestMetadata(request)

    await logEvidenceEvent({
      eventType: "certificate_activated",
      entityType: "certificate",
      entityId: certificateCode,
      userId: user.id,
      actorRole: "user",
      payload: {
        certificateCode,
        activatedAt: new Date().toISOString(),
        consentVersion: consentValidation.version,
      },
      ipAddress: ip,
      userAgent: userAgent,
    })

    return NextResponse.json({
      success: true,
      message: "Certificate activated successfully",
    })
  } catch (error) {
    console.error("[v0] Certificate activation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
