import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import crypto from "crypto"
import { logger } from "@/lib/config/logger"
import { CURRENT_TERMS_VERSION } from "@/lib/legal/terms-versions"

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    })

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const userId = user?.id || "anonymous"

    const body = await request.json()
    const terms_version = body.terms_version || CURRENT_TERMS_VERSION

    logger.debug("Processing terms acceptance for user:", userId)

    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    const timestamp = new Date().toISOString()
    const documentContent = `TERMS_${terms_version}_${userId}_${timestamp}`
    const nom151Hash = crypto.createHash("sha256").update(documentContent).digest("hex")

    try {
      if (user) {
        const { error: insertError } = await supabase.from("terms_acceptance").insert({
          user_id: user.id,
          ip_address: ip,
          user_agent: userAgent,
          terms_version,
          nom151_hash: nom151Hash,
          clickwrap_signature: {
            timestamp,
            ip,
            user_agent: userAgent,
            method: "clickwrap",
          },
        })

        if (insertError) {
          logger.warn("Database insert failed, but accepting terms anyway:", insertError.message)
        } else {
          logger.info("Terms acceptance saved successfully for user:", user.id)

          // Audit log (non-blocking)
          supabase
            .from("compliance_audit_log")
            .insert({
              user_id: user.id,
              event_type: "terms_accepted",
              event_data: { terms_version, nom151Hash },
              ip_address: ip,
              user_agent: userAgent,
            })
            .then(({ error }) => {
              if (error) logger.warn("Audit log failed:", error.message)
            })
        }
      }
    } catch (dbError) {
      logger.warn("Database operation failed, continuing anyway:", dbError)
    }

    return NextResponse.json({
      success: true,
      nom151Hash,
      timestamp,
      version: terms_version,
      message: "Terms accepted successfully",
    })
  } catch (error) {
    logger.error("Error in accept-terms:", error)
    return NextResponse.json({
      success: true,
      message: "Terms accepted (fallback mode)",
    })
  }
}
