import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { amount_usdc, transaction_hash } = body

    if (!amount_usdc || amount_usdc <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    const weekAmount = amount_usdc

    // Get or create user's WEEK balance
    let { data: balance } = await supabase.from("week_balances").select("*").eq("user_id", user.id).single()

    if (!balance) {
      const { data: newBalance, error: createError } = await supabase
        .from("week_balances")
        .insert({
          user_id: user.id,
          user_wallet: user.email || "",
          balance: weekAmount,
          locked_balance: 0,
        })
        .select()
        .single()

      if (createError) {
        console.error("[v0] Error creating balance:", createError)
        return NextResponse.json({ error: "Failed to create balance" }, { status: 500 })
      }

      balance = newBalance
    } else {
      const { data: updatedBalance, error: updateError } = await supabase
        .from("week_balances")
        .update({
          balance: (balance.balance || 0) + weekAmount,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .select()
        .single()

      if (updateError) {
        console.error("[v0] Error updating balance:", updateError)
        return NextResponse.json({ error: "Failed to update balance" }, { status: 500 })
      }

      balance = updatedBalance
    }

    await supabase.from("week_transactions").insert({
      user_id: user.id,
      transaction_type: "deposit",
      amount: weekAmount,
      transaction_hash,
      status: "completed",
    })

    return NextResponse.json({
      success: true,
      balance,
      week_amount: weekAmount,
    })
  } catch (error) {
    console.error("[v0] Deposit error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
