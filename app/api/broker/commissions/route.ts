import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { getBrokerCommissionRate } from "@/lib/broker/broker-levels"

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Get broker commissions with reservation details
    const { data: commissions, error } = await supabase
      .from("broker_commissions")
      .select(
        `
        *,
        reservations (
          *,
          weeks (price, week_number),
          properties (name)
        )
      `,
      )
      .eq("broker_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching commissions:", error)
      return NextResponse.json({ error: "Error al obtener comisiones" }, { status: 500 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select(`
        broker_level_id,
        total_weeks_sold,
        broker_levels (
          tag,
          display_name,
          direct_commission_rate
        )
      `)
      .eq("id", user.id)
      .single()

    // Get current commission rate
    const directCommissionRate = await getBrokerCommissionRate(user.id)

    // Calculate totals
    const totalCommissions = commissions?.reduce((sum, c) => sum + (c.commission_amount_usdc || 0), 0) || 0
    const pendingCommissions =
      commissions?.filter((c) => c.status === "pending").reduce((sum, c) => sum + (c.commission_amount_usdc || 0), 0) ||
      0
    const paidCommissions =
      commissions?.filter((c) => c.status === "paid").reduce((sum, c) => sum + (c.commission_amount_usdc || 0), 0) || 0

    return NextResponse.json({
      commissions,
      brokerLevel: {
        tag: (profile?.broker_levels as any)?.tag || "BROKER",
        displayName: (profile?.broker_levels as any)?.display_name || "Broker",
        directCommissionRate,
      },
      stats: {
        totalCommissions,
        pendingCommissions,
        paidCommissions,
        totalWeeksSold: profile?.total_weeks_sold || 0,
      },
    })
  } catch (error) {
    console.error("[v0] Error in commissions route:", error)
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 })
  }
}
