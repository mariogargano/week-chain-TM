// WEEK-CHAIN Capacity Engine - Core Logic
import { createClient } from "@/lib/supabase/server"
import {
  type CertificateTier,
  type SystemStatus,
  type CapacityEngineStatus,
  CAPACITY_THRESHOLDS,
  SAFETY_FACTOR,
  EXPECTED_USAGE_RATES,
  CERTIFICATE_WEEKS,
  BETA_CONFIG,
} from "./types"

/**
 * Calculate total supply weeks from all active properties
 */
export async function calculateTotalSupplyWeeks(): Promise<number> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("supply_properties")
    .select("supply_weeks_per_year")
    .eq("status", "active")

  if (error || !data) {
    console.error("[CapacityEngine] Error fetching supply:", error)
    return 0
  }

  return data.reduce((sum, prop) => sum + (prop.supply_weeks_per_year || 48), 0)
}

/**
 * Calculate safe capacity (70% of total supply)
 */
export function calculateSafeCapacity(totalSupplyWeeks: number): number {
  return Math.floor(totalSupplyWeeks * SAFETY_FACTOR)
}

/**
 * Calculate projected demand based on active certificates
 */
export async function calculateProjectedDemand(): Promise<{
  demand: number
  counts: Record<CertificateTier, number>
}> {
  const supabase = await createClient()

  const { data, error } = await supabase.from("user_certificates").select("tier").eq("status", "active")

  if (error || !data) {
    console.error("[CapacityEngine] Error fetching certificates:", error)
    return {
      demand: 0,
      counts: { Silver: 0, Gold: 0, Platinum: 0, Signature: 0 },
    }
  }

  const counts: Record<CertificateTier, number> = {
    Silver: 0,
    Gold: 0,
    Platinum: 0,
    Signature: 0,
  }

  data.forEach((cert) => {
    if (cert.tier in counts) {
      counts[cert.tier as CertificateTier]++
    }
  })

  // ProjectedDemand = SUM(Certificates * WeeksPerYear * ExpectedUsageRate)
  const demand = Object.entries(counts).reduce((sum, [tier, count]) => {
    const weeks = CERTIFICATE_WEEKS[tier as CertificateTier]
    const usageRate = EXPECTED_USAGE_RATES[tier as CertificateTier]
    return sum + count * weeks * usageRate
  }, 0)

  return { demand, counts }
}

/**
 * Determine system status based on capacity utilization
 * Updated to match specification: GREEN <50%, YELLOW 50-65%, RED >65%
 */
export function determineSystemStatus(utilizationPct: number): SystemStatus {
  if (utilizationPct < CAPACITY_THRESHOLDS.GREEN_MAX) return "GREEN"
  if (utilizationPct < CAPACITY_THRESHOLDS.YELLOW_MAX) return "YELLOW"
  // No ORANGE in new spec - goes directly to RED at 65%
  return "RED"
}

/**
 * Determine which tiers should have sales stopped
 * Stop-sale triggers when utilization >= 65% (per spec)
 * Order: Silver first, then Gold, then all
 */
export function determineStopSaleStatus(utilizationPct: number): {
  silverEnabled: boolean
  goldEnabled: boolean
  platinumEnabled: boolean
  signatureEnabled: boolean
  waitlistEnabled: boolean
} {
  // Under 65%: all sales enabled
  if (utilizationPct < 65) {
    return {
      silverEnabled: true,
      goldEnabled: true,
      platinumEnabled: true,
      signatureEnabled: true,
      waitlistEnabled: false,
    }
  }

  // 65-75%: Stop Silver only (lowest tier first)
  if (utilizationPct < 75) {
    return {
      silverEnabled: false,
      goldEnabled: true,
      platinumEnabled: true,
      signatureEnabled: true,
      waitlistEnabled: true,
    }
  }

  // 75-85%: Stop Silver and Gold
  if (utilizationPct < 85) {
    return {
      silverEnabled: false,
      goldEnabled: false,
      platinumEnabled: true,
      signatureEnabled: true,
      waitlistEnabled: true,
    }
  }

  // 85%+: Stop all sales
  return {
    silverEnabled: false,
    goldEnabled: false,
    platinumEnabled: false,
    signatureEnabled: false,
    waitlistEnabled: true,
  }
}

/**
 * Run full capacity engine calculation and store result
 */
