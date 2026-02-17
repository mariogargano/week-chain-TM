import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { generateTwoFactorSecret } from "@/lib/auth/two-factor"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] 2FA generate: Starting...")

    const supabase = await createServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    console.log("[v0] 2FA generate: User check -", user?.email, "Error:", authError?.message)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] 2FA generate: Generating secret for", user.email)
    const setup = await generateTwoFactorSecret(user.id, user.email!)
    console.log("[v0] 2FA generate: Success! QR generated")

    return NextResponse.json(setup)
  } catch (error) {
    console.error("[v0] 2FA generate error:", error)
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: "Failed to generate 2FA secret", details: message }, { status: 500 })
  }
}
