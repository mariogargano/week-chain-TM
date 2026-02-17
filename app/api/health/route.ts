import { NextResponse } from "next/server"
import { getEnv } from "@/lib/config/env-schema"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const env = getEnv()

    // Test Supabase connection
    const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    })

    const { error: dbError } = await supabase.from("legal_contracts").select("count").limit(1)

    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      solana_network: env.SOLANA_NETWORK,
      checks: {
        database: dbError ? "unhealthy" : "healthy",
        legalario: env.LEGALARIO_API_KEY ? "configured" : "not_configured",
        conekta: env.CONEKTA_SECRET_KEY ? "configured" : "not_configured",
        solana: env.SOLANA_KEYPAIR_BASE64 ? "configured" : "not_configured",
      },
    }

    return NextResponse.json(health)
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
