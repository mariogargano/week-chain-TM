import { NextRequest, NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const eventName = body?.data?.attributes?.name || body?.data?.attributes?.status
    const inquiryId = body?.data?.relationships?.inquiry?.data?.id || body?.data?.id

    if (!inquiryId) {
      return NextResponse.json({ error: "Missing inquiry ID" }, { status: 400 })
    }

    // Use service role to bypass RLS - webhook has no user session
    const supabase = createServiceRoleClient()

    // Map Persona statuses to our internal statuses
    let newStatus: string
    if (eventName === "completed" || eventName === "approved") {
      newStatus = "approved"
    } else if (eventName === "failed" || eventName === "declined") {
      newStatus = "rejected"
    } else if (eventName === "needs_review" || eventName === "pending") {
      newStatus = "review"
    } else {
      newStatus = "pending"
    }

    // Update KYC status by persona_inquiry_id
    const { error } = await supabase
      .from("kyc_users")
      .update({
        status: newStatus,
        kyc_updated_at: new Date().toISOString(),
      })
      .eq("persona_inquiry_id", inquiryId)

    if (error) {
      console.error("Persona webhook DB error:", error)
      return NextResponse.json({ error: "DB update failed" }, { status: 500 })
    }

    // If approved, also update the users table kyc_status
    if (newStatus === "approved") {
      const { data: kycRow } = await supabase
        .from("kyc_users")
        .select("user_id")
        .eq("persona_inquiry_id", inquiryId)
        .single()

      if (kycRow?.user_id) {
        await supabase
          .from("users")
          .update({ kyc_status: "approved" })
          .eq("id", kycRow.user_id)
      }
    }

    return NextResponse.json({ received: true, status: newStatus })
  } catch (error: any) {
    console.error("Persona webhook error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
