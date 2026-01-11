import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const referralCode = searchParams.get("code")

    if (!referralCode) {
      return NextResponse.json({ error: "Código de referido requerido" }, { status: 400 })
    }

    // Obtener estadísticas del referido anónimo
    const { data: referralData, error: referralError } = await supabase
      .from("anonymous_referrals")
      .select("*")
      .eq("referral_code", referralCode)
      .single()

    if (referralError) {
      return NextResponse.json({ error: "Código de referido no encontrado" }, { status: 404 })
    }

    // Obtener conversiones
    const { data: conversions, error: conversionsError } = await supabase
      .from("anonymous_referral_conversions")
      .select("*")
      .eq("anonymous_referral_id", referralData.id)
      .order("created_at", { ascending: false })

    return NextResponse.json({
      success: true,
      referral: referralData,
      conversions: conversions || [],
    })
  } catch (error: any) {
    console.error("Error in referral stats API:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
