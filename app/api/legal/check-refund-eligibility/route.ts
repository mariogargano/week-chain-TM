import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const type = searchParams.get("type") || "voucher" // 'voucher' or 'booking'

    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 })
    }

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

    // Call the SQL function to get eligibility details
    const { data, error } = await supabase.rpc("get_refund_eligibility", {
      p_id: id,
      p_type: type,
    })

    if (error) {
      console.error("[v0] Error checking refund eligibility:", error)
      return NextResponse.json({ error: "Error al verificar elegibilidad" }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: "No se encontró el registro" }, { status: 404 })
    }

    const eligibility = data[0]

    return NextResponse.json({
      eligible: eligibility.eligible,
      hours_remaining: Math.floor(eligibility.hours_remaining),
      deadline: eligibility.deadline,
      reason: eligibility.reason,
      can_auto_approve: eligibility.eligible,
      message: eligibility.eligible
        ? `Tienes ${Math.floor(eligibility.hours_remaining)} horas restantes para cancelar con reembolso automático`
        : "El periodo de reflexión de 120 horas ha expirado. Tu solicitud será revisada manualmente.",
    })
  } catch (error) {
    console.error("[v0] Error in check-refund-eligibility:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
