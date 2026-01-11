import crypto from "crypto"

/**
 * Generate SHA-256 hash from base64 string
 * Used for NOM-151 document certification
 */
export function sha256Base64(base64Str: string): string {
  const buf = Buffer.from(base64Str, "base64")
  return crypto.createHash("sha256").update(buf).digest("hex")
}

/**
 * Generate SHA-256 hash from string
 */
export function sha256(str: string): string {
  return crypto.createHash("sha256").update(str).digest("hex")
}

/**
 * Generate SHA-256 hash from Buffer
 */
export function sha256Buffer(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex")
}

/**
 * Generate unique folio for NOM-151 certification
 * Format: MX-YYYY-MM-DD-NNNNNN
 */
export function generateNOM151Folio(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  const random = String(Math.floor(Math.random() * 1000000)).padStart(6, "0")

  return `MX-${year}-${month}-${day}-${random}`
}

/**
 * Verify document hash matches expected hash
 */
export function verifyDocumentHash(document: string | Buffer, expectedHash: string): boolean {
  const actualHash = typeof document === "string" ? sha256(document) : sha256Buffer(document)

  return actualHash === expectedHash
}
