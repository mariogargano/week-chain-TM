import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { verifyEasylexSignature, extractEasylexWebhookHeaders } from "@/lib/easylex/webhook-handler"
import { logEvidenceEvent } from "@/lib/evidence/logger"
import { logger } from "@/lib/config/logger"

export async function POST(request: Request) {
  try {
    // 1. Extract webhook headers
    const headers = extractEasylexWebhookHeaders(request)
    if (!headers) {
      return NextResponse.json({ error: "Missing webhook headers" }, { status: 400 })
    }

    // 2. Get raw body for signature verification
    const rawBody = await request.text()

    // 3. Verify webhook signature
    const verification = verifyEasylexSignature(rawBody, headers.signature, headers.timestamp)

    if (!verification.valid) {
      logger.error("EasyLex webhook verification failed:", verification.error)
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const payload = verification.payload!
    logger.info("EasyLex webhook received:", payload.event, payload.data.documentId)

    const supabase = createClient()

    // 4. Process webhook event
    switch (payload.event) {
      case "document.signed": {
        // Update certificate or reservation status
        const { data: certificate } = await supabase
          .from("certificates")
          .update({
            signature_status: "signed",
            signature_date: payload.data.signedAt,
            nom151_hash: payload.data.nom151Hash,
            evidence_package_url: payload.data.evidencePackageUrl,
          })
          .eq("easylex_document_id", payload.data.documentId)
          .select()
          .single()

        // Log evidence event
        if (certificate) {
          await logEvidenceEvent({
            eventType: "document_signed",
            entityType: "certificate",
            entityId: certificate.id,
            userId: certificate.user_id,
            actorRole: "user",
            payload: {
              documentId: payload.data.documentId,
              nom151Hash: payload.data.nom151Hash,
              signedAt: payload.data.signedAt,
              certificateUrl: payload.data.certificateUrl,
            },
          })
        }

        break
      }

      case "document.rejected": {
        await supabase
          .from("certificates")
          .update({
            signature_status: "rejected",
          })
          .eq("easylex_document_id", payload.data.documentId)

        break
      }

      case "document.expired": {
        await supabase
          .from("certificates")
          .update({
            signature_status: "expired",
          })
          .eq("easylex_document_id", payload.data.documentId)

        break
      }
    }

    // 5. Log webhook event
    await supabase.from("webhook_events").insert({
      provider: "easylex",
      event_type: payload.event,
      payload: payload.data,
      processed: true,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error("EasyLex webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
