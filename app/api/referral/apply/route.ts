import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// API para aplicar un código de referido a un usuario
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { referral_code, user_id } = body

    if (!referral_code || !user_id) {
      return NextResponse.json({ error: "referral_code y user_id son requeridos" }, { status: 400 })
    }

    // Llamar a la función de Supabase para registrar el referido
    const { data, error } = await supabase.rpc("register_referral", {
      p_referral_code: referral_code,
      p_new_user_id: user_id,
    })

    if (error) {
      console.error("Error registering referral:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: "Código de referido no válido" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Código de referido aplicado correctamente",
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("Error in apply referral API:", error)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
