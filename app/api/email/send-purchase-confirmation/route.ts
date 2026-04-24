import { type NextRequest, NextResponse } from "next/server"
import { resend, FROM_EMAIL } from "@/lib/email/resend-client"
import { PurchaseConfirmation } from "@/lib/email/templates/purchase-confirmation"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, userName, propertyName, weekNumber, purchaseAmount, transactionId } = body

    if (!email || !propertyName || !weekNumber || !purchaseAmount || !transactionId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Purchase Confirmed - Week ${weekNumber} at ${propertyName}`,
      react: PurchaseConfirmation({
        userName: userName || "there",
        propertyName,
        weekNumber,
        purchaseAmount,
        transactionId,
      }),
    })

    if (error) {
      console.error("[v0] Error sending purchase confirmation:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("[v0] Error in send-purchase-confirmation route:", error)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
