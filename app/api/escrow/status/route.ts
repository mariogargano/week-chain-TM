import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const escrowId = searchParams.get("escrow_id")
    const userWallet = searchParams.get("user_wallet")

    if (!escrowId && !userWallet) {
      return NextResponse.json(
        { success: false, error: "Either escrow_id or user_wallet is required" },
        { status: 400 },
      )
    }

    let query = supabase.from("escrow_deposits").select("*")

    if (escrowId) {
      query = query.eq("id", escrowId)
    } else if (userWallet) {
      query = query.eq("user_wallet", userWallet)
    }

    const { data: escrowDeposits, error } = await query.order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Escrow status error:", error)
      return NextResponse.json({ success: false, error: "Failed to fetch escrow status" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      escrows: escrowDeposits,
    })
  } catch (error) {
    console.error("[v0] Escrow status error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
