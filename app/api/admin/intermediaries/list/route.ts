import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Check admin auth
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify admin role
    const { data: adminUser } = await supabase.from("admin_users").select("*").eq("user_id", user.id).single()

    if (!adminUser || adminUser.status !== "active") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get all intermediaries with their stats
    const { data: intermediaries } = await supabase
      .from("intermediary_profiles")
      .select(
        `
        *,
        leads:leads(count),
        commissions:commission_records(sum:commission_amount,status),
        strikes:compliance_strikes(count)
      `,
      )
      .order("created_at", { ascending: false })

    return NextResponse.json({ intermediaries })
  } catch (error) {
    console.error("Error fetching intermediaries:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
