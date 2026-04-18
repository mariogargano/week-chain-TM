import { NextResponse } from "next/server"
import { getLatestCapacityStatus, runCapacityEngineCalculation } from "@/lib/capacity-engine/engine"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    let status = await getLatestCapacityStatus()

    // If no status exists, run calculation first
    if (!status) {
      status = await runCapacityEngineCalculation()
    }

    if (!status) {
      return NextResponse.json({ error: "Failed to calculate capacity" }, { status: 500 })
    }

    return NextResponse.json({
      systemStatus: status.systemStatus,
      utilizationPct: status.capacityUtilizationPct,
      totalSupplyWeeks: status.totalSupplyWeeks,
      safeCapacity: status.safeCapacity,
      projectedDemand: status.projectedDemand,
      activeProperties: status.activeProperties,
      certificates: {
        silver: status.totalCertificatesSilver,
        gold: status.totalCertificatesGold,
        platinum: status.totalCertificatesPlatinum,
        signature: status.totalCertificatesSignature,
      },
      salesEnabled: {
        silver: status.silverSalesEnabled,
        gold: status.goldSalesEnabled,
        platinum: status.platinumSalesEnabled,
        signature: status.signatureSalesEnabled,
      },
      waitlistEnabled: status.waitlistEnabled,
      waitlistCount: status.waitlistCount,
      calculatedAt: status.calculatedAt,
    })
  } catch (error) {
    console.error("[v0] Capacity metrics error:", error)
    return NextResponse.json({ error: "Failed to fetch capacity metrics" }, { status: 500 })
  }
}
