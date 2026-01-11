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

    // Get global capacity metrics
    const { data: capacityStatus } = await supabase
      .from("capacity_engine_status")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .single()

    // Get active supply properties count
    const { count: totalSupply } = await supabase
      .from("supply_properties")
      .select("*", { count: "exact", head: true })
      .eq("status", "active")

    // Get active certificates per tier
    const { data: certificates } = await supabase.from("user_certificates").select("tier_id").eq("status", "active")

    const tierCounts = {
      silver: certificates?.filter((c) => c.tier_id === "silver").length || 0,
      gold: certificates?.filter((c) => c.tier_id === "gold").length || 0,
      platinum: certificates?.filter((c) => c.tier_id === "platinum").length || 0,
      signature: certificates?.filter((c) => c.tier_id === "signature").length || 0,
    }

    // Get active countries
    const { data: countries } = await supabase.from("supply_properties").select("country").eq("status", "active")

    const uniqueCountries = [...new Set(countries?.map((p) => p.country) || [])]

    // Calculate system health status
    const utilizationPct = capacityStatus?.current_utilization_percentage || 0
    let systemStatus = "GREEN"
    if (utilizationPct >= 85) systemStatus = "RED"
    else if (utilizationPct >= 75) systemStatus = "ORANGE"
    else if (utilizationPct >= 60) systemStatus = "YELLOW"

    // Get pending reservation requests
    const { count: pendingRequests } = await supabase
      .from("reservation_requests")
      .select("*", { count: "exact", head: true })
      .in("status", ["requested", "processing"])

    // Get waitlist count
    const { count: waitlistCount } = await supabase
      .from("certificate_waitlist")
      .select("*", { count: "exact", head: true })
      .eq("status", "waiting")

    return NextResponse.json({
      globalMetrics: {
        totalSupplyWeeks: capacityStatus?.total_capacity_weeks || 0,
        safeCapacityWeeks: Math.floor((capacityStatus?.total_capacity_weeks || 0) * 0.7),
        currentUtilization: utilizationPct,
        systemStatus,
        totalSupplyProperties: totalSupply || 0,
        activeCountries: uniqueCountries.length,
        pendingRequests: pendingRequests || 0,
        waitlistSize: waitlistCount || 0,
      },
      certificatesActive: tierCounts,
      stopSaleFlags: {
        silver: capacityStatus?.silver_sales_stopped || false,
        gold: capacityStatus?.gold_sales_stopped || false,
        platinum: capacityStatus?.platinum_sales_stopped || false,
        signature: capacityStatus?.signature_sales_stopped || false,
      },
      capacityStatus,
    })
  } catch (error) {
    console.error("Error fetching global capacity status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
