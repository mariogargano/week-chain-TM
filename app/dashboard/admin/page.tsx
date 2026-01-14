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
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [adminEmail, setAdminEmail] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

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
    try {
      setRefreshing(true)
      setError(null)

      const supabase = createClient()

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user?.email) {
        router.push("/auth")
        return
      }

      const { data: adminUser } = await supabase
        .from("admin_users")
        .select("*")
        .eq("email", session.user.email.toLowerCase())
        .eq("status", "active")
        .single()

      if (!adminUser) {
        // If email matches corporativo@morises.com but not in admin_users, auto-create
        if (session.user.email.toLowerCase() === "corporativo@morises.com") {
          const { error: createError } = await supabase.from("admin_users").upsert(
            {
              email: session.user.email.toLowerCase(),
              name: "Administrador WEEK-CHAIN",
              role: "super_admin",
              status: "active",
              user_id: session.user.id,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "email" },
          )

          if (createError) {
            console.error("[v0] Failed to create admin user:", createError)
            router.push("/dashboard")
            return
          }

          setAdminEmail(session.user.email)
        } else {
          console.log("[v0] User is not admin, redirecting to user dashboard")
          router.push("/dashboard")
          return
        }
      } else {
        setAdminEmail(session.user.email)
      }

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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
          <p className="mt-4 text-lg text-slate-600">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-slate-100">
        <Card className="max-w-md border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <AlertCircle className="h-5 w-5" />
              Error al cargar el dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-700">{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4 w-full bg-red-600 hover:bg-red-700">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gradient-to-br from-slate-950 via-blue-900 to-slate-900">
      {/* Fixed Header */}
      <div className="flex-shrink-0 border-b border-white/10 bg-white/5 backdrop-blur-lg">
        <div className="flex items-center justify-between p-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-200 to-emerald-200 bg-clip-text text-transparent">
              Control Global WEEK-CHAIN
            </h1>
            <p className="text-blue-200 mt-1">Bienvenido, {adminEmail}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border-blue-400/30 text-blue-200 hover:bg-white/10 bg-white/5 backdrop-blur"
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
        <div className="p-6 space-y-6">
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
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/90">ESTADO DEL SISTEMA</p>
                  <p className="text-5xl font-bold mt-2">{globalMetrics.systemStatus}</p>
                  <p className="text-lg text-white/90 mt-2">
                    Utilización: {globalMetrics.currentUtilization.toFixed(1)}% de capacidad
                  </p>
                  <div className="flex gap-4 mt-4 text-sm">
                    <div>
                      <span className="text-white/70">Supply Total:</span>{" "}
                      <span className="font-bold">{globalMetrics.totalSupplyWeeks} semanas</span>
                    </div>
                    <div>
                      <span className="text-white/70">Capacidad Segura (70%):</span>{" "}
                      <span className="font-bold">{globalMetrics.safeCapacityWeeks} semanas</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-white/80">
                    <div>{globalMetrics.totalSupplyProperties} propiedades activas</div>
                    <div>{globalMetrics.activeCountries} países operando</div>
                    <div className="mt-4">
                      <Badge className="bg-white/20 text-white text-base px-4 py-2">
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

          <div className="grid gap-4 md:grid-cols-4">
            <Card
              className={`border-2 backdrop-blur-lg ${stopSaleFlags.silver ? "border-red-400 bg-red-900/30" : "border-emerald-400 bg-emerald-900/30"}`}
            >
              <CardContent className="p-4">
                <p className="text-sm font-medium text-slate-700">Silver</p>
                <p className="text-2xl font-bold">{certificatesActive.silver} activos</p>
                <Badge className={stopSaleFlags.silver ? "bg-red-600 text-white" : "bg-green-600 text-white"}>
                  {stopSaleFlags.silver ? "VENTAS DETENIDAS" : "Abierto"}
                </Badge>
              </CardContent>
            </Card>
            <Card
              className={`border-2 backdrop-blur-lg ${stopSaleFlags.gold ? "border-red-400 bg-red-900/30" : "border-emerald-400 bg-emerald-900/30"}`}
            >
              <CardContent className="p-4">
                <p className="text-sm font-medium text-slate-700">Gold</p>
                <p className="text-2xl font-bold">{certificatesActive.gold} activos</p>
                <Badge className={stopSaleFlags.gold ? "bg-red-600 text-white" : "bg-green-600 text-white"}>
                  {stopSaleFlags.gold ? "VENTAS DETENIDAS" : "Abierto"}
                </Badge>
              </CardContent>
            </Card>
            <Card
              className={`border-2 backdrop-blur-lg ${stopSaleFlags.platinum ? "border-red-400 bg-red-900/30" : "border-emerald-400 bg-emerald-900/30"}`}
            >
              <CardContent className="p-4">
                <p className="text-sm font-medium text-slate-700">Platinum</p>
                <p className="text-2xl font-bold">{certificatesActive.platinum} activos</p>
                <Badge className={stopSaleFlags.platinum ? "bg-red-600 text-white" : "bg-green-600 text-white"}>
                  {stopSaleFlags.platinum ? "VENTAS DETENIDAS" : "Abierto"}
                </Badge>
              </CardContent>
            </Card>
            <Card
              className={`border-2 backdrop-blur-lg ${stopSaleFlags.signature ? "border-red-400 bg-red-900/30" : "border-emerald-400 bg-emerald-900/30"}`}
            >
              <CardContent className="p-4">
                <p className="text-sm font-medium text-slate-700">Signature</p>
                <p className="text-2xl font-bold">{certificatesActive.signature} activos</p>
                <Badge className={stopSaleFlags.signature ? "bg-red-600 text-white" : "bg-green-600 text-white"}>
                  {stopSaleFlags.signature ? "VENTAS DETENIDAS" : "Abierto"}
                </Badge>
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Módulos de Control Global</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <Link key={action.href} href={action.href}>
                    <Card className="group cursor-pointer border-2 border-blue-400/30 bg-white/5 backdrop-blur-lg transition-all hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/20 hover:bg-white/10">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg group-hover:from-blue-400 group-hover:to-indigo-500 transition-all group-hover:scale-110">
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-white group-hover:text-blue-200 transition-colors">
                              {action.title}
                            </h3>
                            <p className="text-sm text-blue-200/70">{action.description}</p>
                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-xs font-medium text-blue-300">{action.stats}</span>
                              {action.badge && (
                                <Badge
                                  variant="secondary"
                                  className={action.badgeColor || "bg-blue-500/30 text-blue-100 text-xs backdrop-blur"}
                                >
                                  {action.badge}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <ArrowUpRight className="h-5 w-5 text-blue-400 group-hover:text-blue-200 transition-colors group-hover:translate-x-1 group-hover:-translate-y-1" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </div>

          <Card className="border-2 border-blue-400/30 bg-white/5 backdrop-blur-lg">
            <CardHeader className="border-b border-blue-400/30">
              <CardTitle className="text-lg text-white">Actividad Reciente</CardTitle>
              <CardDescription className="text-blue-200/70">Últimas acciones en la plataforma</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {recentActivity.map((activity, i) => (
                    <Link key={i} href={activity.link}>
                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors cursor-pointer border border-blue-400/20 bg-white/5">
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
                          <p className="text-xs text-blue-300">{activity.time}</p>
                        </div>
                        <Eye className="h-4 w-4 text-blue-400" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-blue-300 text-center py-8">No hay actividad reciente</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
