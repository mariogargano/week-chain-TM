import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { findBestPropertyMatch } from "@/lib/capacity-engine/supply-matcher"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check admin access
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
    const { request_id } = body

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
      return NextResponse.json({ error: "Request already processed" }, { status: 400 })
    }

    // Find best match
    const match = await findBestPropertyMatch({
      desired_start_date: reservationRequest.desired_start_date,
      desired_end_date: reservationRequest.desired_end_date,
      flexibility_days: reservationRequest.flexibility_days,
      party_size: reservationRequest.party_size,
      destination_preference: reservationRequest.destination_preference,
      category_preference: reservationRequest.category_preference,
    })

    if (!match) {
      return NextResponse.json({
        success: false,
        message: "No available properties found. Consider adding to waitlist or offering alternative dates.",
      })
    }

    return NextResponse.json({
      success: true,
      match: {
        property: match.property,
        score: match.score,
        suggested_start: match.available_start,
        suggested_end: match.available_end,
      },
      message: "Match found. Review and generate offer.",
    })
  } catch (error: any) {
    console.error("[v0] Auto-match error:", error)
    return NextResponse.json({ error: error.message || "Failed to auto-match" }, { status: 500 })
  }
}
