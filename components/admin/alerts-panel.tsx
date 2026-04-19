"use client"

import useSWR from "swr"
import Link from "next/link"
import { AlertTriangle, Shield, CheckCircle2, ArrowUpRight, RefreshCw } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Alert = {
  id: string
  severity: "critical" | "high" | "medium" | "low"
  title: string
  message: string
  type: string
  href: string
  createdAt?: string
}

type Summary = {
  buckets: Record<string, number>
  totalUrgent: number
  totalPending: number
  alerts: Alert[]
}

const fetcher = (url: string) => fetch(url, { cache: "no-store" }).then((r) => r.json())

const severityStyles: Record<Alert["severity"], string> = {
  critical: "border-red-200 bg-red-50 text-red-900",
  high: "border-orange-200 bg-orange-50 text-orange-900",
  medium: "border-amber-200 bg-amber-50 text-amber-900",
  low: "border-sky-200 bg-sky-50 text-sky-900",
}

const severityBadge: Record<Alert["severity"], string> = {
  critical: "bg-red-100 text-red-700 border-red-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  low: "bg-sky-100 text-sky-700 border-sky-200",
}

const severityLabel: Record<Alert["severity"], string> = {
  critical: "Critico",
  high: "Alto",
  medium: "Medio",
  low: "Bajo",
}

export function AlertsPanel() {
  const { data, error, isLoading, mutate } = useSWR<Summary>("/api/admin/alerts-summary", fetcher, {
    refreshInterval: 30_000,
    revalidateOnFocus: true,
  })

  if (isLoading) {
    return (
      <Card className="p-4 border-slate-200">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-slate-300 animate-pulse" />
          <span className="text-sm text-slate-500">Cargando alertas...</span>
        </div>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card className="p-4 border-red-200 bg-red-50">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <span className="text-sm text-red-700">No se pudieron cargar las alertas.</span>
        </div>
      </Card>
    )
  }

  const hasUrgent = data.totalUrgent > 0
  const hasAny = data.alerts.length > 0

  return (
    <Card
      className={cn(
        "border-2 overflow-hidden",
        hasUrgent ? "border-red-300 bg-gradient-to-br from-red-50 to-white" : "border-sky-200 bg-white",
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg",
              hasUrgent ? "bg-red-500 text-white" : "bg-sky-500 text-white",
            )}
          >
            {hasUrgent ? <AlertTriangle className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Centro de alertas</h2>
            <p className="text-xs text-slate-500">
              {hasUrgent
                ? `${data.totalUrgent} urgente(s), ${data.totalPending} pendiente(s)`
                : hasAny
                  ? `${data.totalPending} pendiente(s) por atender`
                  : "Todo al dia"}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => mutate()}
          className="h-8 gap-1.5 text-xs text-slate-600 hover:text-slate-900"
          aria-label="Actualizar alertas"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Actualizar
        </Button>
      </div>

      {!hasAny ? (
        <div className="p-8 text-center">
          <CheckCircle2 className="h-10 w-10 mx-auto mb-2 text-emerald-500" />
          <p className="text-sm font-semibold text-slate-900">Todo al dia</p>
          <p className="text-xs text-slate-500 mt-1">No hay alertas pendientes. Buen trabajo.</p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {data.alerts.map((alert) => (
            <li key={alert.id}>
              <Link
                href={alert.href}
                className={cn(
                  "flex items-start gap-3 p-3.5 hover:bg-white/60 transition-colors group",
                  severityStyles[alert.severity],
                )}
              >
                <div className="flex-shrink-0 mt-0.5">
                  <div
                    className={cn(
                      "h-2 w-2 rounded-full",
                      alert.severity === "critical" && "bg-red-500 animate-pulse",
                      alert.severity === "high" && "bg-orange-500",
                      alert.severity === "medium" && "bg-amber-500",
                      alert.severity === "low" && "bg-sky-500",
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold truncate">{alert.title}</span>
                    <Badge variant="outline" className={cn("text-[10px] h-4 px-1.5", severityBadge[alert.severity])}>
                      {severityLabel[alert.severity]}
                    </Badge>
                  </div>
                  <p className="text-xs opacity-80 mt-0.5 line-clamp-2">{alert.message}</p>
                </div>
                <ArrowUpRight className="h-4 w-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
