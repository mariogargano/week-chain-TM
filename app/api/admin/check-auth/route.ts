import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { checkAdminAuth } from "@/lib/auth/admin-guard"
import { checkRateLimit, AUTH_RATE_LIMIT } from "@/lib/security/rate-limiter"

/**
 * Admin authentication check endpoint
 * Used by admin pages to verify authorization
 */
export async function GET() {
  // F-07 FIX: Rate limiting for auth endpoints
  const headersList = await headers()
  const ip = headersList.get("x-forwarded-for")?.split(",")[0] || 
             headersList.get("x-real-ip") || 
             "unknown"
  
  const rateLimit = checkRateLimit(`check-auth:${ip}`, AUTH_RATE_LIMIT)
  
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later.", authorized: false },
      { 
        status: 429,
        headers: {
          "X-RateLimit-Remaining": rateLimit.remaining.toString(),
          "X-RateLimit-Reset": rateLimit.resetTime.toString(),
        }
      }
    )
  }

  const adminData = await checkAdminAuth()

  if (!adminData) {
    return NextResponse.json({ error: "Unauthorized", authorized: false }, { status: 403 })
  }

  return NextResponse.json({
    authorized: true,
    email: adminData.email,
    role: adminData.role,
  })
}
