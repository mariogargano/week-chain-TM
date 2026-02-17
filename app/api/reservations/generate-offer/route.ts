import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { addDays } from "date-fns"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Verify admin authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: adminUser } = await supabase
      .from("admin_users")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single()

    if (!adminUser) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const body = await request.json()
    const { request_id, offered_property_id, offered_dates_start, offered_dates_end, offer_expires_hours = 48 } = body

    // Get the reservation request
    const { data: reservationRequest, error: reqError } = await supabase
      .from("reservation_requests")
      .select("*")
      .eq("id", request_id)
      .single()

    if (reqError || !reservationRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }

    if (reservationRequest.status !== "requested" && reservationRequest.status !== "processing") {
      return NextResponse.json({ error: "Request is not in valid state for offer" }, { status: 400 })
    }

    // Verify property exists and is available
    const { data: property, error: propError } = await supabase
      .from("supply_properties")
      .select("*")
      .eq("id", offered_property_id)
      .eq("status", "active")
      .single()

    if (propError || !property) {
      return NextResponse.json({ error: "Property not available" }, { status: 400 })
    }

    // Check for conflicts with existing confirmed reservations
    const { data: conflicts } = await supabase
      .from("confirmed_reservations")
      .select("*")
      .eq("property_id", offered_property_id)
      .gte("check_out", offered_dates_start)
      .lte("check_in", offered_dates_end)
      .neq("status", "cancelled")

    if (conflicts && conflicts.length > 0) {
      return NextResponse.json(
        {
          error: "Property has conflicting reservations during requested dates",
          conflicts,
        },
        { status: 409 },
      )
    }

    // Update request with offer
    const offer_expires_at = addDays(new Date(), offer_expires_hours / 24).toISOString()

    const { data: updatedRequest, error: updateError } = await supabase
      .from("reservation_requests")
      .update({
        status: "offered",
        offered_property_id,
        offered_dates_start,
        offered_dates_end,
        offer_expires_at,
        updated_at: new Date().toISOString(),
      })
      .eq("id", request_id)
      .select()
      .single()

    if (updateError) {
      console.error("[v0] Failed to update request with offer:", updateError)
      return NextResponse.json({ error: "Failed to create offer" }, { status: 500 })
    }

    // TODO: Send email notification to user about offer

    return NextResponse.json({
      success: true,
      offer: updatedRequest,
      message: "Offer generated and sent to user",
    })
  } catch (error: any) {
    console.error("[v0] Generate offer error:", error)
    return NextResponse.json({ error: error.message || "Failed to generate offer" }, { status: 500 })
  }
}
