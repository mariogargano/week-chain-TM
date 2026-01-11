// WEEK-CHAIN Intermediary System
// Single-level commission model (NO MLM)

import { createClient } from "@/lib/supabase/server"

// Commission rates per tier
export const COMMISSION_RATES = {
  silver: 0.08, // 8%
  gold: 0.1, // 10%
  platinum: 0.12, // 12%
  signature: 0.15, // 15%
  wedding: 0.15, // 15%
} as const

// Anti-fraud hold period in days
export const ANTI_FRAUD_HOLD_DAYS = 14

// Referral attribution window in days
export const ATTRIBUTION_WINDOW_DAYS = 30

export type IntermediaryRole = "affiliate" | "broker" | "agency" | "wedding_partner"
export type IntermediaryStatus = "active" | "suspended" | "banned"
export type CommissionStatus = "pending" | "approved" | "paid" | "reversed"
export type LeadStatus = "registered" | "kyc" | "checkout" | "paid" | "refunded" | "cancelled"

export interface IntermediaryProfile {
  id: string
  userId: string
  role: IntermediaryRole
  status: IntermediaryStatus
  agencyId: string | null
  payoutMethod: Record<string, unknown> | null
  complianceAcceptedAt: string | null
  certificationApprovedAt: string | null
  referralCode: string
  createdAt: string
}

export interface CommissionRecord {
  id: string
  intermediaryId: string
  buyerUserId: string
  orderId: string
  certificateTier: string
  saleAmount: number
  commissionRate: number
  commissionAmount: number
  status: CommissionStatus
  holdUntil: string
  createdAt: string
}

/**
 * Generate unique referral code
 */
export function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

/**
 * Get intermediary profile by user ID
 */
export async function getIntermediaryProfile(userId: string): Promise<IntermediaryProfile | null> {
  const supabase = await createClient()

  const { data } = await supabase.from("intermediary_profiles").select("*").eq("user_id", userId).single()

  if (!data) return null

  return {
    id: data.id,
    userId: data.user_id,
    role: data.role as IntermediaryRole,
    status: data.status as IntermediaryStatus,
    agencyId: data.agency_id,
    payoutMethod: data.payout_method,
    complianceAcceptedAt: data.compliance_accepted_at,
    certificationApprovedAt: data.certification_approved_at,
    referralCode: data.referral_code,
    createdAt: data.created_at,
  }
}

/**
 * Create referral attribution when lead uses referral code
 */
export async function createReferralAttribution(referralCode: string, leadEmail: string): Promise<boolean> {
  const supabase = await createClient()

  // Find intermediary by referral code
  const { data: intermediary } = await supabase
    .from("intermediary_profiles")
    .select("id")
    .eq("referral_code", referralCode)
    .eq("status", "active")
    .single()

  if (!intermediary) return false

  // Create attribution with 30-day expiry
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + ATTRIBUTION_WINDOW_DAYS)

  const { error } = await supabase.from("referral_attributions").insert({
    referral_code: referralCode,
    intermediary_id: intermediary.id,
    lead_email: leadEmail,
    expires_at: expiresAt.toISOString(),
  })

  return !error
}

/**
 * Calculate commission for a sale
 */
export function calculateCommission(
  tier: keyof typeof COMMISSION_RATES,
  saleAmount: number,
): { rate: number; amount: number } {
  const rate = COMMISSION_RATES[tier] || 0.08
  const amount = saleAmount * rate
  return { rate, amount }
}

/**
 * Create commission record after successful sale
 */
export async function createCommissionRecord(
  intermediaryId: string,
  buyerUserId: string,
  orderId: string,
  certificateTier: keyof typeof COMMISSION_RATES,
  saleAmount: number,
): Promise<CommissionRecord | null> {
  const supabase = await createClient()

  const { rate, amount } = calculateCommission(certificateTier, saleAmount)

  // Set hold period
  const holdUntil = new Date()
  holdUntil.setDate(holdUntil.getDate() + ANTI_FRAUD_HOLD_DAYS)

  const { data, error } = await supabase
    .from("commission_records")
    .insert({
      intermediary_id: intermediaryId,
      buyer_user_id: buyerUserId,
      order_id: orderId,
      certificate_tier: certificateTier,
      sale_amount: saleAmount,
      commission_rate: rate,
      commission_amount: amount,
      status: "pending",
      hold_until: holdUntil.toISOString(),
    })
    .select()
    .single()

  if (error || !data) return null

  return {
    id: data.id,
    intermediaryId: data.intermediary_id,
    buyerUserId: data.buyer_user_id,
    orderId: data.order_id,
    certificateTier: data.certificate_tier,
    saleAmount: data.sale_amount,
    commissionRate: data.commission_rate,
    commissionAmount: data.commission_amount,
    status: data.status as CommissionStatus,
    holdUntil: data.hold_until,
    createdAt: data.created_at,
  }
}

/**
 * Get intermediary dashboard stats
 */
export async function getIntermediaryStats(intermediaryId: string): Promise<{
  totalLeads: number
  leadsByStatus: Record<LeadStatus, number>
  totalSales: number
  salesByTier: Record<string, number>
  commissions: {
    pending: number
    approved: number
    paid: number
  }
}> {
  const supabase = await createClient()

  // Get leads
  const { data: leads } = await supabase.from("leads").select("status").eq("intermediary_id", intermediaryId)

  const leadsByStatus: Record<LeadStatus, number> = {
    registered: 0,
    kyc: 0,
    checkout: 0,
    paid: 0,
    refunded: 0,
    cancelled: 0,
  }

  leads?.forEach((lead) => {
    const status = lead.status as LeadStatus
    if (status in leadsByStatus) {
      leadsByStatus[status]++
    }
  })

  // Get commissions
  const { data: commissions } = await supabase
    .from("commission_records")
    .select("certificate_tier, commission_amount, status")
    .eq("intermediary_id", intermediaryId)

  const salesByTier: Record<string, number> = {}
  const commissionTotals = {
    pending: 0,
    approved: 0,
    paid: 0,
  }

  commissions?.forEach((c) => {
    salesByTier[c.certificate_tier] = (salesByTier[c.certificate_tier] || 0) + 1

    if (c.status === "pending") {
      commissionTotals.pending += c.commission_amount
    } else if (c.status === "approved") {
      commissionTotals.approved += c.commission_amount
    } else if (c.status === "paid") {
      commissionTotals.paid += c.commission_amount
    }
  })

  return {
    totalLeads: leads?.length || 0,
    leadsByStatus,
    totalSales: commissions?.length || 0,
    salesByTier,
    commissions: commissionTotals,
  }
}

/**
 * Add compliance strike to intermediary
 */
export async function addComplianceStrike(
  intermediaryId: string,
  reason: string,
  action: "warning" | "suspend" | "ban",
): Promise<boolean> {
  const supabase = await createClient()

  // Create strike record
  const { error: strikeError } = await supabase.from("compliance_strikes").insert({
    intermediary_id: intermediaryId,
    reason,
    action_taken: action,
  })

  if (strikeError) return false

  // Update intermediary status if needed
  if (action === "suspend" || action === "ban") {
    await supabase
      .from("intermediary_profiles")
      .update({ status: action === "ban" ? "banned" : "suspended" })
      .eq("id", intermediaryId)
  }

  return true
}
