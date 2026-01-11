// Centralized environment configuration and validation
// This file manages all environment variables and provides type-safe access

export interface EnvironmentConfig {
  // App Configuration
  nodeEnv: "development" | "production" | "test"
  siteUrl: string
  appUrl: string

  // Feature Flags
  isDemoMode: boolean
  isProduction: boolean

  // Database
  supabase: {
    url: string
    anonKey: string
    serviceRoleKey: string
  }

  // Payments
  conekta: {
    secretKey: string
    webhookSecret: string
    isDemoMode: boolean
  }

  google: {
    clientId: string
    clientSecret: string
    isConfigured: boolean
  }

  // KYC
  kyc: {
    provider: "persona" | "sumsub" | "none"
    persona?: {
      apiKey: string
      templateId: string
      environment: string
    }
    sumsub?: {
      appToken: string
      secretKey: string
    }
  }

  // Legal
  legalario: {
    apiKey: string
  }

  // Email
  resend: {
    apiKey: string
  }

  // Blockchain
  solana: {
    cluster: "devnet" | "mainnet-beta"
    isDemoMode: boolean
  }
}

const getNodeEnv = (): "development" | "production" | "test" => {
  // On the server, use process.env.NODE_ENV
  if (typeof window === "undefined") {
    return (process.env.NODE_ENV || "development") as "development" | "production" | "test"
  }
  // On the client, default to production for safety (actual value is set at build time)
  return "production"
}

class EnvironmentValidator {
  private config: EnvironmentConfig
  private errors: string[] = []
  private warnings: string[] = []

  constructor() {
    this.config = this.loadConfig()
    // Only validate on server
    if (typeof window === "undefined") {
      this.validate()
    }
  }

  private loadConfig(): EnvironmentConfig {
    const nodeEnv = getNodeEnv()
    const isProduction = nodeEnv === "production"

    // Conekta demo mode detection - only access secret key on server
    const conektaSecretKey = typeof window === "undefined" ? process.env.CONEKTA_SECRET_KEY || "" : ""

    // Debug log to see what key we're getting
    if (typeof window === "undefined") {
      console.log("[v0] CONEKTA_SECRET_KEY detection:", {
        hasKey: !!conektaSecretKey,
        keyLength: conektaSecretKey.length,
        keyPrefix: conektaSecretKey ? conektaSecretKey.substring(0, 10) : "none",
        startsWithKey: conektaSecretKey.startsWith("key_"),
      })
    }

    // Keys starting with "key_" are valid Conekta keys (both test and live)
    const conektaDemoMode = !conektaSecretKey || conektaSecretKey === "demo_mode"

    // Google config - only access secrets on server
    const googleClientId = typeof window === "undefined" ? process.env.GOOGLE_CLIENT_ID || "" : ""
    const googleClientSecret = typeof window === "undefined" ? process.env.GOOGLE_CLIENT_SECRET || "" : ""
    const googleConfigured = Boolean(googleClientId && googleClientSecret)

    // Overall demo mode (if any payment processor is in demo)
    const isDemoMode = conektaDemoMode

    // KYC provider detection - only on server
    let kycProvider: "persona" | "sumsub" | "none" = "none"
    if (typeof window === "undefined") {
      if (process.env.PERSONA_API_KEY) kycProvider = "persona"
      else if (process.env.SUMSUB_APP_TOKEN) kycProvider = "sumsub"
    }

    const productionUrl = "https://www.week-chain.com"
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (isProduction ? productionUrl : "http://localhost:3000")
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || siteUrl

    return {
      nodeEnv,
      siteUrl,
      appUrl,
      isDemoMode,
      isProduction,

      supabase: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
        serviceRoleKey: typeof window === "undefined" ? process.env.SUPABASE_SERVICE_ROLE_KEY || "" : "",
      },

      conekta: {
        secretKey: conektaSecretKey,
        webhookSecret: typeof window === "undefined" ? process.env.CONEKTA_WEBHOOK_SECRET || "" : "",
        isDemoMode: conektaDemoMode,
      },

      google: {
        clientId: googleClientId,
        clientSecret: googleClientSecret,
        isConfigured: googleConfigured,
      },

      kyc: {
        provider: kycProvider,
        persona:
          typeof window === "undefined" && process.env.PERSONA_API_KEY
            ? {
                apiKey: process.env.PERSONA_API_KEY,
                templateId: process.env.PERSONA_TEMPLATE_ID || "",
                environment: process.env.NEXT_PUBLIC_PERSONA_ENVIRONMENT || "sandbox",
              }
            : undefined,
        sumsub:
          typeof window === "undefined" && process.env.SUMSUB_APP_TOKEN
            ? {
                appToken: process.env.SUMSUB_APP_TOKEN,
                secretKey: process.env.SUMSUB_SECRET_KEY || "",
              }
            : undefined,
      },

      legalario: {
        apiKey: typeof window === "undefined" ? process.env.LEGALARIO_API_KEY || "" : "",
      },

      resend: {
        apiKey: typeof window === "undefined" ? process.env.RESEND_API_KEY || "" : "",
      },

      solana: {
        cluster: isProduction && !isDemoMode ? "mainnet-beta" : "devnet",
        isDemoMode: isDemoMode,
      },
    }
  }

  private validate() {
    // Only run validation on server
    if (typeof window !== "undefined") return

    // Critical validations for production
    if (this.config.isProduction) {
      this.validateProduction()
    }

    // Warnings for demo mode
    if (this.config.isDemoMode && this.config.isProduction) {
      this.warnings.push(
        "⚠️  Running in PRODUCTION with DEMO MODE enabled. Payment processors are not configured for real transactions.",
      )
    }

    // Database validation
    if (!this.config.supabase.url || !this.config.supabase.anonKey) {
      this.errors.push("❌ Supabase configuration is missing (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)")
    }

    if (!this.config.google.isConfigured) {
      this.warnings.push("⚠️  Google OAuth not configured. Sign in with Google will be disabled.")
    }

    // KYC validation
    if (this.config.kyc.provider === "none" && this.config.isProduction) {
      this.warnings.push("⚠️  No KYC provider configured. Identity verification will be disabled.")
    }

    // Legal compliance validation
    if (!this.config.legalario.apiKey && this.config.isProduction) {
      this.warnings.push("⚠️  Legalario not configured. NOM-151 legal compliance will not be available.")
    }

    // Email validation
    if (!this.config.resend.apiKey && this.config.isProduction) {
      this.warnings.push("⚠️  Resend not configured. Transactional emails will not be sent.")
    }
  }

  private validateProduction() {
    const isDemoMode = this.config.isDemoMode

    // Payment processors
    if (this.config.conekta.isDemoMode) {
      this.warnings.push("⚠️  Conekta is in DEMO MODE. Configure production key: CONEKTA_SECRET_KEY")
    }

    if (!this.config.conekta.webhookSecret) {
      this.warnings.push("⚠️  Conekta webhook secret is missing: CONEKTA_WEBHOOK_SECRET")
    }

    // Blockchain
    if (this.config.solana.cluster === "devnet") {
      if (isDemoMode) {
        this.warnings.push("⚠️  Solana is on DEVNET. This is expected in demo mode.")
      } else {
        this.errors.push("❌ Solana is on DEVNET. Deploy smart contracts to mainnet-beta for production.")
      }
    }
  }

  getConfig(): EnvironmentConfig {
    return this.config
  }

  getErrors(): string[] {
    return this.errors
  }

  getWarnings(): string[] {
    return this.warnings
  }

  hasErrors(): boolean {
    return this.errors.length > 0
  }

  printStatus() {
    // Only print on server
    if (typeof window !== "undefined") return

    console.log("\n🔧 WEEK-CHAIN Environment Configuration\n")
    console.log(`Environment: ${this.config.nodeEnv}`)
    console.log(`Demo Mode: ${this.config.isDemoMode ? "✅ ENABLED" : "❌ DISABLED"}`)
    console.log(`Production: ${this.config.isProduction ? "✅ YES" : "❌ NO"}`)
    console.log(`\nPayment Processor:`)
    console.log(`  Conekta: ${this.config.conekta.isDemoMode ? "🧪 Demo" : "✅ Production"}`)
    console.log(`\nAuthentication:`)
    console.log(`  Google OAuth: ${this.config.google.isConfigured ? "✅ Configured" : "❌ Not Configured"}`)
    console.log(`\nKYC Provider: ${this.config.kyc.provider}`)
    console.log(`Blockchain: ${this.config.solana.cluster}`)

    if (this.warnings.length > 0) {
      console.log("\n⚠️  Warnings:")
      this.warnings.forEach((warning) => console.log(`  ${warning}`))
    }

    if (this.errors.length > 0) {
      console.log("\n❌ Errors:")
      this.errors.forEach((error) => console.log(`  ${error}`))
      if (!this.config.isDemoMode) {
        console.log("\n🚫 Cannot start in production mode with errors. Please fix configuration.\n")
      } else {
        console.log("\n⚠️  Running in DEMO MODE - these errors are treated as warnings.\n")
      }
    } else {
      console.log("\n✅ Configuration validated successfully\n")
    }
  }
}

