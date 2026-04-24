import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get("code")
  if (!code) return NextResponse.json({ error: "code required" }, { status: 400 })

  try {
    const supabase = await createClient()
    const { data: profile } = await supabase
      .from("intermediary_profiles")
      .select("display_name, status, referral_code")
      .eq("referral_code", code)
      .maybeSingle()

    if (!profile || profile.status !== "active") {
      return NextResponse.json({ exists: false })
    }

    return NextResponse.json({
      exists: true,
      displayName: profile.display_name || "tu agente",
      referralCode: profile.referral_code,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
