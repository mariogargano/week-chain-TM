// lib/flags/client.ts
import { createClient } from "@/lib/supabase/client"

export interface FeatureFlags {
  PAYMENTS_ENABLED: boolean
  STRIPE_LIVE_MODE_ENABLED: boolean
  CONEKTA_ENABLED: boolean
  CERTIFICATE_ISSUANCE_ENABLED: boolean
  WEBHOOK_PROCESSING_ENABLED: boolean
  EMAILS_ENABLED: boolean
  KYC_ENABLED: boolean
  SIGNATURE_ENABLED: boolean
  PUBLIC_SIGNUP_ENABLED: boolean
  BETA_ALLOWLIST_ONLY: boolean
}

// In-memory cache with TTL (30 seconds)
let flagCache: { data: FeatureFlags | null; timestamp: number } = {
  data: null,
  timestamp: 0,
}

const CACHE_TTL = 30000 // 30 seconds

export async function getFeatureFlags(): Promise<FeatureFlags> {
  const now = Date.now()

  // Return cached flags if fresh
  if (flagCache.data && now - flagCache.timestamp < CACHE_TTL) {
    return flagCache.data
  }

  try {
    const supabase = createClient()
    const { data, error } = await supabase.from("feature_flags").select("name, enabled")

    if (error) {
      console.error("[v0] Feature flags query error:", error)
      // Return safe defaults if query fails
      return getDefaultFlags()
    }

    const flags = data?.reduce(
      (acc, row) => {
        acc[row.name as keyof FeatureFlags] = row.enabled
        return acc
      },
      {} as Partial<FeatureFlags>
    ) as Partial<FeatureFlags>

    const fullFlags = { ...getDefaultFlags(), ...flags }

    // Update cache
    flagCache = { data: fullFlags, timestamp: now }

    return fullFlags
  } catch (error) {
    console.error("[v0] Error fetching feature flags:", error)
    return getDefaultFlags()
  }
}

export function getDefaultFlags(): FeatureFlags {
  return {
    PAYMENTS_ENABLED: false,
    STRIPE_LIVE_MODE_ENABLED: false,
    CONEKTA_ENABLED: false,
    CERTIFICATE_ISSUANCE_ENABLED: false,
    WEBHOOK_PROCESSING_ENABLED: true,
    EMAILS_ENABLED: false,
    KYC_ENABLED: false,
    SIGNATURE_ENABLED: false,
    PUBLIC_SIGNUP_ENABLED: true,
    BETA_ALLOWLIST_ONLY: false,
  }
}

export async function updateFeatureFlag(flagName: keyof FeatureFlags, enabled: boolean) {
  const supabase = createClient()

  const { error } = await supabase
    .from("feature_flags")
    .update({ enabled, updated_at: new Date().toISOString() })
    .eq("name", flagName)

  if (error) {
    throw new Error(`Failed to update flag ${flagName}: ${error.message}`)
  }

  // Clear cache to force refresh
  flagCache = { data: null, timestamp: 0 }
}

export async function clearFlagsCache() {
  flagCache = { data: null, timestamp: 0 }
}
