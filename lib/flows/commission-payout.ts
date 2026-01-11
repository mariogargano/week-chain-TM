/**
 * FLOW D — Commission Payout
 * Admin-initiated batch payout process
 */

import { createClient } from "@/lib/supabase/server"
import { logAdminAction } from "@/lib/rls/helpers"

export async function executeCommissionPayout(params: {
  commissionIds: string[]
  payoutMethod: string
  payoutReference: string
}) {
  const supabase = createClient()

  // Validate all commissions are approved
  const { data: commissions } = await supabase.from("commission_records").select("*").in("id", params.commissionIds)

  const invalidCommissions = commissions?.filter((c) => c.status !== "approved")

  if (invalidCommissions && invalidCommissions.length > 0) {
    throw new Error("Cannot pay out non-approved commissions")
  }

  // Mark as paid
  const { error } = await supabase
    .from("commission_records")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
    })
    .in("id", params.commissionIds)

  if (error) throw error

  // Log admin action
  await logAdminAction("payout_commissions", "commission_records", null, {
    commission_ids: params.commissionIds,
    payout_method: params.payoutMethod,
    payout_reference: params.payoutReference,
    total_amount: commissions?.reduce((sum, c) => sum + c.commission_amount, 0),
  })

  console.log(`[Payout] Executed payout for ${params.commissionIds.length} commissions`)

  return commissions
}
