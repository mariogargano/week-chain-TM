import { createServerClient } from "@/lib/supabase/server"
import { enforceConsent } from "@/lib/consent/validator"
import { type NextRequest, NextResponse } from "next/server"
import { extractRequestMetadata, logEvidenceEvent } from "@/lib/evidence"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const consentError = await enforceConsent(user.id, "offer_acceptance")
    if (consentError) {
      return consentError
    }

    const body = await request.json()
    const { offerId } = body

    const { data, error } = await supabase
      .from("reservation_offers")
      .update({
        status: "accepted",
        accepted_at: new Date().toISOString(),
      })
      .eq("id", offerId)
      .eq("user_id", user.id) // Security: only recipient can accept
      .select()
      .single()

    if (error) {
      console.error("[v0] Offer acceptance error:", error)
      return NextResponse.json({ error: "Failed to accept offer" }, { status: 500 })
    }

    const { error: reservationError } = await supabase.from("confirmed_reservations").insert({
      user_id: user.id,
      offer_id: offerId,
      reservation_request_id: data.reservation_request_id,
      certificate_id: data.certificate_id,
      destination_id: data.destination_id,
      check_in_date: data.check_in_date,
      check_out_date: data.check_out_date,
      number_of_guests: data.number_of_guests,
      status: "confirmed",
      confirmed_at: new Date().toISOString(),
    })

    if (reservationError) {
      console.error("[v0] Confirmed reservation creation error:", reservationError)
      return NextResponse.json({ error: "Failed to create confirmed reservation" }, { status: 500 })
    }

    const { ip, userAgent } = extractRequestMetadata(request)

    await logEvidenceEvent({
      eventType: "offer_accepted",
      entityType: "offer",
      entityId: offerId,
      userId: user.id,
      actorRole: "user",
      payload: {
        offerId,
        reservationRequestId: data.reservation_request_id,
        certificateId: data.certificate_id,
        destinationId: data.destination_id,
        checkInDate: data.check_in_date,
        checkOutDate: data.check_out_date,
        numberOfGuests: data.number_of_guests,
        acceptedAt: new Date().toISOString(),
        consentVersion: consentError ? undefined : "latest",
      },
      ipAddress: ip,
      userAgent: userAgent,
    })

    return NextResponse.json({ success: true, offer: data })
  } catch (error) {
    console.error("[v0] Offer acceptance exception:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
