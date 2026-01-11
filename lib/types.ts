// Type definitions for WeekChain platform
import { z } from "zod"

// Zod validation schemas
export const MintSchema = z.object({
  userId: z.string().uuid(),
  weekId: z.string().uuid(),
  contractId: z.string().uuid(),
  seriesId: z.string().uuid(),
})

export interface ContractData {
  userId: string
  userName: string
  userEmail: string
  userRFC?: string
  propertyId: string
  propertyName: string
  propertyAddress: string
  weekNumber: number
  year: number
  price: number
  currency: string
  series: string
  folio: string
  nom151?: NOM151Data
}

export interface ContractPDFResult {
  pdfBase64: string
  documentHash: string
  folio: string
  metadata: Record<string, any>
}

export interface NOM151Data {
  folio: string
  sha256: string
}

export interface LegalAcceptance {
  id: string
  user_id: string
  document_type: "terms" | "privacy"
  ip_address: string
  wallet_address?: string
  document_hash: string
  accepted_at: string
}

export interface RefundRequest {
  id: string
  user_id: string
  voucher_id?: string
  escrow_tx?: string
  reason?: string
  status: "pending" | "approved" | "rejected"
  requested_at: string
  processed_at?: string
}

/**
 * Generate PDF buffer from contract data
 * This function is kept for backward compatibility but delegates to the API
 */
export async function generatePDFBuffer(data: ContractData): Promise<Buffer> {
  // PDF generation is now handled by /api/legal/download route using jsPDF
  // This is a fallback for any legacy code that still calls this function
  const content = `
CONTRATO DE CESIÓN DE USO VACACIONAL
Serie: ${data.series} | Folio: ${data.folio}

USUARIO: ${data.userName}
RFC: ${data.userRFC || "N/A"}
EMAIL: ${data.userEmail}

PROPIEDAD: ${data.propertyName}
DIRECCIÓN: ${data.propertyAddress}
SEMANA: ${data.weekNumber}
AÑO: ${data.year}

PRECIO: ${data.price} ${data.currency}

Este documento certifica el derecho de uso vacacional conforme a NOM-029-SE-2021.
  `.trim()

  return Buffer.from(content, "utf-8")
}
