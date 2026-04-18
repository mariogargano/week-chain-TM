/**
 * ADMIN ONLY endpoint to manually approve commissions
 * Protected by RLS - only finance/super_admin can execute
 */

import { type NextRequest, NextResponse } from "next/server"
import { approveDueCommissions } from "@/lib/intermediary/flows"
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

    if (!admin || !["super_admin", "finance"].includes(admin.role)) {
      return NextResponse.json({ error: "Forbidden - admin access required" }, { status: 403 })
    }

    const result = await approveDueCommissions()

    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
