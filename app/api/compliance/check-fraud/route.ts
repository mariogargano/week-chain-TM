import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { deviceFingerprint, ipAddress, userAgent, botDetection } = body

    // Buscar usuarios con mismo fingerprint
    const { data: duplicateDevices } = await supabase
      .from("users")
      .select("id, email, full_name, created_at")
      .eq("device_fingerprint", deviceFingerprint)
      .neq("id", user.id)

    // Buscar usuarios con misma IP
    const { data: duplicateIPs } = await supabase
      .from("users")
      .select("id, email, full_name, created_at")
      .eq("signup_ip", ipAddress)
      .neq("id", user.id)

    // Crear alerta si hay duplicados o bot detectado
    const alerts: any[] = []

    if (duplicateDevices && duplicateDevices.length > 0) {
      alerts.push({
        user_id: user.id,
        alert_type: "duplicate_device",
        severity: "high",
        details: {
          duplicate_users: duplicateDevices,
          device_fingerprint: deviceFingerprint,
        },
      })
    }

    if (duplicateIPs && duplicateIPs.length > 2) {
      alerts.push({
        user_id: user.id,
        alert_type: "duplicate_ip",
        severity: "medium",
        details: {
          duplicate_users: duplicateIPs,
          ip_address: ipAddress,
        },
      })
    }

    if (botDetection?.isBot) {
      alerts.push({
        user_id: user.id,
        alert_type: "bot_detected",
        severity: "critical",
        details: {
          confidence: botDetection.confidence,
          reasons: botDetection.reasons,
          user_agent: userAgent,
        },
      })
    }

    // Insertar alertas
    if (alerts.length > 0) {
      await supabase.from("fraud_alerts").insert(alerts)
    }

    return NextResponse.json({
      success: true,
      fraudScore: alerts.length * 25,
      alerts: alerts.length,
      requiresReview: alerts.length > 0,
    })
  } catch (error) {
    console.error("Error checking fraud:", error)
    return NextResponse.json({ error: "Error al verificar fraude" }, { status: 500 })
  }
}
