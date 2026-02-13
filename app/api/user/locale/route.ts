import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { locale } = await request.json()

    if (!locale || !["es-MX", "en-US", "it-IT"].includes(locale)) {
      return NextResponse.json({ error: "Invalid locale" }, { status: 400 })
    }

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Update user's profile locale
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ locale })
      .eq("id", user.id)

    if (updateError) {
      console.error("[v0] Locale update error:", updateError)
      return NextResponse.json({ error: "Failed to update locale" }, { status: 500 })
    }

    console.log("[v0] Locale updated for user:", user.id, "to:", locale)

    return NextResponse.json({ success: true, locale })
  } catch (error) {
    console.error("[v0] Locale API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
