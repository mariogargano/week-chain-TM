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

    // Get reservation request
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
      // User declined the offer
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

    // ACCEPT: Create confirmed reservation
    const { data: certificate } = await supabase
      .from("user_certificates")
      .select("*")
      .eq("id", reservationRequest.certificate_id)
      .single()

    if (!certificate || certificate.remaining_weeks_this_year <= 0) {
      return NextResponse.json({ error: "Certificate no longer has available weeks" }, { status: 400 })
    }

    // Check for conflicts one more time (race condition protection)
    const { data: conflicts } = await supabase
      .from("confirmed_reservations")
      .select("*")
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
      console.error("[v0] Failed to create confirmed reservation:", confirmError)
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
    await supabase
      .from("user_certificates")
      .update({
        remaining_weeks_this_year: certificate.remaining_weeks_this_year - 1,
        reservations_used_this_year: certificate.reservations_used_this_year + 1,
      })
      .eq("id", reservationRequest.certificate_id)

    // TODO: Send confirmation email with check-in instructions

    return NextResponse.json({
      success: true,
      reservation: confirmedReservation,
      message: "Reservation confirmed! Check-in instructions have been sent to your email.",
    })
  } catch (error: any) {
    console.error("[v0] Respond to offer error:", error)
    return NextResponse.json({ error: error.message || "Failed to process response" }, { status: 500 })
  }
}
