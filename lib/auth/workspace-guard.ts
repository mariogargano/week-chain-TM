import { createClient } from "@/lib/supabase/server"
import { logger } from "@/lib/config/logger"

/**
 * Dominios de email oficiales de WEEK-CHAIN
 */
const OFFICIAL_EMAIL_DOMAINS = [
  "@weekchain.com",
  "@week-chain.com",
  "@weekchain.mx",
  "@morises.com", // Propiedad intelectual
]

/**
 * Verifica si un email es del dominio oficial de WEEK-CHAIN
 */
export function isOfficialEmail(email: string): boolean {
  if (!email) return false

  const emailLower = email.toLowerCase()
  return OFFICIAL_EMAIL_DOMAINS.some((domain) => emailLower.endsWith(domain))
}

/**
 * Verifica si el usuario actual tiene acceso al workspace
 * Solo usuarios con email oficial de WEEK-CHAIN pueden acceder
 */
export async function verifyWorkspaceAccess(): Promise<{
  hasAccess: boolean
  user: any | null
  error?: string
}> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      logger.warn("Workspace access denied: No authenticated user")
      return {
        hasAccess: false,
        user: null,
        error: "No autenticado. Debes iniciar sesión con tu email oficial de WEEK-CHAIN.",
      }
    }

    // Verificar si el email es del dominio oficial
    if (!isOfficialEmail(user.email || "")) {
      logger.warn("Workspace access denied: Unauthorized email domain", {
        email: user.email,
      })
      return {
        hasAccess: false,
        user: null,
        error: "Acceso denegado. Solo miembros del equipo WEEK-CHAIN con email oficial pueden acceder al workspace.",
      }
    }

    logger.info("Workspace access granted", {
      email: user.email,
      userId: user.id,
    })

    return {
      hasAccess: true,
      user,
    }
  } catch (error) {
    logger.error("Error verifying workspace access", { error })
    return {
      hasAccess: false,
      user: null,
      error: "Error al verificar acceso. Por favor intenta de nuevo.",
    }
  }
}
