import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { getTwoFactorConfig } from "@/lib/auth/two-factor"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const config = await getTwoFactorConfig(user.id)

    if (!config) {
      return NextResponse.json({
        enabled: false,
        enabled_at: null,
        last_used_at: null,
      })
    }

    return NextResponse.json({
      enabled: config.enabled,
      enabled_at: config.enabled_at,
      last_used_at: config.last_used_at,
    })
  } catch (error) {
    console.error("2FA status error:", error)
    return NextResponse.json({ error: "Failed to get 2FA status" }, { status: 500 })
  }
}
