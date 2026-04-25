/**
 * Environment variable validation utility for production hardening.
 *
 * Usage:
 *   - Call validateEnvVars() at server startup to ensure critical env vars are set.
 *   - This prevents silent failures like missing Stripe keys, database credentials, etc.
 */

const CRITICAL_ENV_VARS = {
  STRIPE_SECRET_KEY: "Stripe secret key for payment processing",
  STRIPE_WEBHOOK_SECRET: "Stripe webhook signature verification secret",
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "Stripe publishable key for checkout",
  SUPABASE_URL: "Supabase project URL for database access",
  SUPABASE_ANON_KEY: "Supabase anonymous key for auth",
  RESEND_API_KEY: "Resend API key for email delivery",
}

const OPTIONAL_ENV_VARS = {
  STRIPE_WEBHOOK_SECRET_PRE_HOLDER: "Pre-holder webhook secret (optional)",
  CONEKTA_API_KEY: "Conekta API key for card payments (optional)",
  SOLANA_RPC_URL: "Solana RPC endpoint (optional, payment disabled)",
}

export function validateEnvVars(environment: "development" | "production" = "development"): {
  valid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  // Check critical vars
  for (const [key, description] of Object.entries(CRITICAL_ENV_VARS)) {
    if (!process.env[key]) {
      errors.push(`Missing critical env var: ${key} (${description})`)
    }
  }

  // Check optional vars in production
  if (environment === "production") {
    for (const [key, description] of Object.entries(OPTIONAL_ENV_VARS)) {
      if (!process.env[key]) {
        warnings.push(`Optional env var not set: ${key} (${description})`)
      }
    }
  }

  const valid = errors.length === 0

  if (!valid && environment === "production") {
    console.error(
      "[CRITICAL] Env validation failed. The application cannot start safely in production without these vars."
    )
    errors.forEach((err) => console.error(`  - ${err}`))
  }

  if (warnings.length > 0 && environment === "production") {
    console.warn("[WARNING] Some optional features are disabled due to missing env vars:")
    warnings.forEach((warn) => console.warn(`  - ${warn}`))
  }

  return { valid, errors, warnings }
}

/**
 * Call this at application startup (e.g., in app/layout.tsx or an API bootstrap route).
 * If validation fails in production, throw an error to prevent the app from starting.
 */
export function assertEnvValid(environment: "development" | "production" = "development") {
  const { valid, errors } = validateEnvVars(environment)

  if (!valid && environment === "production") {
    throw new Error(
      `Fatal: Environment validation failed.\n${errors.join("\n")}\n\nPlease set all critical environment variables before deploying.`
    )
  }
}
