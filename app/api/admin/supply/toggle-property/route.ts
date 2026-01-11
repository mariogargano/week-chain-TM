import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check admin auth
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify admin role (ops or super_admin)
    const { data: adminUser } = await supabase.from("admin_users").select("*").eq("user_id", user.id).single()

    if (!adminUser || adminUser.status !== "active") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (!["ops", "super_admin"].includes(adminUser.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const { propertyId, newStatus } = await request.json()

    if (!["active", "paused", "exit_scheduled"].includes(newStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Update property status
    const { error: updateError } = await supabase
      .from("supply_properties")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", propertyId)

    if (updateError) {
      console.error("Error updating property status:", updateError)
      return NextResponse.json({ error: "Failed to update property" }, { status: 500 })
    }

    // Log admin action
    await supabase.from("admin_audit_log").insert({
      admin_user_id: user.id,
      action: `toggle_property_status`,
      entity_type: "supply_property",
      entity_id: propertyId,
      changes: { status: newStatus },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error toggling property:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
