import { type NextRequest, NextResponse } from "next/server"
import { resend, FROM_EMAIL } from "@/lib/email/resend-client"
import { WelcomeEmail } from "@/lib/email/templates/welcome-email"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, userName } = body

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Welcome to WeekChain - Your Journey Begins!",
      react: WelcomeEmail({ userName: userName || "there", userEmail: email }),
    })

    if (error) {
      console.error("[v0] Error sending welcome email:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("[v0] Error in send-welcome route:", error)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
