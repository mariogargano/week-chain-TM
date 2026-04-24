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

    const [
      fiatPaid30d,
      fiatPaidPrev,
      fiatPending,
      fiatFailed,
      escrowDeposits,
      escrowPending,
      txCount,
      recentTx,
    ] = await Promise.all([
      supabase
        .from("fiat_payments")
        .select("amount, currency, usdc_equivalent", { count: "exact" })
        .in("status", ["succeeded", "completed"])
        .gte("created_at", thirty),
      supabase
        .from("fiat_payments")
        .select("amount, currency, usdc_equivalent")
        .in("status", ["succeeded", "completed"])
        .gte("created_at", sixty)
        .lt("created_at", thirty),
      supabase.from("fiat_payments").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("fiat_payments").select("id", { count: "exact", head: true }).eq("status", "failed"),
      supabase.from("escrow_deposits").select("amount_usdc").eq("status", "confirmed"),
      supabase.from("escrow_deposits").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase
        .from("fiat_payments")
        .select("id", { count: "exact", head: true })
        .gte("created_at", thirty),
      supabase
        .from("fiat_payments")
        .select("id, amount, currency, status, payment_method, created_at, user_email")
        .order("created_at", { ascending: false })
        .limit(10),
    ])

    const sumPayments = (rows: any[] | null) =>
      (rows || []).reduce((acc, r) => acc + Number(r.usdc_equivalent ?? r.amount ?? 0), 0)

    const fiatRevenue = sumPayments(fiatPaid30d.data)
    const fiatRevenuePrev = sumPayments(fiatPaidPrev.data)
    const revenueChange =
      fiatRevenuePrev > 0 ? ((fiatRevenue - fiatRevenuePrev) / fiatRevenuePrev) * 100 : 0

    const escrowTotal = (escrowDeposits.data || []).reduce(
      (acc, r: any) => acc + Number(r.amount_usdc || 0),
      0,
    )

    return NextResponse.json({
      fiatRevenue,
      fiatPendingCount: fiatPending.count ?? 0,
      fiatFailedCount: fiatFailed.count ?? 0,
      escrowTotal,
      escrowPendingCount: escrowPending.count ?? 0,
      txCount: txCount.count ?? 0,
      walletBalance: 0,
      revenueChange,
      recentTx: (recentTx.data || []).map((r: any) => ({
        id: r.id,
        amount: Number(r.amount || 0),
        currency: r.currency || "USD",
        status: r.status,
        method: r.payment_method,
        created_at: r.created_at,
        user_email: r.user_email,
      })),
    })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "error" }, { status: 500 })
  }
}
