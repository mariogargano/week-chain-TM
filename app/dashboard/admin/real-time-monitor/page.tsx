"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Navbar } from "@/components/navbar"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import {
  Users,
  Building2,
  Briefcase,
  Scale,
  Wrench,
  UserCog,
  Activity,
  Eye,
  TrendingUp,
  AlertCircle,
} from "lucide-react"

export default function RealTimeMonitorPage() {
  const [roleStats, setRoleStats] = useState<Record<string, any>>({})
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRealTimeData()
    const interval = setInterval(fetchRealTimeData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchRealTimeData = async () => {
    const supabase = createClient()

    // Fetch user counts by role
    const { data: profiles } = await supabase.from("profiles").select("role")

    const roleCounts: Record<string, number> = {}
    profiles?.forEach((p) => {
      const role = p.role || "user"
      roleCounts[role] = (roleCounts[role] || 0) + 1
    })

    // Fetch recent activity from various tables
    const [{ data: recentReservations }, { data: recentSubmissions }, { data: recentSales }, { data: recentServices }] =
      await Promise.all([
        supabase.from("reservations").select("*, properties(name)").order("created_at", { ascending: false }).limit(5),
        supabase
          .from("property_submissions")
          .select("*, property_owner_profiles(business_name)")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase.from("property_owner_sales").select("*").order("sale_date", { ascending: false }).limit(5),
        supabase.from("management_services").select("*").order("service_date", { ascending: false }).limit(5),
      ])

    const activity = [
      ...(recentReservations?.map((r) => ({
        type: "reservation",
        message: `Nueva reserva: ${r.properties?.name}`,
        time: r.created_at,
        role: "user",
      })) || []),
      ...(recentSubmissions?.map((s) => ({
        type: "submission",
        message: `Propiedad enviada: ${s.property_name}`,
        time: s.created_at,
        role: "property_owner",
      })) || []),
      ...(recentSales?.map((s) => ({
        type: "sale",
        message: `Venta registrada: Semana #${s.week_number}`,
        time: s.sale_date,
        role: "property_owner",
      })) || []),
      ...(recentServices?.map((s) => ({
        type: "service",
        message: `Servicio: ${s.service_type}`,
        time: s.service_date,
        role: "service_provider",
      })) || []),
    ]
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 20)

    setRoleStats(roleCounts)
    setRecentActivity(activity)
    setLoading(false)
  }

  const roleConfig: Record<string, { label: string; icon: any; color: string; description: string }> = {
    user: {
      label: "Usuarios/Clientes",
      icon: Users,
      color: "blue",
      description: "Compradores de NFTs y usuarios de la plataforma",
    },
    property_owner: {
      label: "Dueños de Propiedades",
      icon: Building2,
      color: "purple",
      description: "Propietarios que tokenizen sus propiedades",
    },
    broker: {
      label: "Brokers",
      icon: Briefcase,
      color: "indigo",
      description: "Corredores de bienes raíces",
    },
    management: {
      label: "Management",
      icon: UserCog,
      color: "pink",
      description: "Equipo de gestión de propiedades",
    },
    notaria: {
      label: "Notarios/Legal",
      icon: Scale,
      color: "amber",
      description: "Equipo legal y notarial",
    },
    service_provider: {
      label: "Prestadores de Servicios",
      icon: Wrench,
      color: "orange",
      description: "Proveedores de limpieza y mantenimiento",
    },
    admin: {
      label: "Administradores",
      icon: Activity,
      color: "red",
      description: "Administradores de la plataforma",
    },
  }

  if (loading) {
    return (
      <>
        <Navbar user={true} />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
          <p className="text-slate-600">Cargando monitor en tiempo real...</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar user={true} />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Monitor en Tiempo Real
              </h1>
              <p className="text-slate-600 mt-2">Visibilidad completa de todos los roles y actividades</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Activity className="h-4 w-4 animate-pulse text-green-500" />
              <span>Actualización automática cada 30s</span>
            </div>
          </div>

          {/* Role Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(roleConfig).map(([role, config]) => {
              const Icon = config.icon
              const count = roleStats[role] || 0
              return (
                <Card
                  key={role}
                  className={`border-${config.color}-200/50 bg-white/90 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300`}
                >
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600">{config.label}</CardTitle>
                    <Icon className={`h-5 w-5 text-${config.color}-600`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-slate-900">{count}</div>
                    <p className="text-xs text-slate-500 mt-1">{config.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Activity Monitor */}
          <Card className="border-slate-200/50 bg-white/90 backdrop-blur-xl shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-600" />
                Actividad en Tiempo Real
              </CardTitle>
              <CardDescription>Últimas acciones de todos los roles en la plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => {
                    const roleInfo = roleConfig[activity.role] || roleConfig.user
                    const Icon = roleInfo.icon
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-8 w-8 rounded-full bg-gradient-to-r from-${roleInfo.color}-400 to-${roleInfo.color}-500 flex items-center justify-center`}
                          >
                            <Icon className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">{activity.message}</p>
                            <p className="text-xs text-slate-500">{roleInfo.label}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-500">
                            {new Date(activity.time).toLocaleTimeString("es-ES")}
                          </p>
                          <p className="text-xs text-slate-400">
                            {new Date(activity.time).toLocaleDateString("es-ES")}
                          </p>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600">No hay actividad reciente</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Role-Specific Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-white/90 backdrop-blur-sm border border-slate-200">
              <TabsTrigger value="overview">Vista General</TabsTrigger>
              <TabsTrigger value="owners">Propietarios</TabsTrigger>
              <TabsTrigger value="brokers">Brokers</TabsTrigger>
              <TabsTrigger value="management">Management</TabsTrigger>
              <TabsTrigger value="notaria">Notaría</TabsTrigger>
              <TabsTrigger value="services">Servicios</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Card className="border-slate-200/50 bg-white/90 backdrop-blur-xl shadow-lg">
                <CardHeader>
                  <CardTitle>Resumen de la Plataforma</CardTitle>
                  <CardDescription>Métricas clave de todos los roles</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 border border-slate-200 rounded-lg">
                      <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-slate-900">
                        {Object.values(roleStats).reduce((a, b) => a + b, 0)}
                      </p>
                      <p className="text-sm text-slate-600">Total Usuarios</p>
                    </div>
                    <div className="text-center p-6 border border-slate-200 rounded-lg">
                      <Activity className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-slate-900">{recentActivity.length}</p>
                      <p className="text-sm text-slate-600">Actividades Recientes</p>
                    </div>
                    <div className="text-center p-6 border border-slate-200 rounded-lg">
                      <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-slate-900">{Object.keys(roleStats).length}</p>
                      <p className="text-sm text-slate-600">Roles Activos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Additional tabs would show role-specific details */}
            <TabsContent value="owners">
              <Card className="border-purple-200/50 bg-white/90 backdrop-blur-xl shadow-lg">
                <CardHeader>
                  <CardTitle>Actividad de Propietarios</CardTitle>
                  <CardDescription>Propiedades enviadas y ventas</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">
                    {roleStats.property_owner || 0} propietarios activos en la plataforma
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="brokers">
              <Card className="border-indigo-200/50 bg-white/90 backdrop-blur-xl shadow-lg">
                <CardHeader>
                  <CardTitle>Actividad de Brokers</CardTitle>
                  <CardDescription>Ventas y comisiones</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">{roleStats.broker || 0} brokers activos en la plataforma</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="management">
              <Card className="border-pink-200/50 bg-white/90 backdrop-blur-xl shadow-lg">
                <CardHeader>
                  <CardTitle>Actividad de Management</CardTitle>
                  <CardDescription>Gestión de propiedades</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">{roleStats.management || 0} managers activos en la plataforma</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notaria">
              <Card className="border-amber-200/50 bg-white/90 backdrop-blur-xl shadow-lg">
                <CardHeader>
                  <CardTitle>Actividad de Notaría</CardTitle>
                  <CardDescription>Revisiones y aprobaciones</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">{roleStats.notaria || 0} notarios activos en la plataforma</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="services">
              <Card className="border-orange-200/50 bg-white/90 backdrop-blur-xl shadow-lg">
                <CardHeader>
                  <CardTitle>Actividad de Servicios</CardTitle>
                  <CardDescription>Limpieza y mantenimiento</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">{roleStats.service_provider || 0} prestadores de servicios activos</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )
}
