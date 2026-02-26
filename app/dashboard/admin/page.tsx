"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Building2,
  Users,
  AlertCircle,
  ArrowUpRight,
  Loader2,
  Ticket,
  FileText,
  Calendar,
  Eye,
  RefreshCw,
} from "lucide-react"
import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [adminEmail, setAdminEmail] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const fetchedRef = useRef(false)

  const [globalMetrics, setGlobalMetrics] = useState({
    totalSupplyWeeks: 0,
    safeCapacityWeeks: 0,
    currentUtilization: 0,
    systemStatus: "GREEN",
    totalSupplyProperties: 0,
    activeCountries: 0,
    pendingRequests: 0,
    waitlistSize: 0,
  })

  const [certificatesActive, setCertificatesActive] = useState({
    silver: 0,
    gold: 0,
    platinum: 0,
    signature: 0,
  })

  const [stopSaleFlags, setStopSaleFlags] = useState({
    silver: false,
    gold: false,
    platinum: false,
    signature: false,
  })

  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsersThisMonth: 0,
    pendingKYC: 0,
  })

  const [recentActivity, setRecentActivity] = useState<any[]>([])

  const fetchDashboardData = async () => {
    // Prevent multiple redirects
    if (isRedirecting) return
    
    try {
      setRefreshing(true)
      setError(null)

      const supabase = createClient()

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user?.email) {
        if (!isRedirecting) {
          setIsRedirecting(true)
          router.replace("/auth")
        }
        return
      }
      
      setAuthChecked(true)

      const userEmail = user.email.toLowerCase()

      // Check admin access via users table role or hardcoded admin email
      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .maybeSingle()

      const isAdmin =
        userEmail === "corporativo@morises.com" ||
        userData?.role === "admin" ||
        userData?.role === "super_admin"

      if (!isAdmin) {
        if (!isRedirecting) {
          setIsRedirecting(true)
          router.replace("/dashboard")
        }
        return
      }

      setAdminEmail(userEmail)

      const [capacityResponse, users, kyc, reservationReqs] = await Promise.all([
        fetch("/api/admin/capacity/global-status").then((r) => r.json()),
        supabase.from("users").select("id, email, created_at", { count: "exact" }),
        supabase.from("kyc_users").select("id, name, email, status, created_at").eq("status", "pending").limit(5),
        supabase
          .from("reservation_requests")
          .select("id, status, created_at, destination_preference")
          .in("status", ["requested", "processing"])
          .order("created_at", { ascending: false })
          .limit(10),
      ])

      if (capacityResponse.globalMetrics) {
        setGlobalMetrics(capacityResponse.globalMetrics)
        setCertificatesActive(capacityResponse.certificatesActive)
        setStopSaleFlags(capacityResponse.stopSaleFlags)
      }

      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const newUsers = users.data?.filter((u) => new Date(u.created_at) >= monthStart).length || 0

      setStats({
        totalUsers: users.count || 0,
        newUsersThisMonth: newUsers,
        pendingKYC: kyc.data?.length || 0,
      })

      const activities: any[] = []

      if (reservationReqs.data) {
        reservationReqs.data.forEach((r: any) => {
          activities.push({
            type: "reservation_request",
            action: `Solicitud de reserva: ${r.destination_preference || "Destino flexible"}`,
            time: formatTimeAgo(r.created_at),
            status: r.status === "processing" ? "pending" : "info",
            link: "/dashboard/admin/reservations",
          })
        })
      }

      if (kyc.data) {
        kyc.data.forEach((k: any) => {
          activities.push({
            type: "kyc",
            action: `KYC pendiente: ${k.name || k.email}`,
            time: formatTimeAgo(k.created_at),
            status: "pending",
            link: "/dashboard/admin/kyc",
          })
        })
      }

      setRecentActivity(activities.slice(0, 8))
      setLoading(false)
      setRefreshing(false)
    } catch (err) {
      console.error("[v0] Error loading admin dashboard:", err)
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
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? "s" : ""}`
    return `Hace ${diffDays} día${diffDays > 1 ? "s" : ""}`
  }

  const quickActions = [
    {
      title: "Capacidad & Riesgo",
      description: "Proyección 15 años y control de ventas",
      icon: AlertCircle,
      href: "/dashboard/admin/capacity-risk",
      stats: `${globalMetrics.currentUtilization.toFixed(1)}% utilización`,
      badge: `Sistema ${globalMetrics.systemStatus}`,
      badgeColor:
        globalMetrics.systemStatus === "RED"
          ? "bg-red-100 text-red-700"
          : globalMetrics.systemStatus === "ORANGE"
            ? "bg-orange-100 text-orange-700"
            : globalMetrics.systemStatus === "YELLOW"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-green-100 text-green-700",
    },
    {
      title: "Gestión de Supply",
      description: "Activar/pausar propiedades y países",
      icon: Building2,
      href: "/dashboard/admin/supply",
      stats: `${globalMetrics.totalSupplyProperties} propiedades`,
      badge: `${globalMetrics.activeCountries} países`,
    },
    {
      title: "Control de Reservaciones",
      description: "Solicitudes pendientes y ofertas",
      icon: Calendar,
      href: "/dashboard/admin/reservations",
      stats: `${globalMetrics.pendingRequests} solicitudes`,
      badge: globalMetrics.pendingRequests > 0 ? "Requiere atención" : null,
    },
    {
      title: "Control de Certificados",
      description: "Certificados activos por tier",
      icon: Ticket,
      href: "/dashboard/admin/certificates",
      stats: `${certificatesActive.silver + certificatesActive.gold + certificatesActive.platinum + certificatesActive.signature} activos`,
      badge: null,
    },
    {
      title: "Personas & Roles",
      description: "Gestión de intermediarios y equipo",
      icon: Users,
      href: "/dashboard/admin/team",
      stats: `${stats.totalUsers} usuarios`,
      badge: stats.pendingKYC > 0 ? `${stats.pendingKYC} KYC pendientes` : null,
    },
    {
      title: "Compliance & Auditoría",
      description: "Logs de admin y strikes",
      icon: FileText,
      href: "/dashboard/admin/audit-logs",
      stats: "Historial completo",
      badge: null,
    },
  ]

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-sky-900 to-slate-900">
        <div className="glass-card rounded-2xl p-8 text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-sky-400" />
          <p className="mt-4 text-lg text-slate-300">Cargando panel de administración...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 bg-gradient-to-br from-slate-900 via-sky-900 to-slate-900">
        <Card className="max-w-md border-red-500/30 bg-red-500/10 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-400">
              <AlertCircle className="h-5 w-5" />
              Error al cargar el dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-300">{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full bg-gradient-to-br from-slate-900 via-sky-900/50 to-slate-900 -m-3 sm:-m-4 lg:-m-6">
      {/* Fixed Header */}
      <div className="flex-shrink-0 border-b border-sky-500/20 glass-dark">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 sm:p-6">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-sky-300 via-cyan-300 to-teal-300 bg-clip-text text-transparent truncate">
              Control Global WEEK-CHAIN
            </h1>
            <p className="text-sky-300/80 mt-1 text-sm sm:text-base truncate">Bienvenido, {adminEmail}</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="border-sky-400/30 text-sky-200 hover:bg-sky-500/10 bg-sky-500/5 backdrop-blur min-h-[44px]"
              onClick={() => fetchDashboardData()}
              disabled={refreshing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Actualizar
            </Button>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <Card
            className={`border-2 backdrop-blur-xl ${
              globalMetrics.systemStatus === "RED"
                ? "border-red-400 bg-gradient-to-br from-red-500/20 to-red-600/20"
                : globalMetrics.systemStatus === "ORANGE"
                  ? "border-orange-400 bg-gradient-to-br from-orange-500/20 to-orange-600/20"
                  : globalMetrics.systemStatus === "YELLOW"
                    ? "border-yellow-400 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20"
                    : "border-emerald-400 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20"
            } shadow-2xl`}
          >
            <CardContent className="p-4 sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-white/90">ESTADO DEL SISTEMA</p>
                  <p className="text-3xl sm:text-5xl font-bold mt-1 sm:mt-2">{globalMetrics.systemStatus}</p>
                  <p className="text-sm sm:text-lg text-white/90 mt-1 sm:mt-2">
                    Utilizacion: {globalMetrics.currentUtilization.toFixed(1)}% de capacidad
                  </p>
                  <div className="flex flex-col sm:flex-row gap-1 sm:gap-4 mt-3 sm:mt-4 text-xs sm:text-sm">
                    <div>
                      <span className="text-white/70">Supply Total:</span>{" "}
                      <span className="font-bold">{globalMetrics.totalSupplyWeeks} semanas</span>
                    </div>
                    <div>
                      <span className="text-white/70">Capacidad Segura:</span>{" "}
                      <span className="font-bold">{globalMetrics.safeCapacityWeeks} semanas</span>
                    </div>
                  </div>
                </div>
                <div className="sm:text-right">
                  <div className="text-xs sm:text-sm text-white/80 flex flex-wrap gap-2 sm:block">
                    <span className="sm:block">{globalMetrics.totalSupplyProperties} propiedades activas</span>
                    <span className="sm:block">{globalMetrics.activeCountries} paises operando</span>
                    <div className="mt-2 sm:mt-4">
                      <Badge className="bg-white/20 text-white text-xs sm:text-base px-3 sm:px-4 py-1 sm:py-2">
                        {globalMetrics.waitlistSize > 0
                          ? `${globalMetrics.waitlistSize} en lista de espera`
                          : "Sin lista de espera"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            <Card
              className={`border-2 backdrop-blur-lg ${stopSaleFlags.silver ? "border-red-400 bg-red-900/30" : "border-emerald-400 bg-emerald-900/30"}`}
            >
              <CardContent className="p-4">
                <p className="text-sm font-medium text-white/80">Silver</p>
                <p className="text-2xl font-bold text-white">{certificatesActive.silver} activos</p>
                <Badge className={stopSaleFlags.silver ? "bg-red-600 text-white" : "bg-green-600 text-white"}>
                  {stopSaleFlags.silver ? "VENTAS DETENIDAS" : "Abierto"}
                </Badge>
              </CardContent>
            </Card>
            <Card
              className={`border-2 backdrop-blur-lg ${stopSaleFlags.gold ? "border-red-400 bg-red-900/30" : "border-emerald-400 bg-emerald-900/30"}`}
            >
              <CardContent className="p-4">
                <p className="text-sm font-medium text-white/80">Gold</p>
                <p className="text-2xl font-bold text-white">{certificatesActive.gold} activos</p>
                <Badge className={stopSaleFlags.gold ? "bg-red-600 text-white" : "bg-green-600 text-white"}>
                  {stopSaleFlags.gold ? "VENTAS DETENIDAS" : "Abierto"}
                </Badge>
              </CardContent>
            </Card>
            <Card
              className={`border-2 backdrop-blur-lg ${stopSaleFlags.platinum ? "border-red-400 bg-red-900/30" : "border-emerald-400 bg-emerald-900/30"}`}
            >
              <CardContent className="p-4">
                <p className="text-sm font-medium text-white/80">Platinum</p>
                <p className="text-2xl font-bold text-white">{certificatesActive.platinum} activos</p>
                <Badge className={stopSaleFlags.platinum ? "bg-red-600 text-white" : "bg-green-600 text-white"}>
                  {stopSaleFlags.platinum ? "VENTAS DETENIDAS" : "Abierto"}
                </Badge>
              </CardContent>
            </Card>
            <Card
              className={`border-2 backdrop-blur-lg ${stopSaleFlags.signature ? "border-red-400 bg-red-900/30" : "border-emerald-400 bg-emerald-900/30"}`}
            >
              <CardContent className="p-4">
                <p className="text-sm font-medium text-white/80">Signature</p>
                <p className="text-2xl font-bold text-white">{certificatesActive.signature} activos</p>
                <Badge className={stopSaleFlags.signature ? "bg-red-600 text-white" : "bg-green-600 text-white"}>
                  {stopSaleFlags.signature ? "VENTAS DETENIDAS" : "Abierto"}
                </Badge>
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="text-lg sm:text-2xl font-bold text-white mb-3 sm:mb-4">Modulos de Control Global</h2>
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <Link key={action.href} href={action.href}>
                    <Card className="group cursor-pointer border-2 border-sky-400/30 bg-white/5 backdrop-blur-lg transition-all hover:border-sky-400 hover:shadow-xl hover:shadow-sky-500/20 hover:bg-white/10 active:scale-[0.98]">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-start gap-3 sm:gap-4">
                          <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600 shadow-lg flex-shrink-0">
                            <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-sky-200 transition-colors">
                              {action.title}
                            </h3>
                            <p className="text-xs sm:text-sm text-sky-200/70 truncate">{action.description}</p>
                            <div className="mt-1.5 sm:mt-2 flex items-center gap-2">
                              <span className="text-[10px] sm:text-xs font-medium text-sky-300">{action.stats}</span>
                              {action.badge && (
                                <Badge
                                  variant="secondary"
                                  className={action.badgeColor || "bg-sky-500/30 text-sky-100 text-[10px] sm:text-xs backdrop-blur"}
                                >
                                  {action.badge}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5 text-sky-400 flex-shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </div>

          <Card className="border-2 border-sky-400/30 bg-white/5 backdrop-blur-lg">
            <CardHeader className="border-b border-sky-400/30">
              <CardTitle className="text-lg text-white">Actividad Reciente</CardTitle>
              <CardDescription className="text-sky-200/70">Últimas acciones en la plataforma</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {recentActivity.map((activity, i) => (
                    <Link key={i} href={activity.link}>
                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors cursor-pointer border border-sky-400/20 bg-white/5">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            activity.status === "success"
                              ? "bg-emerald-400"
                              : activity.status === "pending"
                                ? "bg-amber-400"
                                : "bg-blue-400"
                          }`}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{activity.action}</p>
                          <p className="text-xs text-sky-300">{activity.time}</p>
                        </div>
                        <Eye className="h-4 w-4 text-sky-400" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-sky-300 text-center py-8">No hay actividad reciente</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
