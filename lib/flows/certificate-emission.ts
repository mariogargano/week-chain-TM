import { createClient } from "@/lib/supabase/server"
import { logger } from "@/lib/config/logger"

/**
 * Generate unique certificate number
 * Format: WC-YYYY-XXXXXX (e.g., WC-2025-000123)
 */
function generateCertificateNumber(): string {
  const year = new Date().getFullYear()
  const randomPart = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0")
  return `WC-${year}-${randomPart}`
}

export interface EmitCertificateInput {
  userId: string
  svcType: "PAX2" | "PAX4" | "PAX6" | "PAX8"
  checkoutSessionId: string
  amount: number
  currency: string
}

export async function emitCertificate(input: EmitCertificateInput) {
  const supabase = await createClient()

  try {
    // 1. Get user's KYC status
    const { data: kycData, error: kycError } = await supabase
      .from("kyc_users")
      .select("status")
      .eq("user_id", input.userId)
      .maybeSingle()

    if (kycError) {
      logger.error("[certificate-emission] Failed to fetch KYC status", kycError)
      throw new Error("Failed to fetch KYC status")
    }

    // 2. Determine certificate status based on KYC
    const certificateStatus = kycData?.status === "approved" ? "active" : "pending_kyc"
    const certificateNumber = generateCertificateNumber()

    // 3. Create certificate record
    const { data: certificate, error: certError } = await supabase
      .from("certificates")
      .insert({
        user_id: input.userId,
        certificate_number: certificateNumber,
        svc_type: input.svcType,
        status: certificateStatus,
        issued_at: new Date().toISOString(),
        activated_at: certificateStatus === "active" ? new Date().toISOString() : null,
        expires_at: new Date(Date.now() + 15 * 365 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
          checkout_session_id: input.checkoutSessionId,
          purchase_amount: input.amount,
          purchase_currency: input.currency,
          source: "stripe_checkout",
        },
      })
      .select()
      .single()

    if (certError) {
      logger.error("[certificate-emission] Failed to create certificate", certError)
      throw new Error("Failed to create certificate")
    }

    logger.info("[certificate-emission] Certificate emitted", {
      certificateId: certificate.id,
      certificateNumber,
      userId: input.userId,
      status: certificateStatus,
    })

    // 4. If certificate is active, update user onboarding status
    if (certificateStatus === "active") {
      const { error: userError } = await supabase
        .from("users")
        .update({
          onboarding_status: "holder_verified",
          holder_since: new Date().toISOString(),
        })
        .eq("id", input.userId)

      if (userError) {
        logger.error("[certificate-emission] Failed to update user status", userError)
        // Don't throw - certificate was created, this is secondary
      }
    } else {
      // Certificate pending KYC - update to holder_pending_kyc
      const { error: userError } = await supabase
        .from("users")
        .update({
          onboarding_status: "holder_pending_kyc",
        })
        .eq("id", input.userId)

      if (userError) {
        logger.error("[certificate-emission] Failed to update user to holder_pending_kyc", userError)
      }
    }

    // 5. TODO: Send email with certificate details and PDF

    return certificate
  } catch (error) {
    logger.error("[certificate-emission] Unhandled error:", error)
    throw error
  }
}
