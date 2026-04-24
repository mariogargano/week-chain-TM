import type { TemplateVariables } from "@/types/email"

/**
 * Renders template string by replacing {{variables}} with actual values
 */
export function renderTemplate(template: string, variables: TemplateVariables): string {
  let rendered = template

  // Replace all {{variable}} patterns
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g")
    const displayValue = formatVariableValue(value)
    rendered = rendered.replace(regex, displayValue)
  })

  // Remove any remaining unmatched variables
  rendered = rendered.replace(/{{[^}]+}}/g, "")

  return rendered
}

/**
 * Format variable value for display in email
 */
function formatVariableValue(value: any): string {
  if (value === null || value === undefined) return ""
  if (typeof value === "boolean") return value ? "Sí" : "No"
  if (Array.isArray(value)) return value.join(", ")
  if (typeof value === "object") return JSON.stringify(value)
  return String(value)
}

/**
 * Extract variables from template string
 */
export function extractVariables(template: string): string[] {
  const regex = /{{\\s*([a-zA-Z0-9_]+)\\s*}}/g
  const variables: string[] = []
  let match

  while ((match = regex.exec(template)) !== null) {
    if (!variables.includes(match[1])) {
      variables.push(match[1])
    }
  }

  return variables
}

/**
 * Generate test variables for a template type
 */
export function generateTestVariables(templateType: string): TemplateVariables {
  const baseVariables: TemplateVariables = {
    company_name: "WEEK-CHAIN",
    company_email: "soporte@week-chain.com",
    company_phone: "+52 55 1234 5678",
    company_whatsapp: "+52 55 1234 5678",
    site_url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.week-chain.com",
    support_url: `${process.env.NEXT_PUBLIC_SITE_URL}/help` || "https://www.week-chain.com/help",
  }

  const userVariables: TemplateVariables = {
    user_first_name: "Juan",
    user_last_name: "Pérez",
    user_full_name: "Juan Pérez",
    user_email: "juan.perez@example.com",
  }

  const certificateVariables: TemplateVariables = {
    certificate_number: "WC-2025-001234",
    certificate_tier: "Gold",
    certificate_pax: 4,
    certificate_start_date: "1 Enero 2025",
    certificate_end_date: "31 Diciembre 2039",
    certificate_qr_url: "https://week-chain.com/certificate/qr/001234",
  }

  const bookingVariables: TemplateVariables = {
    booking_number: "BK-2025-5678",
    booking_status: "CONFIRMED",
    requested_destination: "Cancún, México",
    check_in_date: "15 Marzo 2025",
    check_out_date: "22 Marzo 2025",
    guests_count: 4,
  }

  const propertyVariables: TemplateVariables = {
    property_name: "Villa Paradise Cancún",
    property_address: "Av. Bonampak 123, Zona Hotelera",
    property_destination: "Cancún, Quintana Roo, México",
    property_pax: 6,
    property_bedrooms: 3,
    property_bathrooms: 2,
    property_amenities: ["Piscina privada", "WiFi", "Aire acondicionado", "Cocina equipada"],
    property_check_in_time: "15:00",
    property_check_out_time: "11:00",
    property_access_instructions: "Código de acceso: 1234. Llaves en caja fuerte.",
    property_rating: 4.8,
  }

  const offerVariables: TemplateVariables = {
    offer_expires_at: "18 Marzo 2025 14:00",
    offer_accept_url: `${process.env.NEXT_PUBLIC_SITE_URL}/booking/accept/ABC123`,
    hours_until_expiry: 48,
  }

  // Combine all based on template type
  return {
    ...baseVariables,
    ...userVariables,
    ...certificateVariables,
    ...bookingVariables,
    ...propertyVariables,
    ...offerVariables,
  }
}

/**
 * Validate template has all required variables
 */
export function validateTemplate(
  template: string,
  requiredVariables: string[],
): {
  valid: boolean
  missingVariables: string[]
} {
  const templateVariables = extractVariables(template)
  const missingVariables = requiredVariables.filter((v) => !templateVariables.includes(v))

  return {
    valid: missingVariables.length === 0,
    missingVariables,
  }
}
