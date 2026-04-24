import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AgentDashboardClient } from "./client"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Dashboard Agente | WEEK-CHAIN",
  description: "Tus ventas, comisiones y enlace de referido como agente WEEK-CHAIN.",
}

export default async function AgentDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth?next=/dashboard/agent")
  }

  // 1. Agent profile
  const { data: profile } = await supabase
    .from("intermediary_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle()

  if (!profile) {
    // Not an agent yet: send them to member dashboard with activation CTA.
    redirect("/dashboard/member?activateAgent=1")
  }

  // 2. KYC status
  const { data: kyc } = await supabase
    .from("kyc_users")
    .select("status, submitted_at, reviewed_at")
    .eq("user_id", user.id)
    .maybeSingle()

  // 3. Commission records
  const { data: commissions } = await supabase
    .from("commission_records")
    .select(
      "id, certificate_tier, sale_amount, commission_rate, commission_amount, status, hold_until, approved_at, paid_at, created_at, buyer_user_id, order_id",
    )
    .eq("intermediary_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(100)

  // 4. Attributed leads (people who used the link but may or may not have bought)
  const { data: attributions } = await supabase
    .from("referral_attributions")
    .select("id, lead_email, lead_user_id, created_at, expires_at, converted_at")
    .eq("intermediary_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(200)

  // 5. User profile for display name fallback
  const { data: userRow } = await supabase
    .from("users")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle()

  return (
    <AgentDashboardClient
      profile={profile}
      kyc={kyc}
      commissions={commissions || []}
      attributions={attributions || []}
      userFullName={userRow?.full_name || profile.display_name || "Agente"}
      userEmail={user.email || ""}
    />
  )
}
