import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { IntermediaryDashboardClient } from "./client"

export const dynamic = "force-dynamic"

export default async function IntermediaryDashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth")

  // Fetch intermediary profile
  const { data: profile } = await supabase.from("intermediary_profiles").select("*").eq("user_id", user.id).single()

  if (!profile) {
    // Redirect to onboarding if not an intermediary
    redirect("/intermediary/onboarding")
  }

  // Fetch commission records
  const { data: commissions } = await supabase
    .from("commission_records")
    .select("*")
    .eq("intermediary_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(50)

  // Fetch leads
  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .eq("intermediary_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(100)

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <IntermediaryDashboardClient profile={profile} commissions={commissions || []} leads={leads || []} />
    </Suspense>
  )
}
