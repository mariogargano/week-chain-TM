import { createHmac } from "crypto"
import { config } from "@/lib/config"
import { logger } from "@/lib/config/logger"

/**
 * Verifies the signature of a Conekta webhook request
 *
 * @param payload The raw request body as a string
 * @param signature The signature from the X-Conekta-Signature header
 * @returns boolean indicating if the signature is valid
 */
export function verifyConektaSignature(payload: string, signature: string | null): boolean {
  if (!signature) {
    logger.warn("Conekta signature verification failed: Missing signature")
    return false
  }

  const secret = config.conekta.webhookSecret

  if (!secret) {
    logger.warn("Conekta webhook secret not configured. Skipping verification (NOT RECOMMENDED FOR PRODUCTION)")
    // If we're in demo mode and no secret is provided, we might want to allow it
    // but for production this should definitely be required.
    return config.conekta.isDemoMode
  }

  try {
    const hmac = createHmac("sha256", secret)
    const digest = hmac.update(payload).digest("hex")

    const isValid = digest === signature

    if (!isValid) {
      logger.error("Conekta signature verification failed: Digest mismatch", {
        received: signature,
        computed: digest,
      })
    }

    return isValid
  } catch (error) {
    logger.error("Error verifying Conekta signature", { error })
    return false
  }
}
