import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const supabase = await createClient()

    // Check admin authorization
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: adminUser } = await supabase
      .from("admin_users")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("status", "active")
      .single()

    if (!adminUser || !["super_admin", "ops"].includes(adminUser.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const { tier, enabled } = await req.json()

    if (!tier || typeof enabled !== "boolean") {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 })
    }

    console.log(`[v0] Admin ${adminUser.role} toggling ${tier} sales to ${enabled}`)

    // Get latest capacity status and update the specific tier flag
    const { data: latest } = await supabase
      .from("capacity_engine_status")
      .select("*")
      .order("calculated_at", { ascending: false })
      .limit(1)
      .single()

    if (!latest) {
      return NextResponse.json({ error: "No capacity status found" }, { status: 404 })
    }

    // Create new status record with updated flag
    const updateField = `${tier.toLowerCase()}_sales_enabled`
    const newStatus = {
      ...latest,
      [updateField]: enabled,
      calculated_at: new Date().toISOString(),
    }

    delete newStatus.id // Remove id so Supabase generates new one

    const { data: updated, error: updateError } = await supabase
      .from("capacity_engine_status")
      .insert(newStatus)
      .select()
      .single()

    if (updateError) {
      console.error("[v0] Error updating capacity status:", updateError)
      return NextResponse.json({ error: "Failed to update status" }, { status: 500 })
    }

    console.log(`[v0] ${tier} sales ${enabled ? "enabled" : "disabled"}`)

    return NextResponse.json({
      success: true,
      tier,
      enabled,
      message: `${tier} sales ${enabled ? "enabled" : "disabled"} successfully`,
    })
  } catch (error: any) {
    console.error("[v0] Error toggling sales:", error)
    return NextResponse.json({ error: error.message || "Failed to toggle sales" }, { status: 500 })
  }
}
