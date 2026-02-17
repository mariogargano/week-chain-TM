"use server"

import { createServiceRoleClient } from "@/lib/supabase/server"
import * as OTPAuth from "otpauth"
import * as crypto from "crypto"

export interface TwoFactorSetup {
  secret: string
  qrCode: string
  backupCodes: string[]
}

export interface TwoFactorConfig {
  id: string
  user_id: string
  enabled: boolean
  enabled_at: string | null
  last_used_at: string | null
}

/**
 * Genera un secreto TOTP y códigos de respaldo para 2FA
 */
export async function generateTwoFactorSecret(userId: string, email: string): Promise<TwoFactorSetup> {
  // Generar secreto TOTP
  const secret = new OTPAuth.Secret({ size: 20 })

  // Crear TOTP
  const totp = new OTPAuth.TOTP({
    issuer: "WEEK-CHAIN",
    label: email,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: secret,
  })

  // Generar QR code URI
  const qrCode = totp.toString()

  // Generar 10 códigos de respaldo
  const backupCodes = Array.from({ length: 10 }, () => crypto.randomBytes(4).toString("hex").toUpperCase())

  const supabase = createServiceRoleClient()

  // Primero eliminar cualquier configuración existente
  await supabase.from("user_two_factor").delete().eq("user_id", userId)

  const { error } = await supabase.from("user_two_factor").insert({
    user_id: userId,
    secret: secret.base32,
    backup_codes: backupCodes,
    enabled: false,
  })

  if (error) {
    console.error("[v0] 2FA insert error:", error)
    throw new Error(`Failed to save 2FA config: ${error.message}`)
  }

  return {
    secret: secret.base32,
    qrCode,
    backupCodes,
  }
}

/**
 * Verifica un código TOTP
 */
export async function verifyTwoFactorCode(userId: string, code: string): Promise<boolean> {
  const supabase = createServiceRoleClient()

  // Obtener configuración 2FA del usuario
  const { data: config, error } = await supabase.from("user_two_factor").select("*").eq("user_id", userId).single()

  if (error || !config) {
    await logTwoFactorAttempt(userId, "verify_fail", false)
    return false
  }

  // Verificar código TOTP
  const totp = new OTPAuth.TOTP({
    issuer: "WEEK-CHAIN",
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(config.secret),
  })

  const delta = totp.validate({ token: code, window: 1 })

  if (delta !== null) {
    // Código válido
    await supabase.from("user_two_factor").update({ last_used_at: new Date().toISOString() }).eq("user_id", userId)

    await logTwoFactorAttempt(userId, "verify_success", true)
    return true
  }

  // Verificar si es un código de respaldo
  if (config.backup_codes && config.backup_codes.includes(code)) {
    // Remover código de respaldo usado
    const updatedCodes = config.backup_codes.filter((c: string) => c !== code)

    await supabase
      .from("user_two_factor")
      .update({
        backup_codes: updatedCodes,
        last_used_at: new Date().toISOString(),
      })
      .eq("user_id", userId)

    await logTwoFactorAttempt(userId, "verify_success", true)
    return true
  }

  await logTwoFactorAttempt(userId, "verify_fail", false)
  return false
}

/**
 * Habilita 2FA para un usuario después de verificar el código
 */
export async function enableTwoFactor(userId: string, verificationCode: string): Promise<boolean> {
  // Verificar código primero
  const isValid = await verifyTwoFactorCode(userId, verificationCode)

  if (!isValid) {
    return false
  }

  const supabase = createServiceRoleClient()
  const { error } = await supabase
    .from("user_two_factor")
    .update({
      enabled: true,
      enabled_at: new Date().toISOString(),
    })
    .eq("user_id", userId)

  if (error) {
    throw new Error(`Failed to enable 2FA: ${error.message}`)
  }

  await logTwoFactorAttempt(userId, "enable", true)
  return true
}

/**
 * Deshabilita 2FA para un usuario
 */
export async function disableTwoFactor(userId: string): Promise<void> {
  const supabase = createServiceRoleClient()

  const { error } = await supabase
    .from("user_two_factor")
    .update({
      enabled: false,
      enabled_at: null,
    })
    .eq("user_id", userId)

  if (error) {
    throw new Error(`Failed to disable 2FA: ${error.message}`)
  }

  await logTwoFactorAttempt(userId, "disable", true)
}

/**
 * Verifica si un usuario tiene 2FA habilitado
 */
export async function hasTwoFactorEnabled(userId: string): Promise<boolean> {
  const supabase = createServiceRoleClient()

  const { data, error } = await supabase.from("user_two_factor").select("enabled").eq("user_id", userId).single()

  if (error || !data) {
    return false
  }

  return data.enabled === true
}

/**
 * Obtiene la configuración 2FA de un usuario
 */
export async function getTwoFactorConfig(userId: string): Promise<TwoFactorConfig | null> {
  const supabase = createServiceRoleClient()

  const { data, error } = await supabase
    .from("user_two_factor")
    .select("id, user_id, enabled, enabled_at, last_used_at")
    .eq("user_id", userId)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

/**
 * Registra un intento de 2FA en el log de auditoría
 */
async function logTwoFactorAttempt(userId: string, action: string, success: boolean): Promise<void> {
  const supabase = createServiceRoleClient()

  await supabase.from("two_factor_audit_log").insert({
    user_id: userId,
    action,
    success,
    ip_address: null,
    user_agent: null,
  })
}

/**
 * Verifica si un rol requiere 2FA
 */
export async function roleRequiresTwoFactor(role: string): Promise<boolean> {
  const rolesRequiring2FA = ["admin", "super_admin", "management", "notaria"]
  return rolesRequiring2FA.includes(role)
}
