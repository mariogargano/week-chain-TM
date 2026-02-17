import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const { data: activePurchases } = await supabase
      .from("payments")
      .select("id, status, amount, properties(name)")
      .eq("user_id", user.id)
      .in("status", ["cooling_off", "completed"])

    if (activePurchases && activePurchases.length > 0) {
      return NextResponse.json(
        {
          error: "No puedes eliminar tu cuenta con compras activas",
          details: {
            active_purchases: activePurchases.length,
            purchases: activePurchases.map((p) => ({
              order_id: p.id,
              status: p.status,
            })),
          },
        },
        { status: 400 },
      )
    }

    const deletedAt = new Date().toISOString()
    const anonymizedEmail = `deleted_${user.id}@weekchain.deleted`

    await supabase
      .from("users")
      .update({
        email: anonymizedEmail,
        full_name: "[CUENTA ELIMINADA]",
        phone: null,
        device_fingerprint: null,
        signup_ip: null,
        last_login_ip: null,
        referral_code: null,
        status: "deleted",
        deleted_at: deletedAt,
      })
      .eq("id", user.id)

    await supabase.from("fraud_alerts").insert({
      user_id: user.id,
      alert_type: "account_deletion",
      severity: "low",
      details: {
        deleted_at: deletedAt,
        reason: "User requested GDPR deletion",
      },
      status: "action_taken",
    })

    await supabase.auth.signOut()

    return NextResponse.json({
      success: true,
      message: "Tu cuenta ha sido eliminada exitosamente",
    })
  } catch (error: any) {
    console.error("Account deletion error:", error)
    return NextResponse.json({ error: "Error al eliminar cuenta: " + error.message }, { status: 500 })
  }
}
