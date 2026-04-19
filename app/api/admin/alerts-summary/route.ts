import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

    // Bucketed counts in parallel
    const [
      pendingKyc,
      pendingOffers,
      pendingRequests,
      pendingApprovals,
      failedPayments,
      escrowPending,
      slaBreached,
      fraudAlerts,
      systemAlerts,
    ] = await Promise.all([
      supabase.from("kyc_users").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("reservation_offers").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("reservation_requests").select("id", { count: "exact", head: true }).in("status", ["pending", "awaiting_offer"]),
      supabase.from("property_submissions").select("id", { count: "exact", head: true }).eq("admin_status", "pending"),
      supabase.from("fiat_payments").select("id", { count: "exact", head: true }).eq("status", "failed"),
      supabase.from("escrow_deposits").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("sla_tracking").select("id", { count: "exact", head: true }).eq("breached", true).is("completed_at", null),
      supabase.from("fraud_alerts").select("id", { count: "exact", head: true }).eq("status", "open"),
      supabase.from("system_alerts").select("id", { count: "exact", head: true }).eq("acknowledged", false).eq("resolved", false),
    ])

    // Build the top-N list from system_alerts for display
    const { data: topAlerts } = await supabase
      .from("system_alerts")
      .select("id, severity, title, message, alert_type, entity_type, created_at, acknowledged, resolved")
      .eq("resolved", false)
      .order("created_at", { ascending: false })
      .limit(10)

    const buckets = {
      pendingKyc: pendingKyc.count ?? 0,
      pendingOffers: pendingOffers.count ?? 0,
      pendingRequests: pendingRequests.count ?? 0,
      pendingApprovals: pendingApprovals.count ?? 0,
      failedPayments: failedPayments.count ?? 0,
      escrowPending: escrowPending.count ?? 0,
      slaBreached: slaBreached.count ?? 0,
      fraudAlerts: fraudAlerts.count ?? 0,
      systemAlerts: systemAlerts.count ?? 0,
    }

    const totalUrgent = buckets.slaBreached + buckets.fraudAlerts + buckets.failedPayments
    const totalPending =
      buckets.pendingKyc +
      buckets.pendingOffers +
      buckets.pendingRequests +
      buckets.pendingApprovals +
      buckets.escrowPending

    const alertsList: Array<{
      id: string
      severity: "critical" | "high" | "medium" | "low"
      title: string
      message: string
      type: string
      href: string
      createdAt?: string
    }> = []

    if (buckets.slaBreached > 0) {
      alertsList.push({
        id: "sla-breached",
        severity: "critical",
        title: `${buckets.slaBreached} SLA vencido(s)`,
        message: "Hay reservaciones u operaciones con tiempo vencido. Requieren acción inmediata.",
        type: "sla",
        href: "/dashboard/admin/reservations?tab=pending",
      })
    }
    if (buckets.fraudAlerts > 0) {
      alertsList.push({
        id: "fraud",
        severity: "critical",
        title: `${buckets.fraudAlerts} alerta(s) de fraude`,
        message: "Operaciones sospechosas detectadas por el sistema antifraude.",
        type: "fraud",
        href: "/dashboard/admin/security",
      })
    }
    if (buckets.failedPayments > 0) {
      alertsList.push({
        id: "payments-failed",
        severity: "high",
        title: `${buckets.failedPayments} pago(s) fallido(s)`,
        message: "Revisa los pagos rechazados por proveedor y reintenta o contacta al cliente.",
        type: "payment",
        href: "/dashboard/admin/payments?status=failed",
      })
    }
    if (buckets.pendingKyc > 0) {
      alertsList.push({
        id: "kyc-pending",
        severity: "medium",
        title: `${buckets.pendingKyc} KYC pendiente(s)`,
        message: "Usuarios esperando verificación de identidad.",
        type: "kyc",
        href: "/dashboard/admin/kyc?tab=pending",
      })
    }
    if (buckets.pendingOffers > 0) {
      alertsList.push({
        id: "offers-pending",
        severity: "medium",
        title: `${buckets.pendingOffers} oferta(s) pendiente(s)`,
        message: "Ofertas de reservación esperando respuesta del holder.",
        type: "offer",
        href: "/dashboard/admin/reservations?tab=offers",
      })
    }
    if (buckets.pendingApprovals > 0) {
      alertsList.push({
        id: "approvals-pending",
        severity: "medium",
        title: `${buckets.pendingApprovals} aprobación(es) de propiedades`,
        message: "Nuevas propiedades esperando revisión.",
        type: "approval",
        href: "/dashboard/admin/property-approvals",
      })
    }
    if (buckets.escrowPending > 0) {
      alertsList.push({
        id: "escrow-pending",
        severity: "low",
        title: `${buckets.escrowPending} escrow pendiente(s)`,
        message: "Depósitos en escrow por liberar o confirmar.",
        type: "escrow",
        href: "/dashboard/admin/escrow-contable?tab=pending",
      })
    }

    // Merge system_alerts from DB (real alerts engine)
    for (const a of topAlerts || []) {
      const sev = (a.severity || "medium").toLowerCase()
      alertsList.push({
        id: a.id,
        severity: (["critical", "high", "medium", "low"].includes(sev) ? sev : "medium") as any,
        title: a.title || "Alerta del sistema",
        message: a.message || "",
        type: a.alert_type || "system",
        href: "/dashboard/admin/alerts",
        createdAt: a.created_at,
      })
    }

    // Sort by severity
    const severityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }
    alertsList.sort((a, b) => (severityOrder[a.severity] ?? 9) - (severityOrder[b.severity] ?? 9))

    return NextResponse.json({
      buckets,
      totalUrgent,
      totalPending,
      alerts: alertsList.slice(0, 8),
    })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "error" }, { status: 500 })
  }
}
