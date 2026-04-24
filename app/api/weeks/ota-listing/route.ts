import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

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
    const { week_id, listed } = body

    // Verify ownership
    const { data: week } = await supabase.from("weeks").select("owner_wallet").eq("id", week_id).single()

    if (!week || week.owner_wallet !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Update OTA listing status
    const { error } = await supabase.from("weeks").update({ listed_on_ota: listed }).eq("id", week_id)

    if (error) {
      console.error("[v0] OTA listing update error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // TODO: Integrate with actual OTA APIs (Airbnb, Booking.com, VRBO)
    // For now, just update the database flag

    return NextResponse.json({ success: true, listed })
  } catch (error) {
    console.error("[v0] API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
