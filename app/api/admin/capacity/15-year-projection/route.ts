import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Check admin auth
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify admin role
    const { data: adminUser } = await supabase.from("admin_users").select("*").eq("user_id", user.id).single()

    if (!adminUser || adminUser.status !== "active") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get all active certificates
    const { data: certificates } = await supabase
      .from("user_certificates")
      .select("tier_id, weeks_per_year, start_date, end_date")
      .eq("status", "active")

    // Get total supply capacity
    const { data: supplyProps } = await supabase
      .from("supply_properties")
      .select("total_weeks_capacity")
      .eq("status", "active")

    const totalSupply = supplyProps?.reduce((sum, p) => sum + (p.total_weeks_capacity || 0), 0) || 0

    // Project demand for next 15 years
    const projections = []
    const currentYear = new Date().getFullYear()

    for (let year = 0; year < 15; year++) {
      const targetYear = currentYear + year

      // Count active certificates in this year
      const activeCerts =
        certificates?.filter((c) => {
          const startYear = new Date(c.start_date).getFullYear()
          const endYear = new Date(c.end_date).getFullYear()
          return targetYear >= startYear && targetYear <= endYear
        }) || []

      const demandWeeks = activeCerts.reduce((sum, c) => sum + (c.weeks_per_year || 0), 0)
      const utilizationPct = totalSupply > 0 ? (demandWeeks / totalSupply) * 100 : 0

      let riskLevel = "LOW"
      if (utilizationPct >= 85) riskLevel = "CRITICAL"
      else if (utilizationPct >= 75) riskLevel = "HIGH"
      else if (utilizationPct >= 60) riskLevel = "MEDIUM"

      projections.push({
        year: targetYear,
        yearOffset: year,
        demandWeeks,
        supplyWeeks: totalSupply,
        utilizationPct: Math.round(utilizationPct * 10) / 10,
        riskLevel,
        activeCertificates: activeCerts.length,
      })
    }

    return NextResponse.json({ projections })
  } catch (error) {
    console.error("Error calculating 15-year projection:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
