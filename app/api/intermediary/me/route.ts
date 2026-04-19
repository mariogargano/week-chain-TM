import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ isAgent: false, profile: null })
    }

    const { data: profile } = await supabase
      .from("intermediary_profiles")
      .select("id, referral_code, status, display_name, total_sales, total_commissions")
      .eq("user_id", user.id)
      .maybeSingle()

    const { data: kyc } = await supabase
      .from("kyc_users")
      .select("status")
      .eq("user_id", user.id)
      .maybeSingle()

    return NextResponse.json({
      isAgent: !!profile,
      profile,
      kycStatus: kyc?.status || "not_started",
    })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 })
  }
}
