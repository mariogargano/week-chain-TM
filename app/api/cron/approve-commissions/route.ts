/**
 * Cron job to auto-approve commissions after hold period
 * Should run daily via Vercel Cron or similar
 */

import { type NextRequest, NextResponse } from "next/server"
import { approveDueCommissions } from "@/lib/intermediary/flows"

export async function GET(req: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const result = await approveDueCommissions()

  return NextResponse.json(result)
}
