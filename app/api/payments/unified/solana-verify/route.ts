import { NextResponse } from "next/server"
import { logger } from "@/lib/config/logger"

/**
 * SECURITY NOTE — Solana Pay verification is NOT yet implemented.
 *
 * This endpoint is intentionally disabled (returns 503) until robust on-chain
 * verification is built. Returning a success response without real on-chain
 * checks would allow any caller to claim a payment was made without actually
 * sending USDC, which is a critical financial fraud vector.
 *
 * To implement properly:
 *   1. Verify tx_sig exists on Solana mainnet via JSON-RPC (getTransaction).
 *   2. Confirm the receiver matches the platform escrow vault address.
 *   3. Verify the transferred amount and token (USDC SPL mint).
 *   4. Verify the transaction has ≥ 32 confirmations (finalized).
 *   5. Check for idempotency: reject duplicate tx_sig submissions.
 *   6. Only after all checks pass, mark the payment as confirmed in Supabase.
 */
export async function POST(request: Request) {
  logger.warn("Solana Pay verification endpoint called but is disabled pending secure implementation", {
    url: request.url,
  })

  return NextResponse.json(
    {
      ok: false,
      reason: "not_implemented",
      message:
        "Solana Pay verification is not available at this time. Please use Stripe to complete your purchase.",
    },
    { status: 503 }
  )
}
