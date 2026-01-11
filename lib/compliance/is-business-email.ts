/**
 * Valida si un email es corporativo/empresarial
 * Rechaza emails de dominios gratuitos para usuarios broker
 */
export function isBusinessEmail(email: string): boolean {
  const freeEmailDomains = [
    "gmail.com",
    "yahoo.com",
    "hotmail.com",
    "outlook.com",
    "icloud.com",
    "protonmail.com",
    "aol.com",
    "mail.com",
    "zoho.com",
    "yandex.com",
    "gmx.com",
    "live.com",
    "msn.com",
    "inbox.com",
    "mail.ru",
  ]

  const domain = email.split("@")[1]?.toLowerCase()
  if (!domain) return false

  return !freeEmailDomains.includes(domain)
}

export function validateBusinessEmail(email: string): { valid: boolean; error?: string } {
  if (!email || !email.includes("@")) {
    return { valid: false, error: "Email inválido" }
  }

  if (!isBusinessEmail(email)) {
    return {
      valid: false,
      error: "Se requiere un email corporativo. No se permiten correos gratuitos (Gmail, Yahoo, etc.)",
    }
  }

  return { valid: true }
}
