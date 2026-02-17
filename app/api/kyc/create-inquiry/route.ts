import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { logger } from "@/lib/config/logger"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { userId, userEmail } = body

    if (!process.env.PERSONA_API_KEY) {
      logger.error("Persona API key not configured")
      return NextResponse.json({ error: "Persona API key not configured" }, { status: 500 })
    }

    const response = await fetch("https://withpersona.com/api/v1/inquiries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PERSONA_API_KEY}`,
        "Persona-Version": "2023-01-05",
      },
      body: JSON.stringify({
        data: {
          type: "inquiry",
          attributes: {
            "inquiry-template-id": process.env.PERSONA_TEMPLATE_ID || "itmpl_default",
            "reference-id": userId || user.id,
            "redirect-uri": `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/kyc/complete`,
          },
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      logger.error("Persona API error:", errorText)
      return NextResponse.json({ error: "Failed to create inquiry" }, { status: 500 })
    }

    const data = await response.json()
    const inquiryId = data.data.id
    const sessionToken = data.data.attributes["session-token"]

    await supabase.from("kyc_users").upsert(
      {
        wallet: user.user_metadata?.wallet_address || "",
        email: userEmail || user.email || "",
        name: user.user_metadata?.full_name || "",
        status: "pending",
        persona_inquiry_id: inquiryId,
        submitted_at: new Date().toISOString(),
      },
      {
        onConflict: "email",
      },
    )

    logger.info("Persona inquiry created successfully", { inquiryId })
    return NextResponse.json({ inquiryId, sessionToken })
  } catch (error) {
    logger.error("Error creating Persona inquiry:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
