import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get("code")

    if (!code) {
      return NextResponse.json({ valid: false, error: "Código requerido" }, { status: 400 })
    }

    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from("purchase_vouchers")
      .select("id, voucher_code, status, user_id, property_id, week_id")
      .eq("voucher_code", code.toUpperCase())
      .eq("status", "active")
      .single()

    if (error || !data) {
      return NextResponse.json({ valid: false }, { status: 200 })
    }

    return NextResponse.json({
      valid: true,
      certificate: {
        code: data.voucher_code,
        propertyId: data.property_id,
        weekId: data.week_id,
      },
    })
  } catch (error) {
    console.error("[API] Voucher verification error:", error)
    return NextResponse.json({ valid: false, error: "Error interno" }, { status: 500 })
  }
}
