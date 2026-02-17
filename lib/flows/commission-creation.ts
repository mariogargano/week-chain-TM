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
  certificateTier: "silver" | "gold" | "platinum" | "signature" | "wedding"
  saleAmount: number
}) {
  const supabase = createClient()

  // Check for active attribution
  const attribution = await getActiveAttribution({
    userId: params.buyerUserId,
    email: params.buyerEmail,
  })

  if (!attribution) {
    console.log("[Commission] No active attribution found for this buyer")
    return null
  }

  // Get commission rate for this tier
  const { data: rateConfig } = await supabase
    .from("commission_rates")
    .select("*")
    .eq("certificate_tier", params.certificateTier)
    .single()

  if (!rateConfig) {
    throw new Error(`No commission rate configured for tier: ${params.certificateTier}`)
  }

  const commissionRate = rateConfig.default_rate
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

  console.log("[Commission] Created commission record:", commission.id)

  return commission
}
