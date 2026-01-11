import { createClient } from "@/lib/supabase/server"

export type ConsentType =
  | "terms_acceptance"
  | "certificate_activation"
  | "reservation_request"
  | "offer_acceptance"
  | "privacy_policy"
  | "marketing_consent"

export interface ConsentRequirement {
  type: ConsentType
  required: boolean
  documentVersion: string
}

/**
 * Check if user has valid consent for a specific action
 * CRITICAL: This blocks actions if consent is missing
 */
export async function checkConsent(userId: string, consentType: ConsentType): Promise<boolean> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc("has_valid_consent", {
    p_user_id: userId,
    p_consent_type: consentType,
    p_max_age_days: 365,
  })

  if (error) {
    console.error("[CONSENT] Error checking consent:", error)
    return false // Block action on error (fail-safe)
  }

  return data === true
}

/**
 * Record user consent with full audit trail
 * NOM-151 compliant with SHA-256 hash
 */
export async function recordConsent(
  userId: string,
  consentType: ConsentType,
  documentVersion: string,
  ipAddress: string,
  userAgent: string,
  metadata: Record<string, any> = {},
): Promise<string | null> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc("record_consent", {
    p_user_id: userId,
    p_consent_type: consentType,
    p_document_version: documentVersion,
    p_ip_address: ipAddress,
    p_user_agent: userAgent,
    p_metadata: metadata,
  })

  if (error) {
    console.error("[CONSENT] Error recording consent:", error)
    return null
  }

  return data
}

/**
 * Enforce consent before critical actions
 * Throws error if consent missing (blocks execution)
 */
export async function enforceConsent(userId: string, action: ConsentType): Promise<void> {
  const hasConsent = await checkConsent(userId, action)

  if (!hasConsent) {
    throw new Error(`CONSENT_REQUIRED: User must accept ${action} before proceeding`)
  }
}

/**
 * Get all consents for a user (for admin audit)
 */
export async function getUserConsents(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("user_consents")
    .select("*")
    .eq("user_id", userId)
    .order("accepted_at", { ascending: false })

  if (error) {
    console.error("[CONSENT] Error fetching user consents:", error)
    return []
  }

  return data
}
