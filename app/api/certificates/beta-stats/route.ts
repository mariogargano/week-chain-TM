import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const supabase = await createClient()

    // Get total sold certificates from certificate_products_v2
    const { data: products, error } = await supabase.from("certificate_products_v2").select("sold_count")

    if (error) {
      console.error("[v0] Error fetching beta stats:", error)
      return NextResponse.json({ sold: 0, remaining: 68 }, { status: 200 })
    }

    const totalSold = products?.reduce((sum, p) => sum + (p.sold_count || 0), 0) || 0

    return NextResponse.json({
      sold: totalSold,
      remaining: 68 - totalSold,
      percentage: (totalSold / 68) * 100,
    })
  } catch (error) {
    console.error("[v0] Error in beta stats:", error)
    return NextResponse.json({ sold: 0, remaining: 68 }, { status: 200 })
  }
}
