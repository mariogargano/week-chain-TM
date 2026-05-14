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

    // Fetch certificates with user details
    const { data: certificates, error } = await supabase
      .from("user_certificates_v2")
      .select(`
        id,
        user_id,
        product_id,
        status,
        max_pax,
        start_date,
        end_date,
        purchase_price_usd,
        users:user_id(email, full_name)
      `)
      .order("created_at", { ascending: false })
      .limit(500)

    if (error) {
      console.error("[admin-certs] Error fetching certificates:", error)
      return NextResponse.json({ error: "Failed to fetch certificates" }, { status: 500 })
    }

    return NextResponse.json(certificates || [])
  } catch (error) {
    console.error("[admin-certs] Unhandled error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
