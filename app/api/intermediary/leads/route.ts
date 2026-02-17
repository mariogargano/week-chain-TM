/**
 * PROTECTED endpoint for intermediary leads
 * RLS ensures each intermediary sees only their leads
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

    // Get intermediary profile
    const { data: profile } = await supabase.from("intermediary_profiles").select("id").eq("user_id", user.id).single()

    if (!profile) {
      return NextResponse.json({ error: "Not an intermediary" }, { status: 403 })
    }

    // Get leads (RLS enforced - will only return own leads)
    const { data: leads, error } = await supabase
      .from("leads")
      .select("*")
      .eq("intermediary_id", profile.id)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ leads })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
