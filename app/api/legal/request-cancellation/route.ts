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
    const { escrow_tx, reason } = body

    if (!escrow_tx) {
      return NextResponse.json({ error: "ID de transacción requerido" }, { status: 400 })
    }

    // Find the voucher
    const { data: voucher, error: voucherError } = await supabase
      .from("purchase_vouchers")
      .select("*")
      .eq("id", escrow_tx)
      .eq("buyer_wallet", user.id)
      .single()

    if (voucherError || !voucher) {
      return NextResponse.json({ error: "Voucher no encontrado" }, { status: 404 })
    }

    const { data: canRefund, error: refundCheckError } = await supabase.rpc("can_refund_120h", {
      p_voucher_id: voucher.id,
    })

    if (refundCheckError) {
      console.error("[v0] Error checking refund window:", refundCheckError)
      return NextResponse.json({ error: "Error al verificar periodo de reembolso" }, { status: 500 })
    }

    if (!canRefund) {
      return NextResponse.json(
        {
          ok: false,
          error: "Plazo de 120h vencido",
          message: "El periodo de reflexión de 5 días (120 horas) ha expirado según NOM-029-SE-2021",
        },
        { status: 409 },
      )
    }

    // Create cancellation request (auto-approved within 120h window)
    const { data: cancellation, error: cancellationError } = await supabase
      .from("cancellation_requests")
      .insert({
        user_id: user.id,
        voucher_id: voucher.id,
        escrow_tx,
        reason,
        within_reflection_period: true, // Always true if we reach here
        refund_amount: voucher.amount_usd,
        status: "approved", // Auto-approved within 120h
      })
      .select()
      .single()

    if (cancellationError) {
      console.error("[v0] Error creating cancellation request:", cancellationError)
      return NextResponse.json({ error: "Error al crear solicitud" }, { status: 500 })
    }

    // Log to audit trail
    const ip = request.headers.get("x-forwarded-for") || "unknown"
    await supabase.from("compliance_audit_log").insert({
      user_id: user.id,
      event_type: "cancellation_requested",
      event_data: {
        voucher_id: voucher.id,
        within_reflection_period: true,
        reason,
        auto_approved: true,
      },
      ip_address: ip,
    })

    // Auto-approve and process refund (within 120h window)
    // TODO: Process actual refund via Stripe/blockchain
    await supabase.from("purchase_vouchers").update({ status: "cancelled" }).eq("id", voucher.id)

    return NextResponse.json({
      success: true,
      cancellation_id: cancellation.id,
      within_reflection_period: true,
      status: "approved",
      message: "Cancelación aprobada automáticamente (dentro del periodo de reflexión de 120h)",
    })
  } catch (error) {
    console.error("[v0] Error in request-cancellation:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
