import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { request_id, response } = body // response: 'accept' or 'decline'

    if (!["accept", "decline"].includes(response)) {
      return NextResponse.json({ error: "Invalid response. Must be 'accept' or 'decline'" }, { status: 400 })
    }

    // Get reservation request (only own requests)
    const { data: reservationRequest, error: reqError } = await supabase
      .from("reservation_requests")
      .select("*")
      .eq("id", request_id)
      .eq("user_id", user.id)
      .single()

    if (reqError || !reservationRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }

    if (reservationRequest.status !== "offered") {
      return NextResponse.json({ error: "No active offer for this request" }, { status: 400 })
    }

    // Check if offer expired
    if (new Date(reservationRequest.offer_expires_at) < new Date()) {
      await supabase.from("reservation_requests").update({ status: "expired" }).eq("id", request_id)
      return NextResponse.json({ error: "Offer has expired" }, { status: 400 })
    }

    if (response === "decline") {
      const { error: declineError } = await supabase
        .from("reservation_requests")
        .update({
          status: "requested",
          offered_property_id: null,
          offered_dates_start: null,
          offered_dates_end: null,
          offer_expires_at: null,
          admin_notes: `User declined offer on ${new Date().toISOString()}. ${reservationRequest.admin_notes || ""}`,
        })
        .eq("id", request_id)

      if (declineError) {
        return NextResponse.json({ error: "Failed to decline offer" }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: "Offer declined. Your request will be reviewed again.",
      })
    }

    // ===== ACCEPT FLOW =====

    // Validate certificate has remaining weeks
    // Try user_certificates_v2 first (new system), fall back to user_certificates (legacy)
    let certificate: any = null
    let certTable = "user_certificates_v2"

    if (reservationRequest.certificate_id) {
      const { data: certV2 } = await supabase
        .from("user_certificates_v2")
        .select("*")
        .eq("id", reservationRequest.certificate_id)
        .single()

      if (certV2) {
        certificate = certV2
      } else {
        // Fall back to legacy table
        const { data: certLegacy } = await supabase
          .from("user_certificates")
          .select("*")
          .eq("id", reservationRequest.certificate_id)
          .single()

        if (certLegacy) {
          certificate = certLegacy
          certTable = "user_certificates"
        }
      }
    }

    if (!certificate) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 400 })
    }

    // Check remaining entitlement
    const remaining = certTable === "user_certificates_v2"
      ? certificate.annual_entitlement_estancias - certificate.annual_used_estancias
      : certificate.remaining_weeks_this_year

    if (remaining <= 0) {
      return NextResponse.json({ error: "Certificate no longer has available weeks" }, { status: 400 })
    }

    // Race condition protection: check for date conflicts
    const { data: conflicts } = await supabase
      .from("confirmed_reservations")
      .select("id")
      .eq("property_id", reservationRequest.offered_property_id)
      .gte("check_out", reservationRequest.offered_dates_start)
      .lte("check_in", reservationRequest.offered_dates_end)
      .neq("status", "cancelled")

    if (conflicts && conflicts.length > 0) {
      return NextResponse.json(
        {
          error: "Property no longer available for these dates. We will send you a new offer.",
          revertToRequested: true,
        },
        { status: 409 },
      )
    }

    // Lock the week in `weeks` table if a specific week is referenced
    if (reservationRequest.week_id) {
      const { error: lockError } = await supabase
        .from("weeks")
        .update({
          status: "reserved",
          reserved_by: user.id,
          reserved_at: new Date().toISOString(),
        })
        .eq("id", reservationRequest.week_id)
        .eq("status", "available") // Only lock if still available (optimistic lock)

      if (lockError) {
        return NextResponse.json({ error: "Week is no longer available" }, { status: 409 })
      }
    }

    // Create confirmed reservation
    const { data: confirmedReservation, error: confirmError } = await supabase
      .from("confirmed_reservations")
      .insert({
        user_id: user.id,
        certificate_id: reservationRequest.certificate_id,
        request_id: reservationRequest.id,
        property_id: reservationRequest.offered_property_id,
        check_in: reservationRequest.offered_dates_start,
        check_out: reservationRequest.offered_dates_end,
        party_size: reservationRequest.party_size,
        status: "confirmed",
      })
      .select()
      .single()

    if (confirmError) {
      // Rollback week lock if confirmation failed
      if (reservationRequest.week_id) {
        await supabase
          .from("weeks")
          .update({ status: "available", reserved_by: null, reserved_at: null })
          .eq("id", reservationRequest.week_id)
      }
      return NextResponse.json({ error: "Failed to confirm reservation" }, { status: 500 })
    }

    // Update reservation request to confirmed
    await supabase
      .from("reservation_requests")
      .update({
        status: "confirmed",
        confirmed_property_id: reservationRequest.offered_property_id,
        confirmed_at: new Date().toISOString(),
      })
      .eq("id", request_id)

    // Decrement remaining weeks on certificate
    if (certTable === "user_certificates_v2") {
      await supabase
        .from("user_certificates_v2")
        .update({
          annual_used_estancias: certificate.annual_used_estancias + 1,
        })
        .eq("id", certificate.id)
    } else {
      await supabase
        .from("user_certificates")
        .update({
          remaining_weeks_this_year: certificate.remaining_weeks_this_year - 1,
          reservations_used_this_year: certificate.reservations_used_this_year + 1,
        })
        .eq("id", certificate.id)
    }

    // Update certificate_visual_state via week_tokens
    const { data: weekToken } = await supabase
      .from("week_tokens")
      .select("id")
      .eq("user_certificate_v2_id", certificate.id)
      .maybeSingle()

    if (weekToken) {
      // Get property name for visual state
      const { data: prop } = await supabase
        .from("supply_properties")
        .select("name")
        .eq("id", reservationRequest.offered_property_id)
        .maybeSingle()

      const propName = prop?.name || "Propiedad confirmada"

      await supabase
        .from("certificate_visual_state")
        .upsert(
          {
            certificate_id: weekToken.id,
            current_status: "active",
            last_reservation_date: new Date().toISOString(),
            last_property_name: propName,
            reservations_count: (certTable === "user_certificates_v2"
              ? certificate.annual_used_estancias + 1
              : certificate.reservations_used_this_year + 1),
          },
          { onConflict: "certificate_id" }
        )
    }

    // Insert notification for user
    await supabase.from("notifications").insert({
      user_id: user.id,
      title: "Reservacion confirmada",
      message: `Tu reservacion del ${reservationRequest.offered_dates_start} al ${reservationRequest.offered_dates_end} ha sido confirmada.`,
      type: "reservation_confirmed",
    })

    return NextResponse.json({
      success: true,
      reservation: confirmedReservation,
      message: "Reservation confirmed!",
    })
  } catch (error: any) {
    console.error("[respond-to-offer] Error:", error)
    return NextResponse.json({ error: error.message || "Failed to process response" }, { status: 500 })
  }
}
