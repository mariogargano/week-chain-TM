"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Building2, Users, AlertCircle, ArrowUpRight, Loader2, Ticket, Calendar, Eye,
  RefreshCw, TrendingUp, DollarSign, ShieldCheck, BadgeCheck, BarChart3, MapPin,
  CreditCard, FileText, Clock, Activity, Briefcase, ArrowUp, Globe, Scale, Coins,
  Lock, Star, Wrench, Shield,
} from "lucide-react"
import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

/* ---------- Glass utility classes ---------- */
const glass = "bg-white/80 backdrop-blur-xl border border-sky-200/60 rounded-2xl shadow-sm"
const glassHover = "hover:shadow-md hover:border-sky-300/60 transition-all duration-300"
const glassCard = `${glass} ${glassHover}`

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
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <div className={`${glass} p-8 text-center max-w-xs w-full`}>
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-sky-500" />
          <p className="mt-3 text-sm text-slate-500 font-medium">Cargando panel...</p>
        </div>
      </div>
    )
  }

  /* ---------- Error ---------- */
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <div className={`${glass} max-w-sm w-full p-6`}>
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900 text-center mb-2">Error al cargar</h3>
          <p className="text-sm text-red-600 mb-5 text-center">{error}</p>
          <div className="flex flex-col gap-2">
            <Button onClick={() => { fetchedRef.current = false; fetchDashboardData() }} className="w-full bg-sky-500 hover:bg-sky-600 text-white rounded-xl">
              Reintentar
            </Button>
            <Link href="/auth?tab=login" className="w-full">
              <Button variant="outline" className="w-full border-sky-200 text-sky-700 hover:bg-sky-50 rounded-xl">
                Iniciar Sesion
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const statusColor = data.systemStatus === "RED" ? "bg-red-500" : data.systemStatus === "ORANGE" ? "bg-orange-500" : data.systemStatus === "YELLOW" ? "bg-yellow-500" : "bg-emerald-500"
  const statusBg = data.systemStatus === "RED" ? "bg-red-50 border-red-200" : data.systemStatus === "ORANGE" ? "bg-orange-50 border-orange-200" : data.systemStatus === "YELLOW" ? "bg-yellow-50 border-yellow-200" : "bg-emerald-50 border-emerald-200"
  const statusText = data.systemStatus === "RED" ? "text-red-700" : data.systemStatus === "ORANGE" ? "text-orange-700" : data.systemStatus === "YELLOW" ? "text-yellow-700" : "text-emerald-700"
  const pendingCount = data.pendingKYC + data.pendingReservations + data.pendingPropertySubmissions + data.pendingContracts

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Panel de Control</h1>
          <p className="text-xs text-slate-500 mt-0.5">Centro de operaciones WEEK-WORLD</p>
        </div>
        <Button
          onClick={() => fetchDashboardData()}
          disabled={refreshing}
          size="sm"
          className="bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs px-3 min-h-[36px]"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline ml-1.5">Actualizar</span>
        </Button>
      </div>

      {/* Stripe Test Mode Warning */}
      {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_test') && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
            <CreditCard className="h-4 w-4 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-800">Stripe en Modo Test</p>
            <p className="text-[11px] text-amber-600">Los pagos no son reales. Cambia a claves live en produccion.</p>
          </div>
          <Badge className="bg-amber-200 text-amber-800 border-0 text-[10px] px-2 py-0.5 flex-shrink-0">
            TEST
          </Badge>
        </div>
      )}

      {/* System Status Banner */}
      <div className={`${statusBg} backdrop-blur-xl border rounded-xl p-3 flex items-center gap-3`}>
        <div className={`h-3 w-3 rounded-full ${statusColor} animate-pulse shadow-sm flex-shrink-0`} />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${statusText}`}>
            Sistema {data.systemStatus} - {data.currentUtilization.toFixed(1)}%
          </p>
          <p className="text-[11px] text-slate-500 truncate">
            {data.totalSupplyWeeks} semanas | {data.safeCapacityWeeks} seguras | {data.activeCountries} paises
          </p>
        </div>
        {pendingCount > 0 && (
          <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px] px-2 py-0.5 flex-shrink-0">
            <Clock className="h-3 w-3 mr-1" />
            {pendingCount}
          </Badge>
        )}
      </div>

      {/* KPI Cards - 2x2 grid on mobile, 4 columns on desktop */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Usuarios", value: data.totalUsers, sub: `+${data.newUsersThisMonth} mes`, icon: Users, color: "bg-sky-500", href: "/dashboard/admin/users", trend: data.newUsersThisMonth },
          { label: "Certificados", value: data.totalCertificates, sub: `${data.activeCertificates} activos`, icon: Ticket, color: "bg-amber-500", href: "/dashboard/admin/certificates" },
          { label: "Propiedades", value: data.totalProperties, sub: `${data.activeProperties} activas`, icon: Building2, color: "bg-emerald-500", href: "/dashboard/admin/properties" },
          { label: "Revenue", value: formatCurrency(data.totalRevenue), sub: `${data.totalPayments} pagos`, icon: DollarSign, color: "bg-violet-500", href: "/dashboard/admin/payments", isString: true },
        ].map((kpi) => (
          <Link key={kpi.label} href={kpi.href}>
            <div className={`${glassCard} p-4 cursor-pointer h-full`}>
              <div className="flex items-center justify-between mb-2">
                <div className={`${kpi.color} p-2 rounded-lg`}>
                  <kpi.icon className="h-4 w-4 text-white" />
                </div>
                {kpi.trend && kpi.trend > 0 && (
                  <span className="flex items-center text-[10px] text-emerald-600 font-medium bg-emerald-50 px-1.5 py-0.5 rounded-full">
                    <ArrowUp className="h-2.5 w-2.5" />+{kpi.trend}
                  </span>
                )}
              </div>
              <p className="text-lg font-bold text-slate-900">{kpi.isString ? kpi.value : (kpi.value as number).toLocaleString()}</p>
              <p className="text-[11px] text-slate-500">{kpi.sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Certificate Tiers - 2x2 on mobile, 4 columns on desktop */}
      <div>
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Certificados por Tier</h2>
        <div className="grid grid-cols-2 gap-2">
          {(["silver", "gold", "platinum", "signature"] as const).map((tier) => {
            const stopped = data.stopSaleFlags[tier]
            const count = data.certificatesActive[tier]
            const colors: Record<string, string> = { silver: "bg-slate-400", gold: "bg-amber-400", platinum: "bg-sky-400", signature: "bg-violet-400" }
            return (
              <div key={tier} className={`${glass} ${stopped ? "border-red-200" : ""} p-3`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-slate-600 capitalize">{tier}</span>
                  <Badge className={`text-[9px] px-1.5 py-0 ${stopped ? "bg-red-50 text-red-600 border-red-200" : "bg-emerald-50 text-emerald-600 border-emerald-200"}`}>
                    {stopped ? "STOP" : "OK"}
                  </Badge>
                </div>
                <div className="flex items-end gap-2">
                  <p className="text-xl font-bold text-slate-900">{count}</p>
                  <div className={`h-1 flex-1 rounded-full ${colors[tier]} opacity-30 mb-1`} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Pending Actions */}
      <div className={`${glass} p-4`}>
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-3">
          <Clock className="h-4 w-4 text-amber-500" />
          Pendientes
        </h3>
        <div className="space-y-2">
          {[
            { condition: data.pendingKYC > 0, label: "KYC", count: data.pendingKYC, icon: BadgeCheck, bg: "bg-amber-50 border-amber-200", iconCls: "text-amber-600", href: "/dashboard/admin/kyc" },
            { condition: data.pendingReservations > 0, label: "Reservas", count: data.pendingReservations, icon: Calendar, bg: "bg-sky-50 border-sky-200", iconCls: "text-sky-600", href: "/dashboard/admin/reservations" },
            { condition: data.pendingPropertySubmissions > 0, label: "Propiedades", count: data.pendingPropertySubmissions, icon: Building2, bg: "bg-violet-50 border-violet-200", iconCls: "text-violet-600", href: "/dashboard/admin/property-approvals" },
            { condition: data.pendingContracts > 0, label: "Contratos", count: data.pendingContracts, icon: FileText, bg: "bg-emerald-50 border-emerald-200", iconCls: "text-emerald-600", href: "/dashboard/admin/legalario" },
            { condition: data.waitlistSize > 0, label: "Waitlist", count: data.waitlistSize, icon: Star, bg: "bg-orange-50 border-orange-200", iconCls: "text-orange-600", href: "/dashboard/admin/presale" },
          ].filter(item => item.condition).map((item) => (
            <Link key={item.label} href={item.href}>
              <div className={`flex items-center justify-between p-2.5 rounded-lg border ${item.bg} transition-all cursor-pointer active:scale-[0.98]`}>
                <div className="flex items-center gap-2">
                  <item.icon className={`h-4 w-4 ${item.iconCls}`} />
                  <span className="text-sm font-medium text-slate-700">{item.label}</span>
                </div>
                <Badge variant="secondary" className="text-xs">{item.count}</Badge>
              </div>
            </Link>
          ))}
          {pendingCount === 0 && (
            <div className="text-center py-6">
              <ShieldCheck className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
              <p className="text-sm font-medium text-emerald-700">Todo al dia</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className={`${glass} p-4`}>
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-3">
          <Activity className="h-4 w-4 text-sky-500" />
          Acciones Rapidas
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Reservas", icon: Calendar, href: "/dashboard/admin/reservations", color: "bg-sky-500" },
            { label: "Propiedades", icon: Building2, href: "/dashboard/admin/properties", color: "bg-emerald-500" },
            { label: "Pagos", icon: CreditCard, href: "/dashboard/admin/payments", color: "bg-violet-500" },
            { label: "KYC", icon: BadgeCheck, href: "/dashboard/admin/kyc", color: "bg-amber-500" },
            { label: "Brokers", icon: Briefcase, href: "/dashboard/admin/broker-network", color: "bg-pink-500" },
            { label: "Destinos", icon: MapPin, href: "/dashboard/admin/destinations", color: "bg-teal-500" },
            { label: "Supply", icon: BarChart3, href: "/dashboard/admin/supply", color: "bg-red-500" },
            { label: "Escrow", icon: DollarSign, href: "/dashboard/admin/escrow-contable", color: "bg-emerald-600" },
            { label: "Legal", icon: Scale, href: "/dashboard/admin/legalario", color: "bg-amber-600" },
            { label: "Compliance", icon: Shield, href: "/dashboard/admin/compliance", color: "bg-slate-500" },
            { label: "Analytics", icon: TrendingUp, href: "/dashboard/admin/analytics", color: "bg-sky-600" },
            { label: "Config", icon: Wrench, href: "/dashboard/admin/settings", color: "bg-slate-400" },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-slate-100 bg-white/60 hover:bg-sky-50 hover:border-sky-200 transition-all cursor-pointer active:scale-95">
                <div className={`${item.color} p-2 rounded-lg`}>
                  <item.icon className="h-4 w-4 text-white" />
                </div>
                <span className="text-[11px] text-slate-600 font-medium text-center">{item.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Ecosystem Satellites - Scrollable on mobile */}
      <div>
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Ecosistema WEEK-WORLD</h2>
        <div className="grid grid-cols-1 gap-3">
          {[
            { name: "WEEK-MANAGEMENT", desc: "Propiedades", icon: Building2, color: "bg-sky-500", status: "Operativo", stats: [{ l: "Props", v: data.totalProperties }, { l: "Activas", v: data.activeProperties }], href: "/dashboard/admin/properties" },
            { name: "WEEK-BOOKING", desc: "Reservaciones", icon: Calendar, color: "bg-violet-500", status: "Operativo", stats: [{ l: "Pendientes", v: data.pendingReservations }, { l: "Confirmadas", v: data.activeReservations }], href: "/dashboard/admin/reservations" },
            { name: "WEEK-AGENT", desc: "Red de brokers", icon: Briefcase, color: "bg-orange-500", status: "Operativo", stats: [{ l: "Brokers", v: data.brokerCount }, { l: "Comision", v: "4%" }], href: "/dashboard/admin/broker-network" },
            { name: "WEEK-FINANCE", desc: "Tokenizacion", icon: Coins, color: "bg-emerald-500", status: "Q1 2027", stats: [{ l: "TVL", v: "$0" }, { l: "Status", v: "Dev" }], href: "/dashboard/admin/vafi" },
            { name: "WEEK-LEGAL", desc: "NOM-151", icon: Scale, color: "bg-amber-500", status: "Operativo", stats: [{ l: "Contratos", v: data.pendingContracts }, { l: "KYC", v: data.pendingKYC }], href: "/dashboard/admin/legalario" },
            { name: "WEEK-CHAIN", desc: "Blockchain", icon: Lock, color: "bg-cyan-500", status: "Operativo", stats: [{ l: "Certs", v: data.totalCertificates }, { l: "Activos", v: data.activeCertificates }], href: "/dashboard/admin/certificates" },
          ].map((satellite) => (
            <Link key={satellite.name} href={satellite.href}>
              <div className={`${glassCard} p-4 cursor-pointer`}>
                <div className="flex items-center gap-3">
                  <div className={`${satellite.color} p-2.5 rounded-xl`}>
                    <satellite.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900">{satellite.name}</h4>
                      <Badge className={`text-[10px] ${satellite.status === "Operativo" ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-amber-50 text-amber-600 border-amber-200"}`}>
                        {satellite.status}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-500">{satellite.desc}</p>
                  </div>
                </div>
                <div className="flex gap-4 mt-3 pt-3 border-t border-slate-100">
                  {satellite.stats.map((stat) => (
                    <div key={stat.l} className="flex-1">
                      <p className="text-[10px] text-slate-400 uppercase">{stat.l}</p>
                      <p className="text-sm font-semibold text-slate-700">{typeof stat.v === "number" ? stat.v.toLocaleString() : stat.v}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className={`${glass} p-4`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Eye className="h-4 w-4 text-sky-500" />
            Actividad Reciente
          </h3>
          <Link href="/dashboard/admin/audit-logs">
            <Button variant="ghost" size="sm" className="text-[11px] text-sky-600 hover:text-sky-700 h-7 px-2">
              Ver todo <ArrowUpRight className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        </div>
        {recentActivity.length > 0 ? (
          <div className="space-y-2">
            {recentActivity.slice(0, 5).map((activity, i) => (
              <Link key={i} href={activity.link}>
                <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-all cursor-pointer border border-slate-100">
                  <div className={`h-2 w-2 rounded-full flex-shrink-0 ${
                    activity.status === "success" ? "bg-emerald-500" :
                    activity.status === "warning" ? "bg-amber-500" : "bg-sky-500"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 truncate">{activity.action}</p>
                    <p className="text-[10px] text-slate-400">{activity.time}</p>
                  </div>
                  <ArrowUpRight className="h-3 w-3 text-slate-300 flex-shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400">
            <Activity className="h-8 w-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm">Sin actividad reciente</p>
          </div>
        )}
      </div>
    </div>
  )
}
