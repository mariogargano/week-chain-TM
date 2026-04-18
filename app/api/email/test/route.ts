import { type NextRequest, NextResponse } from "next/server"
import { sendEmail } from "@/lib/email/send-email"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, templateType, context } = body

    if (!to || !templateType) {
      return NextResponse.json({ error: "Missing required fields: to, templateType" }, { status: 400 })
    }

    const result = await sendEmail({
      to,
      templateType,
      context: context || {},
      metadata: { test: true },
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Error in POST /api/email/test:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
