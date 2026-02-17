// Edge Function: Reset de contador mensual de referidos
// Se ejecuta automáticamente el 1ro de cada mes vía Cron Job

/// <reference lib="deno.ns" />

import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Deno } from "https://deno.land/std@0.168.0/_util/deps.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    )

    console.log("[v0] Iniciando reset mensual de contadores de referidos...")

    // Resetear contador mensual para todos los usuarios
    const { data: updated, error } = await supabaseClient
      .from("users")
      .update({ referrals_this_month: 0 })
      .neq("referrals_this_month", 0)
      .select("id, full_name, referrals_this_month")

    if (error) {
      console.error("[v0] Error reseteando contadores:", error)
      throw error
    }

    console.log(`[v0] Reset completado. ${updated?.length || 0} usuarios actualizados`)

    // Crear registro de auditoría
    const { error: auditError } = await supabaseClient.from("audit_logs").insert({
      action: "reset_referral_counters",
      details: {
        users_updated: updated?.length || 0,
        reset_date: new Date().toISOString(),
      },
      created_at: new Date().toISOString(),
    })

    if (auditError) {
      console.error("[v0] Error creando log de auditoría:", auditError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Contadores de referidos reseteados exitosamente",
        users_updated: updated?.length || 0,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    )
  } catch (error) {
    console.error("[v0] Error en edge function:", error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    )
  }
})
