/**
 * FLOW B — Sale -> Commission Creation
 * Creates commission records when a certificate is purchased.
 *
 * Business rules (WEEK-CHAIN):
 *  - Flat 4% referral commission for any certificate tier.
 *  - Self-referral is forbidden (an agent cannot earn commission on their own purchase).
 *  - Commissions enter a 45-day anti-fraud hold before being approved.
 *  - An agent can only have commissions *released* once they pass KYC
 *    (enforced in anti-fraud-hold.ts when moving pending -> approved).
 */

import { createClient } from "@/lib/supabase/server"
import { getActiveAttribution } from "./referral-attribution"

const FLAT_COMMISSION_RATE = 0.04
const HOLD_DAYS = 45

export async function createCommissionFromOrder(params: {
  orderId: string
  buyerUserId: string
  buyerEmail: string
  certificateTier: string
  saleAmount: number
}) {
  const supabase = await createClient()

  // Idempotency: if we've already created a commission for this order, return it.
  const { data: existing } = await supabase
    .from("commission_records")
    .select("id, status")
    .eq("order_id", params.orderId)
    .maybeSingle()

  if (existing) {
    return existing
  }

  // Find an active attribution for this buyer (30-day window handled upstream).
  const attribution = await getActiveAttribution({
    userId: params.buyerUserId,
    email: params.buyerEmail,
  })

  if (!attribution) {
    return null
  }

  // ---- Self-referral guard ----
  // If the intermediary's user_id equals the buyer's user_id, refuse the commission.
  const { data: agentProfile } = await supabase
    .from("intermediary_profiles")
    .select("id, user_id, status")
    .eq("id", attribution.intermediary_id)
    .maybeSingle()

  if (!agentProfile) {
    return null
  }

  if (agentProfile.status !== "active") {
    // Agent is suspended/banned -> no commission.
    return null
  }

  if (agentProfile.user_id === params.buyerUserId) {
    // Self-referral attempt: block commission silently.
    console.warn("[Commission] Self-referral attempt blocked", {
      userId: params.buyerUserId,
      orderId: params.orderId,
    })
    return null
  }

  const commissionAmount = +(params.saleAmount * FLAT_COMMISSION_RATE).toFixed(2)

  const holdUntil = new Date()
  holdUntil.setDate(holdUntil.getDate() + HOLD_DAYS)

  const { data: commission, error } = await supabase
    .from("commission_records")
    .insert({
      intermediary_id: agentProfile.id,
      buyer_user_id: params.buyerUserId,
      order_id: params.orderId,
      certificate_tier: params.certificateTier,
      sale_amount: params.saleAmount,
      commission_rate: FLAT_COMMISSION_RATE,
      commission_amount: commissionAmount,
      status: "pending",
      hold_until: holdUntil.toISOString(),
      metadata: {
        flat_rate: true,
        rate: FLAT_COMMISSION_RATE,
        attribution_id: attribution.id ?? null,
        buyer_email: params.buyerEmail ?? null,
      },
    })
    .select()
    .single()

  if (error) {
    console.error("[Commission] Error creating commission:", error)
    throw error
  }

  // Bump intermediary aggregate counters (best-effort, non-blocking)
  try {
    const { data: current } = await supabase
      .from("intermediary_profiles")
      .select("total_sales, total_commissions")
      .eq("id", agentProfile.id)
      .maybeSingle()

    const newSales = Number(current?.total_sales ?? 0) + Number(params.saleAmount)
    const newCommissions = Number(current?.total_commissions ?? 0) + Number(commissionAmount)

    await supabase
      .from("intermediary_profiles")
      .update({
        total_sales: newSales,
        total_commissions: newCommissions,
        updated_at: new Date().toISOString(),
      })
      .eq("id", agentProfile.id)
  } catch (e) {
    console.error("[Commission] Could not update aggregate counters:", e)
  }

  return commission
}
