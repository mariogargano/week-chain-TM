/**
 * WEEK-CHAIN Monitoring Cron Job
 * Runs SLA checks, alert generation, and workflow processing
 * Schedule: Every 5 minutes via Vercel Cron
 */

import { NextResponse } from "next/server"
import { runAllMonitoringChecks, getAlertStats } from "@/lib/monitoring/alerts"
import { processWorkflowQueue, checkSLABreaches } from "@/lib/workflows/engine"

// Verify cron secret to prevent unauthorized access
const CRON_SECRET = process.env.CRON_SECRET

export async function GET(request: Request) {
  // Verify authorization
  const authHeader = request.headers.get("authorization")
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  const startTime = Date.now()
  
  try {
    // 1. Process workflow queue
    const workflowsProcessed = await processWorkflowQueue(20)
    
    // 2. Check SLA breaches
    const slaBreaches = await checkSLABreaches()
    
    // 3. Run all monitoring checks
    const monitoringResults = await runAllMonitoringChecks()
    
    // 4. Get current alert stats
    const alertStats = await getAlertStats(1) // Last 24 hours
    
    const duration = Date.now() - startTime
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`,
      results: {
        workflowsProcessed,
        slaBreaches,
        monitoring: monitoringResults,
        alertStats,
      },
    })
  } catch (error) {
    console.error("Monitoring cron error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}

// Vercel Cron config
export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60
