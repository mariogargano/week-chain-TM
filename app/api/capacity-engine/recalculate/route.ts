import { NextResponse } from "next/server"
import { runCapacityEngineCalculation } from "@/lib/capacity-engine"
import { createClient } from "@/lib/supabase/server"

export async function POST() {
  try {
    // Verify admin access
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (profile?.role !== "admin" && profile?.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Run calculation
    const status = await runCapacityEngineCalculation()

    if (!status) {
      return NextResponse.json({ error: "Calculation failed" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      status,
    })
  } catch (error) {
    console.error("[API] Recalculate error:", error)
    return NextResponse.json({ error: "Failed to recalculate" }, { status: 500 })
  }
}
