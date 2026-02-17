import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { format } from "date-fns"

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
    const { week_id, property_id, wallet_address, amount_usdc, escrow_id, booking_id, check_in, check_out, guests } =
      body

    const { data: reservation, error: reservationError } = await supabase
      .from("reservations")
      .insert({
        week_id,
        property_id,
        user_wallet: wallet_address,
        status: "pending",
        week_tokens_deposited: false,
        nft_issued: false,
        escrow_id: escrow_id || null,
        usdc_equivalent: amount_usdc,
        metadata: {
          booking_id: booking_id || null,
          blockchain: booking_id ? "solana" : "traditional",
        },
      })
      .select()
      .single()

    if (reservationError) {
      console.error("[v0] Reservation error:", reservationError)
      return NextResponse.json({ error: reservationError.message }, { status: 500 })
    }

    const { error: weekError } = await supabase
      .from("weeks")
      .update({ status: "reserved", owner_wallet: wallet_address, reservation_id: reservation.id })
      .eq("id", week_id)

    if (weekError) {
      console.error("[v0] Week update error:", weekError)
    }

    try {
      const { data: property } = await supabase.from("properties").select("name").eq("id", property_id).single()

      const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single()

      await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/email/send-reservation-confirmation`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user.email,
            userName: profile?.full_name || user.email,
            propertyName: property?.name || "Property",
            checkIn: check_in ? format(new Date(check_in), "MMMM d, yyyy") : "TBD",
            checkOut: check_out ? format(new Date(check_out), "MMMM d, yyyy") : "TBD",
            guests: guests || 1,
            reservationId: reservation.id,
          }),
        },
      )
    } catch (emailError) {
      console.error("[v0] Failed to send reservation confirmation email:", emailError)
      // Don't block reservation if email fails
    }

    return NextResponse.json({ success: true, reservation })
  } catch (error) {
    console.error("[v0] API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
