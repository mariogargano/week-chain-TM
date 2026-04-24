import crypto from "crypto"

export class SignatureVerifier {
  /**
   * Verifies webhook signature using HMAC-SHA256
   * Uses timing-safe comparison to prevent timing attacks
   */
  static verify(rawBody: string, signature: string, secret: string): boolean {
    if (!secret || !signature) {
      return false
    }

    try {
      // Compute HMAC-SHA256
      const hmac = crypto.createHmac("sha256", secret)
      hmac.update(rawBody)
      const computedSignature = hmac.digest("hex")

      // Timing-safe comparison
      return crypto.timingSafeEqual(Buffer.from(computedSignature), Buffer.from(signature))
    } catch (error) {
      return false
    }
  }

  /**
   * Compute SHA256 hash of payload for audit logging
   */
  static computeDigest(data: string): string {
    return crypto.createHash("sha256").update(data).digest("hex")
  }
}
