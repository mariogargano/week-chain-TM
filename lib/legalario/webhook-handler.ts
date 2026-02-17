import { createHmac, timingSafeEqual } from "crypto"
import { getEnv } from "@/lib/config/env-schema"

export interface LegalarioWebhookPayload {
  event: "contract.certified" | "contract.rejected" | "contract.updated"
  data: {
    contract_id: string
    folio: string
    sha256: string
    certified_at: string
    status: "certified" | "rejected"
    series_id?: string
    user_id?: string
    metadata?: Record<string, unknown>
  }
  timestamp: number
  signature: string
}

export interface WebhookVerificationResult {
  valid: boolean
  error?: string
  payload?: LegalarioWebhookPayload
}

const TIMESTAMP_TOLERANCE_MS = 5 * 60 * 1000 // 5 minutes

export function verifyLegalarioSignature(
  rawBody: string,
  signature: string,
  timestamp: number,
): WebhookVerificationResult {
  try {
    const env = getEnv()

    // 1. Verify timestamp to prevent replay attacks
    const now = Date.now()
    const timestampMs = timestamp * 1000 // Convert to milliseconds
    if (Math.abs(now - timestampMs) > TIMESTAMP_TOLERANCE_MS) {
      return {
        valid: false,
        error: `Timestamp out of tolerance. Diff: ${Math.abs(now - timestampMs)}ms`,
      }
    }

    // 2. Compute expected signature: HMAC-SHA256(secret, timestamp + "." + payload)
    const signedPayload = `${timestamp}.${rawBody}`
    const hmac = createHmac("sha256", env.LEGALARIO_WEBHOOK_SECRET)
    hmac.update(signedPayload)
    const expectedSignature = hmac.digest("hex")

    // 3. Timing-safe comparison
    const signatureBuffer = Buffer.from(signature, "hex")
    const expectedBuffer = Buffer.from(expectedSignature, "hex")

    if (signatureBuffer.length !== expectedBuffer.length) {
      return { valid: false, error: "Signature length mismatch" }
    }

    if (!timingSafeEqual(signatureBuffer, expectedBuffer)) {
      return { valid: false, error: "Signature verification failed" }
    }

    // 4. Parse payload
    const payload = JSON.parse(rawBody) as LegalarioWebhookPayload

    return { valid: true, payload }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Unknown verification error",
    }
  }
}

export function extractWebhookHeaders(request: Request): { signature: string; timestamp: number } | null {
  const signature = request.headers.get("x-legalario-signature")
  const timestampHeader = request.headers.get("x-legalario-timestamp")

  if (!signature || !timestampHeader) {
    return null
  }

  const timestamp = Number.parseInt(timestampHeader, 10)
  if (isNaN(timestamp)) {
    return null
  }

  return { signature, timestamp }
}
