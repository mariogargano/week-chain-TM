import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .select("*")
      .eq("id", params.id)
      .single()

    if (propertyError) {
      console.error("[v0] Property fetch error:", propertyError)
      return NextResponse.json({ error: propertyError.message }, { status: 500 })
    }

    const { data: weeks, error: weeksError } = await supabase
      .from("weeks")
      .select("*")
      .eq("property_id", params.id)
      .order("week_number", { ascending: true })

    if (weeksError) {
      console.error("[v0] Weeks fetch error:", weeksError)
      return NextResponse.json({ error: weeksError.message }, { status: 500 })
    }

    return NextResponse.json({ property, weeks })
  } catch (error) {
    console.error("[v0] API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
