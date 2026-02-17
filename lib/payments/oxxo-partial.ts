import { logger } from "@/lib/config/logger"

export const OXXO_LIMIT_MXN = 10000
export const OXXO_MIN_MXN = 20

export interface PartialPayment {
  amount: number
  sequence: number
  total: number
}

export interface PaymentGroup {
  id: string
  payments: PartialPayment[]
  totalAmount: number
  totalPayments: number
}

/**
 * Calcula los pagos parciales necesarios para OXXO
 * Divide montos > $10,000 MXN en múltiples pagos
 */
export function calculateOxxoPartialPayments(totalAmountMXN: number): PartialPayment[] {
  if (totalAmountMXN <= OXXO_LIMIT_MXN) {
    return [{ amount: totalAmountMXN, sequence: 1, total: 1 }]
  }

  const payments: PartialPayment[] = []
  let remaining = totalAmountMXN
  let sequence = 1

  while (remaining > 0) {
    const paymentAmount = remaining > OXXO_LIMIT_MXN ? OXXO_LIMIT_MXN : remaining
    payments.push({
      amount: Math.round(paymentAmount * 100) / 100, // Round to 2 decimals
      sequence,
      total: 0, // Will be set after calculating all payments
    })
    remaining -= paymentAmount
    sequence++
  }

  // Update total in all payments
  const totalPayments = payments.length
  payments.forEach((p) => (p.total = totalPayments))

  logger.debug("Calculated OXXO partial payments", {
    totalAmount: totalAmountMXN,
    payments: payments.length,
    breakdown: payments,
  })

  return payments
}

/**
 * Valida si un monto requiere pagos parciales
 */
export function requiresPartialPayments(amountMXN: number): boolean {
  return amountMXN > OXXO_LIMIT_MXN
}

/**
 * Obtiene el mensaje descriptivo para pagos parciales
 */
export function getPartialPaymentMessage(payments: PartialPayment[]): string {
  if (payments.length === 1) {
    return `Pago único de $${payments[0].amount.toLocaleString()} MXN`
  }

  const breakdown = payments.map((p) => `Pago ${p.sequence}: $${p.amount.toLocaleString()} MXN`).join("\n")

  return `Se crearán ${payments.length} pagos en OXXO:\n\n${breakdown}\n\nCada pago tendrá su propio código de barras y podrás pagarlos en cualquier orden.`
}

/**
 * Calcula el progreso de pagos completados
 */
export function calculatePaymentProgress(
  completed: number,
  total: number,
): {
  percentage: number
  remaining: number
  message: string
} {
  const percentage = Math.round((completed / total) * 100)
  const remaining = total - completed

  let message = ""
  if (completed === 0) {
    message = `Pendiente: ${total} pagos por realizar`
  } else if (completed < total) {
    message = `Progreso: ${completed} de ${total} pagos completados (${remaining} pendientes)`
  } else {
    message = `✅ Todos los pagos completados`
  }

  return { percentage, remaining, message }
}
