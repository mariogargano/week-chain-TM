import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")
    const templateType = searchParams.get("template_type")
    const limit = Number.parseInt(searchParams.get("limit") || "100")

    let query = supabase.from("email_logs").select("*").order("sent_at", { ascending: false }).limit(limit)

    if (status) {
      query = query.eq("status", status)
    }

    if (templateType) {
      query = query.eq("template_type", templateType)
    }

    const { data, error } = await query

    if (error) {
      console.error("[v0] Error fetching email logs:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ logs: data })
  } catch (error) {
    console.error("[v0] Error in GET /api/admin/email-logs:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
