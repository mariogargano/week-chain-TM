import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // Verify admin access
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle()

    if (userData?.role !== "admin" && userData?.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Fetch KYC users with pending status
    const { data: kycUsers, error } = await supabase
      .from("kyc_users")
      .select(`
        id,
        user_id,
        status,
        persona_inquiry_id,
        created_at,
        kyc_updated_at,
        users:user_id(email, full_name)
      `)
      .order("created_at", { ascending: false })
      .limit(500)

    if (error) {
      console.error("[admin-kyc] Error fetching KYC users:", error)
      return NextResponse.json({ error: "Failed to fetch KYC users" }, { status: 500 })
    }

    return NextResponse.json(kycUsers || [])
  } catch (error) {
    console.error("[admin-kyc] Unhandled error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
