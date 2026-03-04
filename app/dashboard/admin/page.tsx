"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Building2, Users, AlertCircle, ArrowUpRight, Loader2, Ticket, Calendar, Eye,
  RefreshCw, TrendingUp, DollarSign, ShieldCheck, BadgeCheck, BarChart3, MapPin,
  CreditCard, FileText, Clock, Activity, Briefcase, ArrowUp, Globe, Scale, Coins,
  Lock, Star, PlaneTakeoff, Database, Bell, Shield, Webhook, BookOpen, Wrench,
} from "lucide-react"
import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

/* ---------- Glass utility classes ---------- */
const glass = "bg-gradient-to-br from-sky-500/[0.08] to-blue-600/[0.04] backdrop-blur-xl border border-sky-500/20 rounded-2xl shadow-[0_4px_24px_rgba(14,165,233,0.1)]"
const glassHover = "hover:shadow-[0_8px_32px_rgba(14,165,233,0.18)] hover:border-sky-400/30 transition-all duration-300"
const glassCard = `${glass} ${glassHover}`
const glassIcon = (bg: string) => `p-2.5 rounded-xl ${bg} flex items-center justify-center`

/* ---------- Types ---------- */
interface DashboardData {
  totalUsers: number
  newUsersThisMonth: number
  pendingKYC: number
  totalCertificates: number
  activeCertificates: number
  totalProperties: number
  activeProperties: number
  pendingReservations: number
  totalPayments: number
  totalRevenue: number
  pendingBrokerApprovals: number
  systemStatus: string
  currentUtilization: number
  totalSupplyWeeks: number
  safeCapacityWeeks: number
  activeCountries: number
  waitlistSize: number
  certificatesActive: { silver: number; gold: number; platinum: number; signature: number }
  stopSaleFlags: { silver: boolean; gold: boolean; platinum: boolean; signature: boolean }
  pendingPropertySubmissions: number
  pendingContracts: number
  activeReservations: number
  brokerCount: number
}

const defaultData: DashboardData = {
  totalUsers: 0, newUsersThisMonth: 0, pendingKYC: 0, totalCertificates: 0,
  activeCertificates: 0, totalProperties: 0, activeProperties: 0, pendingReservations: 0,
  totalPayments: 0, totalRevenue: 0, pendingBrokerApprovals: 0, systemStatus: "GREEN",
  currentUtilization: 0, totalSupplyWeeks: 0, safeCapacityWeeks: 0, activeCountries: 0,
  waitlistSize: 0,
  certificatesActive: { silver: 0, gold: 0, platinum: 0, signature: 0 },
  stopSaleFlags: { silver: false, gold: false, platinum: false, signature: false },
  pendingPropertySubmissions: 0, pendingContracts: 0, activeReservations: 0, brokerCount: 0,
}

