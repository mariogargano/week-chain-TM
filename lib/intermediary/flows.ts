/**
 * WEEK-CHAIN AUTOMATED FLOWS
 * Purpose: Implement all business logic flows for intermediary system
 * Security: All functions use service role, never expose to frontend
 */

import { createClient } from "@supabase/supabase-js"

// Service role client (bypasses RLS for automated operations)
const getServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, supabaseServiceKey)
}

// =====================================================
// FLOW A — REFERRAL ATTRIBUTION (30-day window)
// =====================================================

/**
 * Create referral attribution when user arrives with referral code
 * Called on: signup or first visit with ?ref=CODE
 */
export async function createReferralAttribution(params: {
  referralCode: string
  email?: string
  userId?: string
}) {
  const supabase = getServiceClient()

  // Validate that code exists and intermediary is active
  const { data: profile, error: profileError } = await supabase
    .from("intermediary_profiles")
    .select("id, status")
    .eq("referral_code", params.referralCode)
    .eq("status", "active")
    .single()

  if (profileError || !profile) {
    return {
      success: false,
      error: "Invalid or inactive referral code",
    }
  }

  // Check if attribution already exists (prevent duplicates)
  let existingQuery = supabase
    .from("referral_attributions")
    .select("id")
    .eq("referral_code", params.referralCode)
    .gt("expires_at", new Date().toISOString())

  if (params.userId) {
    existingQuery = existingQuery.eq("lead_user_id", params.userId)
  } else if (params.email) {
    existingQuery = existingQuery.eq("lead_email", params.email)
  }

  const { data: existing } = await existingQuery.single()

  if (existing) {
    return {
      success: true,
      message: "Attribution already exists",
      attributionId: existing.id,
    }
  }

  // Create new attribution with 30-day expiration
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30)

  const { data: attribution, error: attributionError } = await supabase
    .from("referral_attributions")
    .insert({
      referral_code: params.referralCode,
      intermediary_id: profile.id,
      lead_email: params.email || null,
      lead_user_id: params.userId || null,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single()

  if (attributionError) {
    return {
      success: false,
      error: attributionError.message,
    }
  }

  // Also create lead record if email provided
  if (params.email) {
    await supabase
      .from("leads")
      .insert({
        intermediary_id: profile.id,
        email: params.email,
        status: "registered",
      })
      .select()
  }

  return {
    success: true,
    attributionId: attribution.id,
    expiresAt: expiresAt.toISOString(),
  }
}

// =====================================================
// FLOW B — SALE → COMMISSION CREATION
// =====================================================

/**
 * Create commission when user purchases certificate
 * Called from: Stripe webhook or payment confirmation
 */
export async function createCommissionFromOrder(params: {
  orderId: string
  buyerUserId: string
  certificateTier: "silver" | "gold" | "platinum" | "signature" | "wedding"
  saleAmount: number
}) {
  const supabase = getServiceClient()

  // Check if commission already exists (prevent duplicates)
  const { data: existing } = await supabase
    .from("commission_records")
    .select("id")
    .eq("order_id", params.orderId)
    .single()

  if (existing) {
    return {
      success: false,
      error: "Commission already created for this order",
    }
  }

  // Find valid attribution for this user
  const { data: attribution } = await supabase
    .from("referral_attributions")
    .select("intermediary_id, referral_code")
    .eq("lead_user_id", params.buyerUserId)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (!attribution) {
    return {
      success: false,
      error: "No valid attribution found (30-day window expired or not referred)",
    }
  }

  // Get commission rate for this tier
  const { data: rate } = await supabase
    .from("commission_rates")
    .select("default_rate")
    .eq("certificate_tier", params.certificateTier)
    .single()

  if (!rate) {
    return {
      success: false,
      error: "Commission rate not configured for this tier",
    }
  }

  // Calculate commission amount
  const commissionAmount = params.saleAmount * rate.default_rate

  // Create commission with PENDING status and 45-day hold
  const holdUntil = new Date()
  holdUntil.setDate(holdUntil.getDate() + 45) // 45-day anti-fraud hold

  const { data: commission, error: commissionError } = await supabase
    .from("commission_records")
    .insert({
      intermediary_id: attribution.intermediary_id,
      buyer_user_id: params.buyerUserId,
      order_id: params.orderId,
      certificate_tier: params.certificateTier,
      sale_amount: params.saleAmount,
      commission_rate: rate.default_rate,
      commission_amount: commissionAmount,
      status: "pending",
      hold_until: holdUntil.toISOString(),
    })
    .select()
    .single()

  if (commissionError) {
    return {
      success: false,
      error: commissionError.message,
    }
  }

  // Update lead status to 'paid'
  await supabase
    .from("leads")
    .update({ status: "paid" })
    .eq("intermediary_id", attribution.intermediary_id)
    .eq("email", params.buyerUserId) // Assuming email matches user

  return {
    success: true,
    commissionId: commission.id,
    commissionAmount,
    holdUntil: holdUntil.toISOString(),
  }
}

// =====================================================
// FLOW C — ANTI-FRAUD HOLD
// =====================================================

/**
 * Approve commissions after hold period expires
 * Called by: Cron job (daily) or manual admin trigger
 */
export async function approveDueCommissions() {
  const supabase = getServiceClient()

  // Find all pending commissions where hold period has expired
  const { data: dueCommissions, error: fetchError } = await supabase
    .from("commission_records")
    .select("id")
    .eq("status", "pending")
    .lt("hold_until", new Date().toISOString())

  if (fetchError || !dueCommissions || dueCommissions.length === 0) {
    return {
      success: true,
      approved: 0,
      message: "No commissions due for approval",
    }
  }

  // Update status to 'approved'
  const { error: updateError } = await supabase
    .from("commission_records")
    .update({
      status: "approved",
      approved_at: new Date().toISOString(),
    })
    .in(
      "id",
      dueCommissions.map((c) => c.id),
    )

  if (updateError) {
    return {
      success: false,
      error: updateError.message,
    }
  }

  return {
    success: true,
    approved: dueCommissions.length,
  }
}

/**
 * Reverse commission due to refund or chargeback
 * Called from: Stripe webhook on refund/dispute
 */
export async function reverseCommission(orderId: string) {
  const supabase = getServiceClient()

  // Find commission by order_id
  const { data: commission, error: fetchError } = await supabase
    .from("commission_records")
    .select("id, status, intermediary_id")
    .eq("order_id", orderId)
    .single()

  if (fetchError || !commission) {
    return {
      success: false,
      error: "Commission not found for this order",
    }
  }

  // Cannot reverse already paid commissions (needs manual admin intervention)
  if (commission.status === "paid") {
    return {
      success: false,
      error: "Cannot auto-reverse paid commission - requires manual admin action",
    }
  }

  // Reverse commission
  const { error: updateError } = await supabase
    .from("commission_records")
    .update({
      status: "reversed",
      reversed_at: new Date().toISOString(),
    })
    .eq("id", commission.id)

  if (updateError) {
    return {
      success: false,
      error: updateError.message,
    }
  }

  // Update lead status to 'refunded'
  await supabase.from("leads").update({ status: "refunded" }).eq("intermediary_id", commission.intermediary_id)

  return {
    success: true,
    commissionId: commission.id,
  }
}

// =====================================================
// FLOW D — COMMISSION PAYOUT
// =====================================================

/**
 * Execute payout batch for approved commissions
 * Called by: Admin manually or scheduled batch job
 */
export async function executePayoutBatch(params: {
  commissionIds: string[]
  adminUserId: string
}) {
  const supabase = getServiceClient()

  // Verify admin has permission
  const { data: admin } = await supabase
    .from("admin_users")
    .select("role")
    .eq("user_id", params.adminUserId)
    .eq("status", "active")
    .single()

  if (!admin || !["super_admin", "finance"].includes(admin.role)) {
    return {
      success: false,
      error: "Unauthorized - only super_admin or finance can execute payouts",
    }
  }

  // Verify all commissions are approved and not yet paid
  const { data: commissions, error: fetchError } = await supabase
    .from("commission_records")
    .select("id, status, commission_amount")
    .in("id", params.commissionIds)

  if (fetchError || !commissions) {
    return {
      success: false,
      error: "Failed to fetch commissions",
    }
  }

  const unapproved = commissions.filter((c) => c.status !== "approved")
  if (unapproved.length > 0) {
    return {
      success: false,
      error: `${unapproved.length} commission(s) not yet approved`,
    }
  }

  // Mark as paid
  const { error: updateError } = await supabase
    .from("commission_records")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
    })
    .in("id", params.commissionIds)

  if (updateError) {
    return {
      success: false,
      error: updateError.message,
    }
  }

  const totalPaid = commissions.reduce((sum, c) => sum + Number(c.commission_amount), 0)

  return {
    success: true,
    paid: commissions.length,
    totalAmount: totalPaid,
  }
}

