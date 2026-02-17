import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { logger } from "@/lib/config/logger"
import { WebhookLogger } from "@/lib/webhooks/logger"
import { SignatureVerifier } from "@/lib/legalario/signature-verifier"
import { checkRateLimit } from "@/lib/legalario/rate-limiter"
import { getClientIP, isIPAllowed } from "@/lib/legalario/ip-allowlist"
import { verifyLegalarioSignature, extractWebhookHeaders } from "@/lib/legalario/webhook-handler"
import { getEnv } from "@/lib/config/env-schema"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  const startTime = Date.now()

  const ipAddress =
    getClientIP(req) ||
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  const userAgent = req.headers.get("user-agent") || "unknown"

  const webhookId: string | null = null
  let rawBody = ""
  let payloadDigest = ""

  console.log("[v0] Legalario webhook received from IP:", ipAddress)

  try {
    const env = getEnv()

    // 1. Rate limiting with enhanced response
    const rateLimitResult = checkRateLimit(ipAddress)
    if (!rateLimitResult.allowed) {
      logger.warn("Rate limit exceeded for Legalario webhook", {
        ip: ipAddress,
        remaining: rateLimitResult.remaining,
      })

      await WebhookLogger.log({
        source: "legalario",
        eventId: "rate_limited",
        eventType: "rate_limited",
        payload: { ip: ipAddress },
        ipAddress,
        userAgent,
        signatureValid: false,
      })

      return NextResponse.json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": "10",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": new Date(rateLimitResult.resetAt).toISOString(),
            "Retry-After": "60",
          },
        },
      )
    }

    // 2. IP Allowlist check
    if (!isIPAllowed(ipAddress)) {
      console.warn("[v0] Webhook from disallowed IP:", ipAddress)

      await WebhookLogger.log({
        source: "legalario",
        eventId: "unauthorized-ip",
        eventType: "ip_blocked",
        payload: { ip: ipAddress, userAgent },
        ipAddress,
        userAgent,
        signatureValid: false,
      })

      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // 3. Extract and verify webhook headers
    const headers = extractWebhookHeaders(req)
    if (!headers) {
      await WebhookLogger.log({
        source: "legalario",
        eventId: "missing-headers",
        eventType: "missing_headers",
        payload: { ip: ipAddress },
        ipAddress,
        userAgent,
        signatureValid: false,
      })

      return NextResponse.json({ error: "Missing signature or timestamp headers" }, { status: 400 })
    }

    // 4. Get raw body
    rawBody = await req.text()
    if (!rawBody) {
      return NextResponse.json({ error: "Empty body" }, { status: 400 })
    }

    payloadDigest = SignatureVerifier.computeDigest(rawBody)

    // 5. Verify HMAC signature with new handler
    const verification = verifyLegalarioSignature(rawBody, headers.signature, headers.timestamp)

    // Log verification attempt
    await WebhookLogger.log({
      source: "legalario",
      eventId: verification.valid ? "signature_verified" : "signature_failed",
      eventType: verification.valid ? "signature_verified" : "security_violation",
      payload: {
        ip: ipAddress,
        userAgent,
        signature: headers.signature.slice(0, 16) + "...",
        timestamp: headers.timestamp,
        bodyDigest: payloadDigest.substring(0, 32),
        verificationError: verification.error,
      },
      ipAddress,
      userAgent,
      signatureValid: verification.valid,
    })

    if (!verification.valid) {
      console.error("[v0] Signature verification failed:", verification.error)
      return NextResponse.json({ error: "Invalid signature", details: verification.error }, { status: 401 })
    }

    const payload = verification.payload!

    console.log("[v0] Webhook signature verified. Event:", payload.event)
    console.log("[v0] Contract ID:", payload.data.contract_id)
    console.log("[v0] NOM-151 Folio:", payload.data.folio)

    // 6. Process webhook event
    const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    })

    if (payload.event === "contract.certified") {
      // Update legal_contracts table with certification data
      const { error: updateError } = await supabase
        .from("legal_contracts")
        .update({
          folio: payload.data.folio,
          sha256_hash: payload.data.sha256,
          status: "certified",
          certified_at: payload.data.certified_at,
          metadata: payload.data.metadata || {},
        })
        .eq("id", payload.data.contract_id)

      if (updateError) {
        console.error("[v0] Failed to update legal_contracts:", updateError)
        return NextResponse.json({ error: "Database update failed" }, { status: 500 })
      }

      console.log("[v0] Contract certified successfully:", payload.data.contract_id)

      await WebhookLogger.log({
        source: "legalario",
        eventId: payload.data.contract_id,
        eventType: "contract_certified",
        payload,
        ipAddress,
        userAgent,
        signatureValid: true,
      })

      return NextResponse.json({
        success: true,
        message: "Contract certification processed",
        contract_id: payload.data.contract_id,
      })
    } else if (payload.event === "contract.rejected") {
      // Handle rejection
      const { error: updateError } = await supabase
        .from("legal_contracts")
        .update({
          status: "rejected",
          metadata: payload.data.metadata || {},
        })
        .eq("id", payload.data.contract_id)

      if (updateError) {
        console.error("[v0] Failed to update legal_contracts:", updateError)
        return NextResponse.json({ error: "Database update failed" }, { status: 500 })
      }

      await WebhookLogger.log({
        source: "legalario",
        eventId: payload.data.contract_id,
        eventType: "contract_rejected",
        payload,
        ipAddress,
        userAgent,
        signatureValid: true,
      })

      return NextResponse.json({
        success: true,
        message: "Contract rejection processed",
        contract_id: payload.data.contract_id,
      })
    }

    // Unknown event type
    return NextResponse.json({ error: "Unknown event type" }, { status: 400 })
  } catch (error: any) {
    console.error("[v0] Webhook processing error:", error)

    await WebhookLogger.log({
      source: "legalario",
      eventId: "error",
      eventType: "processing_error",
      payload: { ip: ipAddress, error: error.message, payloadDigest },
      ipAddress,
      userAgent,
      signatureValid: false,
    })

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
