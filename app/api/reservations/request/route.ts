import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { validateConsent } from "@/lib/consent/validator"
import { extractRequestMetadata, logEvidenceEvent } from "@/lib/evidence/logger"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Verify user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const consentValidation = await validateConsent(user.id, "reservation")

    if (!consentValidation.valid) {
      return NextResponse.json(
        {
          error: "CONSENT_REQUIRED",
          message: "Debes aceptar los términos de solicitud de reservación antes de continuar",
          details: consentValidation.error,
        },
        { status: 403 },
      )
    }

    const body = await request.json()
    const {
      certificate_id,
      desired_start_date,
      desired_end_date,
      flexibility_days = 0,
      party_size,
      destination_preference,
      special_requests,
    } = body

    // First try v2 (PAX-based)
    let certificate = null
    let isV2 = false

    const { data: certV2, error: certV2Error } = await supabase
      .from("user_certificates_v2")
      .select("*")
      .eq("id", certificate_id)
      .eq("user_id", user.id)
      .eq("status", "active")
      .single()

    if (certV2 && !certV2Error) {
      certificate = certV2
      isV2 = true
    } else {
      // Fallback to v1 for legacy certificates
      const { data: certV1, error: certV1Error } = await supabase
        .from("user_certificates")
        .select("*")
        .eq("id", certificate_id)
        .eq("user_id", user.id)
        .eq("status", "active")
        .single()

      if (certV1 && !certV1Error) {
        certificate = certV1
      }
    }

    if (!certificate) {
      return NextResponse.json({ error: "Certificado inválido o inactivo" }, { status: 400 })
    }

    if (isV2) {
      const remainingEstancias = certificate.annual_entitlement_estancias - certificate.annual_used_estancias
      if (remainingEstancias <= 0) {
        return NextResponse.json(
          {
            error: "No tienes estancias disponibles este año. Tus estancias se renovarán en tu fecha de aniversario.",
            resetDate: certificate.annual_reset_at,
          },
          { status: 400 },
        )
      }
    } else {
      if (certificate.remaining_weeks_this_year <= 0) {
        return NextResponse.json(
          {
            error: "No tienes semanas disponibles este año. Tus semanas se renovarán en tu fecha de aniversario.",
            resetDate: certificate.year_start_date,
          },
          { status: 400 },
        )
      }
    }

    const maxPax = isV2 ? certificate.max_pax : 8 // Default to 8 for legacy
    const requestedPartySize = party_size || 2

    if (requestedPartySize > maxPax) {
      return NextResponse.json(
        {
          error: `Tu certificado permite hasta ${maxPax} personas. Has solicitado ${requestedPartySize}.`,
          maxPax,
        },
        { status: 400 },
      )
    }

    // Create reservation request (status: 'requested')
    const { data: reservationRequest, error: requestError } = await supabase
      .from("reservation_requests")
      .insert({
        user_id: user.id,
        certificate_id: certificate.id,
        desired_start_date,
        desired_end_date,
        flexibility_days,
        party_size: requestedPartySize,
        destination_preference,
        special_requests,
        status: "requested",
      })
      .select()
      .single()

    if (requestError) {
      console.error("[v0] Failed to create reservation request:", requestError)
      return NextResponse.json({ error: "Error al crear la solicitud" }, { status: 500 })
    }

    const { ip, userAgent } = extractRequestMetadata(request)

    await logEvidenceEvent({
      eventType: "reservation_requested",
      entityType: "reservation",
      entityId: reservationRequest.id,
      userId: user.id,
      actorRole: "user",
      payload: {
        certificateId: certificate.id,
        desiredStartDate: desired_start_date,
        desiredEndDate: desired_end_date,
        partySize: requestedPartySize,
        destinationPreference: destination_preference,
        consentVersion: consentValidation.version,
      },
      ipAddress: ip,
      userAgent: userAgent,
    })

    return NextResponse.json({
      success: true,
      request: reservationRequest,
      message:
        "Solicitud enviada correctamente. Nuestro equipo revisará y te enviará una oferta dentro de 24-48 horas.",
      certificateInfo: {
        maxPax,
        remainingEstancias: isV2
          ? certificate.annual_entitlement_estancias - certificate.annual_used_estancias
          : certificate.remaining_weeks_this_year,
      },
    })
  } catch (error: any) {
    console.error("[v0] Reservation request error:", error)
    return NextResponse.json({ error: error.message || "Error al procesar la solicitud" }, { status: 500 })
  }
}
