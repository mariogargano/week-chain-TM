import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

    const now = new Date()
    const thirty = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const sixty = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const [
      totalUsers,
      newUsersThisMonth,
      totalCertificates,
      activeCertificates,
      totalProperties,
      activeProperties,
      pendingReservations,
      activeReservations,
      revenue30d,
      revenuePrev,
      brokerCount,
      capacity,
    ] = await Promise.all([
      supabase.from("users").select("id", { count: "exact", head: true }),
      supabase.from("users").select("id", { count: "exact", head: true }).gte("created_at", monthStart),
      supabase.from("user_certificates_v2").select("id", { count: "exact", head: true }),
      supabase.from("user_certificates_v2").select("id", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("properties").select("id", { count: "exact", head: true }),
      supabase.from("properties").select("id", { count: "exact", head: true }).eq("status", "active"),
      supabase
        .from("reservation_requests")
        .select("id", { count: "exact", head: true })
        .in("status", ["pending", "awaiting_offer"]),
      supabase.from("confirmed_reservations").select("id", { count: "exact", head: true }).eq("status", "confirmed"),
      supabase
        .from("fiat_payments")
        .select("amount, usdc_equivalent")
        .in("status", ["succeeded", "completed"])
        .gte("created_at", thirty),
      supabase
        .from("fiat_payments")
        .select("amount, usdc_equivalent")
        .in("status", ["succeeded", "completed"])
        .gte("created_at", sixty)
        .lt("created_at", thirty),
      supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "broker"),
      supabase
        .from("capacity_engine_status")
        .select("utilization_pct")
        .order("last_calculated_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ])

    const sumPayments = (rows: any[] | null) =>
      (rows || []).reduce((acc, r) => acc + Number(r.usdc_equivalent ?? r.amount ?? 0), 0)

    const r30 = sumPayments(revenue30d.data)
    const rPrev = sumPayments(revenuePrev.data)
    const revenueChange = rPrev > 0 ? ((r30 - rPrev) / rPrev) * 100 : 0

    return NextResponse.json({
      totalUsers: totalUsers.count ?? 0,
      newUsersThisMonth: newUsersThisMonth.count ?? 0,
      totalCertificates: totalCertificates.count ?? 0,
      activeCertificates: activeCertificates.count ?? 0,
      totalProperties: totalProperties.count ?? 0,
      activeProperties: activeProperties.count ?? 0,
      pendingReservations: pendingReservations.count ?? 0,
      activeReservations: activeReservations.count ?? 0,
      revenue30d: r30,
      revenueChange,
      brokerCount: brokerCount.count ?? 0,
      utilization: Number(capacity.data?.utilization_pct || 0),
    })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "error" }, { status: 500 })
  }
}
