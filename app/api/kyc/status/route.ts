import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const { data: kyc } = await supabase
      .from("kyc_users")
      .select("status, persona_inquiry_id, persona_session_token, kyc_updated_at")
      .eq("user_id", user.id)
      .single()

    return NextResponse.json({
      status: kyc?.status || "missing",
      persona_inquiry_id: kyc?.persona_inquiry_id || null,
      persona_session_token: kyc?.persona_session_token || null,
      kyc_updated_at: kyc?.kyc_updated_at || null,
    })
  } catch (error: any) {
    console.error("KYC status error:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
