import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, name, phone, preferredTier } = body

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Check if user is logged in
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Check if already on waitlist
    const { data: existing } = await supabase
      .from("certificate_waitlist")
      .select("id")
      .eq("email", email)
      .eq("status", "waiting")
      .single()

    if (existing) {
      return NextResponse.json({ error: "Ya estás en la lista de espera", alreadyOnWaitlist: true }, { status: 400 })
    }

    // Add to waitlist
    const { data, error } = await supabase
      .from("certificate_waitlist")
      .insert({
        user_id: user?.id || null,
        email,
        name: name || null,
        phone: phone || null,
        preferred_tier: preferredTier || "any",
        status: "waiting",
      })
      .select()
      .single()

    if (error) {
      console.error("[Waitlist] Insert error:", error)
      return NextResponse.json({ error: "Failed to join waitlist" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Te hemos agregado a la lista de espera. Te notificaremos cuando haya disponibilidad.",
      waitlistId: data.id,
    })
  } catch (error) {
    console.error("[Waitlist] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
