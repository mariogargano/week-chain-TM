import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

    const { data } = await supabase
      .from("admin_activity")
      .select("id, action, target_type, created_at, admin_id, target_id")
      .order("created_at", { ascending: false })
      .limit(12)

    return NextResponse.json({ activities: data || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "error" }, { status: 500 })
  }
}
