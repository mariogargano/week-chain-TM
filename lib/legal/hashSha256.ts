import crypto from "crypto"

/**
 * Genera un hash SHA-256 de un string
 * Usado para evidencia digital NOM-151 compliant
 *
 * @param data - String a hashear
 * @returns Hash SHA-256 en formato hexadecimal
 */
export function hashSha256(data: string): string {
  return crypto.createHash("sha256").update(data, "utf8").digest("hex")
}

/**
 * Genera un hash SHA-256 de un objeto JSON
 * El objeto se canonicaliza antes de hashear para garantizar determinismo
 *
 * @param obj - Objeto a hashear
 * @returns Hash SHA-256 en formato hexadecimal
 */
export function hashObjectSha256(obj: any): string {
  const canonical = JSON.stringify(obj, Object.keys(obj).sort())
  return hashSha256(canonical)
}

/**
 * Verifica si un hash SHA-256 es válido
 *
 * @param hash - Hash a verificar
 * @returns true si es un hash SHA-256 válido
 */
export function isValidSha256(hash: string): boolean {
  return /^[a-f0-9]{64}$/i.test(hash)
}

/**
 * Genera un hash SHA-256 con salt para passwords
 * NO USAR PARA EVIDENCIA DIGITAL - Solo para comparaciones
 *
 * @param data - String a hashear
 * @param salt - Salt opcional
 * @returns Hash SHA-256 con salt
 */
export function hashWithSalt(data: string, salt = ""): string {
  return hashSha256(data + salt)
}
