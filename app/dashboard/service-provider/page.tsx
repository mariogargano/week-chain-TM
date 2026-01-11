"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, CheckCircle, Clock, AlertCircle, TrendingUp, Calendar, FileText, Download, Star } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { RoleGuard } from "@/components/role-guard"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { ChartContainer } from "@/components/ui/chart"

interface Service {
  id: string
  nft_management_id: string
  service_type: string
  service_provider: string
  service_date: string
  cost_usdc: number
  status: string
  notes: string
  completed_at: string | null
  created_at: string
}

interface ServiceStats {
  pending: number
  inProgress: number
  completed: number
  totalRevenue: number
  thisMonthRevenue: number
  avgRating: number
  completionRate: number
}

export default function ServiceProviderDashboard() {
  return (
    <RoleGuard allowedRoles={["service_provider", "admin"]}>
      <ServiceProviderDashboardContent />
    </RoleGuard>
  )
}

function ServiceProviderDashboardContent() {
  const [services, setServices] = useState<Service[]>([])
  const [stats, setStats] = useState<ServiceStats>({
    pending: 0,
    inProgress: 0,
    completed: 0,
    totalRevenue: 0,
    thisMonthRevenue: 0,
    avgRating: 0,
    completionRate: 0,
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [revenueData, setRevenueData] = useState<any[]>([])

  useEffect(() => {
    loadServices()
  }, [])

  async function loadServices() {
    const supabase = createClient()

    try {
      const { data: servicesData, error } = await supabase
        .from("management_services")
        .select("*")
        .order("created_at", { ascending: false })

      if (!error && servicesData) {
        setServices(servicesData)

        const pending = servicesData.filter((s) => s.status === "pending").length
        const inProgress = servicesData.filter((s) => s.status === "in_progress").length
        const completed = servicesData.filter((s) => s.status === "completed").length
        const totalRevenue = servicesData
          .filter((s) => s.status === "completed")
          .reduce((sum, s) => sum + (s.cost_usdc || 0), 0)

        const now = new Date()
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        const thisMonthRevenue = servicesData
          .filter((s) => s.status === "completed" && new Date(s.completed_at || s.created_at) >= thisMonthStart)
          .reduce((sum, s) => sum + (s.cost_usdc || 0), 0)

        const completionRate = servicesData.length > 0 ? (completed / servicesData.length) * 100 : 0

        setStats({
          pending,
          inProgress,
          completed,
          totalRevenue,
          thisMonthRevenue,
          avgRating: 4.8,
          completionRate,
        })

        // Generate revenue data for last 6 months
        const last6Months = Array.from({ length: 6 }, (_, i) => {
          const d = new Date()
          d.setMonth(d.getMonth() - (5 - i))
          const monthServices = servicesData.filter((s) => {
            const serviceDate = new Date(s.completed_at || s.created_at)
            return (
              s.status === "completed" &&
              serviceDate.getMonth() === d.getMonth() &&
              serviceDate.getFullYear() === d.getFullYear()
            )
          })

          return {
            month: d.toLocaleDateString("es-ES", { month: "short" }),
            revenue: monthServices.reduce((sum, s) => sum + (s.cost_usdc || 0), 0),
            services: monthServices.length,
          }
        })
        setRevenueData(last6Months)
      }
    } catch (error) {
      console.error("[v0] Error loading services:", error)
    } finally {
      setLoading(false)
    }
  }

  async function updateServiceStatus(serviceId: string, newStatus: string) {
    const supabase = createClient()

    const updates: any = { status: newStatus }
    if (newStatus === "completed") {
      updates.completed_at = new Date().toISOString()
    }

    await supabase.from("management_services").update(updates).eq("id", serviceId)

    loadServices()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pendiente
          </Badge>
        )
      case "in_progress":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            En Progreso
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completado
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (loading) {
    return (
      <>
        <Navbar user={true} />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
          <p className="text-slate-600">Cargando servicios...</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar user={true} />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Service Provider Dashboard
              </h1>
              <p className="text-slate-600 mt-2">Gestiona tus servicios y operaciones</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
              <Button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                <FileText className="mr-2 h-4 w-4" />
                Nuevo Reporte
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-l-4 border-l-yellow-500 bg-white/90 backdrop-blur-xl shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Pendientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{stats.pending}</div>
                <p className="text-xs text-slate-500 mt-1">Servicios por realizar</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500 bg-white/90 backdrop-blur-xl shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">En Progreso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{stats.inProgress}</div>
                <p className="text-xs text-slate-500 mt-1">Servicios activos</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500 bg-white/90 backdrop-blur-xl shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Completados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{stats.completed}</div>
                <p className="text-xs text-slate-500 mt-1">Total histórico</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500 bg-white/90 backdrop-blur-xl shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Ingresos Totales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">${stats.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-slate-500 mt-1">${stats.thisMonthRevenue.toLocaleString()} este mes</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="bg-white/90 backdrop-blur-xl shadow-lg">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="services">Servicios</TabsTrigger>
              <TabsTrigger value="completed">Completados</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-2">
                <Card className="bg-white/90 backdrop-blur-xl shadow-lg">
                  <CardHeader>
                    <CardTitle>Ingresos Mensuales</CardTitle>
                    <CardDescription>Últimos 6 meses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        revenue: {
                          label: "Ingresos",
                          color: "hsl(var(--chart-1))",
                        },
                      }}
                      className="h-[300px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={revenueData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="month" stroke="#64748b" />
                          <YAxis stroke="#64748b" />
                          <Tooltip />
                          <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card className="bg-white/90 backdrop-blur-xl shadow-lg">
                  <CardHeader>
                    <CardTitle>Servicios por Mes</CardTitle>
                    <CardDescription>Volumen de trabajo</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        services: {
                          label: "Servicios",
                          color: "hsl(var(--chart-2))",
                        },
                      }}
                      className="h-[300px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={revenueData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="month" stroke="#64748b" />
                          <YAxis stroke="#64748b" />
                          <Tooltip />
                          <Line type="monotone" dataKey="services" stroke="#3b82f6" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-white/90 backdrop-blur-xl shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      Calificación
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-slate-900">{stats.avgRating}</div>
                    <p className="text-sm text-slate-600 mt-1">Promedio de 47 reviews</p>
                  </CardContent>
                </Card>

                <Card className="bg-white/90 backdrop-blur-xl shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      Tasa de Finalización
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-slate-900">{stats.completionRate.toFixed(1)}%</div>
                    <p className="text-sm text-slate-600 mt-1">Servicios completados</p>
                  </CardContent>
                </Card>

                <Card className="bg-white/90 backdrop-blur-xl shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-500" />
                      Próximos 7 Días
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-slate-900">{stats.pending + stats.inProgress}</div>
                    <p className="text-sm text-slate-600 mt-1">Servicios programados</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Services Tab */}
            <TabsContent value="services" className="space-y-4">
              <Card className="bg-white/90 backdrop-blur-xl shadow-lg">
                <CardHeader>
                  <CardTitle>Servicios Activos</CardTitle>
                  <CardDescription>Pendientes y en progreso</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {services
                      .filter((s) => s.status !== "completed")
                      .map((service) => (
                        <div
                          key={service.id}
                          className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center">
                              <Package className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                <h3 className="font-semibold text-slate-900">{service.service_type}</h3>
                                {getStatusBadge(service.status)}
                              </div>
                              <p className="text-sm text-slate-600">{service.notes}</p>
                              <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                                <span>Fecha: {new Date(service.service_date).toLocaleDateString()}</span>
                                <span>Costo: ${service.cost_usdc.toLocaleString()} USDC</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            {service.status === "pending" && (
                              <Button
                                onClick={() => updateServiceStatus(service.id, "in_progress")}
                                size="sm"
                                className="bg-blue-500 hover:bg-blue-600"
                              >
                                Iniciar
                              </Button>
                            )}
                            {service.status === "in_progress" && (
                              <Button
                                onClick={() => updateServiceStatus(service.id, "completed")}
                                size="sm"
                                className="bg-green-500 hover:bg-green-600"
                              >
                                Completar
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}

                    {services.filter((s) => s.status !== "completed").length === 0 && (
                      <div className="text-center py-12">
                        <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-600">No hay servicios activos</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Completed Tab */}
            <TabsContent value="completed" className="space-y-4">
              <Card className="bg-white/90 backdrop-blur-xl shadow-lg">
                <CardHeader>
                  <CardTitle>Historial de Servicios Completados</CardTitle>
                  <CardDescription>Todos los servicios finalizados</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {services
                      .filter((s) => s.status === "completed")
                      .map((service) => (
                        <div
                          key={service.id}
                          className="flex items-center justify-between p-4 border border-slate-200 rounded-lg"
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-slate-900">{service.service_type}</h3>
                              <p className="text-sm text-slate-600">{service.notes}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-slate-900">${service.cost_usdc.toLocaleString()}</p>
                            <p className="text-xs text-slate-500">
                              {new Date(service.completed_at || service.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}

                    {services.filter((s) => s.status === "completed").length === 0 && (
                      <div className="text-center py-12">
                        <CheckCircle className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-600">No hay servicios completados aún</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-4">
              <Card className="bg-white/90 backdrop-blur-xl shadow-lg">
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>Indicadores clave de rendimiento</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-900">Tasa de Finalización</span>
                        <span className="text-sm text-slate-600">{stats.completionRate.toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500" style={{ width: `${stats.completionRate}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-900">Calificación Promedio</span>
                        <span className="text-sm text-slate-600">{stats.avgRating}/5.0</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-500" style={{ width: `${(stats.avgRating / 5) * 100}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-900">Eficiencia Operacional</span>
                        <span className="text-sm text-slate-600">92%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: "92%" }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-900">Tiempo de Respuesta</span>
                        <span className="text-sm text-slate-600">95%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500" style={{ width: "95%" }} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )
}
