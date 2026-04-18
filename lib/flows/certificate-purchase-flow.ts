import { createServerClient } from "@/lib/supabase/server"
import { generateVoucher } from "@/lib/vouchers/generator"
import { generateInvoice } from "@/lib/invoices/generator"
import { sendEmail } from "@/lib/email/send-email"

export interface CertificatePurchaseData {
  userId: string
  certificateType: "basic" | "premium" | "elite"
  amountUsd: number
  amountMxn?: number
  currency: "USD" | "MXN"
  exchangeRate?: number
  paymentMethod: string
  termsAcceptanceId: string
  privacyAcceptanceId: string
  clickwrapData: {
    ip: string
    userAgent: string
    timestamp: string
    acceptedTermsVersion: string
    acceptedPrivacyVersion: string
  }
}

/**
 * Complete certificate purchase flow - PROFECO compliant
 *
 * FLOW:
 * 1. User selects certificate
 * 2. Accepts terms + privacy (click-wrap)
 * 3. Makes payment
 * 4. Receives voucher automatically
 * 5. Can request invoice from dashboard
 */
export async function initiateCertificatePurchase(data: CertificatePurchaseData) {
  const supabase = createServerClient()

  // Generate NOM-151 compliance hash
  const nom151Hash = await generateNOM151Hash({
    userId: data.userId,
    termsAcceptanceId: data.termsAcceptanceId,
    privacyAcceptanceId: data.privacyAcceptanceId,
    timestamp: data.clickwrapData.timestamp,
  })

  // Create certificate purchase record
  const { data: purchase, error } = await supabase
    .from("certificate_purchases")
    .insert({
      user_id: data.userId,
      certificate_type: data.certificateType,
      amount_usd: data.amountUsd,
      amount_mxn: data.amountMxn,
      currency: data.currency,
      exchange_rate: data.exchangeRate,
      payment_method: data.paymentMethod,
      payment_status: "pending",
      terms_acceptance_id: data.termsAcceptanceId,
      privacy_acceptance_id: data.privacyAcceptanceId,
      clickwrap_data: data.clickwrapData,
      nom151_compliance_hash: nom151Hash,
      status: "pending",
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating certificate purchase:", error)
    throw new Error("Failed to initiate certificate purchase")
  }

  return purchase
}

/**
 * Complete payment and activate certificate
 */
export async function completeCertificatePurchase(purchaseId: string, paymentId: string) {
  const supabase = createServerClient()

  // Update purchase with payment info
  const { data: purchase, error: updateError } = await supabase
    .from("certificate_purchases")
    .update({
      payment_id: paymentId,
      payment_status: "completed",
      status: "active",
      activated_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 15 * 365 * 24 * 60 * 60 * 1000).toISOString(), // 15 years
    })
    .eq("id", purchaseId)
    .select()
    .single()

  if (updateError) {
    console.error("[v0] Error completing purchase:", updateError)
    throw new Error("Failed to complete purchase")
  }

  // Generate and send voucher
  await generateAndSendVoucher(purchase.id)

  return purchase
}

/**
 * Generate voucher with complete legal data
 */