/* ================================================ */
export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [data, setData] = useState<DashboardData>(defaultData)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const fetchedRef = useRef(false)

  const safeQuery = async (query: Promise<any>) => {
    try {
      const result = await query
      if (result.error) return { data: null, count: 0, error: result.error }
      return result
    } catch {
      return { data: null, count: 0, error: "Query failed" }
    }
  }

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true)
      setError(null)
      const supabase = createClient()

      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData?.session) {
        setError("Sesion no valida. Inicia sesion para acceder al panel.")
        setLoading(false)
        setRefreshing(false)
        return
      }

      const [
        capacityResponse,
        usersResult,
        kycResult,
        certificatesResult,
        propertiesResult,
        reservationsResult,
        paymentsResult,
        brokerResult,
        propertySubsResult,
        contractsResult,
        confirmedResult,
        waitlistResult,
        recentKyc,
        recentReservations,
        recentPayments,
      ] = await Promise.all([
        fetch("/api/admin/capacity/global-status").then(r => r.ok ? r.json() : { globalMetrics: {} }).catch(() => ({ globalMetrics: {} })),
        safeQuery(supabase.from("users").select("id, created_at", { count: "exact" })),
        safeQuery(supabase.from("kyc_users").select("id", { count: "exact" }).eq("status", "pending")),
        safeQuery(supabase.from("user_certificates_v2").select("id, status", { count: "exact" })),
        safeQuery(supabase.from("properties").select("id, status", { count: "exact" })),
        safeQuery(supabase.from("reservation_requests").select("id", { count: "exact" }).in("status", ["requested", "processing"])),
        safeQuery(supabase.from("payments").select("id, amount, status", { count: "exact" })),
        safeQuery(supabase.from("intermediary_profiles").select("id", { count: "exact" })),
        safeQuery(supabase.from("property_submissions").select("id", { count: "exact" }).eq("status", "submitted")),
        safeQuery(supabase.from("legal_contracts").select("id", { count: "exact" }).eq("status", "pending")),
        safeQuery(supabase.from("confirmed_reservations").select("id", { count: "exact" }).eq("status", "confirmed")),
        safeQuery(supabase.from("certificate_waitlist").select("id", { count: "exact" }).eq("status", "waiting")),
        safeQuery(supabase.from("kyc_users").select("id, name, email, status, created_at").eq("status", "pending").order("created_at", { ascending: false }).limit(5)),
        safeQuery(supabase.from("reservation_requests").select("id, status, created_at, destination_preference").in("status", ["requested", "processing"]).order("created_at", { ascending: false }).limit(5)),
        safeQuery(supabase.from("payments").select("id, amount, status, created_at, payment_method").order("created_at", { ascending: false }).limit(5)),
      ])

      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const newUsers = usersResult.data?.filter((u: any) => new Date(u.created_at) >= monthStart).length || 0
      const activeCerts = certificatesResult.data?.filter((c: any) => c.status === "active").length || 0
      const activeProps = propertiesResult.data?.filter((p: any) => p.status === "active" || p.status === "published").length || 0
      const completedPayments = paymentsResult.data?.filter((p: any) => p.status === "completed" || p.status === "captured")
      const totalRevenue = completedPayments?.reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0) || 0

      const gm = capacityResponse.globalMetrics || {}
      const ca = capacityResponse.certificatesActive || { silver: 0, gold: 0, platinum: 0, signature: 0 }
      const sf = capacityResponse.stopSaleFlags || { silver: false, gold: false, platinum: false, signature: false }

      setData({
        totalUsers: usersResult.count || 0,
        newUsersThisMonth: newUsers,
        pendingKYC: kycResult.count || 0,
        totalCertificates: certificatesResult.count || 0,
        activeCertificates: activeCerts,
        totalProperties: propertiesResult.count || 0,
        activeProperties: activeProps,
        pendingReservations: reservationsResult.count || 0,
        totalPayments: paymentsResult.count || 0,
        totalRevenue,
        pendingBrokerApprovals: 0,
        systemStatus: gm.systemStatus || "GREEN",
        currentUtilization: gm.currentUtilization || 0,
        totalSupplyWeeks: gm.totalSupplyWeeks || 0,
        safeCapacityWeeks: gm.safeCapacityWeeks || 0,
        activeCountries: gm.activeCountries || 0,
        waitlistSize: waitlistResult.count || 0,
        certificatesActive: ca,
        stopSaleFlags: sf,
        pendingPropertySubmissions: propertySubsResult.count || 0,
        pendingContracts: contractsResult.count || 0,
        activeReservations: confirmedResult.count || 0,
        brokerCount: brokerResult.count || 0,
      })

      // Build recent activity
      const activities: any[] = []
      recentReservations.data?.forEach((r: any) => {
        activities.push({ type: "reservation", action: `Nueva solicitud: ${r.destination_preference || "Destino flexible"}`, time: formatTimeAgo(r.created_at), status: "info", link: "/dashboard/admin/reservations" })
      })
      recentKyc.data?.forEach((k: any) => {
        activities.push({ type: "kyc", action: `KYC pendiente: ${k.name || k.email || "Usuario"}`, time: formatTimeAgo(k.created_at), status: "warning", link: "/dashboard/admin/kyc" })
      })
      recentPayments.data?.forEach((p: any) => {
        if (p.status === "completed" || p.status === "captured") {
          activities.push({ type: "payment", action: `Pago recibido: $${Number(p.amount).toLocaleString()} ${p.payment_method || ""}`, time: formatTimeAgo(p.created_at), status: "success", link: "/dashboard/admin/payments" })
        }
      })
      activities.sort((a, b) => a.time.localeCompare(b.time))
      setRecentActivity(activities.slice(0, 10))

      setLoading(false)
      setRefreshing(false)
    } catch (err) {
      console.error("Error loading admin dashboard:", err)
      setError(err instanceof Error ? err.message : "Error al cargar el dashboard")
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true
    fetchDashboardData()
  }, [])

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    if (diffMins < 60) return `Hace ${diffMins}m`
    if (diffHours < 24) return `Hace ${diffHours}h`
    return `Hace ${diffDays}d`
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-MX", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount)

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className={`${glass} p-10 text-center`}>
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-sky-500" />
          <p className="mt-4 text-sm text-slate-500 font-medium">Cargando panel de administracion...</p>
        </div>
      </div>
    )
  }

  /* ---------- Error ---------- */
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-6">
        <div className={`${glass} max-w-md w-full p-8`}>
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 text-center mb-2">Error al cargar</h3>
          <p className="text-sm text-red-600 mb-6 text-center">{error}</p>
          <div className="flex gap-3">
            <Button onClick={() => { fetchedRef.current = false; fetchDashboardData() }} className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-sky-400 hover:to-blue-500 rounded-xl shadow-[0_4px_16px_rgba(14,165,233,0.3)]">
              Reintentar
            </Button>
            <Link href="/auth?tab=login" className="flex-1">
              <Button variant="outline" className="w-full border-sky-500/30 text-sky-700 hover:bg-sky-50 rounded-xl">
                Iniciar Sesion
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const statusColor = data.systemStatus === "RED" ? "bg-red-500" : data.systemStatus === "ORANGE" ? "bg-orange-500" : data.systemStatus === "YELLOW" ? "bg-yellow-500" : "bg-emerald-500"
  const statusGlass = data.systemStatus === "RED" ? "from-red-500/10 to-red-600/5 border-red-500/20" : data.systemStatus === "ORANGE" ? "from-orange-500/10 to-orange-600/5 border-orange-500/20" : data.systemStatus === "YELLOW" ? "from-yellow-500/10 to-yellow-600/5 border-yellow-500/20" : "from-emerald-500/10 to-emerald-600/5 border-emerald-500/20"
  const statusText = data.systemStatus === "RED" ? "text-red-700" : data.systemStatus === "ORANGE" ? "text-orange-700" : data.systemStatus === "YELLOW" ? "text-yellow-700" : "text-emerald-700"
  const pendingCount = data.pendingKYC + data.pendingReservations + data.pendingPropertySubmissions + data.pendingContracts

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Panel de Control</h1>
          <p className="text-sm text-slate-500 mt-0.5">Centro de operaciones WEEK-WORLD</p>
        </div>
        <Button
          onClick={() => fetchDashboardData()}
          disabled={refreshing}
          className="self-start bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-sky-400 hover:to-blue-500 rounded-xl shadow-[0_4px_16px_rgba(14,165,233,0.3)] border border-sky-400/30 px-5"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      {/* System Status Banner */}
      <div className={`bg-gradient-to-br ${statusGlass} backdrop-blur-xl border rounded-2xl shadow-[0_4px_24px_rgba(14,165,233,0.08)] p-4 flex flex-col sm:flex-row sm:items-center gap-4`}>
        <div className="flex items-center gap-3 flex-1">
          <div className={`h-3.5 w-3.5 rounded-full ${statusColor} animate-pulse shadow-lg`} />
          <div>
            <p className={`font-semibold ${statusText}`}>
              Sistema {data.systemStatus} &mdash; Utilizacion {data.currentUtilization.toFixed(1)}%
            </p>
            <p className="text-xs text-slate-500">
              {data.totalSupplyWeeks} semanas supply | {data.safeCapacityWeeks} capacidad segura | {data.activeCountries} paises
            </p>
          </div>
        </div>
        {pendingCount > 0 && (
          <Badge className="bg-amber-500/20 text-amber-700 border border-amber-500/30 backdrop-blur-sm self-start px-3 py-1">
            <Clock className="h-3 w-3 mr-1.5" />
            {pendingCount} acciones pendientes
          </Badge>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Usuarios", value: data.totalUsers, sub: `+${data.newUsersThisMonth} este mes`, icon: Users, iconBg: "bg-gradient-to-br from-sky-500 to-blue-600", href: "/dashboard/admin/users", trend: data.newUsersThisMonth },
          { label: "Certificados", value: data.totalCertificates, sub: `${data.activeCertificates} activos`, icon: Ticket, iconBg: "bg-gradient-to-br from-amber-500 to-orange-600", href: "/dashboard/admin/certificates" },
          { label: "Propiedades", value: data.totalProperties, sub: `${data.activeProperties} activas`, icon: Building2, iconBg: "bg-gradient-to-br from-emerald-500 to-green-600", href: "/dashboard/admin/properties" },
          { label: "Revenue Total", value: formatCurrency(data.totalRevenue), sub: `${data.totalPayments} pagos`, icon: DollarSign, iconBg: "bg-gradient-to-br from-violet-500 to-purple-600", href: "/dashboard/admin/payments", isString: true },
        ].map((kpi) => (
          <Link key={kpi.label} href={kpi.href}>
            <div className={`${glassCard} p-5 cursor-pointer group h-full`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`${kpi.iconBg} p-2.5 rounded-xl shadow-lg`}>
                  <kpi.icon className="h-5 w-5 text-white" />
                </div>
                {kpi.trend && kpi.trend > 0 && (
                  <span className="flex items-center text-xs text-emerald-600 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    <ArrowUp className="h-3 w-3 mr-0.5" />+{kpi.trend}
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-sky-700">{kpi.isString ? kpi.value : (kpi.value as number).toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-1">{kpi.sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Certificate Tiers Status */}
      <div>
        <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-3">Certificados por Tier</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {(["silver", "gold", "platinum", "signature"] as const).map((tier) => {
            const stopped = data.stopSaleFlags[tier]
            const count = data.certificatesActive[tier]
            const colors: Record<string, string> = { silver: "from-slate-400 to-slate-500", gold: "from-amber-400 to-yellow-500", platinum: "from-sky-400 to-blue-500", signature: "from-violet-400 to-purple-500" }
            return (
              <div key={tier} className={`${glass} ${stopped ? "border-red-500/30" : ""} p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-700 capitalize">{tier}</span>
                  <Badge className={stopped ? "bg-red-500/20 text-red-700 border-red-500/30 text-[10px]" : "bg-emerald-500/20 text-emerald-700 border-emerald-500/30 text-[10px]"}>
                    {stopped ? "DETENIDO" : "ABIERTO"}
                  </Badge>
                </div>
                <div className="flex items-end gap-2">
                  <p className="text-2xl font-bold text-slate-900">{count}</p>
                  <div className={`h-1.5 flex-1 rounded-full bg-gradient-to-r ${colors[tier]} opacity-40 mb-1.5`} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Pending Actions + Ecosystem Satellites */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Pending Actions */}
        <div className={`${glass} p-5 lg:col-span-1`}>
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2 mb-4">
            <Clock className="h-4 w-4 text-amber-500" />
            Pendientes de Accion
          </h3>
          <div className="space-y-2.5">
            {[
              { condition: data.pendingKYC > 0, label: "Verificaciones KYC", count: data.pendingKYC, icon: BadgeCheck, color: "amber", href: "/dashboard/admin/kyc" },
              { condition: data.pendingReservations > 0, label: "Solicitudes de Reserva", count: data.pendingReservations, icon: Calendar, color: "sky", href: "/dashboard/admin/reservations" },
              { condition: data.pendingPropertySubmissions > 0, label: "Propiedades por Aprobar", count: data.pendingPropertySubmissions, icon: Building2, color: "violet", href: "/dashboard/admin/property-approvals" },
              { condition: data.pendingContracts > 0, label: "Contratos Pendientes", count: data.pendingContracts, icon: FileText, color: "emerald", href: "/dashboard/admin/legalario" },
              { condition: data.waitlistSize > 0, label: "Lista de Espera", count: data.waitlistSize, icon: Star, color: "orange", href: "/dashboard/admin/presale" },
            ].filter(item => item.condition).map((item) => (
              <Link key={item.label} href={item.href}>
                <div className={`flex items-center justify-between p-3 rounded-xl bg-${item.color}-500/10 border border-${item.color}-500/20 hover:bg-${item.color}-500/20 transition-all cursor-pointer`}>
                  <div className="flex items-center gap-2.5">
                    <item.icon className={`h-4 w-4 text-${item.color}-600`} />
                    <span className="text-sm font-medium text-slate-700">{item.label}</span>
                  </div>
                  <Badge className={`bg-${item.color}-500/20 text-${item.color}-700 border-${item.color}-500/30`}>{item.count}</Badge>
                </div>
              </Link>
            ))}
            {pendingCount === 0 && (
              <div className="text-center py-8">
                <ShieldCheck className="h-10 w-10 mx-auto mb-3 text-emerald-500" />
                <p className="text-sm font-semibold text-emerald-700">Todo al dia</p>
                <p className="text-xs text-slate-400 mt-1">No hay acciones pendientes</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className={`${glass} p-5 lg:col-span-2`}>
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-sky-500" />
            Gestion del Negocio
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {[
              { label: "Reservaciones", icon: Calendar, href: "/dashboard/admin/reservations", iconBg: "bg-gradient-to-br from-sky-500 to-blue-600" },
              { label: "Propiedades", icon: Building2, href: "/dashboard/admin/properties", iconBg: "bg-gradient-to-br from-emerald-500 to-green-600" },
              { label: "Pagos y Cobros", icon: CreditCard, href: "/dashboard/admin/payments", iconBg: "bg-gradient-to-br from-violet-500 to-purple-600" },
              { label: "KYC / Verificacion", icon: BadgeCheck, href: "/dashboard/admin/kyc", iconBg: "bg-gradient-to-br from-amber-500 to-orange-600" },
              { label: "Red de Brokers", icon: Briefcase, href: "/dashboard/admin/approvals", iconBg: "bg-gradient-to-br from-pink-500 to-rose-600" },
              { label: "Destinos", icon: MapPin, href: "/dashboard/admin/destinations", iconBg: "bg-gradient-to-br from-teal-500 to-cyan-600" },
              { label: "Supply / Capacidad", icon: BarChart3, href: "/dashboard/admin/supply", iconBg: "bg-gradient-to-br from-red-500 to-rose-600" },
              { label: "Escrow Contable", icon: DollarSign, href: "/dashboard/admin/escrow-contable", iconBg: "bg-gradient-to-br from-emerald-500 to-green-600" },
              { label: "Legalario / Firmas", icon: Scale, href: "/dashboard/admin/legalario", iconBg: "bg-gradient-to-br from-amber-500 to-yellow-600" },
              { label: "Compliance", icon: Shield, href: "/dashboard/admin/compliance", iconBg: "bg-gradient-to-br from-slate-500 to-gray-600" },
              { label: "Analytics", icon: TrendingUp, href: "/dashboard/admin/analytics", iconBg: "bg-gradient-to-br from-sky-500 to-blue-600" },
              { label: "Configuracion", icon: Wrench, href: "/dashboard/admin/settings", iconBg: "bg-gradient-to-br from-slate-400 to-slate-500" },
            ].map((item) => (
              <Link key={item.href} href={item.href}>
                <div className="flex items-center gap-2.5 p-3 rounded-xl border border-sky-500/10 bg-white/40 hover:bg-sky-500/10 hover:border-sky-500/20 transition-all cursor-pointer group">
                  <div className={`${item.iconBg} p-1.5 rounded-lg shadow-md`}>
                    <item.icon className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="text-sm text-slate-700 font-medium group-hover:text-sky-700 truncate">{item.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Ecosystem Satellites Monitor */}
      <div>
        <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-3">Ecosistema WEEK-WORLD</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: "WEEK-MANAGEMENT", desc: "Propiedades y administracion", icon: Building2, color: "from-sky-500 to-blue-600", status: "Operativo", stats: [{ l: "Propiedades", v: data.totalProperties }, { l: "Activas", v: data.activeProperties }], href: "/dashboard/admin/properties" },
            { name: "WEEK-BOOKING", desc: "Reservaciones y estancias", icon: Calendar, color: "from-violet-500 to-purple-600", status: "Operativo", stats: [{ l: "Solicitudes pendientes", v: data.pendingReservations }, { l: "Confirmadas", v: data.activeReservations }], href: "/dashboard/admin/reservations" },
            { name: "WEEK-AGENT", desc: "Red de intermediarios", icon: Briefcase, color: "from-orange-500 to-red-600", status: "Operativo", stats: [{ l: "Brokers activos", v: data.brokerCount }, { l: "Certificados vendidos", v: data.totalCertificates }], href: "/dashboard/admin/approvals" },
            { name: "WEEK-FINANCE", desc: "VA-FI Tokenizacion y DeFi", icon: Coins, color: "from-emerald-500 to-green-600", status: "Testnet Q1 2027", stats: [{ l: "TVL", v: "$0" }, { l: "Status", v: "En desarrollo" }], href: "/dashboard/admin/vafi" },
            { name: "WEEK-LEGAL", desc: "Legalario y NOM-151", icon: Scale, color: "from-amber-500 to-yellow-600", status: "Operativo", stats: [{ l: "Contratos pendientes", v: data.pendingContracts }, { l: "KYC pendientes", v: data.pendingKYC }], href: "/dashboard/admin/legalario" },
            { name: "WEEK-CHAIN", desc: "Blockchain y certificados", icon: Lock, color: "from-cyan-500 to-sky-600", status: "Operativo", stats: [{ l: "Certificados totales", v: data.totalCertificates }, { l: "Activos", v: data.activeCertificates }], href: "/dashboard/admin/certificates" },
            { name: "WEEK-EXPERIENCE", desc: "Servicios complementarios", icon: Star, color: "from-pink-500 to-rose-600", status: "Proximo", stats: [{ l: "Proveedores", v: 0 }, { l: "Status", v: "Pendiente" }], href: "/dashboard/admin/services" },
            { name: "WEEK-COMMUNITY", desc: "Red social y DAO", icon: Globe, color: "from-teal-500 to-cyan-600", status: "Activo", stats: [{ l: "Usuarios", v: data.totalUsers }, { l: "Propuestas DAO", v: 0 }], href: "/dashboard/admin/dao" },
            { name: "WEEK-FUNDACION", desc: "Impacto social y ambiental", icon: Shield, color: "from-green-500 to-emerald-600", status: "Activo", stats: [{ l: "Proyectos", v: 0 }, { l: "Donaciones", v: "$0" }], href: "/week-fundacion" },
          ].map((satellite) => (
            <Link key={satellite.name} href={satellite.href}>
              <div className={`${glassCard} p-5 cursor-pointer h-full`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`bg-gradient-to-br ${satellite.color} p-2.5 rounded-xl shadow-lg`}>
                    <satellite.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate">{satellite.name}</h4>
                    <p className="text-[11px] text-slate-500 truncate">{satellite.desc}</p>
                  </div>
                  <Badge className={`text-[10px] ${satellite.status === "Operativo" || satellite.status === "Activo" ? "bg-emerald-500/20 text-emerald-700 border-emerald-500/30" : "bg-amber-500/20 text-amber-700 border-amber-500/30"}`}>
                    {satellite.status}
                  </Badge>
                </div>
                <div className="space-y-1.5">
                  {satellite.stats.map((stat) => (
                    <div key={stat.l} className="flex justify-between text-xs">
                      <span className="text-slate-500">{stat.l}</span>
                      <span className="font-semibold text-slate-700">{typeof stat.v === "number" ? stat.v.toLocaleString() : stat.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className={`${glass} p-5`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Eye className="h-4 w-4 text-sky-500" />
            Actividad Reciente
          </h3>
          <Link href="/dashboard/admin/audit-logs">
            <Button variant="ghost" size="sm" className="text-xs text-sky-600 hover:text-sky-700 hover:bg-sky-500/10">
              Ver todo <ArrowUpRight className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        </div>
        {recentActivity.length > 0 ? (
          <div className="space-y-2">
            {recentActivity.map((activity, i) => (
              <Link key={i} href={activity.link}>
                <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-sky-500/[0.06] transition-all cursor-pointer border border-sky-500/10">
                  <div className={`h-2.5 w-2.5 rounded-full shrink-0 shadow-md ${
                    activity.status === "success" ? "bg-emerald-500" :
                    activity.status === "warning" ? "bg-amber-500" : "bg-sky-500"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 truncate">{activity.action}</p>
                    <p className="text-xs text-slate-400">{activity.time}</p>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-slate-400">
            <Activity className="h-10 w-10 mx-auto mb-3 text-sky-300" />
            <p className="text-sm font-medium">Sin actividad reciente</p>
          </div>
        )}
      </div>
    </div>
  )
}
