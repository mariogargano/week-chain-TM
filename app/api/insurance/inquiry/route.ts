import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { full_name, email, phone, insurance_type, message } = body

    if (!full_name || !email || !insurance_type) {
      return NextResponse.json(
        { error: "Nombre, email y tipo de seguro son obligatorios." },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "El formato de email no es valido." },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { error } = await supabase.from("insurance_inquiries").insert({
      full_name: full_name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || null,
      insurance_type,
      message: message?.trim() || null,
      status: "new",
    })

    if (error) {
      console.error("[InsuranceInquiry] DB error:", error)
      return NextResponse.json(
        { error: "Error al guardar la solicitud. Intenta de nuevo." },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[InsuranceInquiry] Unexpected error:", err)
    return NextResponse.json(
      { error: "Error inesperado. Intenta de nuevo." },
      { status: 500 }
    )
  }
}
