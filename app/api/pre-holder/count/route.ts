import { type NextRequest, NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

const MAX_PRE_HOLDERS = 500

/**
 * GET /api/pre-holder/count
 * Returns the current count of paid pre-holders and remaining slots.
 * Public endpoint — no PII exposed.
 */
export async function GET(_req: NextRequest) {
  try {
    const supabase = createServiceRoleClient()

    const { count, error } = await supabase
      .from("pre_holders")
      .select("*", { count: "exact", head: true })
      .eq("status", "paid")

    if (error) {
      console.error("[pre-holder/count] Supabase error:", error)
      return NextResponse.json({ error: "Failed to fetch count" }, { status: 500 })
    }

    const paidCount = count ?? 0
    const remaining = Math.max(0, MAX_PRE_HOLDERS - paidCount)

    return NextResponse.json(
      { count: paidCount, remaining, max: MAX_PRE_HOLDERS },
      {
        headers: {
          // Cache for 30 seconds to reduce DB load
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      },
    )
  } catch (err: any) {
    console.error("[pre-holder/count] Unexpected error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
