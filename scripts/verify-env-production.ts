#!/usr/bin/env node
/**
 * Pre-deployment verification script.
 * Run this in your CI/CD pipeline BEFORE deploying to production.
 *
 * Usage:
 *   node scripts/verify-env-production.ts
 *   # or
 *   pnpm exec tsx scripts/verify-env-production.ts
 *
 * Exit codes:
 *   0 = all critical env vars are set ✓
 *   1 = missing critical env vars ✗
 */

import { validateEnvVars } from "../lib/config/env-validation"

const { valid, errors, warnings } = validateEnvVars("production")

if (errors.length > 0) {
  console.error("❌ CRITICAL: Production environment validation FAILED\n")
  errors.forEach((err) => console.error(`   ${err}`))
  console.error("\nPlease set all missing environment variables before deploying.")
  process.exit(1)
}

if (warnings.length > 0) {
  console.warn("⚠️  WARNING: Some optional features are disabled:\n")
  warnings.forEach((warn) => console.warn(`   ${warn}`))
  console.warn("")
}

console.log("✅ All critical environment variables are set. Ready to deploy.")
process.exit(0)
