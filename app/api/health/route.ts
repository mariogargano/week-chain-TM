import { NextResponse } from "next/server"
import { config } from "@/lib/config"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // Test Supabase connection
    const supabase = createClient(config.supabase.url, config.supabase.serviceRoleKey, {
      auth: { persistSession: false },
    })

    const { error: dbError } = await supabase.from("profiles").select("count").limit(1)

    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      environment: config.env.NODE_ENV,
      solana_network: config.solana.network,
      checks: {
        database: dbError ? "unhealthy" : "healthy",
        easylex: config.easylex.apiKey ? "configured" : "not_configured",
        conekta: config.conekta.secretKey ? "configured" : "not_configured",
        solana: config.solana.rpcUrl ? "healthy" : "not_configured",
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
