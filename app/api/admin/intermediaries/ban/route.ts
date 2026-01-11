/**
 * ADMIN ONLY endpoint to ban intermediary permanently
 * Protected by RLS - only super_admin can execute
 */

import { type NextRequest, NextResponse } from "next/server"
import { banIntermediary } from "@/lib/intermediary/flows"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify super_admin role
    const { data: admin } = await supabase
      .from("admin_users")
      .select("role")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single()

    if (!admin || admin.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden - super admin access required" }, { status: 403 })
    }

    const body = await req.json()
    const { intermediaryId, reason, evidenceUrl } = body

    if (!intermediaryId || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await banIntermediary({
      intermediaryId,
      reason,
      evidenceUrl,
      adminUserId: user.id,
    })

    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
