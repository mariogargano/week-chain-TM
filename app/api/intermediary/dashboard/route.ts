/**
 * PROTECTED endpoint for intermediary dashboard data
 * Returns ONLY data for authenticated intermediary
 * RLS ensures data isolation
 */

import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get intermediary profile (RLS enforced)
    const { data: profile } = await supabase.from("intermediary_profiles").select("*").eq("user_id", user.id).single()

    if (!profile) {
      return NextResponse.json({ error: "Not an intermediary" }, { status: 403 })
    }

    // Get commission stats (RLS ensures only own data)
    const { data: commissions } = await supabase
      .from("commission_records")
      .select("*")
      .eq("intermediary_id", profile.id)
      .order("created_at", { ascending: false })

    // Calculate totals
    const totalEarned =
      commissions?.filter((c) => c.status === "paid").reduce((sum, c) => sum + Number(c.commission_amount), 0) || 0

    const pendingAmount =
      commissions
        ?.filter((c) => c.status === "pending" || c.status === "approved")
        .reduce((sum, c) => sum + Number(c.commission_amount), 0) || 0

    // Get leads count (RLS enforced)
    const { count: leadsCount } = await supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("intermediary_id", profile.id)

    // Get active attributions count
    const { count: activeAttributions } = await supabase
      .from("referral_attributions")
      .select("*", { count: "exact", head: true })
      .eq("intermediary_id", profile.id)
      .gt("expires_at", new Date().toISOString())

    return NextResponse.json({
      profile: {
        referralCode: profile.referral_code,
        role: profile.role,
        status: profile.status,
      },
      stats: {
        totalEarned,
        pendingAmount,
        leadsCount: leadsCount || 0,
        activeAttributions: activeAttributions || 0,
      },
      commissions: commissions?.slice(0, 10) || [], // Recent 10
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
