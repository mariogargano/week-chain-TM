import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { getCurrentTermsVersion, needsReAcceptance } from "@/lib/legal/terms-versions"
import { logger } from "@/lib/config/logger"

export async function GET() {
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

    if (!user) {
      return NextResponse.json({
        needsAcceptance: true,
        currentVersion: getCurrentTermsVersion().version,
        reason: "not_authenticated",
      })
    }

    // Get user's latest terms acceptance
    const { data: acceptance } = await supabase
      .from("terms_acceptance")
      .select("terms_version, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    const userVersion = acceptance?.terms_version || null
    const currentVersion = getCurrentTermsVersion()
    const needsAcceptance = needsReAcceptance(userVersion)

    logger.debug("Terms check:", {
      userId: user.id,
      userVersion,
      currentVersion: currentVersion.version,
      needsAcceptance,
    })

    return NextResponse.json({
      needsAcceptance,
      currentVersion: currentVersion.version,
      userVersion,
      changes: needsAcceptance ? currentVersion.changes : [],
    })
  } catch (error) {
    logger.error("Error checking terms:", error)
    return NextResponse.json(
      {
        needsAcceptance: true,
        currentVersion: getCurrentTermsVersion().version,
        reason: "error",
      },
      { status: 500 },
    )
  }
}
