import { NextResponse } from "next/server"
import { logger } from "@/lib/config/logger"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { tx_sig, payment_id } = await request.json()

    if (!tx_sig || !payment_id) {
      return NextResponse.json({ ok: false, reason: "missing_params" }, { status: 400 })
    }

    logger.debug("Verifying Solana transaction", { tx_sig, payment_id })

    // TODO: For production, implement robust on-chain verification:
    // 1. Verify transaction exists on Solana
    // 2. Check receiver matches escrow vault
    // 3. Verify amount matches expected payment
    // 4. Check token is USDC
    // 5. Verify transaction is confirmed

    // For now, just log and return success
    // This should be implemented with proper Solana RPC calls

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Record the transaction attempt
    await supabase.from("fiat_payments").insert({
      user_wallet: user?.id || "guest",
      user_email: user?.email || "",
      amount: 0, // Should be extracted from on-chain data
      currency: "USDC",
      payment_method: "solana_pay",
      status: "pending_verification",
      metadata: {
        tx_signature: tx_sig,
        payment_id,
        verification_status: "manual_review_required",
      },
    })

    logger.warn("Solana Pay verification not fully implemented - manual review required", {
      tx_sig,
      payment_id,
    })

    return NextResponse.json({
      ok: true,
      message: "Transaction recorded. Manual verification required.",
    })
  } catch (error) {
    logger.error("Error verifying Solana transaction:", error)
    return NextResponse.json({ ok: false, reason: "internal_error" }, { status: 500 })
  }
}
