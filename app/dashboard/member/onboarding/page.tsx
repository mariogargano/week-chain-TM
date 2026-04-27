import { createClient } from "@/lib/supabase/server"
import OnboardingClient from "./client"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function OnboardingPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth")
  }

  // Fetch user profile and KYC status
  const { data: userProfile } = await supabase
    .from("users")
    .select("id, full_name, email, onboarding_status, holder_since")
    .eq("id", user.id)
    .single()

  const { data: kycData } = await supabase
    .from("kyc_users")
    .select("status, kyc_updated_at")
    .eq("user_id", user.id)
    .maybeSingle()

  // Fetch active certificate if exists
  const { data: certificate } = await supabase
    .from("certificates")
    .select("id, certificate_number, status, svc_type, issued_at")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle()

  // If user already has a holder certificate, redirect to main dashboard
  if (certificate) {
    redirect("/dashboard/member")
  }

  return (
    <OnboardingClient
      user={userProfile}
      kyc={kycData}
      userEmail={user.email!}
    />
  )
}
