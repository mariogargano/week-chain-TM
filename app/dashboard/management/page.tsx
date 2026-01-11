"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, CheckCircle, Clock, TrendingUp, Package, Download, Plus, Search, Filter } from "lucide-react"
import { useEffect, useState } from "react"
import { RoleGuard } from "@/components/role-guard"
import { Navbar } from "@/components/navbar"
import { createClient } from "@/lib/supabase/client"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { ChartContainer } from "@/components/ui/chart"

const SIMONETTA_WALLET = "EZ2xgEBYyJNegSAjyf29VUNYG1Y3Hqj7JmPsRg4HS6Hp"

interface ManagedNFT {
  id: string
  week_id: string
  property_id: string
  owner_wallet: string
  management_enabled: boolean
  management_fee_percentage: number
  weeks: {
    week_number: number
    season: string
    nft_token_id: string
  }
  properties: {
    name: string
    location: string
    main_image: string
  }
}

interface Reservation {
  id: string
  status: string
  created_at: string
  user_wallet: string
  usdc_equivalent: number
  weeks: {
    week_number: number
    season: string
  }
  properties: {
    name: string
    location: string
  }
}

interface ManagementStats {
  totalCertificates: number
  activeRequests: number
  monthlyFees: number
  successRate: number
  pendingCoordination: number
  completedRequests: number
  avgResponseTime: number
  clientSatisfaction: number
}