export async function runCapacityEngineCalculation(): Promise<CapacityEngineStatus | null> {
  const supabase = await createClient()

  try {
    // Calculate supply
    const totalSupplyWeeks = await calculateTotalSupplyWeeks()
    const safeCapacity = calculateSafeCapacity(totalSupplyWeeks)

    // Calculate demand
    const { demand: projectedDemand, counts } = await calculateProjectedDemand()

    // Calculate utilization
    const utilizationPct = safeCapacity > 0 ? (projectedDemand / safeCapacity) * 100 : 0

    // Determine status
    const systemStatus = determineSystemStatus(utilizationPct)
    const stopSaleStatus = determineStopSaleStatus(utilizationPct)

    // Get property counts
    const { data: propertiesData } = await supabase.from("supply_properties").select("status")

    const totalProperties = propertiesData?.length || 0
    const activeProperties = propertiesData?.filter((p) => p.status === "active").length || 0

    // Get waitlist count
    const { count: waitlistCount } = await supabase
      .from("certificate_waitlist")
      .select("*", { count: "exact", head: true })
      .eq("status", "waiting")

    // Insert new status record
    const statusRecord = {
      total_properties: totalProperties,
      active_properties: activeProperties,
      total_supply_weeks: totalSupplyWeeks,
      safe_capacity: safeCapacity,
      total_certificates_silver: counts.Silver,
      total_certificates_gold: counts.Gold,
      total_certificates_platinum: counts.Platinum,
      total_certificates_signature: counts.Signature,
      projected_demand: projectedDemand,
      capacity_utilization_pct: Math.round(utilizationPct * 100) / 100,
      system_status: systemStatus,
      silver_sales_enabled: stopSaleStatus.silverEnabled,
      gold_sales_enabled: stopSaleStatus.goldEnabled,
      platinum_sales_enabled: stopSaleStatus.platinumEnabled,
      signature_sales_enabled: stopSaleStatus.signatureEnabled,
      waitlist_enabled: stopSaleStatus.waitlistEnabled,
      waitlist_count: waitlistCount || 0,
    }

    const { data, error } = await supabase.from("capacity_engine_status").insert(statusRecord).select().single()

    if (error) {
      console.error("[CapacityEngine] Error saving status:", error)
      return null
    }

    return {
      id: data.id,
      calculatedAt: data.calculated_at,
      totalProperties: data.total_properties,
      activeProperties: data.active_properties,
      totalSupplyWeeks: data.total_supply_weeks,
      safeCapacity: data.safe_capacity,
      totalCertificatesSilver: data.total_certificates_silver,
      totalCertificatesGold: data.total_certificates_gold,
      totalCertificatesPlatinum: data.total_certificates_platinum,
      totalCertificatesSignature: data.total_certificates_signature,
      projectedDemand: data.projected_demand,
      capacityUtilizationPct: data.capacity_utilization_pct,
      systemStatus: data.system_status,
      silverSalesEnabled: data.silver_sales_enabled,
      goldSalesEnabled: data.gold_sales_enabled,
      platinumSalesEnabled: data.platinum_sales_enabled,
      signatureSalesEnabled: data.signature_sales_enabled,
      waitlistEnabled: data.waitlist_enabled,
      waitlistCount: data.waitlist_count,
    }
  } catch (err) {
    console.error("[CapacityEngine] Calculation error:", err)
    return null
  }
}

/**
 * Get latest capacity engine status
 */
export async function getLatestCapacityStatus(): Promise<CapacityEngineStatus | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("capacity_engine_status")
    .select("*")
    .order("calculated_at", { ascending: false })
    .limit(1)
    .single()

  if (error || !data) {
    return null
  }

  return {
    id: data.id,
    calculatedAt: data.calculated_at,
    totalProperties: data.total_properties,
    activeProperties: data.active_properties,
    totalSupplyWeeks: data.total_supply_weeks,
    safeCapacity: data.safe_capacity,
    totalCertificatesSilver: data.total_certificates_silver,
    totalCertificatesGold: data.total_certificates_gold,
    totalCertificatesPlatinum: data.total_certificates_platinum,
    totalCertificatesSignature: data.total_certificates_signature,
    projectedDemand: data.projected_demand,
    capacityUtilizationPct: data.capacity_utilization_pct,
    systemStatus: data.system_status,
    silverSalesEnabled: data.silver_sales_enabled,
    goldSalesEnabled: data.gold_sales_enabled,
    platinumSalesEnabled: data.platinum_sales_enabled,
    signatureSalesEnabled: data.signature_sales_enabled,
    waitlistEnabled: data.waitlist_enabled,
    waitlistCount: data.waitlist_count,
  }
}

/**
 * Check if a specific tier is available for purchase
 */
export async function isTierAvailable(tier: CertificateTier): Promise<boolean> {
  if (typeof window === "undefined" && !process.env.STRIPE_SECRET_KEY) {
    console.log("[v0] Build-time check: defaulting to tier available")
    return true
  }

  const status = await getLatestCapacityStatus()

  if (!status) {
    // If no status available, default to enabled
    return true
  }

  switch (tier) {
    case "Silver":
      return status.silverSalesEnabled
    case "Gold":
      return status.goldSalesEnabled
    case "Platinum":
      return status.platinumSalesEnabled
    case "Signature":
      return status.signatureSalesEnabled
    default:
      return false
  }
}

/**
 * Check if beta cap allows more certificate purchases
 */
export async function checkBetaCapAvailability(
  maxPax: number,
  maxEstancias: number,
): Promise<{
  available: boolean
  remainingForProduct: number
  remainingTotal: number
}> {
  const supabase = await createClient()

  // Get product-specific cap
  const { data: product } = await supabase
    .from("certificate_products_v2")
    .select("beta_cap, sold_count")
    .eq("max_pax", maxPax)
    .eq("max_estancias_per_year", maxEstancias)
    .single()

  // Get total sold
  const { data: totals } = await supabase.from("certificate_products_v2").select("sold_count")

  const totalSold = totals?.reduce((sum, p) => sum + (p.sold_count || 0), 0) || 0
  const remainingTotal = BETA_CONFIG.totalCertificatesAllowed - totalSold

  if (!product) {
    return { available: false, remainingForProduct: 0, remainingTotal }
  }

  const remainingForProduct = product.beta_cap - (product.sold_count || 0)

  return {
    available: remainingForProduct > 0 && remainingTotal > 0,
    remainingForProduct,
    remainingTotal,
  }
}
