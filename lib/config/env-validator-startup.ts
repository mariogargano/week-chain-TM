import { validateEnv } from "./env-schema";

if (typeof window === "undefined") {
  try {
    validateEnv()
    console.log("✅ All environment variables validated successfully")
  } catch (error) {
    console.error("❌ Environment validation failed on startup")
    // During build, we don't want to exit the process as many env vars
    // are only required at runtime.
    if (process.env.NODE_ENV === "production" && process.env.NEXT_PHASE !== "phase-production-build") {
      // Still don't exit for now to be safe, but we could if we're sure it's runtime
      console.warn("⚠️ Continuing despite validation errors...")
    }
  }
}