function ManagementDashboardContent() {
  const [managedNFTs, setManagedNFTs] = useState<ManagedNFT[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")

  const [stats, setStats] = useState<ManagementStats>({
    totalCertificates: 0,
    activeRequests: 0,
    monthlyFees: 0,
    successRate: 0,
    pendingCoordination: 0,
    completedRequests: 0,
    avgResponseTime: 0,
    clientSatisfaction: 0,
  })

  const [revenueData, setRevenueData] = useState<any[]>([])
  const [occupancyData, setOccupancyData] = useState<any[]>([])
  const [servicesData, setServicesData] = useState<any[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const supabase = createClient()

    try {
      const [nftsRes, reservationsRes, propertiesRes] = await Promise.all([
        supabase
          .from("nft_management")
          .select(`
            id,
            week_id,
            property_id,
            owner_wallet,
            management_enabled,
            management_fee_percentage,
            weeks (
              week_number,
              season,
              nft_token_id
            ),
            properties (
              name,
              location,
              main_image
            )
          `)
          .eq("management_enabled", true),

        supabase
          .from("reservations")
          .select(`
            id,
            status,
            created_at,
            user_wallet,
            usdc_equivalent,
            weeks (
              week_number,
              season
            ),
            properties (
              name,
              location
            )
          `)
          .order("created_at", { ascending: false })
          .limit(50),

        supabase.from("properties").select("*").eq("status", "active"),
      ])

      const nftsList = nftsRes.data || []
      const reservationsList = reservationsRes.data || []

      setManagedNFTs(nftsList)
      setReservations(reservationsList)

      // Calculate stats
      const activeReservations = reservationsList.filter((r) => r.status === "confirmed").length
      const monthlyRevenue = reservationsList
        .filter((r) => {
          const reservationDate = new Date(r.created_at)
          const now = new Date()
          return reservationDate.getMonth() === now.getMonth() && reservationDate.getFullYear() === now.getFullYear()
        })
        .reduce((sum, r) => sum + (r.usdc_equivalent || 0), 0)

      const totalWeeks = nftsList.length
      const occupiedWeeks = reservationsList.filter((r) => r.status === "confirmed").length
      const occupancyRate = totalWeeks > 0 ? (occupiedWeeks / totalWeeks) * 100 : 0

      setStats({
        totalCertificates: nftsList.length,
        activeRequests: activeReservations,
        monthlyFees: monthlyRevenue * 0.15, // 15% management fee
        successRate: 85, // Placeholder value
        pendingCoordination: 12,
        completedRequests: 45,
        avgResponseTime: 2.5,
        clientSatisfaction: 94,
      })

      // Generate revenue data for last 6 months
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date()
        d.setMonth(d.getMonth() - (5 - i))
        const monthReservations = reservationsList.filter((r) => {
          const reservationDate = new Date(r.created_at)
          return reservationDate.getMonth() === d.getMonth() && reservationDate.getFullYear() === d.getFullYear()
        })

        return {
          month: d.toLocaleDateString("es-ES", { month: "short" }),
          revenue: monthReservations.reduce((sum, r) => sum + (r.usdc_equivalent || 0), 0) * 0.15,
          reservations: monthReservations.length,
        }
      })
      setRevenueData(last6Months)

      // Generate occupancy data
      const occupancyByProperty = nftsList.reduce((acc: any, nft) => {
        const propertyName = nft.properties.name
        if (!acc[propertyName]) {
          acc[propertyName] = { property: propertyName, occupied: 0, total: 0 }
        }
        acc[propertyName].total++
        const isOccupied = reservationsList.some(
          (r) => r.weeks.week_number === nft.weeks.week_number && r.status === "confirmed",
        )
        if (isOccupied) acc[propertyName].occupied++
        return acc
      }, {})

      setOccupancyData(Object.values(occupancyByProperty).slice(0, 5))

      // Services data
      setServicesData([
        { type: "Limpieza", count: 23, color: "#3b82f6" },
        { type: "Mantenimiento", count: 15, color: "#10b981" },
        { type: "Inspección", count: 7, color: "#f59e0b" },
        { type: "Reparaciones", count: 5, color: "#ef4444" },
      ])
    } catch (error) {
      console.error("[v0] Error fetching management data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
    > = {
      confirmed: { label: "Confirmada", variant: "default" },
      pending: { label: "Pendiente", variant: "secondary" },
      cancelled: { label: "Cancelada", variant: "destructive" },
    }

    const config = statusConfig[status] || { label: status, variant: "outline" }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  if (loading) {
    return (
      <>
        <Navbar user={true} />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
          <p className="text-slate-600">Cargando dashboard...</p>
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
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Dashboard de Administración
              </h1>
              <p className="text-slate-600 mt-2">
                Servicio profesional de administración de Smart Vacational Certificates
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Exportar Reporte
              </Button>
              <Button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Nueva Tarea
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-blue-500 bg-white/90 backdrop-blur-xl shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Certificados Administrados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{stats.totalCertificates}</div>
                <p className="text-xs text-slate-500 mt-1">Bajo gestión activa</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500 bg-white/90 backdrop-blur-xl shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Honorarios del Mes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">${stats.monthlyFees.toLocaleString()}</div>
                <p className="text-xs text-slate-500 mt-1">15% servicio de administración</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500 bg-white/90 backdrop-blur-xl shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Tasa de Éxito</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{stats.successRate.toFixed(1)}%</div>
                <p className="text-xs text-slate-500 mt-1">{stats.activeRequests} solicitudes activas</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500 bg-white/90 backdrop-blur-xl shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Satisfacción Cliente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{stats.clientSatisfaction}%</div>
                <p className="text-xs text-slate-500 mt-1">{stats.avgResponseTime}h tiempo respuesta</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="bg-white/90 backdrop-blur-xl shadow-lg">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="properties">Propiedades</TabsTrigger>
              <TabsTrigger value="reservations">Reservas</TabsTrigger>
              <TabsTrigger value="services">Servicios</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-2">
                <Card className="bg-white/90 backdrop-blur-xl shadow-lg">
                  <CardHeader>
                    <CardTitle>Revenue por Mes</CardTitle>
                    <CardDescription>Comisiones de gestión últimos 6 meses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        revenue: {
                          label: "Revenue",
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
                          <Bar dataKey="revenue" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card className="bg-white/90 backdrop-blur-xl shadow-lg">
                  <CardHeader>
                    <CardTitle>Distribución de Servicios</CardTitle>
                    <CardDescription>Tipos de servicios realizados</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        count: {
                          label: "Servicios",
                          color: "hsl(var(--chart-1))",
                        },
                      }}
                      className="h-[300px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={servicesData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ type, count }) => `${type}: ${count}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                          >
                            {servicesData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card className="bg-white/90 backdrop-blur-xl shadow-lg">
                  <CardHeader>
                    <CardTitle>Servicios Pendientes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { type: "Limpieza", property: "Villa Tulum", date: "Hoy, 3:00 PM", priority: "high" },
                        {
                          type: "Mantenimiento",
                          property: "Cabaña Monterrey",
                          date: "Mañana, 10:00 AM",
                          priority: "medium",
                        },
                        { type: "Inspección", property: "Penthouse CDMX", date: "15 Ene, 2:00 PM", priority: "low" },
                      ].map((service, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border border-slate-200 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`h-2 w-2 rounded-full ${
                                service.priority === "high"
                                  ? "bg-red-500"
                                  : service.priority === "medium"
                                    ? "bg-orange-500"
                                    : "bg-green-500"
                              }`}
                            />
                            <div>
                              <p className="font-medium text-slate-900">{service.type}</p>
                              <p className="text-sm text-slate-600">{service.property}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-500">{service.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/90 backdrop-blur-xl shadow-lg">
                  <CardHeader>
                    <CardTitle>Ocupación por Propiedad</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {occupancyData.map((item: any, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-900">{item.property}</span>
                            <span className="text-sm text-slate-600">
                              {item.total > 0 ? Math.round((item.occupied / item.total) * 100) : 0}%
                            </span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                              style={{ width: `${item.total > 0 ? (item.occupied / item.total) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Properties Tab */}
            <TabsContent value="properties" className="space-y-4">
              <Card className="bg-white/90 backdrop-blur-xl shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Propiedades Gestionadas</CardTitle>
                    <div className="flex gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          placeholder="Buscar propiedades..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-9 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm"
                        />
                      </div>
                      <Button variant="outline" size="sm">
                        <Filter className="mr-2 h-4 w-4" />
                        Filtros
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {managedNFTs.map((nft) => (
                      <Card key={nft.id} className="border-slate-200 hover:shadow-lg transition-shadow">
                        <CardHeader className="p-0">
                          <div className="aspect-video relative rounded-t-lg overflow-hidden">
                            <img
                              src={nft.properties.main_image || "/placeholder.svg?height=200&width=300&query=property"}
                              alt={nft.properties.name}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 space-y-2">
                          <h3 className="font-semibold text-slate-900">{nft.properties.name}</h3>
                          <p className="text-sm text-slate-600">{nft.properties.location}</p>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">Semana {nft.weeks.week_number}</span>
                            <Badge variant="secondary">{nft.weeks.season}</Badge>
                          </div>
                          <Button size="sm" className="w-full bg-transparent" variant="outline">
                            Ver Detalles
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reservations Tab */}
            <TabsContent value="reservations" className="space-y-4">
              <Card className="bg-white/90 backdrop-blur-xl shadow-lg">
                <CardHeader>
                  <CardTitle>Reservas Recientes</CardTitle>
                  <CardDescription>Gestión de todas las reservas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reservations.slice(0, 10).map((reservation) => (
                      <div
                        key={reservation.id}
                        className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-slate-900">{reservation.properties.name}</p>
                            <p className="text-sm text-slate-600">
                              Semana {reservation.weeks.week_number} - {reservation.weeks.season}
                            </p>
                            <p className="text-xs text-slate-500 font-mono">{reservation.user_wallet.slice(0, 8)}...</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-bold text-slate-900">${reservation.usdc_equivalent?.toLocaleString()}</p>
                            <p className="text-xs text-slate-500">
                              {new Date(reservation.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          {getStatusBadge(reservation.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Services Tab */}
            <TabsContent value="services" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-white/90 backdrop-blur-xl shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-orange-600" />
                      Pendientes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-slate-900">{stats.pendingCoordination}</div>
                    <p className="text-sm text-slate-600 mt-1">Servicios por realizar</p>
                  </CardContent>
                </Card>

                <Card className="bg-white/90 backdrop-blur-xl shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Completados
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-slate-900">{stats.completedRequests}</div>
                    <p className="text-sm text-slate-600 mt-1">Este mes</p>
                  </CardContent>
                </Card>

                <Card className="bg-white/90 backdrop-blur-xl shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      Eficiencia
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-slate-900">96%</div>
                    <p className="text-sm text-slate-600 mt-1">Tasa de finalización</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-white/90 backdrop-blur-xl shadow-lg">
                <CardHeader>
                  <CardTitle>Calendario de Servicios</CardTitle>
                  <CardDescription>Próximos servicios programados</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      {
                        type: "Limpieza Profunda",
                        property: "Villa Tulum",
                        date: "2025-01-15 14:00",
                        provider: "CleanPro",
                        cost: 150,
                      },
                      {
                        type: "Mantenimiento AC",
                        property: "Cabaña Monterrey",
                        date: "2025-01-16 10:00",
                        provider: "TechServices",
                        cost: 200,
                      },
                      {
                        type: "Jardinería",
                        property: "Penthouse CDMX",
                        date: "2025-01-17 09:00",
                        provider: "GreenScape",
                        cost: 100,
                      },
                      {
                        type: "Inspección Plomería",
                        property: "Casa Cancún",
                        date: "2025-01-18 15:00",
                        provider: "PlumbMaster",
                        cost: 120,
                      },
                    ].map((service, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center">
                            <Package className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{service.type}</p>
                            <p className="text-sm text-slate-600">{service.property}</p>
                            <p className="text-xs text-slate-500">{service.provider}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-slate-900">${service.cost}</p>
                          <p className="text-xs text-slate-500">{service.date}</p>
                          <Badge variant="secondary" className="mt-1">
                            Programado
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-2">
                <Card className="bg-white/90 backdrop-blur-xl shadow-lg">
                  <CardHeader>
                    <CardTitle>Reservas por Mes</CardTitle>
                    <CardDescription>Tendencia de reservas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        reservations: {
                          label: "Reservas",
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
                          <Line type="monotone" dataKey="reservations" stroke="#10b981" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card className="bg-white/90 backdrop-blur-xl shadow-lg">
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                    <CardDescription>KPIs clave de gestión</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-slate-900">Tiempo de Respuesta</span>
                          <span className="text-sm text-slate-600">{stats.avgResponseTime}h</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500" style={{ width: "85%" }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-slate-900">Satisfacción del Cliente</span>
                          <span className="text-sm text-slate-600">{stats.clientSatisfaction}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500" style={{ width: `${stats.clientSatisfaction}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-slate-900">Tasa de Ocupación</span>
                          <span className="text-sm text-slate-600">{stats.successRate.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500" style={{ width: `${stats.successRate}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-slate-900">Eficiencia de Servicios</span>
                          <span className="text-sm text-slate-600">96%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-orange-500" style={{ width: "96%" }} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )
}

export default function ManagementDashboard() {
  return (
    <RoleGuard allowedRoles={["management", "admin"]}>
      <ManagementDashboardContent />
    </RoleGuard>
  )
}
