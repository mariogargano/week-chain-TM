import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export interface VoucherData {
  userId: string
  certificateId: string
  certificateType: string
  certificateName: string
  weeksQuantity: number
  validityStartDate: Date
  validityEndDate: Date
  userFullName: string
  userEmail: string
  userPhone?: string
  userAddress?: {
    street: string
    city: string
    state: string
    zip: string
    country: string
  }
  paymentAmountCents: number
  paymentCurrency: string
  paymentMethod: string
  paymentReference: string
  paymentDate: Date
}

export async function generateVoucher(data: VoucherData): Promise<{ voucherCode: string; voucherId: string }> {
  const cookieStore = cookies()
  const supabase = createClient()

  // Generar código único de voucher
  const voucherCode = generateVoucherCode()

  // Insertar voucher en la base de datos
  const { data: voucher, error } = await supabase
    .from("certificate_vouchers")
    .insert({
      voucher_code: voucherCode,
      user_id: data.userId,
      certificate_id: data.certificateId,
      certificate_type: data.certificateType,
      certificate_name: data.certificateName,
      weeks_quantity: data.weeksQuantity,
      validity_start_date: data.validityStartDate.toISOString().split("T")[0],
      validity_end_date: data.validityEndDate.toISOString().split("T")[0],
      user_full_name: data.userFullName,
      user_email: data.userEmail,
      user_phone: data.userPhone,
      user_address: data.userAddress,
      payment_amount_cents: data.paymentAmountCents,
      payment_currency: data.paymentCurrency,
      payment_method: data.paymentMethod,
      payment_reference: data.paymentReference,
      payment_date: data.paymentDate.toISOString(),
      status: "active",
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating voucher:", error)
    throw new Error("Failed to generate voucher")
  }

  console.log("[v0] Voucher generated successfully:", voucherCode)

  return {
    voucherCode,
    voucherId: voucher.id,
  }
}

function generateVoucherCode(): string {
  const year = new Date().getFullYear()
  const random1 = Math.random().toString(36).substring(2, 6).toUpperCase()
  const random2 = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `WC-${year}-${random1}-${random2}`
}
