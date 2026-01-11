import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ verified: false, error: "Not authenticated" })
    }

    const { data: kycData } = await supabase.from("kyc_users").select("status").eq("user_id", user.id).single()

    return NextResponse.json({
      verified: kycData?.status === "approved",
      status: kycData?.status || "not_started",
    })
  } catch (error) {
    console.error("[v0] Error checking KYC status:", error)
    return NextResponse.json({ verified: false, error: "Error checking KYC status" })
  }
}
