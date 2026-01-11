import { type NextRequest, NextResponse } from "next/server"
import { resend, MANAGEMENT_EMAIL } from "@/lib/email/resend-client"
import { KYCStatusEmail } from "@/lib/email/templates/kyc-status"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, userName, status, reason } = body

    if (!email || !status) {
      return NextResponse.json({ error: "Email and status are required" }, { status: 400 })
    }

    if (!["approved", "rejected", "pending"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const statusText = {
      approved: "Approved",
      rejected: "Requires Attention",
      pending: "In Progress",
    }[status]

    const { data, error } = await resend.emails.send({
      from: MANAGEMENT_EMAIL,
      to: email,
      subject: `KYC Verification ${statusText}`,
      react: KYCStatusEmail({
        userName: userName || "there",
        status: status as "approved" | "rejected" | "pending",
        reason,
      }),
    })

    if (error) {
      console.error("[v0] Error sending KYC status email:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("[v0] Error in send-kyc-status route:", error)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
