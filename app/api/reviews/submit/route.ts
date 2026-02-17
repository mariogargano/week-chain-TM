import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const body = await request.json()
    const { certificateNumber, rating, reviewText } = body

    // Validate inputs
    if (!certificateNumber || !rating || !reviewText || reviewText.length < 50) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })
    }

    const { data: voucher, error: voucherError } = await supabase
      .from("purchase_vouchers")
      .select("id, user_id")
      .eq("voucher_code", certificateNumber.toUpperCase())
      .eq("user_id", user.id)
      .single()

    if (voucherError || !voucher) {
      return NextResponse.json({ error: "Certificado no encontrado o no pertenece al usuario" }, { status: 403 })
    }

    const { error: insertError } = await supabase.from("testimonials").insert({
      user_id: user.id,
      voucher_id: voucher.id,
      rating,
      content: reviewText,
      author_first_name: user.user_metadata?.full_name?.split(" ")[0] || "Usuario",
      author_last_name: user.user_metadata?.full_name?.split(" ")[1] || "Anónimo",
      status: "pending", // Requires admin approval
      is_approved: false,
    })

    if (insertError) {
      console.error("[API] Error creating review:", insertError)
      return NextResponse.json({ error: "Error al guardar review" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[API] Review submission error:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
