import { createClient } from "@/lib/supabase/server"
import { checkAdminAuth } from "@/lib/auth/admin-guard"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const adminCheck = await checkAdminAuth(supabase)

    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: adminCheck.reason || "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()
    const { testimonial_id, approved } = body

    if (!testimonial_id) {
      return NextResponse.json({ error: "testimonial_id required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("testimonials")
      .update({
        is_approved: approved === true,
        approved_at: approved === true ? new Date().toISOString() : null,
        approved_by: approved === true ? adminCheck.adminUser.id : null,
      })
      .eq("id", testimonial_id)
      .select()
      .single()

    if (error) {
      console.error("[v0] Error updating testimonial:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ testimonial: data, message: `Testimonial ${approved ? "approved" : "rejected"}` })
  } catch (error) {
    console.error("[v0] Unexpected error in admin/testimonials/approve:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
