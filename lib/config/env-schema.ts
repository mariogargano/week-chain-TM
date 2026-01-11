import { z } from "zod"

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
  SUPABASE_JWT_SECRET: z.string().min(1),

  // Postgres (via Supabase)
  POSTGRES_URL: z.string().url(),
  POSTGRES_PRISMA_URL: z.string().url().optional(),
  POSTGRES_URL_NON_POOLING: z.string().url().optional(),
  POSTGRES_USER: z.string().min(1),
  POSTGRES_PASSWORD: z.string().min(1),
  POSTGRES_DATABASE: z.string().min(1),
  POSTGRES_HOST: z.string().min(1),

  // Conekta (Primary payment processor)
  CONEKTA_SECRET_KEY: z.string().min(1),
  CONEKTA_WEBHOOK_SECRET: z.string().optional(),

  // Email
  RESEND_API_KEY: z.string().min(1),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string().min(1),

  // Legalario (NOM-151 Certification)
  LEGALARIO_API_KEY: z.string().min(1),
  LEGALARIO_WEBHOOK_SECRET: z.string().min(1),
  LEGALARIO_API_URL: z.string().url().default("https://api.legalario.com"),

  // EasyLex (NOM-151 PSC Provider)
  EASYLEX_API_KEY: z.string().min(1).optional(),
  EASYLEX_WEBHOOK_SECRET: z.string().min(1).optional(),
  EASYLEX_API_URL: z.string().url().default("https://sandboxapi.easylex.com"),
  EASYLEX_WIDGET_URL: z.string().url().default("https://sandboxwg.easylex.com"),
  EASYLEX_ENVIRONMENT: z.enum(["sandbox", "production"]).default("sandbox"),

  // Redirect URL for dev
  NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL: z.string().url().optional(),
})

export type EnvSchema = z.infer<typeof envSchema>

let cachedEnv: EnvSchema | null = null

export function validateEnv(): EnvSchema {
  if (cachedEnv) {
    return cachedEnv
  }

  try {
    cachedEnv = envSchema.parse(process.env)
    console.log("✅ Environment variables validated successfully")
    return cachedEnv
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Environment validation failed:")
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join(".")}: ${err.message}`)
      })
      throw new Error("Invalid environment variables. Check console for details.")
    }
    throw error
  }
}

export function getEnv(): EnvSchema {
  if (!cachedEnv) {
    validateEnv()
  }
  return cachedEnv!
}
