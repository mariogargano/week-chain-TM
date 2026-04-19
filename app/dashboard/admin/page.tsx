"use client"

import useSWR from "swr"
import Link from "next/link"
import { useEffect, useState } from "react"
import {
  Calendar,
  BadgeCheck,
  CreditCard,
  Building2,
  Briefcase,
  BarChart3,
  Mail,
  Coins,
  FileText,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Users,
  Sparkles,
  RefreshCw,
  MapPin,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { AlertsPanel } from "@/components/admin/alerts-panel"
import { createClient } from "@/lib/supabase/client"

const fetcher = (url: string) => fetch(url, { cache: "no-store" }).then((r) => r.json())

function formatUsd(n: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n || 0)
}

function formatNumber(n: number) {
  return new Intl.NumberFormat("es-MX").format(n || 0)
}

type KpiData = {
  totalUsers: number
  newUsersThisMonth: number
  totalCertificates: number
  activeCertificates: number
  totalProperties: number
  activeProperties: number
  pendingReservations: number
  activeReservations: number
  revenue30d: number
  revenueChange: number
  brokerCount: number
  utilization: number
}

export default function AdminDashboardPage() {
  const [userName, setUserName] = useState("Admin")
  const { data, isLoading, mutate } = useSWR<KpiData>("/api/admin/dashboard-kpis", fetcher, {
    refreshInterval: 60_000,
  })

  useEffect(() => {
    const load = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const email = user.email || ""
          const { data: userData } = await supabase
            .from("users")
            .select("full_name")
            .eq("id", user.id)
            .maybeSingle()
          setUserName(userData?.full_name || email.split("@")[0] || "Admin")
        }
      } catch {
        // silent
      }
    }
    load()
  }, [])

  const now = new Date()
  const greeting =
    now.getHours() < 12 ? "Buenos dias" : now.getHours() < 19 ? "Buenas tardes" : "Buenas noches"

  // Daily operations - priority order based on user feedback
  const dailyOps = [
    { label: "Reservaciones", icon: Calendar, href: "/dashboard/admin/reservations", color: "from-violet-500 to-violet-600", badge: data?.pendingReservations || 0 },
    { label: "KYC", icon: BadgeCheck, href: "/dashboard/admin/kyc", color: "from-amber-500 to-orange-500" },
    { label: "Finanzas", icon: Coins, href: "/dashboard/admin/finanzas", color: "from-emerald-500 to-teal-500" },
    { label: "Certificados", icon: BadgeCheck, href: "/dashboard/admin/certificates", color: "from-sky-500 to-cyan-500", badge: data?.activeCertificates || 0 },
    { label: "Propiedades", icon: Building2, href: "/dashboard/admin/properties", color: "from-pink-500 to-rose-500" },
    { label: "Reportes", icon: BarChart3, href: "/dashboard/admin/analytics", color: "from-indigo-500 to-blue-500" },
    { label: "Check-in", icon: MapPin, href: "/dashboard/admin/bookings", color: "from-teal-500 to-emerald-500" },
    { label: "Emails", icon: Mail, href: "/dashboard/admin/emails", color: "from-slate-500 to-slate-600" },
  ]

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 text-balance">
            {greeting}, {userName.split(" ")[0]}
          </h1>
          <p className="text-sm text-slate-500">Resumen del ecosistema WEEK-CHAIN</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => mutate()}
          className="h-9 gap-1.5 text-xs bg-white"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Actualizar
        </Button>
      </div>

      {/* ALERTS PANEL - top priority */}
      <AlertsPanel />

      {/* KPI grid */}
      <div>
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">KPIs principales</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard
            label="Ingresos 30d"
            value={isLoading ? null : formatUsd(data?.revenue30d || 0)}
            change={data?.revenueChange}
            icon={Coins}
            color="bg-emerald-500"
            href="/dashboard/admin/finanzas"
          />
          <KpiCard
            label="Usuarios activos"
            value={isLoading ? null : formatNumber(data?.totalUsers || 0)}
            sublabel={data ? `+${data.newUsersThisMonth} este mes` : undefined}
            icon={Users}
            color="bg-sky-500"
            href="/dashboard/admin/users"
          />
          <KpiCard
            label="Certificados activos"
            value={isLoading ? null : formatNumber(data?.activeCertificates || 0)}
            sublabel={data ? `${data.totalCertificates} total` : undefined}
            icon={BadgeCheck}
            color="bg-violet-500"
            href="/dashboard/admin/certificates"
          />
          <KpiCard
            label="Utilizacion"
            value={isLoading ? null : `${(data?.utilization || 0).toFixed(1)}%`}
            sublabel="capacidad 48+4"
            icon={BarChart3}
            color="bg-amber-500"
            href="/dashboard/admin/capacity-risk"
          />
        </div>
      </div>

      {/* Quick actions - daily operations */}
      <div>
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Operacion diaria
        </h2>
        <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {dailyOps.map((op) => (
            <Link key={op.href} href={op.href}>
              <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white border border-slate-200 hover:border-sky-300 hover:shadow-md transition-all active:scale-95 relative">
                <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${op.color} flex items-center justify-center`}>
                  <op.icon className="h-5 w-5 text-white" />
                </div>
                <span className="text-[11px] font-medium text-slate-700 text-center leading-tight">{op.label}</span>
                {op.badge && op.badge > 0 ? (
                  <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
                    {op.badge > 99 ? "99+" : op.badge}
                  </span>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Operational summary */}
      <div className="grid md:grid-cols-2 gap-3">
        <OpCard
          title="Reservaciones hoy"
          icon={Calendar}
          color="bg-violet-500"
          isLoading={isLoading}
          primary={data?.pendingReservations || 0}
          primaryLabel="Pendientes"
          secondary={data?.activeReservations || 0}
          secondaryLabel="Confirmadas"
          href="/dashboard/admin/reservations"
        />
        <OpCard
          title="Inventario"
          icon={Building2}
          color="bg-sky-500"
          isLoading={isLoading}
          primary={data?.activeProperties || 0}
          primaryLabel="Propiedades activas"
          secondary={data?.brokerCount || 0}
          secondaryLabel="Brokers"
          href="/dashboard/admin/properties"
        />
      </div>

      {/* Recent activity (uses audit_logs) */}
      <RecentActivity />
    </div>
  )
}

function KpiCard({
  label,
  value,
  sublabel,
  change,
  icon: Icon,
  color,
  href,
}: {
  label: string
  value: string | null
  sublabel?: string
  change?: number
  icon: any
  color: string
  href: string
}) {
  return (
    <Link href={href}>
      <Card className="p-4 border-slate-200 hover:border-sky-300 hover:shadow-md transition-all h-full cursor-pointer group">
        <div className="flex items-start justify-between mb-2">
          <div className={`h-9 w-9 rounded-xl ${color} flex items-center justify-center`}>
            <Icon className="h-4 w-4 text-white" />
          </div>
          <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-sky-500 transition-colors" />
        </div>
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
        {value === null ? (
          <Skeleton className="h-7 w-20 mt-1" />
        ) : (
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <p className="text-xl sm:text-2xl font-bold text-slate-900">{value}</p>
            {typeof change === "number" && change !== 0 && (
              <span
                className={`text-[11px] font-semibold flex items-center ${change > 0 ? "text-emerald-600" : "text-red-600"}`}
              >
                {change > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {Math.abs(change).toFixed(1)}%
              </span>
            )}
          </div>
        )}
        {sublabel && <p className="text-[11px] text-slate-400 mt-0.5">{sublabel}</p>}
      </Card>
    </Link>
  )
}

function OpCard({
  title,
  icon: Icon,
  color,
  isLoading,
  primary,
  primaryLabel,
  secondary,
  secondaryLabel,
  href,
}: {
  title: string
  icon: any
  color: string
  isLoading: boolean
  primary: number
  primaryLabel: string
  secondary: number
  secondaryLabel: string
  href: string
}) {
  return (
    <Link href={href}>
      <Card className="p-4 border-slate-200 hover:border-sky-300 hover:shadow-md transition-all cursor-pointer h-full">
        <div className="flex items-center gap-2.5 mb-3">
          <div className={`h-9 w-9 rounded-xl ${color} flex items-center justify-center`}>
            <Icon className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          <ArrowUpRight className="h-4 w-4 text-slate-300 ml-auto" />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">{primaryLabel}</p>
            {isLoading ? (
              <Skeleton className="h-7 w-16 mt-1" />
            ) : (
              <p className="text-xl font-bold text-slate-900 mt-0.5">{formatNumber(primary)}</p>
            )}
          </div>
          <div className="flex-1 border-l border-slate-100 pl-4">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">{secondaryLabel}</p>
            {isLoading ? (
              <Skeleton className="h-7 w-16 mt-1" />
            ) : (
              <p className="text-xl font-bold text-slate-900 mt-0.5">{formatNumber(secondary)}</p>
            )}
          </div>
        </div>
      </Card>
    </Link>
  )
}

function RecentActivity() {
  const { data, isLoading } = useSWR<{ activities: Array<{ id: string; action: string; target_type: string; created_at: string; admin_id: string }> }>(
    "/api/admin/recent-activity",
    fetcher,
    { refreshInterval: 60_000 },
  )

  return (
    <Card className="border-slate-200">
      <div className="flex items-center justify-between p-4 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-sky-500" />
          Actividad reciente
        </h3>
        <Link href="/dashboard/admin/audit-logs">
          <Button variant="ghost" size="sm" className="h-7 text-xs text-sky-600 hover:text-sky-700">
            Ver todo <ArrowUpRight className="h-3 w-3 ml-1" />
          </Button>
        </Link>
      </div>
      {isLoading ? (
        <div className="p-4 space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : !data?.activities?.length ? (
        <div className="p-8 text-center">
          <FileText className="h-8 w-8 mx-auto mb-2 text-slate-300" />
          <p className="text-sm text-slate-500">Sin actividad reciente</p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {data.activities.slice(0, 6).map((act) => (
            <li key={act.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors">
              <div className="h-2 w-2 rounded-full bg-sky-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700 truncate">
                  <span className="font-medium">{act.action}</span>
                  {act.target_type && (
                    <span className="text-slate-400"> · {act.target_type}</span>
                  )}
                </p>
                <p className="text-[10px] text-slate-400">{new Date(act.created_at).toLocaleString("es-MX")}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
