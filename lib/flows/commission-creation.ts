/**
 * FLOW B — Sale → Commission Creation
 * Automatically creates commission records when a certificate is purchased
 */

import { createClient } from "@/lib/supabase/server"
import { getActiveAttribution } from "./referral-attribution"

export async function createCommissionFromOrder(params: {
  orderId: string
  buyerUserId: string
  buyerEmail: string
  certificateTier: string
  saleAmount: number
}) {
  const supabase = await createClient()

  // Check for active attribution
  const attribution = await getActiveAttribution({
    userId: params.buyerUserId,
    email: params.buyerEmail,
  })

  if (!attribution) {
    return null
  }

  // Get commission rate for this tier (try exact match, then fallback to default)
  const { data: rateConfig } = await supabase
    .from("commission_rates")
    .select("*")
    .eq("certificate_tier", params.certificateTier)
    .single()

  // WEEK-CHAIN uses a flat 4% referral commission. No multi-level, no tier-based rates.
  const FLAT_COMMISSION_RATE = 0.04
  let commissionRate: number

  if (rateConfig) {
    // Cap at 4% even if DB has a higher value (safety guard)
    commissionRate = Math.min(rateConfig.default_rate, FLAT_COMMISSION_RATE)
  } else {
    commissionRate = FLAT_COMMISSION_RATE
  }
  const commissionAmount = params.saleAmount * commissionRate

  // Create commission with PENDING status and hold period
  const holdUntil = new Date()
  holdUntil.setDate(holdUntil.getDate() + 45) // 45-day hold period

  const { data: commission, error } = await supabase
    .from("commission_records")
    .insert({
      intermediary_id: attribution.intermediary_id,
      buyer_user_id: params.buyerUserId,
      order_id: params.orderId,
      certificate_tier: params.certificateTier,
      sale_amount: params.saleAmount,
      commission_rate: commissionRate,
      commission_amount: commissionAmount,
      status: "pending",
      hold_until: holdUntil.toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error("[Commission] Error creating commission:", error)
    throw error
  }

  return commission
}
