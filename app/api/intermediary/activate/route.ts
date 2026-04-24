import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

/**
 * Activate "agent mode" for the current authenticated user.
 *
 * - Idempotent: returns the existing intermediary_profile if one is already there.
 * - Creates a unique `referral_code` derived from the user's id.
 * - Accepts an optional { displayName, phone } payload.
 */
export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fast path: already an agent.
    const { data: existing } = await supabase
      .from("intermediary_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ profile: existing, created: false })
    }

    let body: any = {}
    try {
      body = await req.json()
    } catch {
      body = {}
    }

    const { data: userRow } = await supabase
      .from("users")
      .select("full_name, email, phone, referral_code")
      .eq("id", user.id)
      .maybeSingle()

    const baseCode =
      (userRow?.referral_code && String(userRow.referral_code)) ||
      `WC${user.id.replace(/-/g, "").slice(0, 6).toUpperCase()}`

    // Ensure referral code is unique on intermediary_profiles.
    let referralCode = baseCode
    for (let i = 0; i < 5; i++) {
      const { data: clash } = await supabase
        .from("intermediary_profiles")
        .select("id")
        .eq("referral_code", referralCode)
        .maybeSingle()
      if (!clash) break
      referralCode = `${baseCode}${Math.floor(Math.random() * 900 + 100)}`
    }

    const insertPayload = {
      user_id: user.id,
      referral_code: referralCode,
      display_name: body?.displayName || userRow?.full_name || user.email?.split("@")[0] || "Agente",
      email: userRow?.email || user.email || null,
      phone: body?.phone || userRow?.phone || null,
      status: "active",
      total_sales: 0,
      total_commissions: 0,
      metadata: {
        activated_via: body?.source || "self_activation",
        activated_at: new Date().toISOString(),
      },
    }

    const { data: profile, error: insertError } = await supabase
      .from("intermediary_profiles")
      .insert(insertPayload)
      .select()
      .single()

    if (insertError) {
      console.error("[intermediary/activate] insert error:", insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    // Also mirror the referral code on the users table if it was missing.
    if (!userRow?.referral_code) {
      await supabase
        .from("users")
        .update({ referral_code: referralCode })
        .eq("id", user.id)
    }

    return NextResponse.json({ profile, created: true })
  } catch (err: any) {
    console.error("[intermediary/activate] error:", err)
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 })
  }
}
