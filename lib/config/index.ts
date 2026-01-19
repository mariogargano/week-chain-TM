import { z } from "zod"

/**
 * Validates and provides type-safe access to environment variables.
 * This is the single source of truth for environment configuration.
 */

const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // URLs
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_JWT_SECRET: z.string().min(1).optional(),

  // Conekta (Primary payment processor)
  CONEKTA_SECRET_KEY: z.string().min(1),
  CONEKTA_WEBHOOK_SECRET: z.string().min(1).optional(),

  // Email
  RESEND_API_KEY: z.string().min(1).optional(),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string().min(1).optional(),

  // Legalario (NOM-151 Certification)
  LEGALARIO_API_KEY: z.string().min(1).optional(),
  LEGALARIO_WEBHOOK_SECRET: z.string().min(1).optional(),
  LEGALARIO_API_URL: z.string().url().default("https://api.legalario.com/v1"),

  // Solana (for future NFT integration)
  SOLANA_RPC: z.string().url().default("https://api.devnet.solana.com"),
  SOLANA_NETWORK: z.enum(["mainnet-beta", "devnet", "testnet"]).default("devnet"),

  // USDC
  USDC_MINT: z.string().default("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
})

export type EnvSchema = z.infer<typeof envSchema>

let cachedEnv: EnvSchema | null = null

export function validateEnv(): EnvSchema {
  if (cachedEnv) return cachedEnv

  const result = envSchema.safeParse(process.env)

  if (!result.success) {
    console.error("❌ Environment validation failed:")
    result.error.errors.forEach((err) => {
      console.error(`  - ${err.path.join(".")}: ${err.message}`)
    })

    // In production, we should be strict
    if (process.env.NODE_ENV === "production") {
      throw new Error("Invalid environment variables. Check logs.")
    }

    // In development, we return a partial env but warn
    cachedEnv = process.env as any
    return cachedEnv!
  }

  cachedEnv = result.data
  return cachedEnv
}

export function getEnv(): EnvSchema {
  return validateEnv()
}

/**
 * Type-safe configuration object
 */
export const config = {
  get env() { return getEnv() },
  get isProduction() { return getEnv().NODE_ENV === "production" },
  get isDevelopment() { return getEnv().NODE_ENV === "development" },
  get isTest() { return getEnv().NODE_ENV === "test" },

  supabase: {
    get url() { return getEnv().NEXT_PUBLIC_SUPABASE_URL },
    get anonKey() { return getEnv().NEXT_PUBLIC_SUPABASE_ANON_KEY },
    get serviceRoleKey() { return getEnv().SUPABASE_SERVICE_ROLE_KEY },
  },

  conekta: {
    get secretKey() { return getEnv().CONEKTA_SECRET_KEY },
    get webhookSecret() { return getEnv().CONEKTA_WEBHOOK_SECRET },
    get isDemoMode() { return getEnv().CONEKTA_SECRET_KEY === "demo_mode" || !config.isProduction },
  },

  legalario: {
    get apiKey() { return getEnv().LEGALARIO_API_KEY },
    get webhookSecret() { return getEnv().LEGALARIO_WEBHOOK_SECRET },
    get apiUrl() { return getEnv().LEGALARIO_API_URL },
  },

  solana: {
    get rpcUrl() { return getEnv().SOLANA_RPC },
    get network() { return getEnv().SOLANA_NETWORK },
  }
}
