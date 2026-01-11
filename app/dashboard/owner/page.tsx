"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Navbar } from "@/components/navbar"
import { RoleGuard } from "@/components/role-guard"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Building2,
  DollarSign,
  FileText,
  Bell,
  Plus,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  Briefcase,
  Download,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { ChartContainer } from "@/components/ui/chart"

export default function OwnerDashboardPage() {
  return (
    <RoleGuard allowedRoles={["property_owner", "admin"]}>
      <OwnerDashboardContent />
    </RoleGuard>
  )
}

function OwnerDashboardContent() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  const [stats, setStats] = useState({
    totalSubmissions: 0,
    approvedProperties: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    revenueGrowth: 0,
    pendingReview: 0,
    weeksSold: 0,
    weeksAvailable: 0,
    averageWeekPrice: 0,
    totalCommissions: 0,
    pendingPayments: 0,
    completedPayments: 0,
  })

  const [recentSubmissions, setRecentSubmissions] = useState<any[]>([])
  const [recentSales, setRecentSales] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])

  const [revenueData, setRevenueData] = useState<any[]>([])
  const [propertyPerformance, setPropertyPerformance] = useState<any[]>([])
  const [salesByMonth, setSalesByMonth] = useState<any[]>([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const [submissions, sales, notifs, profile] = await Promise.all([
      supabase
        .from("property_submissions")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("property_owner_sales")
        .select("*")
        .eq("owner_id", user.id)
        .order("sale_date", { ascending: false }),
      supabase
        .from("owner_notifications")
        .select("*")
        .eq("owner_id", user.id)
        .eq("read", false)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase.from("property_owner_profiles").select("*").eq("user_id", user.id).single(),
    ])

    const approved = submissions.data?.filter((s) => s.status === "approved").length || 0
    const pending =
      submissions.data?.filter(
        (s) => s.status === "submitted" || s.status === "notary_review" || s.status === "admin_review",
      ).length || 0

    const totalRevenue = sales.data?.reduce((sum, sale) => sum + (sale.owner_revenue_usd || 0), 0) || 0
    const totalCommissions = sales.data?.reduce((sum, sale) => sum + (sale.commission_usd || 0), 0) || 0
    const pendingPayments =
      sales.data
        ?.filter((s) => s.payment_status === "pending")
        .reduce((sum, sale) => sum + (sale.owner_revenue_usd || 0), 0) || 0
    const completedPayments =
      sales.data
        ?.filter((s) => s.payment_status === "paid")
        .reduce((sum, sale) => sum + (sale.owner_revenue_usd || 0), 0) || 0

    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthlyRev =
      sales.data
        ?.filter((s) => new Date(s.sale_date) >= monthStart)
        .reduce((sum, sale) => sum + (sale.owner_revenue_usd || 0), 0) || 0

    const avgPrice =
      sales.data && sales.data.length > 0
        ? sales.data.reduce((sum, s) => sum + (s.sale_price_usd || 0), 0) / sales.data.length
        : 0

    setStats({
      totalSubmissions: submissions.data?.length || 0,
      approvedProperties: approved,
      totalRevenue: totalRevenue,
      monthlyRevenue: monthlyRev,
      revenueGrowth: totalRevenue > 0 ? (monthlyRev / totalRevenue) * 100 : 0,
      pendingReview: pending,
      weeksSold: sales.data?.length || 0,
      weeksAvailable: approved * 52 - (sales.data?.length || 0),
      averageWeekPrice: avgPrice,
      totalCommissions: totalCommissions,
      pendingPayments: pendingPayments,
      completedPayments: completedPayments,
    })

    setRecentSubmissions(submissions.data?.slice(0, 5) || [])
    setRecentSales(sales.data?.slice(0, 5) || [])
    setNotifications(notifs.data || [])

    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date()
      d.setMonth(d.getMonth() - (5 - i))
      const monthSales =
        sales.data?.filter((s) => {
          const saleDate = new Date(s.sale_date)
          return saleDate.getMonth() === d.getMonth() && saleDate.getFullYear() === d.getFullYear()
        }) || []

      return {
        month: d.toLocaleDateString("es-ES", { month: "short" }),
        revenue: monthSales.reduce((sum, s) => sum + (s.owner_revenue_usd || 0), 0),
        sales: monthSales.length,
      }
    })
    setRevenueData(last6Months)
    setSalesByMonth(last6Months)

    const propPerf =
      submissions.data
        ?.filter((s) => s.status === "approved")
        .map((prop) => {
          const propSales = sales.data?.filter((s) => s.property_id === prop.id) || []
          return {
            name: prop.property_name?.substring(0, 15) + "...",
            sold: propSales.length,
            available: 52 - propSales.length,
            revenue: propSales.reduce((sum, s) => sum + (s.owner_revenue_usd || 0), 0),
          }
        }) || []
    setPropertyPerformance(propPerf)

    setLoading(false)
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
                Dashboard de Propietario
              </h1>
              <p className="text-slate-600 mt-2">Gestiona tus propiedades tokenizadas y tracking de ventas</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => router.push("/dashboard/owner/sales")}
                variant="outline"
                className="border-purple-200"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar Ventas
              </Button>
              <Button
                onClick={() => router.push("/dashboard/owner/submit-property")}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nueva Propiedad
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-green-500 bg-white/90 backdrop-blur-xl shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Revenue Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">${stats.totalRevenue.toLocaleString()}</div>
                <div className="mt-1 flex items-center text-xs">
                  {stats.revenueGrowth > 0 ? (
                    <ArrowUpRight className="mr-1 h-3 w-3 text-green-600" />
                  ) : (
                    <ArrowDownRight className="mr-1 h-3 w-3 text-red-600" />
                  )}
                  <span className={stats.revenueGrowth > 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                    {Math.abs(stats.revenueGrowth).toFixed(1)}%
                  </span>
                  <span className="ml-1 text-slate-500">este mes</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500 bg-white/90 backdrop-blur-xl shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Propiedades Aprobadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{stats.approvedProperties}</div>
                <p className="text-xs text-slate-500 mt-1">
                  {stats.totalSubmissions} total • {stats.pendingReview} en revisión
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500 bg-white/90 backdrop-blur-xl shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Semanas Vendidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{stats.weeksSold}</div>
                <p className="text-xs text-slate-500 mt-1">
                  {stats.weeksAvailable} disponibles • ${stats.averageWeekPrice.toLocaleString()} promedio
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500 bg-white/90 backdrop-blur-xl shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Pagos Pendientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">${stats.pendingPayments.toLocaleString()}</div>
                <p className="text-xs text-slate-500 mt-1">${stats.completedPayments.toLocaleString()} pagados</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="properties">Propiedades</TabsTrigger>
              <TabsTrigger value="sales">Ventas</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-2">
                {/* Revenue Chart */}
                <Card className="bg-white/90 backdrop-blur-xl shadow-lg">
                  <CardHeader>
                    <CardTitle>Revenue por Mes</CardTitle>
                    <CardDescription>Últimos 6 meses</CardDescription>
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
                        <AreaChart data={revenueData}>
                          <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="month" stroke="#64748b" />
                          <YAxis stroke="#64748b" />
                          <Tooltip />
                          <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#a855f7"
                            fillOpacity={1}
                            fill="url(#colorRevenue)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* Sales by Month */}
                <Card className="bg-white/90 backdrop-blur-xl shadow-lg">
                  <CardHeader>
                    <CardTitle>Ventas por Mes</CardTitle>
                    <CardDescription>Número de semanas vendidas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        sales: {
                          label: "Ventas",
                          color: "hsl(var(--chart-2))",
                        },
                      }}
                      className="h-[300px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={salesByMonth}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="month" stroke="#64748b" />
                          <YAxis stroke="#64748b" />
                          <Tooltip />
                          <Bar dataKey="sales" fill="#ec4899" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-white/90 backdrop-blur-xl shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-sm">Acciones Rápidas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      onClick={() => router.push("/dashboard/owner/submit-property")}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Nueva Propiedad
                    </Button>
                    <Button
                      onClick={() => router.push("/dashboard/owner/submissions")}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Ver Submissions
                    </Button>
                    <Button
                      onClick={() => router.push("/virtual-office")}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <Briefcase className="mr-2 h-4 w-4" />
                      Oficina Virtual
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-white/90 backdrop-blur-xl shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-sm">Métricas Financieras</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Revenue Mensual</span>
                      <span className="text-sm font-bold">${stats.monthlyRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Comisiones</span>
                      <span className="text-sm font-bold">${stats.totalCommissions.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Precio Promedio</span>
                      <span className="text-sm font-bold">${stats.averageWeekPrice.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/90 backdrop-blur-xl shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Bell className="h-4 w-4 text-orange-500" />
                      Notificaciones ({notifications.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {notifications.length > 0 ? (
                      <div className="space-y-2">
                        {notifications.slice(0, 3).map((notif) => (
                          <div key={notif.id} className="text-sm p-2 bg-orange-50 rounded border border-orange-100">
                            <p className="font-medium text-slate-900">{notif.title}</p>
                            <p className="text-xs text-slate-600">{notif.message?.substring(0, 50)}...</p>
                          </div>
                        ))}
                        <Button
                          onClick={() => router.push("/dashboard/owner/notifications")}
                          variant="ghost"
                          size="sm"
                          className="w-full"
                        >
                          Ver todas
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 text-center py-4">No hay notificaciones</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="properties" className="space-y-4">
              <Card className="bg-white/90 backdrop-blur-xl shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Mis Propiedades</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/owner/submissions")}>
                      Ver todas
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {recentSubmissions.length > 0 ? (
                    <div className="space-y-4">
                      {recentSubmissions.map((submission) => (
                        <div
                          key={submission.id}
                          className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                          onClick={() => router.push(`/dashboard/owner/submissions/${submission.id}`)}
                        >
                          <div className="flex items-center gap-4 flex-1">
                            {getStatusIcon(submission.status)}
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-900">{submission.property_name}</h4>
                              <p className="text-sm text-slate-500">{submission.property_location}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-semibold text-slate-900">
                                ${submission.total_value_usd?.toLocaleString()}
                              </p>
                              <p className="text-xs text-slate-500">{submission.weeks_to_tokenize} semanas</p>
                            </div>
                            <Badge className={getStatusColor(submission.status)}>{submission.status}</Badge>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-600 mb-4">No has enviado propiedades aún</p>
                      <Button
                        onClick={() => router.push("/dashboard/owner/submit-property")}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Enviar Primera Propiedad
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sales" className="space-y-4">
              <Card className="bg-white/90 backdrop-blur-xl shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Historial de Ventas</CardTitle>
                    <Button onClick={() => router.push("/dashboard/owner/sales")} variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Exportar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {recentSales.length > 0 ? (
                    <div className="space-y-4">
                      {recentSales.map((sale) => (
                        <div
                          key={sale.id}
                          className="flex items-center justify-between p-4 border border-slate-200 rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center">
                              <DollarSign className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-slate-900">Semana #{sale.week_number}</h4>
                              <p className="text-sm text-slate-500">
                                {new Date(sale.sale_date).toLocaleDateString("es-ES")}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">${sale.owner_revenue_usd?.toLocaleString()}</p>
                            <Badge variant={sale.payment_status === "paid" ? "default" : "outline"}>
                              {sale.payment_status === "paid" ? "Pagado" : "Pendiente"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <DollarSign className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-600">No hay ventas registradas aún</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <Card className="bg-white/90 backdrop-blur-xl shadow-lg">
                <CardHeader>
                  <CardTitle>Performance por Propiedad</CardTitle>
                  <CardDescription>Semanas vendidas vs disponibles</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      sold: {
                        label: "Vendidas",
                        color: "hsl(var(--chart-1))",
                      },
                      available: {
                        label: "Disponibles",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                    className="h-[400px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={propertyPerformance}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip />
                        <Bar dataKey="sold" fill="#10b981" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="available" fill="#94a3b8" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )
}

// ... existing helper functions ...
function getStatusIcon(status: string) {
  switch (status) {
    case "approved":
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case "rejected":
      return <XCircle className="h-4 w-4 text-red-500" />
    case "draft":
      return <FileText className="h-4 w-4 text-slate-400" />
    default:
      return <Clock className="h-4 w-4 text-yellow-500" />
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "approved":
      return "bg-green-100 text-green-700"
    case "rejected":
      return "bg-red-100 text-red-700"
    case "draft":
      return "bg-slate-100 text-slate-700"
    default:
      return "bg-yellow-100 text-yellow-700"
  }
}
