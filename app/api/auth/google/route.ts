import { NextResponse } from "next/server"
import { googleAuth } from "@/lib/google-auth/client"
import { logger } from "@/lib/config/logger"

function generateRandomState(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("")
}

export async function GET(request: Request) {
  try {
    // Get referral code from URL if present
    let referralCode = ""
    try {
      const url = new URL(request.url)
      referralCode = url.searchParams.get("ref") || ""
    } catch {
      logger.debug("Could not parse URL for referral code")
    }

    logger.info("Google OAuth: Starting authentication flow")

    if (!googleAuth.isConfigured()) {
      logger.error("Google OAuth not configured - missing credentials")
      return NextResponse.json(
        { error: "Google authentication is not configured. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET." },
        { status: 503 },
      )
    }

    const randomState = generateRandomState()
    const authUrl = googleAuth.getAuthUrl(randomState)

    logger.info("Google OAuth: Generated auth URL successfully")

    const response = NextResponse.redirect(authUrl)

    const isProduction = process.env.NODE_ENV === "production"
    const host = request.headers.get("host") || ""
    const isMainDomain = host.includes("week-chain.com")

    const cookieOptions = {
      httpOnly: true,
      secure: isProduction || host.includes("localhost") === false,
      sameSite: "lax" as const,
      maxAge: 600,
      path: "/",
      // Only set domain if we are on the main domain, to avoid issues on Vercel preview URLs
      ...(isMainDomain && { domain: ".week-chain.com" }),
    }

    response.cookies.set("google_oauth_state", randomState, cookieOptions)

    if (referralCode) {
      response.cookies.set("google_oauth_referral", referralCode, cookieOptions)
    }

    console.log("[v0] OAuth state set:", randomState.substring(0, 10) + "...")

    return response
  } catch (error) {
    logger.error("Error initiating Google OAuth:", error)
    return NextResponse.json({ error: "Failed to initiate Google authentication" }, { status: 500 })
  }
}