// Singleton instance
let envInstance: EnvironmentValidator | null = null

export function getEnvironment(): EnvironmentConfig {
  if (!envInstance) {
    envInstance = new EnvironmentValidator()

    // Print status on first load (server-side only)
    if (typeof window === "undefined") {
      envInstance.printStatus()

      if (envInstance.hasErrors() && envInstance.getConfig().isProduction && !envInstance.getConfig().isDemoMode) {
        throw new Error("Critical environment configuration errors detected. Cannot start in production mode.")
      }
    }
  }

  return envInstance.getConfig()
}

export function validateEnvironment(): { valid: boolean; errors: string[]; warnings: string[] } {
  if (!envInstance) {
    envInstance = new EnvironmentValidator()
  }

  // Add critical check for webhook secret
  const config = envInstance.getConfig()
  const errors = envInstance.getErrors()
  const warnings = envInstance.getWarnings()

  if (config.isProduction && !config.conekta.webhookSecret && !config.isDemoMode) {
    errors.push("❌ CONEKTA_WEBHOOK_SECRET is required for production")
  }

  return {
    valid: !envInstance.hasErrors(),
    errors,
    warnings,
  }
}

// Export env as a simple object with getter functions
export const env = {
  CONEKTA_SECRET_KEY: () => getEnvironment().conekta.secretKey,
  CONEKTA_WEBHOOK_SECRET: () => getEnvironment().conekta.webhookSecret,
  googleClientId: () => getEnvironment().google.clientId,
  googleClientSecret: () => getEnvironment().google.clientSecret,
  appUrl: () => getEnvironment().appUrl,
  isDemoMode: () => getEnvironment().isDemoMode,
  isProduction: () => getEnvironment().isProduction,
  config: () => getEnvironment(),
}

// Also export individual helper functions for direct access
export const isDemoMode = () => getEnvironment().isDemoMode
export const isProduction = () => getEnvironment().isProduction
