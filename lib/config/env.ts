// Environment configuration for WEEK-CHAIN platform

export const env = {
  // Solana (for future NFT integration)
  solana: {
    rpcUrl: process.env.SOLANA_RPC || "https://api.mainnet-beta.solana.com",
    network: (process.env.SOLANA_NETWORK || "mainnet-beta") as "mainnet-beta" | "devnet" | "testnet",
  },

  // USDC (for future crypto integration)
  usdc: {
    mint: process.env.USDC_MINT || "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    decimals: 6,
  },

  // Squads (for future multisig integration)
  squads: {
    vaultSerieB1: process.env.SQUADS_VAULT_SERIE_B1 || "",
    treasurySerieB1: process.env.SERIES_TREASURY_B1 || "",
    keypairBase64: process.env.SQUADS_KEYPAIR_BASE64 || "",
  },

  // Supabase
  supabase: {
    url: process.env.SUPABASE_URL || "",
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  },

  // Conekta (Primary payment processor)
  conekta: {
    secretKey: process.env.CONEKTA_SECRET_KEY || "",
    webhookSecret: process.env.CONEKTA_WEBHOOK_SECRET || "",
  },

  // Legalario (Legal document management)
  legalario: {
    apiKey: process.env.LEGALARIO_API_KEY || "",
    webhookSecret: process.env.LEGALARIO_WEBHOOK_SECRET || "",
  },

  // Timeouts
  timeouts: {
    refundWindowHours: 120, // 5 days
    settlementDelayHours: 120, // 5 days after certificate issuance
  },
} as const

// Validation
export function validateEnv() {
  const required = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "CONEKTA_SECRET_KEY"]

  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    console.warn(`[env] Missing environment variables: ${missing.join(", ")}`)
  }

  return missing.length === 0
}
