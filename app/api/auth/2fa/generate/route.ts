import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { generateTwoFactorSecret } from "@/lib/auth/two-factor";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const setup = await generateTwoFactorSecret(user.id, user.email!)
    return NextResponse.json(setup)
  } catch (error) {
    console.error("[v0] 2FA generate error:", error)
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: "Failed to generate 2FA secret", details: message }, { status: 500 })
  }
}
