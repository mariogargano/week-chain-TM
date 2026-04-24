/**
 * FLOW C — Anti-Fraud Hold
 *
 * Responsibilities:
 *  - Reverse commissions on refund / chargeback (immediate).
 *  - Approve commissions whose 45-day hold has expired, BUT only if the
 *    intermediary has an approved KYC record. Commissions whose agent is
 *    not KYC-approved stay in "pending" until the agent completes KYC.
 */

import { createClient } from "@/lib/supabase/server"

export async function reverseCommission(orderId: string, reason: string) {
  const supabase = await createClient()

  const { data: commission } = await supabase
    .from("commission_records")
    .select("*")
    .eq("order_id", orderId)
    .maybeSingle()

  if (!commission) {
    // No commission for this order -> nothing to reverse. Not an error.
    return false
  }

  if (commission.status === "paid") {
    throw new Error("Cannot reverse already paid commission")
  }

  const metadata = {
    ...(commission.metadata ?? {}),
    reversed_reason: reason,
    reversed_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from("commission_records")
    .update({
      status: "reversed",
      reversed_at: new Date().toISOString(),
      metadata,
    })
    .eq("order_id", orderId)

  if (error) throw error

  return true
}

/**
 * Approve commissions whose hold has expired AND whose agent has KYC approved.
 * Safe to call from a cron/daily job or admin endpoint.
 */
export async function approveDueCommissions() {
  const supabase = await createClient()

  // 1. Pick pending commissions whose 45-day hold has elapsed.
  const { data: dueCommissions } = await supabase
    .from("commission_records")
    .select("id, intermediary_id")
    .eq("status", "pending")
    .lt("hold_until", new Date().toISOString())

  if (!dueCommissions || dueCommissions.length === 0) {
    return { approved: 0, waitingKyc: 0 }
  }

  const intermediaryIds = Array.from(new Set(dueCommissions.map((c) => c.intermediary_id)))

  // 2. Resolve their underlying user_id so we can check KYC.
  const { data: profiles } = await supabase
    .from("intermediary_profiles")
    .select("id, user_id, status")
    .in("id", intermediaryIds)

  const profileById = new Map<string, { user_id: string; status: string }>()
  for (const p of profiles || []) {
    profileById.set(p.id, { user_id: p.user_id, status: p.status })
  }

  const userIds = Array.from(new Set((profiles || []).map((p) => p.user_id)))

  const { data: kycRows } = await supabase
    .from("kyc_users")
    .select("user_id, status")
    .in("user_id", userIds)

  const kycByUser = new Map<string, string>()
  for (const k of kycRows || []) {
    kycByUser.set(k.user_id, k.status)
  }

  // 3. Bucket commissions: approve if agent is active AND KYC approved.
  const approveIds: string[] = []
  let waitingKyc = 0

  for (const c of dueCommissions) {
    const profile = profileById.get(c.intermediary_id)
    if (!profile) continue
    if (profile.status !== "active") continue
    const kycStatus = kycByUser.get(profile.user_id)
    if (kycStatus === "approved") {
      approveIds.push(c.id)
    } else {
      waitingKyc += 1
    }
  }

  if (approveIds.length === 0) {
    return { approved: 0, waitingKyc }
  }

  const { error } = await supabase
    .from("commission_records")
    .update({
      status: "approved",
      approved_at: new Date().toISOString(),
    })
    .in("id", approveIds)

  if (error) throw error

  return { approved: approveIds.length, waitingKyc }
}
