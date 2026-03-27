import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "6")
    const approved_only = searchParams.get("approved") !== "false"

    let query = supabase.from("testimonials").select("*").order("created_at", { ascending: false }).limit(limit)

    if (approved_only) {
      query = query.eq("is_approved", true)
    }

    const { data, error } = await query

    if (error) {
      // Si la tabla no existe o hay error, devolver array vacío
      return NextResponse.json({ testimonials: [] })
    }

    return NextResponse.json({ testimonials: data || [] })
  } catch {
    return NextResponse.json({ testimonials: [] })
  }
}
