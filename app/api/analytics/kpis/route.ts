/**
 * WEEK-CHAIN KPIs API
 * Returns role-based KPI data for dashboards
 */

import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getKPIsForRole, getAdminDashboardData } from "@/lib/analytics/kpis"

export async function GET(request: Request) {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  // Get user role
  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single()
  
  const role = userData?.role || "user"
  
  // Check query params
  const url = new URL(request.url)
  const requestedRole = url.searchParams.get("role")
  const fullDashboard = url.searchParams.get("full") === "true"
  
  // Admin can request any role's KPIs
  const isAdmin = ["admin", "super_admin"].includes(role)
  const effectiveRole = isAdmin && requestedRole ? requestedRole : role
  
  try {
    if (fullDashboard && isAdmin) {
      // Return full admin dashboard
      const dashboardData = await getAdminDashboardData()
      return NextResponse.json({
        success: true,
        role: "admin",
        dashboard: dashboardData,
        timestamp: new Date().toISOString(),
      })
    }
    
    // Return role-specific KPIs
    const kpiData = await getKPIsForRole(effectiveRole)
    
    return NextResponse.json({
      success: true,
      ...kpiData,
    })
  } catch (error) {
    console.error("KPI calculation error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to calculate KPIs",
    }, { status: 500 })
  }
}

export const dynamic = "force-dynamic"
