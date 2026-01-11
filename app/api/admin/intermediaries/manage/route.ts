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

    // Verify admin role (compliance or super_admin)
    const { data: adminUser } = await supabase.from("admin_users").select("*").eq("user_id", user.id).single()

    if (!adminUser || adminUser.status !== "active") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (!["compliance", "super_admin"].includes(adminUser.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const { intermediaryId, action, reason } = await request.json()

    // Actions: approve, suspend, reactivate, add_strike, freeze_commissions
    let updateData: any = {}

    switch (action) {
      case "approve":
        updateData = { status: "approved", compliance_accepted_at: new Date().toISOString() }
        break
      case "suspend":
        updateData = { status: "suspended" }
        // Also freeze commissions
        await supabase
          .from("commission_records")
          .update({ status: "frozen" })
          .eq("intermediary_id", intermediaryId)
          .in("status", ["pending", "approved"])
        break
      case "reactivate":
        updateData = { status: "approved" }
        break
      case "add_strike":
        // Add compliance strike
        await supabase.from("compliance_strikes").insert({
          intermediary_id: intermediaryId,
          reason,
          created_by: user.id,
        })

        // Check total strikes
        const { count } = await supabase
          .from("compliance_strikes")
          .select("*", { count: "exact", head: true })
          .eq("intermediary_id", intermediaryId)

        if (count && count >= 3) {
          updateData = { status: "banned" }
          // Freeze all commissions
          await supabase
            .from("commission_records")
            .update({ status: "frozen" })
            .eq("intermediary_id", intermediaryId)
            .in("status", ["pending", "approved"])
        }
        break
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from("intermediary_profiles")
        .update(updateData)
        .eq("id", intermediaryId)

      if (updateError) {
        console.error("Error updating intermediary:", updateError)
        return NextResponse.json({ error: "Failed to update intermediary" }, { status: 500 })
      }
    }

    // Log admin action
    await supabase.from("admin_audit_log").insert({
      admin_user_id: user.id,
      action: `intermediary_${action}`,
      entity_type: "intermediary",
      entity_id: intermediaryId,
      changes: { action, reason },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error managing intermediary:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
