/**
 * FLOW A — Referral Attribution
 * Handles 30-day attribution window for intermediary referrals
 */

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

const ATTRIBUTION_WINDOW_DAYS = 30

export async function createReferralAttribution(params: {
  referralCode: string
  leadEmail?: string
  leadUserId?: string
}) {
  const supabase = createClient()

  // Validate that intermediary exists and is active
  const { data: intermediary } = await supabase
    .from("intermediary_profiles")
    .select("id, status")
    .eq("referral_code", params.referralCode)
    .eq("status", "active")
    .single()

  if (!intermediary) {
    throw new Error("Invalid or inactive referral code")
  }

  // Create attribution with 30-day expiration
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + ATTRIBUTION_WINDOW_DAYS)

  const { data, error } = await supabase
    .from("referral_attributions")
    .insert({
      referral_code: params.referralCode,
      intermediary_id: intermediary.id,
      lead_email: params.leadEmail || null,
      lead_user_id: params.leadUserId || null,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single()

  if (error) throw error

  return data
}

export async function getActiveAttribution(params: { email?: string; userId?: string }) {
  const supabase = createClient()

  let query = supabase
    .from("referral_attributions")
    .select("*, intermediary:intermediary_profiles(*)")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)

  if (params.userId) {
    query = query.eq("lead_user_id", params.userId)
  } else if (params.email) {
    query = query.eq("lead_email", params.email)
  } else {
    return null
  }

  const { data } = await query.single()

  return data
}

export async function storeReferralCodeInCookie(referralCode: string) {
  const cookieStore = cookies()

  cookieStore.set("week_chain_ref", referralCode, {
    maxAge: 60 * 60 * 24 * ATTRIBUTION_WINDOW_DAYS, // 30 days
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  })
}

export async function getReferralCodeFromCookie() {
  const cookieStore = cookies()
  return cookieStore.get("week_chain_ref")?.value || null
}
