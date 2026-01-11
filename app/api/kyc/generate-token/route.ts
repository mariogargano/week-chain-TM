import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { logger } from "@/lib/config/logger"
import crypto from "crypto"

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
    const { userId, levelName } = body

    if (!process.env.SUMSUB_APP_TOKEN || !process.env.SUMSUB_SECRET_KEY) {
      logger.error("Sumsub credentials not configured")
      return NextResponse.json({ error: "Sumsub credentials not configured" }, { status: 500 })
    }

    const externalUserId = userId || user.id
    const ts = Math.floor(Date.now() / 1000)
    const method = "POST"
    const url = `/resources/accessTokens?userId=${externalUserId}&levelName=${levelName || "basic-kyc-level"}&ttlInSecs=600`

    const signature = crypto
      .createHmac("sha256", process.env.SUMSUB_SECRET_KEY)
      .update(ts + method + url)
      .digest("hex")

    const response = await fetch(`https://api.sumsub.com${url}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-App-Token": process.env.SUMSUB_APP_TOKEN,
        "X-App-Access-Sig": signature,
        "X-App-Access-Ts": ts.toString(),
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      logger.error("Sumsub API error:", errorText)
      return NextResponse.json({ error: "Failed to generate access token" }, { status: 500 })
    }

    const data = await response.json()

    await supabase.from("kyc_users").upsert(
      {
        wallet: user.user_metadata?.wallet_address || "",
        email: user.email || "",
        name: user.user_metadata?.full_name || "",
        status: "pending",
        sumsub_applicant_id: externalUserId,
        submitted_at: new Date().toISOString(),
      },
      {
        onConflict: "email",
      },
    )

    logger.info("Sumsub token generated successfully", { userId: externalUserId })
    return NextResponse.json({ token: data.token, userId: externalUserId })
  } catch (error) {
    logger.error("Error generating Sumsub token:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
