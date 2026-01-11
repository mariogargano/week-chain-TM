// lib/broker/commission-calculator.ts
// Calcula y registra comisiones de broker con el nuevo sistema de niveles

import { createClient } from "@/lib/supabase/server"
import { MULTI_LEVEL_RATES, updateBrokerLevel } from "./broker-levels"

export interface CommissionInput {
  reservationId: string
  saleAmountUsdc: number
  buyerUserId: string
}

export interface CommissionResult {
  brokerId: string
  level: number
  rate: number
  amount: number
  levelTag?: string
}

/**
 * Calcula las comisiones para una venta
 * Nivel 1: Comisión directa (según nivel del broker: 4%, 5%, 6%)
 * Nivel 2: 1% para el upline
 * Nivel 3: 0.5% para el upline del upline
 */
export async function calculateCommissions(input: CommissionInput): Promise<CommissionResult[]> {
  const supabase = await createClient()
  const results: CommissionResult[] = []

  // 1. Encontrar el broker de nivel 1 (quien refirió al comprador)
  const { data: referralData, error: referralError } = await supabase
    .from("referral_tree")
    .select(`
      broker_id,
      level,
      profiles!referral_tree_broker_id_fkey (
        id,
        broker_level_id,
        broker_levels (
          tag,
          direct_commission_rate
        )
      )
    `)
    .eq("referred_user_id", input.buyerUserId)
    .order("level", { ascending: true })
    .limit(3)

  if (referralError) {
    console.error("[v0] Error finding referral tree:", referralError)
    return results
  }

  if (!referralData || referralData.length === 0) {
    console.log("[v0] No referral found for user:", input.buyerUserId)
    return results
  }

  // 2. Calcular comisión para cada nivel
  for (const referral of referralData) {
    const brokerProfile = referral.profiles as any
    const brokerLevel = brokerProfile?.broker_levels

    let rate: number
    let levelTag: string | undefined

    if (referral.level === 1) {
      // Nivel 1: Usar tasa del nivel del broker
      rate = brokerLevel?.direct_commission_rate || 0.04
      levelTag = brokerLevel?.tag
    } else if (referral.level === 2) {
      // Nivel 2: Tasa fija 1%
      rate = MULTI_LEVEL_RATES.LEVEL_2
    } else if (referral.level === 3) {
      // Nivel 3: Tasa fija 0.5%
      rate = MULTI_LEVEL_RATES.LEVEL_3
    } else {
      continue // Solo manejamos 3 niveles
    }

    const amount = input.saleAmountUsdc * rate

    results.push({
      brokerId: referral.broker_id,
      level: referral.level,
      rate,
      amount,
      levelTag,
    })
  }

  return results
}

/**
 * Registra las comisiones en la base de datos
 */
export async function recordCommissions(input: CommissionInput, commissions: CommissionResult[]): Promise<void> {
  const supabase = await createClient()

  for (const commission of commissions) {
    const { error } = await supabase.from("broker_commissions").insert({
      broker_id: commission.brokerId,
      reservation_id: input.reservationId,
      sale_amount_usdc: input.saleAmountUsdc,
      commission_rate: commission.rate,
      commission_amount_usdc: commission.amount,
      referral_level: commission.level,
      status: "pending",
      metadata: {
        level_tag: commission.levelTag,
        calculated_at: new Date().toISOString(),
      },
    })

    if (error) {
      console.error("[v0] Error recording commission:", error)
      throw error
    }

    console.log("[v0] Commission recorded:", {
      brokerId: commission.brokerId,
      level: commission.level,
      rate: commission.rate,
      amount: commission.amount,
    })
  }
}

/**
 * Proceso completo: calcula y registra comisiones, actualiza niveles
 * Esta función debe llamarse cuando una reserva se confirma/vende
 */
export async function processCommissionsForSale(input: CommissionInput): Promise<CommissionResult[]> {
  // 1. Calcular comisiones
  const commissions = await calculateCommissions(input)

  if (commissions.length === 0) {
    console.log("[v0] No commissions to process for reservation:", input.reservationId)
    return []
  }

  // 2. Registrar comisiones
  await recordCommissions(input, commissions)

  // 3. Actualizar nivel del broker de nivel 1 (el que hizo la venta)
  const level1Broker = commissions.find((c) => c.level === 1)
  if (level1Broker) {
    try {
      await updateBrokerLevel(level1Broker.brokerId)
    } catch (error) {
      console.error("[v0] Error updating broker level:", error)
      // No lanzamos el error para no interrumpir el proceso
    }
  }

  return commissions
}

/**
 * Registra elegibilidad para retirement bonus
 * Llamar cuando se vende la propiedad completa
 */
export async function recordRetirementBonus(
  brokerId: string,
  propertyId: string,
  salePriceUsdc: number,
): Promise<void> {
  const supabase = await createClient()

  // Verificar elegibilidad
  const { data: eligibility } = await supabase.rpc("check_retirement_bonus_eligibility", {
    p_broker_id: brokerId,
  })

  const result = Array.isArray(eligibility) ? eligibility[0] : eligibility

  if (!result?.is_eligible) {
    console.log("[v0] Broker not eligible for retirement bonus:", brokerId)
    return
  }

  const bonusAmount = salePriceUsdc * result.retirement_rate

  // Registrar en broker_elite_benefits
  const { error } = await supabase.from("broker_elite_benefits").insert({
    broker_id: brokerId,
    property_id: propertyId,
    benefit_type: "retirement_bonus",
    ownership_percentage: result.retirement_rate,
    status: "pending",
    metadata: {
      sale_price_usdc: salePriceUsdc,
      bonus_amount_usdc: bonusAmount,
      calculated_at: new Date().toISOString(),
    },
  })

  if (error) {
    console.error("[v0] Error recording retirement bonus:", error)
    throw error
  }

  console.log("[v0] Retirement bonus recorded:", {
    brokerId,
    propertyId,
    rate: result.retirement_rate,
    amount: bonusAmount,
  })
}
