/**
 * ADMIN ONLY endpoint to suspend intermediary
 * Protected by RLS - only compliance/super_admin can execute
 */

import { type NextRequest, NextResponse } from "next/server"
import { suspendIntermediary } from "@/lib/intermediary/flows"
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

    // Verify admin role
    const { data: admin } = await supabase
      .from("admin_users")
      .select("role")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single()

    if (!admin || !["super_admin", "compliance"].includes(admin.role)) {
      return NextResponse.json({ error: "Forbidden - compliance admin access required" }, { status: 403 })
    }

    const body = await req.json()
    const { intermediaryId, reason } = body

    if (!intermediaryId || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await suspendIntermediary({
      intermediaryId,
      reason,
      adminUserId: user.id,
    })

    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
