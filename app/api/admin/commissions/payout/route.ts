/**
 * ADMIN ONLY endpoint to execute commission payouts
 * Protected by RLS - only finance/super_admin can execute
 */

import { type NextRequest, NextResponse } from "next/server"
import { executePayoutBatch } from "@/lib/intermediary/flows"
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
      return NextResponse.json({ error: "Forbidden - finance admin access required" }, { status: 403 })
    }

    const body = await req.json()
    const { commissionIds } = body

    if (!commissionIds || !Array.isArray(commissionIds)) {
      return NextResponse.json({ error: "Invalid commission IDs" }, { status: 400 })
    }

    const result = await executePayoutBatch({
      commissionIds,
      adminUserId: user.id,
    })

    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
