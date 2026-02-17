import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { enableTwoFactor } from "@/lib/auth/two-factor"

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 })
    }

    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const success = await enableTwoFactor(user.id, code)

    if (!success) {
      return NextResponse.json({ error: "Invalid code" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("2FA enable error:", error)
    return NextResponse.json({ error: "Failed to enable 2FA" }, { status: 500 })
  }
}
