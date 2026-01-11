import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { data } = body

    if (!data || data.type !== "inquiry") {
      return NextResponse.json({ success: true })
    }

    const inquiryId = data.id
    const status = data.attributes.status
    const referenceId = data.attributes["reference-id"]

    const supabase = await createClient()

    let kycStatus = "pending"
    if (status === "completed" || status === "approved") {
      kycStatus = "approved"
    } else if (status === "failed" || status === "declined") {
      kycStatus = "rejected"
    }

    const { error: updateError } = await supabase
      .from("kyc_users")
      .update({
        status: kycStatus,
        reviewed_at: new Date().toISOString(),
      })
      .eq("persona_inquiry_id", inquiryId)

    if (updateError) {
      console.error("[v0] Error updating KYC status:", updateError)
    }

    const { data: kycUser } = await supabase
      .from("kyc_users")
      .select("email, name")
      .eq("persona_inquiry_id", inquiryId)
      .single()

    if (kycUser && (kycStatus === "approved" || kycStatus === "rejected")) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/email/send-kyc-status`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: kycUser.email,
            userName: kycUser.name,
            status: kycStatus,
          }),
        })
      } catch (emailError) {
        console.error("[v0] Failed to send KYC status email:", emailError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
