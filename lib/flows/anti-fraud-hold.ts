/**
 * FLOW C — Anti-Fraud Hold
 * Manages hold period and automatic approval of commissions
 */

import { createClient } from "@/lib/supabase/server"

export async function reverseCommission(orderId: string, reason: string) {
  const supabase = createClient()

  const { data: commission } = await supabase.from("commission_records").select("*").eq("order_id", orderId).single()

  if (!commission) {
    throw new Error(`Commission not found for order: ${orderId}`)
  }

  if (commission.status === "paid") {
    throw new Error("Cannot reverse already paid commission")
  }

  const { error } = await supabase
    .from("commission_records")
    .update({
      status: "reversed",
      reversed_at: new Date().toISOString(),
    })
    .eq("order_id", orderId)

  if (error) throw error

  console.log(`[Anti-Fraud] Reversed commission for order ${orderId}: ${reason}`)

  return true
}

export async function approveDueCommissions() {
  const supabase = createClient()

  // Find all commissions that have passed hold period
  const { data: dueCommissions } = await supabase
    .from("commission_records")
    .select("*")
    .eq("status", "pending")
    .lt("hold_until", new Date().toISOString())

  if (!dueCommissions || dueCommissions.length === 0) {
    console.log("[Anti-Fraud] No commissions due for approval")
    return []
  }

  // Approve all due commissions
  const approvedIds = dueCommissions.map((c) => c.id)

  const { error } = await supabase
    .from("commission_records")
    .update({
      status: "approved",
      approved_at: new Date().toISOString(),
    })
    .in("id", approvedIds)

  if (error) throw error

  console.log(`[Anti-Fraud] Auto-approved ${dueCommissions.length} commissions`)

  return dueCommissions
}
