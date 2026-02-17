/**
 * FLOW E — Compliance Enforcement
 * Manages strikes, suspensions, and bans for intermediaries
 */

import { createClient } from "@/lib/supabase/server"
import { logAdminAction } from "@/lib/rls/helpers"

export async function issueComplianceStrike(params: {
  intermediaryId: string
  reason: string
  evidenceUrl?: string
  actionTaken: "warning" | "suspend" | "ban"
}) {
  const supabase = createClient()

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

  if (strikeError) throw strikeError

  // Update intermediary status if needed
  if (params.actionTaken === "suspend" || params.actionTaken === "ban") {
    const newStatus = params.actionTaken === "ban" ? "banned" : "suspended"

    const { error: updateError } = await supabase
      .from("intermediary_profiles")
      .update({ status: newStatus })
      .eq("id", params.intermediaryId)

    if (updateError) throw updateError

    // Freeze pending commissions if suspended/banned
    await supabase
      .from("commission_records")
      .update({ status: "reversed" })
      .eq("intermediary_id", params.intermediaryId)
      .eq("status", "pending")
  }

  // Log compliance action
  await logAdminAction("compliance_strike", "intermediary_profiles", params.intermediaryId, {
    reason: params.reason,
    action_taken: params.actionTaken,
  })

  console.log(`[Compliance] Issued ${params.actionTaken} for intermediary ${params.intermediaryId}`)

  return strike
}

export async function getIntermediaryStrikes(intermediaryId: string) {
  const supabase = createClient()

  const { data: strikes } = await supabase
    .from("compliance_strikes")
    .select("*")
    .eq("intermediary_id", intermediaryId)
    .order("created_at", { ascending: false })

  return strikes || []
}
