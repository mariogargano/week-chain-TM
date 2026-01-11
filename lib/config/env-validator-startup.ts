import { validateEnv } from "./env-schema"

if (typeof window === "undefined") {
  try {
    validateEnv()
    console.log("✅ All environment variables validated successfully")
  } catch (error) {
    console.error("❌ Environment validation failed on startup")
    if (process.env.NODE_ENV === "production") {
      process.exit(1)
    }
  }
}