async function generateAndSendVoucher(purchaseId: string) {
  const supabase = createServerClient()

  // Get purchase with user data
  const { data: purchase, error } = await supabase
    .from("certificate_purchases")
    .select(`
      *,
      user:auth.users(email, raw_user_meta_data),
      payment:payments(*)
    `)
    .eq("id", purchaseId)
    .single()

  if (error) throw new Error("Failed to fetch purchase data")

  // Generate PDF voucher
  const voucherUrl = await generateVoucher({
    certificateNumber: purchase.certificate_number,
    certificateCode: purchase.certificate_code,
    certificateType: purchase.certificate_type,
    userName: purchase.user.raw_user_meta_data?.full_name || "Usuario",
    userEmail: purchase.user.email,
    amountPaid: purchase.amount_usd,
    currency: purchase.currency,
    paymentMethod: purchase.payment_method,
    paymentDate: purchase.activated_at,
    expiresAt: purchase.expires_at,
    termsAcceptanceId: purchase.terms_acceptance_id,
    privacyAcceptanceId: purchase.privacy_acceptance_id,
    nom151Hash: purchase.nom151_compliance_hash,
  })

  // Update purchase with voucher URL
  await supabase
    .from("certificate_purchases")
    .update({
      voucher_generated: true,
      voucher_url: voucherUrl,
      voucher_generated_at: new Date().toISOString(),
    })
    .eq("id", purchaseId)

  // Send voucher via email
  await sendEmail({
    template: "certificate_voucher",
    to: purchase.user.email,
    variables: {
      userName: purchase.user.raw_user_meta_data?.full_name || "Usuario",
      certificateNumber: purchase.certificate_number,
      certificateCode: purchase.certificate_code,
      voucherUrl,
      downloadLink: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/my-certificates/${purchaseId}`,
    },
  })

  // Mark voucher as sent
  await supabase.from("certificate_purchases").update({ voucher_sent_via_email: true }).eq("id", purchaseId)

  return voucherUrl
}

/**
 * Request invoice from dashboard
 */
export async function requestInvoice(
  purchaseId: string,
  billingData: {
    name: string
    rfc: string
    email: string
    address: {
      street: string
      city: string
      state: string
      zipCode: string
      country: string
    }
    fiscalRegime: string
    cfdiUse: string
  },
) {
  const supabase = createServerClient()

  // Update purchase with billing data
  await supabase
    .from("certificate_purchases")
    .update({
      invoice_requested: true,
      invoice_requested_at: new Date().toISOString(),
      billing_name: billingData.name,
      billing_rfc: billingData.rfc,
      billing_email: billingData.email,
      billing_address: billingData.address,
      billing_fiscal_regime: billingData.fiscalRegime,
      billing_cfdi_use: billingData.cfdiUse,
    })
    .eq("id", purchaseId)

  // Generate invoice automatically
  await generateAndSendInvoice(purchaseId)

  return { success: true }
}

/**
 * Generate invoice automatically
 */
async function generateAndSendInvoice(purchaseId: string) {
  const supabase = createServerClient()

  // Get purchase with billing data
  const { data: purchase, error } = await supabase
    .from("certificate_purchases")
    .select("*")
    .eq("id", purchaseId)
    .single()

  if (error) throw new Error("Failed to fetch purchase for invoice")

  // Generate invoice number
  const invoiceNumber = await generateInvoiceNumber()

  // Generate PDF invoice
  const invoiceUrl = await generateInvoice({
    invoiceNumber,
    certificateNumber: purchase.certificate_number,
    billingName: purchase.billing_name,
    billingRFC: purchase.billing_rfc,
    billingEmail: purchase.billing_email,
    billingAddress: purchase.billing_address,
    fiscalRegime: purchase.billing_fiscal_regime,
    cfdiUse: purchase.billing_cfdi_use,
    amount: purchase.amount_usd,
    currency: purchase.currency,
    paymentDate: purchase.activated_at,
    description: `Certificado Digital Vacacional ${purchase.certificate_type.toUpperCase()} - ${purchase.certificate_number}`,
  })

  // Update purchase with invoice info
  await supabase
    .from("certificate_purchases")
    .update({
      invoice_generated: true,
      invoice_number: invoiceNumber,
      invoice_url: invoiceUrl,
      invoice_generated_at: new Date().toISOString(),
    })
    .eq("id", purchaseId)

  // Send invoice via email
  await sendEmail({
    template: "invoice_ready",
    to: purchase.billing_email,
    variables: {
      userName: purchase.billing_name,
      invoiceNumber,
      invoiceUrl,
      downloadLink: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/my-certificates/${purchaseId}/invoice`,
    },
  })

  // Mark invoice as sent
  await supabase.from("certificate_purchases").update({ invoice_sent_via_email: true }).eq("id", purchaseId)

  return invoiceUrl
}

/**
 * Generate NOM-151 compliance hash for audit trail
 */
async function generateNOM151Hash(data: {
  userId: string
  termsAcceptanceId: string
  privacyAcceptanceId: string
  timestamp: string
}): Promise<string> {
  const message = `${data.userId}|${data.termsAcceptanceId}|${data.privacyAcceptanceId}|${data.timestamp}`

  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(message)
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")

  return hashHex
}

/**
 * Generate sequential invoice number
 */
async function generateInvoiceNumber(): Promise<string> {
  const supabase = createServerClient()

  const year = new Date().getFullYear()

  const { count } = await supabase
    .from("certificate_purchases")
    .select("*", { count: "exact", head: true })
    .not("invoice_number", "is", null)
    .gte("created_at", `${year}-01-01`)

  const sequence = String((count || 0) + 1).padStart(6, "0")

  return `WEEK-${year}-${sequence}`
}
