import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { acceptanceType, termsVersion, ipAddress, userAgent, country, language } = body

    // Registrar aceptación legal
    const { error } = await supabase.from("legal_acceptances").insert({
      user_id: user.id,
      acceptance_type: acceptanceType,
      terms_version: termsVersion,
      ip_address: ipAddress,
      user_agent: userAgent,
      country: country,
      language: language,
    })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error recording acceptance:", error)
    return NextResponse.json({ error: "Error al registrar aceptación" }, { status: 500 })
  }
}
