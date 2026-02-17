// lib/broker/commission-calculator.ts
// Calcula y registra comisiones de broker con el nuevo sistema de niveles

import { createClient } from "@/lib/supabase/server"
import { updateBrokerLevel } from "./broker-levels"

export interface CommissionInput {
  reservationId: string
  saleAmountUsdc: number
  buyerUserId: string
}

export interface CommissionResult {
  brokerId: string
  rate: number
  amount: number
}

export const FLAT_COMMISSION_RATE = 0.04 // 4%

/**
 * Calcula comisión flat 4% SOLO para referido directo
 */
export async function calculateCommissions(input: CommissionInput): Promise<CommissionResult[]> {
  const supabase = await createClient()
  const results: CommissionResult[] = []

  const { data: referralData, error: referralError } = await supabase
    .from("referral_tree")
    .select("broker_id")
    .eq("referred_user_id", input.buyerUserId)
    .eq("level", 1) // Only direct referrals
    .single()

  if (referralError) {
    console.log("[v0] No direct referral found for user:", input.buyerUserId)
    return results
  }

  if (!referralData) {
    return results
  }

  const amount = input.saleAmountUsdc * FLAT_COMMISSION_RATE

  results.push({
    brokerId: referralData.broker_id,
    rate: FLAT_COMMISSION_RATE,
    amount,
  })

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
      referral_level: 1, // Always level 1 (direct)
      status: "pending",
      metadata: {
        commission_type: "flat_4_percent",
        calculated_at: new Date().toISOString(),
      },
    })

    if (error) {
      console.error("[v0] Error recording commission:", error)
      throw error
    }

    console.log("[v0] Commission recorded:", {
      brokerId: commission.brokerId,
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
  const level1Broker = commissions.find((c) => c.brokerId)
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
