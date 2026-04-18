import { createServerClient } from "@/lib/supabase/server"

export type ConsentType = "terms" | "privacy" | "reservation" | "activation" | "offer_acceptance"

/**
 * Check if user has valid consent for specified action
 * PROFECO-compliant: Blocks action if consent not granted
 *
 * Graceful fallback strategy:
 * - Try user_consents (primary, PROFECO-compliant)
 * - Fall back to terms_acceptance (legacy)
 * - If both missing, return invalid
 */
export async function validateConsent(
  userId: string,
  consentType: ConsentType,
  requiredVersion?: string,
): Promise<{ valid: boolean; error?: string; version?: string }> {
  try {
    const supabase = await createServerClient()

    // Primary: user_consents table
    const { data: consents, error } = await supabase
      .from("user_consents")
      .select("consent_version, accepted_at")
      .eq("user_id", userId)
      .eq("consent_type", consentType)
      .order("accepted_at", { ascending: false })
      .limit(1)

    if (error && (error.code === "42P01" || error.message?.includes("does not exist"))) {
      console.warn("[v0] user_consents table missing - falling back to terms_acceptance")
      // Fallback to legacy table for terms
      if (consentType === "terms") {
        const { data: legacy } = await supabase
          .from("terms_acceptance")
          .select("terms_version, accepted_at")
          .eq("user_id", userId)
          .order("accepted_at", { ascending: false })
          .limit(1)
        if (legacy && legacy.length > 0) {
          return { valid: true, version: legacy[0].terms_version }
        }
      }
      // Dev mode bypass
      if (process.env.NODE_ENV === "development") {
        return { valid: true, version: "dev_bypass" }
      }
      return { valid: false, error: `Missing ${consentType} consent` }
    }

    if (error) {
      console.error("[v0] Consent validation error:", error)
      return { valid: false, error: "Database error" }
    }

    if (!consents || consents.length === 0) {
      return {
        valid: false,
        error: `Missing ${consentType} consent`,
      }
    }

    const latestConsent = consents[0]

    if (requiredVersion && latestConsent.consent_version !== requiredVersion) {
      return {
        valid: false,
        error: `Outdated ${consentType} consent (current: ${latestConsent.consent_version}, required: ${requiredVersion})`,
      }
    }

    return { valid: true, version: latestConsent.consent_version }
  } catch (error) {
    console.error("[v0] Consent validation exception:", error)
    return { valid: false, error: "Validation failed" }
  }
}

/**
 * Middleware helper to enforce consent before API action
 * Returns error response if consent not valid
 */
export async function enforceConsent(
  userId: string,
  consentType: ConsentType,
  requiredVersion?: string,
): Promise<Response | null> {
  const validation = await validateConsent(userId, consentType, requiredVersion)

  if (!validation.valid) {
    return new Response(
      JSON.stringify({
        error: "Consent required",
        message: validation.error || "You must accept the required terms before performing this action",
        consentType,
        requiredVersion,
      }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      },
    )
  }

  return null
}
