import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

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
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const body = await request.json()
    const { privacy_version, marketing_consent, data_sharing_consent } = body

    // Get IP
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

    // Insert privacy acceptance
    const { error: insertError } = await supabase.from("privacy_acceptance").insert({
      user_id: user.id,
      ip_address: ip,
      privacy_version,
      marketing_consent: marketing_consent || false,
      data_sharing_consent: data_sharing_consent || false,
    })

    if (insertError) {
      console.error("[v0] Error inserting privacy acceptance:", insertError)
      return NextResponse.json({ error: "Error al guardar aceptación" }, { status: 500 })
    }

    // Log to audit trail
    await supabase.from("compliance_audit_log").insert({
      user_id: user.id,
      event_type: "privacy_accepted",
      event_data: { privacy_version, marketing_consent, data_sharing_consent },
      ip_address: ip,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error in accept-privacy:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
