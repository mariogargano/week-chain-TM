import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { visitor_fingerprint, visitor_ip, visitor_country, referrer_name, referrer_email, referrer_phone } = body

    if (!visitor_fingerprint) {
      return NextResponse.json({ error: "visitor_fingerprint is required" }, { status: 400 })
    }

    // Llamar a la función de Supabase para crear referido anónimo
    const { data, error } = await supabase.rpc("create_anonymous_referral", {
      p_visitor_fingerprint: visitor_fingerprint,
      p_visitor_ip: visitor_ip || null,
      p_visitor_country: visitor_country || null,
      p_referrer_name: referrer_name || null,
      p_referrer_email: referrer_email || null,
      p_referrer_phone: referrer_phone || null,
    })

    if (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("[DEV] Error creating anonymous referral:", error)
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data || !Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ error: "Invalid response from database function" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      referral_code: data[0].referral_code,
      referral_id: data[0].referral_id,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"

    if (process.env.NODE_ENV === "development") {
      console.error("[DEV] Error in generate referral API:", error)
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
