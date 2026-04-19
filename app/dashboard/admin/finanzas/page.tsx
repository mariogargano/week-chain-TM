"use client"

import useSWR from "swr"
import Link from "next/link"
import { Coins, CreditCard, Shield, FileText, Briefcase, TrendingUp, TrendingDown, ArrowUpRight, AlertCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

const fetcher = (url: string) => fetch(url, { cache: "no-store" }).then((r) => r.json())

function formatUsd(n: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n || 0)
}

const sections = [
  {
    title: "Pagos",
    description: "Cobros por tarjeta, SPEI y OXXO",
    icon: CreditCard,
    href: "/dashboard/admin/payments",
    color: "bg-sky-500",
    metric: "fiatRevenue",
    metricLabel: "Ingresos 30d",
  },
  {
    title: "Escrow contable",
    description: "Depositos en custodia y liberaciones",
    icon: Shield,
    href: "/dashboard/admin/escrow-contable",
    color: "bg-emerald-500",
    metric: "escrowTotal",
    metricLabel: "En escrow",
  },
  {
    title: "Transacciones",
    description: "Historial completo de movimientos",
    icon: FileText,
    href: "/dashboard/admin/transactions",
    color: "bg-violet-500",
    metric: "txCount",
    metricLabel: "Total 30d",
    isCount: true,
  },
  {
    title: "Wallets",
    description: "Balances y solicitudes de retiro",
    icon: Briefcase,
    href: "/dashboard/admin/wallets",
    color: "bg-amber-500",
    metric: "walletBalance",
    metricLabel: "Balance total",
  },
] as const

export default function FinanzasPage() {
  const { data, isLoading } = useSWR<{
    fiatRevenue: number
    fiatPendingCount: number
    fiatFailedCount: number
    escrowTotal: number
    escrowPendingCount: number
    txCount: number
    walletBalance: number
    revenueChange: number
    recentTx: Array<{
      id: string
      amount: number
      currency: string
      status: string
      method: string
      created_at: string
      user_email?: string
    }>
  }>("/api/admin/finanzas/summary", fetcher, { refreshInterval: 60_000 })

  return (
    <div className="space-y-5 max-w-6xl">
      <header>
        <div className="flex items-center gap-2.5 mb-1">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
            <Coins className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Centro financiero</h1>
            <p className="text-sm text-slate-500">Pagos, escrow, transacciones y wallets en un solo lugar</p>
          </div>
        </div>
      </header>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4 border-slate-200">
          <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Ingresos 30d</p>
          {isLoading ? (
            <Skeleton className="h-8 w-24 mt-2" />
          ) : (
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-2xl font-bold text-slate-900">{formatUsd(data?.fiatRevenue || 0)}</p>
              {data && data.revenueChange !== 0 && (
                <span
                  className={`text-xs font-semibold flex items-center ${data.revenueChange > 0 ? "text-emerald-600" : "text-red-600"}`}
                >
                  {data.revenueChange > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {Math.abs(data.revenueChange).toFixed(1)}%
                </span>
              )}
            </div>
          )}
        </Card>

        <Card className="p-4 border-slate-200">
          <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">En escrow</p>
          {isLoading ? (
            <Skeleton className="h-8 w-20 mt-2" />
          ) : (
            <p className="text-2xl font-bold text-slate-900 mt-1">{formatUsd(data?.escrowTotal || 0)}</p>
          )}
          <p className="text-[11px] text-slate-500 mt-1">
            {data?.escrowPendingCount || 0} pendientes
          </p>
        </Card>

        <Card className="p-4 border-slate-200">
          <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Transacciones 30d</p>
          {isLoading ? (
            <Skeleton className="h-8 w-16 mt-2" />
          ) : (
            <p className="text-2xl font-bold text-slate-900 mt-1">{(data?.txCount || 0).toLocaleString()}</p>
          )}
        </Card>

        <Card className={`p-4 border-slate-200 ${data && data.fiatFailedCount > 0 ? "bg-red-50 border-red-200" : ""}`}>
          <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold flex items-center gap-1">
            {data && data.fiatFailedCount > 0 && <AlertCircle className="h-3 w-3 text-red-500" />}
            Pagos fallidos
          </p>
          {isLoading ? (
            <Skeleton className="h-8 w-12 mt-2" />
          ) : (
            <p className={`text-2xl font-bold mt-1 ${data && data.fiatFailedCount > 0 ? "text-red-600" : "text-slate-900"}`}>
              {data?.fiatFailedCount || 0}
            </p>
          )}
          {data && data.fiatFailedCount > 0 && (
            <Link href="/dashboard/admin/payments?status=failed" className="text-[11px] text-red-600 hover:underline font-semibold">
              Revisar →
            </Link>
          )}
        </Card>
      </div>

      {/* Section shortcuts */}
      <div>
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Secciones</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {sections.map((s) => (
            <Link key={s.href} href={s.href}>
              <Card className="p-4 border-slate-200 hover:border-sky-300 hover:shadow-md transition-all cursor-pointer h-full group">
                <div className="flex items-start justify-between mb-3">
                  <div className={`${s.color} h-10 w-10 rounded-xl flex items-center justify-center`}>
                    <s.icon className="h-5 w-5 text-white" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-sky-500 transition-colors" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">{s.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{s.description}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent transactions */}
      <Card className="border-slate-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Movimientos recientes</h3>
          <Link href="/dashboard/admin/transactions">
            <Button variant="ghost" size="sm" className="h-7 text-xs text-sky-600 hover:text-sky-700">
              Ver todos <ArrowUpRight className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        </div>
        {isLoading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : !data?.recentTx?.length ? (
          <div className="p-8 text-center text-slate-400">
            <FileText className="h-8 w-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm">Sin movimientos recientes</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {data.recentTx.slice(0, 8).map((tx) => (
              <li key={tx.id} className="flex items-center justify-between p-3 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`h-2 w-2 rounded-full flex-shrink-0 ${
                      tx.status === "succeeded" || tx.status === "completed"
                        ? "bg-emerald-500"
                        : tx.status === "pending"
                          ? "bg-amber-500"
                          : tx.status === "failed"
                            ? "bg-red-500"
                            : "bg-slate-400"
                    }`}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {tx.user_email || "Usuario"} <span className="text-slate-400">·</span> {tx.method || "N/A"}
                    </p>
                    <p className="text-[11px] text-slate-500">{new Date(tx.created_at).toLocaleString("es-MX")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ${
                      tx.status === "succeeded" || tx.status === "completed"
                        ? "border-emerald-200 text-emerald-700 bg-emerald-50"
                        : tx.status === "pending"
                          ? "border-amber-200 text-amber-700 bg-amber-50"
                          : tx.status === "failed"
                            ? "border-red-200 text-red-700 bg-red-50"
                            : "border-slate-200 text-slate-600"
                    }`}
                  >
                    {tx.status}
                  </Badge>
                  <span className="text-sm font-semibold text-slate-900">
                    {formatUsd(tx.amount)} {tx.currency !== "USD" && tx.currency}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
