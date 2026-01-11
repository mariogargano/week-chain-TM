// lib/broker/broker-levels.ts
// Lógica de negocio para el sistema de niveles de broker

import { createClient } from "@/lib/supabase/server"

// Tipos
export interface BrokerLevel {
  id: string
  tag: "BROKER" | "SILVER_BROKER" | "BROKER_ELITE"
  display_name: string
  level: number
  direct_commission_rate: number
  min_weeks_sold: number
  min_affiliates: number
  retirement_bonus_rate: number | null
  created_at: string
}

export interface BrokerStats {
  total_weeks_sold: number
  years_active: number
  num_affiliates: number
  total_commissions: number
}

export interface BrokerLevelUpdateResult {
  broker_id: string
  old_level_tag: string | null
  new_level_tag: string
  total_weeks_sold: number
  years_active: number
  num_affiliates: number
  direct_commission_rate: number
}

// Constantes de comisiones multinivel
export const MULTI_LEVEL_RATES = {
  LEVEL_2: 0.01, // 1% para upline nivel 2
  LEVEL_3: 0.005, // 0.5% para upline nivel 3
} as const

/**
 * Obtiene todos los niveles de broker configurados
 */
export async function getBrokerLevels(): Promise<BrokerLevel[]> {
  const supabase = await createClient()

  const { data, error } = await supabase.from("broker_levels").select("*").order("level", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching broker levels:", error)
    throw error
  }

  return data || []
}

/**
 * Obtiene un nivel por su tag
 */
export async function getBrokerLevelByTag(tag: string): Promise<BrokerLevel | null> {
  const supabase = await createClient()

  const { data, error } = await supabase.from("broker_levels").select("*").eq("tag", tag).single()

  if (error) {
    if (error.code === "PGRST116") return null
    console.error("[v0] Error fetching broker level:", error)
    throw error
  }

  return data
}

/**
 * Obtiene las estadísticas de un broker
 */
export async function getBrokerStats(brokerId: string): Promise<BrokerStats> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc("get_broker_stats", {
    p_broker_id: brokerId,
  })

  if (error) {
    console.error("[v0] Error getting broker stats:", error)
    throw error
  }

  // La función devuelve un array con un solo elemento
  const stats = Array.isArray(data) ? data[0] : data

  return {
    total_weeks_sold: stats?.total_weeks_sold || 0,
    years_active: stats?.years_active || 0,
    num_affiliates: stats?.num_affiliates || 0,
    total_commissions: stats?.total_commissions || 0,
  }
}

/**
 * Actualiza el nivel de un broker basado en sus estadísticas
 * Esta función es idempotente y puede llamarse múltiples veces sin efectos secundarios
 */
export async function updateBrokerLevel(brokerId: string): Promise<BrokerLevelUpdateResult> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc("update_broker_level", {
    p_broker_id: brokerId,
  })

  if (error) {
    console.error("[v0] Error updating broker level:", error)
    throw error
  }

  const result = Array.isArray(data) ? data[0] : data

  console.log("[v0] Broker level updated:", {
    brokerId,
    oldLevel: result.old_level_tag,
    newLevel: result.new_level_tag,
  })

  return result
}

/**
 * Obtiene la tasa de comisión directa de un broker
 */
export async function getBrokerCommissionRate(brokerId: string): Promise<number> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc("get_broker_commission_rate", {
    p_broker_id: brokerId,
  })

  if (error) {
    console.error("[v0] Error getting commission rate:", error)
    return 0.04 // Default 4%
  }

  return data || 0.04
}

/**
 * Obtiene información completa del nivel de un broker
 */
export async function getBrokerLevelInfo(brokerId: string) {
  const supabase = await createClient()

  // Obtener profile con nivel
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(`
      id,
      username,
      display_name,
      role,
      is_broker_elite,
      broker_level_id,
      total_weeks_sold,
      years_active,
      bonuses_claimed,
      created_at,
      broker_levels (
        id,
        tag,
        display_name,
        level,
        direct_commission_rate,
        min_weeks_sold,
        min_affiliates,
        retirement_bonus_rate
      )
    `)
    .eq("id", brokerId)
    .single()

  if (profileError) {
    console.error("[v0] Error getting broker level info:", profileError)
    throw profileError
  }

  // Obtener estadísticas actualizadas
  const stats = await getBrokerStats(brokerId)

  // Obtener siguiente nivel (si existe)
  const currentLevel = (profile.broker_levels as BrokerLevel)?.level || 1
  const { data: nextLevel } = await supabase
    .from("broker_levels")
    .select("*")
    .gt("level", currentLevel)
    .order("level", { ascending: true })
    .limit(1)
    .single()

  return {
    profile,
    currentLevel: profile.broker_levels as BrokerLevel | null,
    stats,
    nextLevel: nextLevel as BrokerLevel | null,
    progressToNextLevel: nextLevel
      ? {
          weeksNeeded: Math.max(0, nextLevel.min_weeks_sold - stats.total_weeks_sold),
          affiliatesNeeded: Math.max(0, nextLevel.min_affiliates - stats.num_affiliates),
          weeksProgress: Math.min(100, (stats.total_weeks_sold / nextLevel.min_weeks_sold) * 100),
          affiliatesProgress: Math.min(100, (stats.num_affiliates / nextLevel.min_affiliates) * 100),
        }
      : null,
  }
}

/**
 * Verifica elegibilidad para retirement bonus
 */
export async function checkRetirementBonusEligibility(brokerId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc("check_retirement_bonus_eligibility", {
    p_broker_id: brokerId,
  })

  if (error) {
    console.error("[v0] Error checking retirement eligibility:", error)
    throw error
  }

  const result = Array.isArray(data) ? data[0] : data

  return {
    isEligible: result?.is_eligible || false,
    retirementRate: result?.retirement_rate || 0,
    reason: result?.reason || "Error al verificar elegibilidad",
  }
}

/**
 * Otorga un bonus de tiempo a un broker
 */
export async function grantTimeBonus(brokerId: string, levelId: string, weeksBonus = 1): Promise<string> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc("grant_time_bonus", {
    p_broker_id: brokerId,
    p_level_id: levelId,
    p_weeks_bonus: weeksBonus,
  })

  if (error) {
    console.error("[v0] Error granting time bonus:", error)
    throw error
  }

  return data
}
