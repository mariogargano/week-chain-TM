"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Building2,
  Users,
  AlertCircle,
  ArrowUpRight,
  Loader2,
  Ticket,
  Calendar,
  Eye,
  RefreshCw,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  BadgeCheck,
  BarChart3,
  MapPin,
  CreditCard,
  FileText,
  Clock,
  Activity,
  Briefcase,
  ArrowDown,
  ArrowUp,
} from "lucide-react"
import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

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
}

const defaultData: DashboardData = {
  totalUsers: 0,
  newUsersThisMonth: 0,
  pendingKYC: 0,
  totalCertificates: 0,
  activeCertificates: 0,
  totalProperties: 0,
  activeProperties: 0,
  pendingReservations: 0,
  totalPayments: 0,
  totalRevenue: 0,
  pendingBrokerApprovals: 0,
  systemStatus: "GREEN",
  currentUtilization: 0,
  totalSupplyWeeks: 0,
  safeCapacityWeeks: 0,
  activeCountries: 0,
  waitlistSize: 0,
  certificatesActive: { silver: 0, gold: 0, platinum: 0, signature: 0 },
  stopSaleFlags: { silver: false, gold: false, platinum: false, signature: false },
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [data, setData] = useState<DashboardData>(defaultData)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const fetchedRef = useRef(false)

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true)
      setError(null)
      const supabase = createClient()

      // Verify session before making queries
      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData?.session) {
        setError("Sesion no valida. Inicia sesion para acceder al panel.")
        setLoading(false)
        setRefreshing(false)
        return
      }

      const safeQuery = async (query: Promise<any>) => {
        try {
          const result = await query
          if (result.error) return { data: null, count: 0, error: result.error }
          return result
        } catch {
          return { data: null, count: 0, error: "Query failed" }
        }
      }

      const [
        capacityResponse,
        usersResult,
        kycResult,
        certificatesResult,
        propertiesResult,
        reservationsResult,
        paymentsResult,
        brokerApprovals,
        recentKyc,
        recentReservations,
      ] = await Promise.all([
        fetch("/api/admin/capacity/global-status").then((r) => r.ok ? r.json() : { globalMetrics: {} }).catch(() => ({ globalMetrics: {} })),
        safeQuery(supabase.from("users").select("id, created_at", { count: "exact" })),
        safeQuery(supabase.from("kyc_users").select("id", { count: "exact" }).eq("status", "pending")),
        safeQuery(supabase.from("certificates").select("id, status", { count: "exact" })),
        safeQuery(supabase.from("properties").select("id, status", { count: "exact" })),
        safeQuery(supabase.from("reservation_requests").select("id", { count: "exact" }).in("status", ["requested", "processing"])),
        safeQuery(supabase.from("payments").select("id, amount, status", { count: "exact" })),
        safeQuery(supabase.from("broker_applications").select("id", { count: "exact" }).eq("status", "pending")),
        safeQuery(supabase.from("kyc_users").select("id, name, email, status, created_at").eq("status", "pending").order("created_at", { ascending: false }).limit(5)),
        safeQuery(supabase.from("reservation_requests").select("id, status, created_at, destination_preference").in("status", ["requested", "processing"]).order("created_at", { ascending: false }).limit(5)),
      ])

      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const newUsers = usersResult.data?.filter((u) => new Date(u.created_at) >= monthStart).length || 0

      const activeCerts = certificatesResult.data?.filter((c) => c.status === "active").length || 0
      const activeProps = propertiesResult.data?.filter((p) => p.status === "active" || p.status === "published").length || 0
      const completedPayments = paymentsResult.data?.filter((p) => p.status === "completed" || p.status === "captured")
      const totalRevenue = completedPayments?.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) || 0

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
        pendingBrokerApprovals: brokerApprovals.count || 0,
        systemStatus: gm.systemStatus || "GREEN",
        currentUtilization: gm.currentUtilization || 0,
        totalSupplyWeeks: gm.totalSupplyWeeks || 0,
        safeCapacityWeeks: gm.safeCapacityWeeks || 0,
        activeCountries: gm.activeCountries || 0,
        waitlistSize: gm.waitlistSize || 0,
        certificatesActive: ca,
        stopSaleFlags: sf,
      })

      // Build recent activity
      const activities: any[] = []
      recentReservations.data?.forEach((r: any) => {
        activities.push({
          type: "reservation",
          action: `Nueva solicitud de reserva: ${r.destination_preference || "Destino flexible"}`,
          time: formatTimeAgo(r.created_at),
          status: r.status === "processing" ? "warning" : "info",
          link: "/dashboard/admin/reservations",
        })
      })
      recentKyc.data?.forEach((k: any) => {
        activities.push({
          type: "kyc",
          action: `KYC pendiente: ${k.name || k.email || "Usuario"}`,
          time: formatTimeAgo(k.created_at),
          status: "warning",
          link: "/dashboard/admin/kyc",
        })
      })
      setRecentActivity(activities.slice(0, 8))

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
    if (diffMins < 60) return `Hace ${diffMins} min`
    if (diffHours < 24) return `Hace ${diffHours}h`
    return `Hace ${diffDays}d`
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-sky-500" />
          <p className="mt-3 text-sm text-slate-500">Cargando panel de administracion...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-6">
        <Card className="max-w-md w-full border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700 text-base">
              <AlertCircle className="h-5 w-5" />
              Error al cargar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <div className="flex gap-2">
              <Button onClick={() => { fetchedRef.current = false; fetchDashboardData() }} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                Reintentar
              </Button>
              <Link href="/auth?tab=login" className="flex-1">
                <Button variant="outline" className="w-full border-red-300 text-red-700 hover:bg-red-100">
                  Iniciar Sesion
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusColor = data.systemStatus === "RED" ? "bg-red-500" : data.systemStatus === "ORANGE" ? "bg-orange-500" : data.systemStatus === "YELLOW" ? "bg-yellow-500" : "bg-emerald-500"
  const statusBorder = data.systemStatus === "RED" ? "border-red-200 bg-red-50" : data.systemStatus === "ORANGE" ? "border-orange-200 bg-orange-50" : data.systemStatus === "YELLOW" ? "border-yellow-200 bg-yellow-50" : "border-emerald-200 bg-emerald-50"
  const statusText = data.systemStatus === "RED" ? "text-red-700" : data.systemStatus === "ORANGE" ? "text-orange-700" : data.systemStatus === "YELLOW" ? "text-yellow-700" : "text-emerald-700"

  const pendingCount = data.pendingKYC + data.pendingReservations + data.pendingBrokerApprovals
  const totalActiveCerts = data.certificatesActive.silver + data.certificatesActive.gold + data.certificatesActive.platinum + data.certificatesActive.signature

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Panel de Administracion</h1>
          <p className="text-sm text-slate-500 mt-0.5">Resumen general de la plataforma WEEK-CHAIN</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-slate-300 text-slate-700 hover:bg-slate-50 self-start"
          onClick={() => fetchDashboardData()}
          disabled={refreshing}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      {/* System Status Banner */}
      <Card className={`border ${statusBorder}`}>
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className={`h-3 w-3 rounded-full ${statusColor} animate-pulse`} />
            <div>
              <p className={`font-semibold ${statusText}`}>
                Sistema {data.systemStatus} - Utilizacion {data.currentUtilization.toFixed(1)}%
              </p>
              <p className="text-xs text-slate-500">
                {data.totalSupplyWeeks} semanas supply total | {data.safeCapacityWeeks} capacidad segura | {data.activeCountries} paises
              </p>
            </div>
          </div>
          {pendingCount > 0 && (
            <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200 self-start">
              <Clock className="h-3 w-3 mr-1" />
              {pendingCount} pendientes
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Link href="/dashboard/admin/users">
          <Card className="border border-slate-200 hover:border-sky-300 hover:shadow-md transition-all cursor-pointer group h-full">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-sky-50 text-sky-600 group-hover:bg-sky-100 transition-colors">
                  <Users className="h-4 w-4" />
                </div>
                {data.newUsersThisMonth > 0 && (
                  <span className="flex items-center text-xs text-emerald-600 font-medium">
                    <ArrowUp className="h-3 w-3 mr-0.5" />+{data.newUsersThisMonth}
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-slate-900">{data.totalUsers.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-0.5">Usuarios registrados</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/admin/certificates">
          <Card className="border border-slate-200 hover:border-sky-300 hover:shadow-md transition-all cursor-pointer group h-full">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-100 transition-colors">
                  <Ticket className="h-4 w-4" />
                </div>
                <span className="text-xs text-slate-500">{totalActiveCerts} activos</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{data.totalCertificates.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-0.5">Certificados emitidos</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/admin/properties">
          <Card className="border border-slate-200 hover:border-sky-300 hover:shadow-md transition-all cursor-pointer group h-full">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                  <Building2 className="h-4 w-4" />
                </div>
                <span className="text-xs text-slate-500">{data.activeProperties} activas</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{data.totalProperties.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-0.5">Propiedades totales</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/admin/payments">
          <Card className="border border-slate-200 hover:border-sky-300 hover:shadow-md transition-all cursor-pointer group h-full">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-violet-50 text-violet-600 group-hover:bg-violet-100 transition-colors">
                  <DollarSign className="h-4 w-4" />
                </div>
                <span className="text-xs text-slate-500">{data.totalPayments} pagos</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(data.totalRevenue)}</p>
              <p className="text-xs text-slate-500 mt-0.5">Ingresos totales</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Certificate Tiers Status */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">Estado de Certificados por Tier</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {(["silver", "gold", "platinum", "signature"] as const).map((tier) => {
            const stopped = data.stopSaleFlags[tier]
            const count = data.certificatesActive[tier]
            const tierLabel = tier.charAt(0).toUpperCase() + tier.slice(1)
            return (
              <Card key={tier} className={`border ${stopped ? "border-red-200 bg-red-50" : "border-slate-200"}`}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">{tierLabel}</span>
                    <Badge variant="secondary" className={stopped ? "bg-red-100 text-red-700 text-[10px]" : "bg-emerald-100 text-emerald-700 text-[10px]"}>
                      {stopped ? "DETENIDO" : "ABIERTO"}
                    </Badge>
                  </div>
                  <p className="text-xl font-bold text-slate-900 mt-1">{count}</p>
                  <p className="text-[10px] text-slate-500">certificados activos</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Pending Actions + Quick Links */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Pending Actions */}
        <Card className="border border-slate-200 lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              Pendientes de Accion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.pendingKYC > 0 && (
              <Link href="/dashboard/admin/kyc">
                <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-100 hover:bg-amber-100 transition-colors cursor-pointer">
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-800">Verificaciones KYC</span>
                  </div>
                  <Badge className="bg-amber-200 text-amber-800">{data.pendingKYC}</Badge>
                </div>
              </Link>
            )}
            {data.pendingReservations > 0 && (
              <Link href="/dashboard/admin/reservations">
                <div className="flex items-center justify-between p-3 rounded-lg bg-sky-50 border border-sky-100 hover:bg-sky-100 transition-colors cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-sky-600" />
                    <span className="text-sm font-medium text-sky-800">Reservaciones</span>
                  </div>
                  <Badge className="bg-sky-200 text-sky-800">{data.pendingReservations}</Badge>
                </div>
              </Link>
            )}
            {data.pendingBrokerApprovals > 0 && (
              <Link href="/dashboard/admin/approvals">
                <div className="flex items-center justify-between p-3 rounded-lg bg-violet-50 border border-violet-100 hover:bg-violet-100 transition-colors cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-violet-600" />
                    <span className="text-sm font-medium text-violet-800">Aprobaciones Broker</span>
                  </div>
                  <Badge className="bg-violet-200 text-violet-800">{data.pendingBrokerApprovals}</Badge>
                </div>
              </Link>
            )}
            {data.waitlistSize > 0 && (
              <Link href="/dashboard/admin/presale">
                <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 transition-colors cursor-pointer">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-800">Lista de espera</span>
                  </div>
                  <Badge className="bg-emerald-200 text-emerald-800">{data.waitlistSize}</Badge>
                </div>
              </Link>
            )}
            {pendingCount === 0 && data.waitlistSize === 0 && (
              <div className="text-center py-6 text-slate-400">
                <ShieldCheck className="h-8 w-8 mx-auto mb-2 text-emerald-400" />
                <p className="text-sm font-medium text-emerald-600">Todo al dia</p>
                <p className="text-xs text-slate-400">No hay acciones pendientes</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Navigation */}
        <Card className="border border-slate-200 lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Activity className="h-4 w-4 text-sky-500" />
              Accesos Rapidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { label: "Capacidad y Riesgo", icon: BarChart3, href: "/dashboard/admin/capacity-risk", color: "text-red-600 bg-red-50" },
                { label: "Supply", icon: Activity, href: "/dashboard/admin/supply", color: "text-sky-600 bg-sky-50" },
                { label: "Pagos y Cobros", icon: CreditCard, href: "/dashboard/admin/payments", color: "text-violet-600 bg-violet-50" },
                { label: "Escrow Contable", icon: DollarSign, href: "/dashboard/admin/escrow-contable", color: "text-emerald-600 bg-emerald-50" },
                { label: "Legalario", icon: FileText, href: "/dashboard/admin/legalario", color: "text-amber-600 bg-amber-50" },
                { label: "Compliance", icon: ShieldCheck, href: "/dashboard/admin/compliance", color: "text-slate-600 bg-slate-50" },
                { label: "Analytics", icon: TrendingUp, href: "/dashboard/admin/analytics", color: "text-sky-600 bg-sky-50" },
                { label: "Equipo", icon: Users, href: "/dashboard/admin/team", color: "text-violet-600 bg-violet-50" },
                { label: "Destinos", icon: MapPin, href: "/dashboard/admin/destinations", color: "text-emerald-600 bg-emerald-50" },
              ].map((item) => (
                <Link key={item.href} href={item.href}>
                  <div className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-100 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer group">
                    <div className={`p-1.5 rounded-md ${item.color}`}>
                      <item.icon className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-sm text-slate-700 font-medium group-hover:text-slate-900 truncate">{item.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border border-slate-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Eye className="h-4 w-4 text-slate-500" />
              Actividad Reciente
            </CardTitle>
            <Link href="/dashboard/admin/audit-logs">
              <Button variant="ghost" size="sm" className="text-xs text-slate-500 hover:text-slate-700">
                Ver todo <ArrowUpRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentActivity.length > 0 ? (
            <div className="space-y-2">
              {recentActivity.map((activity, i) => (
                <Link key={i} href={activity.link}>
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer border border-slate-100">
                    <div className={`h-2 w-2 rounded-full shrink-0 ${
                      activity.status === "success" ? "bg-emerald-500" :
                      activity.status === "warning" ? "bg-amber-500" : "bg-sky-500"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 truncate">{activity.action}</p>
                      <p className="text-xs text-slate-400">{activity.time}</p>
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <Activity className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">Sin actividad reciente</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