// =====================================================
// FLOW E — COMPLIANCE ENFORCEMENT
// =====================================================

/**
 * Issue compliance strike to intermediary
 * Called by: Admin when rules are violated
 */
export async function issueComplianceStrike(params: {
  intermediaryId: string
  reason: string
  evidenceUrl?: string
  actionTaken: "warning" | "suspend" | "ban"
  adminUserId: string
}) {
  const supabase = getServiceClient()

  // Verify admin has permission
  const { data: admin } = await supabase
    .from("admin_users")
    .select("role")
    .eq("user_id", params.adminUserId)
    .eq("status", "active")
    .single()

  if (!admin || !["super_admin", "compliance"].includes(admin.role)) {
    return {
      success: false,
      error: "Unauthorized - only super_admin or compliance can issue strikes",
    }
  }

  // Create strike record
  const { data: strike, error: strikeError } = await supabase
    .from("compliance_strikes")
    .insert({
      intermediary_id: params.intermediaryId,
      reason: params.reason,
      evidence_url: params.evidenceUrl || null,
      action_taken: params.actionTaken,
    })
    .select()
    .single()

  if (strikeError) {
    return {
      success: false,
      error: strikeError.message,
    }
  }

  // Update intermediary status based on action
  if (params.actionTaken === "suspend" || params.actionTaken === "ban") {
    await supabase
      .from("intermediary_profiles")
      .update({
        status: params.actionTaken === "ban" ? "banned" : "suspended",
      })
      .eq("id", params.intermediaryId)

    // If banned, freeze all pending/approved commissions
    if (params.actionTaken === "ban") {
      await supabase
        .from("commission_records")
        .update({ status: "reversed" })
        .eq("intermediary_id", params.intermediaryId)
        .in("status", ["pending", "approved"])
    }
  }

  return {
    success: true,
    strikeId: strike.id,
  }
}

/**
 * Suspend intermediary (freeze all activities)
 */
export async function suspendIntermediary(params: {
  intermediaryId: string
  reason: string
  adminUserId: string
}) {
  return issueComplianceStrike({
    ...params,
    actionTaken: "suspend",
  })
}

/**
 * Ban intermediary permanently (reverse all commissions)
 */
export async function banIntermediary(params: {
  intermediaryId: string
  reason: string
  adminUserId: string
}) {
  return issueComplianceStrike({
    ...params,
    actionTaken: "ban",
  })
}
