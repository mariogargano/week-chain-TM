import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's WEEK balance
    const { data: balance, error } = await supabase.from("week_balances").select("*").eq("user_id", user.id).single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned
      console.error("[v0] Error fetching WEEK balance:", error)
      return NextResponse.json({ error: "Failed to fetch balance" }, { status: 500 })
    }

    // If no balance record exists, create one
    if (!balance) {
      const { data: newBalance, error: createError } = await supabase
        .from("week_balances")
        .insert({
          user_id: user.id,
          user_wallet: user.email || "",
          balance: 0,
          locked_balance: 0,
        })
        .select()
        .single()

      if (createError) {
        console.error("[v0] Error creating WEEK balance:", createError)
        return NextResponse.json({ error: "Failed to create balance" }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        balance: newBalance,
      })
    }

    return NextResponse.json({
      success: true,
      balance,
    })
  } catch (error) {
    console.error("[v0] WEEK balance error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
