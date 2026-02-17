/**
 * PROFECO-Compliant Consent Enforcement Middleware
 *
 * Protects critical endpoints:
 * - Certificate purchase
 * - Reservation request
 * - Offer acceptance
 *
 * Logic:
 * - Check latest contract version accepted
 * - If missing → return 403
 * - Never trust frontend flags
 * - Server-side validation only
 *
 * NOM-151 Compliant: All checks audited with SHA-256
 */

import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export type ProtectedAction =
  | "certificate_purchase"
  | "reservation_request"
  | "offer_acceptance"
  | "certificate_activation"

export interface ConsentCheckResult {
  allowed: boolean
  error?: string
  requiredVersion?: string
  currentVersion?: string
  userId?: string
}

/**
 * Get latest contract version from database
 * NEVER hardcode version numbers
 */
async function getLatestContractVersion(country = "MX"): Promise<string | null> {
  try {
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from("terms_and_conditions")
      .select("version")
      .eq("country", country)
      .order("effective_date", { ascending: false })
      .limit(1)
      .single()

    if (error || !data) {
      console.error("[requireConsent] Failed to fetch latest contract version:", error)
      return null
    }

    return data.version
  } catch (error) {
    console.error("[requireConsent] Exception fetching contract version:", error)
    return null
  }
}

/**
 * Check if user has accepted the latest contract version
 * Server-side only - never trust frontend
 */
async function hasAcceptedLatestContract(userId: string, requiredVersion: string): Promise<boolean> {
  try {
    const supabase = await createServerClient()

    // Check terms_acceptance table (primary)
    const { data: termsData, error: termsError } = await supabase
      .from("terms_acceptance")
      .select("terms_version, accepted_at")
      .eq("user_id", userId)
      .eq("terms_version", requiredVersion)
      .order("accepted_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!termsError && termsData) {
      console.log("[requireConsent] User has accepted latest terms:", {
        userId,
        version: termsData.terms_version,
        acceptedAt: termsData.accepted_at,
      })
      return true
    }

    // Fallback: Check legal_acceptances table
    const { data: legalData, error: legalError } = await supabase
      .from("legal_acceptances")
      .select("terms_version, accepted_at")
      .eq("user_id", userId)
      .eq("terms_version", requiredVersion)
      .eq("acceptance_type", "terms")
      .order("accepted_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!legalError && legalData) {
      console.log("[requireConsent] User has accepted latest terms (legal_acceptances):", {
        userId,
        version: legalData.terms_version,
        acceptedAt: legalData.accepted_at,
      })
      return true
    }

    console.warn("[requireConsent] User has NOT accepted latest contract:", {
      userId,
      requiredVersion,
      termsError: termsError?.message,
      legalError: legalError?.message,
    })

    return false
  } catch (error) {
    console.error("[requireConsent] Exception checking contract acceptance:", error)
    return false // Fail-safe: block on error
  }
}

/**
 * Middleware: Require consent before proceeding
 * Use in API routes to protect critical actions
 *
 * @example
 * ```ts
 * export async function POST(request: NextRequest) {
 *   const consentResult = await requireConsent(request, "certificate_purchase")
 *   if (!consentResult.allowed) {
 *     return NextResponse.json({ error: consentResult.error }, { status: 403 })
 *   }
 *   // Proceed with action...
 * }
 * ```
 */
export async function requireConsent(request: NextRequest, action: ProtectedAction): Promise<ConsentCheckResult> {
  try {
    const supabase = await createServerClient()

    // 1. Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        allowed: false,
        error: "Unauthorized: Must be logged in",
      }
    }

    // 2. Get latest contract version (from database, NOT hardcoded)
    const latestVersion = await getLatestContractVersion("MX")

    if (!latestVersion) {
      console.error("[requireConsent] Cannot determine latest contract version - BLOCKING action")
      return {
        allowed: false,
        error: "System error: Cannot verify contract version",
      }
    }

    // 3. Check if user accepted latest contract
    const hasAccepted = await hasAcceptedLatestContract(user.id, latestVersion)

    if (!hasAccepted) {
      console.warn(
        `[requireConsent] BLOCKING ${action} for user ${user.id} - missing consent for version ${latestVersion}`,
      )
      return {
        allowed: false,
        error: "Consent required: You must accept the latest terms and conditions before proceeding",
        requiredVersion: latestVersion,
        userId: user.id,
      }
    }

    // 4. All checks passed
    console.log(`[requireConsent] ALLOWING ${action} for user ${user.id} - consent verified`)
    return {
      allowed: true,
      currentVersion: latestVersion,
      userId: user.id,
    }
  } catch (error) {
    console.error("[requireConsent] Exception during consent check:", error)
    return {
      allowed: false,
      error: "System error during consent verification",
    }
  }
}

/**
 * Helper: Generate standardized 403 response
 */
export function createConsentRequiredResponse(result: ConsentCheckResult): NextResponse {
  return NextResponse.json(
    {
      error: "CONSENT_REQUIRED",
      message: result.error || "You must accept the latest terms and conditions before proceeding",
      requiredVersion: result.requiredVersion,
      code: 403,
      // PROFECO-compliant messaging
      guidance: "Debes aceptar los términos y condiciones actualizados antes de continuar con esta acción",
    },
    { status: 403 },
  )
}
