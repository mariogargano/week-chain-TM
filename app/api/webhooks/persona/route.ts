import { NextResponse } from "next/server"
import crypto from "crypto"
import { createClient } from "@/lib/supabase/server"
import { logger } from "@/lib/config/logger"

/**
 * Persona Webhook Handler
 *
 * Events: inquiry.completed, inquiry.approved, inquiry.failed
 * Signature validation uses PERSONA_WEBHOOK_SECRET
 * Updates kyc_users status and triggers certificate activation if applicable
 */
export async function POST(request: Request) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get("persona-signature")
    const secret = process.env.PERSONA_WEBHOOK_SECRET

    // Validate webhook signature
    if (!secret || !signature) {
      logger.warn("[persona-webhook] Missing signature or secret", {
        hasSignature: !!signature,
        hasSecret: !!secret,
      })
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const expected = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex")

    if (signature !== expected) {
      logger.warn("[persona-webhook] Signature mismatch", { provided: signature.slice(0, 10) })
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = JSON.parse(rawBody)
    const { data } = body

    if (!data?.id || !data?.type || data.type !== "inquiry") {
      logger.warn("[persona-webhook] Invalid payload", { type: data?.type })
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    const inquiryId = data.id
    const referenceId = data.attributes?.["reference-id"] // This is the user ID
    const personaStatus = data.attributes?.status

    logger.info("[persona-webhook] Received event", {
      inquiryId,
      userId: referenceId,
      status: personaStatus,
    })

    if (!referenceId) {
      logger.warn("[persona-webhook] No reference-id (user_id) in inquiry")
      return NextResponse.json({ error: "No reference-id" }, { status: 400 })
    }

    const supabase = await createClient()

    // Map Persona status to our internal status
    let kycNewStatus = "pending"
    if (personaStatus === "completed" || personaStatus === "approved") {
      kycNewStatus = "approved"
    } else if (personaStatus === "failed" || personaStatus === "declined") {
      kycNewStatus = "failed"
    } else if (personaStatus === "needs_review") {
      kycNewStatus = "pending"
    }

    // Update kyc_users status
    const { error: updateError } = await supabase
      .from("kyc_users")
      .update({
        status: kycNewStatus,
        persona_inquiry_id: inquiryId,
        kyc_updated_at: new Date().toISOString(),
      })
      .eq("user_id", referenceId)

    if (updateError) {
      logger.error("[persona-webhook] Failed to update kyc_users", updateError)
      return NextResponse.json({ error: "Update failed" }, { status: 500 })
    }

    // If KYC approved, trigger certificate activation and update user status
    if (kycNewStatus === "approved") {
      // 1. Find pending certificate and activate it
      const { data: pendingCert, error: certError } = await supabase
        .from("certificates")
        .select("id, user_id, status")
        .eq("user_id", referenceId)
        .eq("status", "pending_kyc")
        .maybeSingle()

      if (certError) {
        logger.error("[persona-webhook] Failed to fetch certificate", certError)
      } else if (pendingCert) {
        const { error: activateError } = await supabase
          .from("certificates")
          .update({ status: "active", activated_at: new Date().toISOString() })
          .eq("id", pendingCert.id)

        if (activateError) {
          logger.error("[persona-webhook] Failed to activate certificate", activateError)
        } else {
          logger.info("[persona-webhook] Certificate activated", { certificateId: pendingCert.id })
        }
      }

      // 2. Update user onboarding status
      const { error: userError } = await supabase
        .from("users")
        .update({
          onboarding_status: "holder_verified",
          holder_since: new Date().toISOString(),
        })
        .eq("id", referenceId)

      if (userError) {
        logger.error("[persona-webhook] Failed to update user status", userError)
      } else {
        logger.info("[persona-webhook] User onboarding status updated to holder_verified", {
          userId: referenceId,
        })
      }

      // TODO: Send email notification of KYC approval
      // sendEmail({ userId: referenceId, template: "kyc-approved" })
    }

    if (kycNewStatus === "failed") {
      logger.info("[persona-webhook] KYC rejected, user can retry", { userId: referenceId })
      // TODO: Send email notification of KYC rejection
      // sendEmail({ userId: referenceId, template: "kyc-rejected" })
    }

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (error) {
    logger.error("[persona-webhook] Unhandled error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
