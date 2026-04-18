import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await req.json()
    const { email, password, fullName, country, referralCode } = body

    // Obtener IP desde headers (server-side)
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || "unknown"
    const userAgent = req.headers.get("user-agent") || ""

    const deviceId = body.deviceFingerprint || `fallback-${Date.now()}`

    const suspiciousBotUA = /bot|crawl|spider|scrape|wget|curl/i.test(userAgent)
    if (suspiciousBotUA) {
      return NextResponse.json({ error: "Registro sospechoso detectado" }, { status: 403 })
    }

    // Verificar fraude (omitido si el API no está disponible)
    const warnings: string[] = []
    try {
      const fraudResponse = await fetch(`${req.nextUrl.origin}/api/compliance/check-fraud`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip, deviceId, email }),
      })

      if (fraudResponse.ok) {
        const fraudData = await fraudResponse.json()
        if (fraudData.duplicateDevice) {
          return NextResponse.json({ error: "Este dispositivo ya fue usado para registro" }, { status: 400 })
        }
        if (fraudData.duplicateIp) warnings.push("IP duplicada detectada")
      }
    } catch (e) {
      console.log("Fraud check skipped:", e)
    }

    let referrerId = null
    if (referralCode) {
      const { data: referrer } = await supabase
        .from("users")
        .select("id")
        .eq("referral_code", referralCode.toUpperCase())
        .single()

      if (!referrer) {
        return NextResponse.json({ error: "Código de referido inválido" }, { status: 400 })
      }
      referrerId = referrer.id
    }

    // Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          country,
        },
        emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${req.nextUrl.origin}/dashboard/member`,
      },
    })

    if (authError) throw authError
    if (!authData.user) throw new Error("Error al crear usuario")

    // Generar código de referido único
    const newReferralCode = `WC${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    // Crear perfil en public.users
    const { error: profileError } = await supabase.from("users").insert({
      id: authData.user.id,
      email,
      full_name: fullName,
      signup_ip: ip,
      signup_country: country,
      device_fingerprint: deviceId,
      referral_code: newReferralCode,
      referred_by: referrerId,
      role: "member",
    })

    if (profileError) throw profileError

    // Incrementar contador de referidos
    if (referrerId) {
      try {
        await supabase.rpc("increment_referral_count", { referrer_id: referrerId })
      } catch (e) {
        console.log("RPC call failed (may not exist yet):", e)
      }
    }

    // Registrar aceptación legal
    try {
      await fetch(`${req.nextUrl.origin}/api/compliance/record-acceptance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: authData.user.id,
          acceptanceType: "terms",
          ipAddress: ip,
          userAgent,
          country,
        }),
      })
    } catch (e) {
      console.log("Legal acceptance recording failed:", e)
    }

    return NextResponse.json({
      success: true,
      userId: authData.user.id,
      referralCode: newReferralCode,
      warnings,
    })
  } catch (error: any) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: error.message || "Error en el registro" }, { status: 500 })
  }
}
