/**
 * Simple environment validator for production readiness.
 * Runs in standard Node.js without TypeScript.
 */

const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'CONEKTA_SECRET_KEY',
  'EASYLEX_API_KEY',
  'EASYLEX_WEBHOOK_SECRET'
];

console.log('🔍 Validating critical environment variables...');

const missing = [];
for (const v of requiredVars) {
  if (!process.env[v]) {
    missing.push(v);
  }
}

if (missing.length > 0) {
  console.error('❌ Missing critical environment variables:');
  for (const m of missing) {
    console.error(`  - ${m}`);
  }

  // Only fail in CI or production build
  if (process.env.CI === 'true' || process.env.NODE_ENV === 'production') {
    console.error('\n🚫 Validation failed. Build will not proceed.');
    process.exit(1);
  } else {
    console.warn('\n⚠️ Validation failed, but continuing as we are not in CI/Production.');
  }
} else {
  console.log('✅ All critical environment variables are present.');
}

// Check for optional but recommended variables
const optionalVars = [
  'RESEND_API_KEY',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'NEXT_PUBLIC_GOOGLE_CLIENT_ID'
];

const missingOptional = optionalVars.filter(v => !process.env[v]);
if (missingOptional.length > 0) {
  console.log('\nℹ️ Optional variables missing (features will be disabled):');
  for (const m of missingOptional) {
    console.log(`  - ${m}`);
  }
}

console.log('\n🚀 Platform is ready for deployment verification.\n');
