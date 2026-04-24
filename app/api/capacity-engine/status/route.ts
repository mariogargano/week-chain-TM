import { NextResponse } from "next/server"
import { getLatestCapacityStatus, runCapacityEngineCalculation } from "@/lib/capacity-engine"

export async function GET() {
  try {
    // Get latest status
    let status = await getLatestCapacityStatus()

    // If no status exists or it's older than 5 minutes, recalculate
    if (!status) {
      status = await runCapacityEngineCalculation()
    } else {
      const calculatedAt = new Date(status.calculatedAt)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)

      if (calculatedAt < fiveMinutesAgo) {
        status = await runCapacityEngineCalculation()
      }
    }

    if (!status) {
      // Return default status if calculation fails
      return NextResponse.json({
        systemStatus: "GREEN",
        capacityUtilizationPct: 0,
        silverSalesEnabled: true,
        goldSalesEnabled: true,
        platinumSalesEnabled: true,
        signatureSalesEnabled: true,
        waitlistEnabled: false,
        waitlistCount: 0,
      })
    }

    return NextResponse.json(status)
  } catch (error) {
    console.error("[API] Capacity status error:", error)
    return NextResponse.json({ error: "Failed to get capacity status" }, { status: 500 })
  }
}
