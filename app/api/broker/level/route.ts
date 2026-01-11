// app/api/broker/level/route.ts
// Endpoint para obtener el nivel actual del broker logueado

import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { getBrokerLevelInfo, updateBrokerLevel } from "@/lib/broker/broker-levels"

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener información completa del nivel
    const levelInfo = await getBrokerLevelInfo(user.id)

    return NextResponse.json({
      success: true,
      data: {
        brokerId: user.id,
        currentLevel: levelInfo.currentLevel,
        stats: levelInfo.stats,
        nextLevel: levelInfo.nextLevel,
        progressToNextLevel: levelInfo.progressToNextLevel,
        profile: {
          username: levelInfo.profile.username,
          display_name: levelInfo.profile.display_name,
          is_broker_elite: levelInfo.profile.is_broker_elite,
          total_weeks_sold: levelInfo.profile.total_weeks_sold,
          years_active: levelInfo.profile.years_active,
          bonuses_claimed: levelInfo.profile.bonuses_claimed,
        },
      },
    })
  } catch (error) {
    console.error("[v0] Error in broker level route:", error)
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 })
  }
}

// POST: Forzar recálculo del nivel (útil para admin o después de una venta)
export async function POST() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Actualizar nivel
    const result = await updateBrokerLevel(user.id)

    return NextResponse.json({
      success: true,
      data: {
        brokerId: result.broker_id,
        oldLevel: result.old_level_tag,
        newLevel: result.new_level_tag,
        stats: {
          total_weeks_sold: result.total_weeks_sold,
          years_active: result.years_active,
          num_affiliates: result.num_affiliates,
        },
        directCommissionRate: result.direct_commission_rate,
      },
    })
  } catch (error) {
    console.error("[v0] Error updating broker level:", error)
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 })
  }
}
