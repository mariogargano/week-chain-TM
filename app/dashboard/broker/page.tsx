"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DollarSign,
  Users,
  TrendingUp,
  Briefcase,
  Download,
  Eye,
  ArrowUpRight,
  BarChart3,
  Calendar,
  Award,
  CreditCard,
  Clock,
  CheckCircle2,
  ArrowRight,
} from "lucide-react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { RoleGuard } from "@/components/role-guard"
import { Navbar } from "@/components/navbar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"
import { ChartContainer } from "@/components/ui/chart"

interface BrokerStats {
  totalSales: number
  commission: number
  pendingCommission: number
  activeClients: number
  closingRate: number
  thisMonthSales: number
  thisMonthCommission: number
  leadsCount: number
  conversionRate: number
  avgDealSize: number
  pipelineValue: number
}

interface Reservation {
  id: string
  created_at: string
  status: string
  usdc_equivalent: number
  week_id: string
  user_wallet: string
  properties: {
    name: string
    location: string
  }
  weeks: {
    week_number: number
    season: string
    price: number
  }
}

interface BrokerProfile {
  id: string
  display_name: string
  username: string
  email?: string
  referral_code: string
  total_weeks_sold: number
  broker_level_id?: string
  is_broker_elite: boolean
  avatar_url?: string
  country?: string
}

function BrokerDashboardContent() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<BrokerProfile | null>(null)

  const [stats, setStats] = useState<BrokerStats>({
    totalSales: 0,
    commission: 0,
    pendingCommission: 0,
    activeClients: 0,
    closingRate: 0,
    thisMonthSales: 0,
    thisMonthCommission: 0,
    leadsCount: 0,
    conversionRate: 0,
    avgDealSize: 0,
    pipelineValue: 0,
  })

  const [reservations, setReservations] = useState<Reservation[]>([])
  const [salesData, setSalesData] = useState<any[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    const supabase = createClient()

    // Get current user profile
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (profileData) {
        setProfile({
          ...profileData,
          email: user.email,
        })
      }
    }

    const [reservationsData, leadsData] = await Promise.all([
      supabase
        .from("reservations")
        .select(`
          id,
          created_at,
          status,
          usdc_equivalent,
          week_id,
          user_wallet,
          properties (
            name,
            location
          ),
          weeks (
            week_number,
            season,
            price
          )
        `)
        .order("created_at", { ascending: false }),

      supabase.from("broker_leads").select("*").order("created_at", { ascending: false }),
    ])

    const reservationsList = reservationsData.data || []
    setReservations(reservationsList)

    const leadsList = leadsData.data || []

    const totalSales = reservationsList.reduce((sum, r) => sum + (r.usdc_equivalent || 0), 0)
    const commission = totalSales * 0.04
    const pendingReservations = reservationsList.filter((r) => r.status === "pending")
    const pendingCommission = pendingReservations.reduce((sum, r) => sum + (r.usdc_equivalent || 0), 0) * 0.04
    const completedReservations = reservationsList.filter((r) => r.status === "completed")
    const closingRate = reservationsList.length > 0 ? (completedReservations.length / reservationsList.length) * 100 : 0

    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const thisMonthReservations = reservationsList.filter((r) => new Date(r.created_at) >= thisMonthStart)
    const thisMonthSales = thisMonthReservations.reduce((sum, r) => sum + (r.usdc_equivalent || 0), 0)
    const thisMonthCommission = thisMonthSales * 0.04

    const uniqueWallets = new Set(reservationsList.map((r) => r.user_wallet))
    const activeClients = uniqueWallets.size

    const avgDealSize = reservationsList.length > 0 ? totalSales / reservationsList.length : 0
    const pipelineValue = leadsList
      .filter((l) => l.stage !== "closed_lost")
      .reduce((sum, l) => sum + (l.estimated_value || 0), 0)
    const conversionRate = leadsList.length > 0 ? (completedReservations.length / leadsList.length) * 100 : 0

    setStats({
      totalSales,
      commission,
      pendingCommission,
      activeClients,
      closingRate,
      thisMonthSales,
      thisMonthCommission,
      leadsCount: leadsList.length,
      conversionRate,
      avgDealSize,
      pipelineValue,
    })

    // Generate last 6 months data for chart
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date()
      d.setMonth(d.getMonth() - (5 - i))
      const monthSales = reservationsList.filter((r) => {
        const saleDate = new Date(r.created_at)
        return saleDate.getMonth() === d.getMonth() && saleDate.getFullYear() === d.getFullYear()
      })

      return {
        month: d.toLocaleDateString("es-ES", { month: "short" }),
        ventas: monthSales.reduce((sum, r) => sum + (r.usdc_equivalent || 0), 0),
        honorarios: monthSales.reduce((sum, r) => sum + (r.usdc_equivalent || 0), 0) * 0.04,
        deals: monthSales.length,
      }
    })
    setSalesData(last6Months)

    // Recent activity
    const activity = reservationsList.slice(0, 5).map((r) => ({
      id: r.id,
      type: "sale",
      title: r.properties?.name || "Propiedad",
      subtitle: `Semana ${r.weeks?.week_number || "N/A"} - ${r.weeks?.season || ""}`,
      amount: r.usdc_equivalent,
      date: r.created_at,
      status: r.status,
    }))
    setRecentActivity(activity)

    setLoading(false)
  }

  const exportToCSV = () => {
    const headers = ["Fecha", "Propiedad", "Ubicación", "Semana", "Temporada", "Monto", "Honorarios (4%)", "Estado"]
    const rows = reservations.map((r) => [
      new Date(r.created_at).toLocaleDateString(),
      r.properties?.name || "N/A",
      r.properties?.location || "N/A",
      r.weeks?.week_number || "N/A",
      r.weeks?.season || "N/A",
      r.usdc_equivalent || 0,
      ((r.usdc_equivalent || 0) * 0.04).toFixed(2),
      r.status,
    ])

    const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.setAttribute("href", URL.createObjectURL(blob))
    link.setAttribute("download", `reporte-intermediario-${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getLevelBadge = () => {
    if (profile?.is_broker_elite) {
      return (
        <Badge className="bg-gradient-to-r from-amber-500 to-yellow-400 text-white border-0">
          <Award className="h-3 w-3 mr-1" />
          Elite
        </Badge>
      )
    }
    if (stats.totalSales > 100000) {
      return <Badge className="bg-gradient-to-r from-slate-400 to-slate-300 text-slate-900 border-0">Silver</Badge>
    }
    return <Badge className="bg-gradient-to-r from-emerald-500 to-teal-400 text-white border-0">Broker</Badge>
  }

  if (loading) {
    return (
      <>
        <Navbar user={true} />
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Cargando dashboard...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar user={true} />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-white/20 bg-gradient-to-br from-emerald-500 to-teal-400">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url || "/placeholder.svg"}
                      alt={profile.display_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold">
                      {profile?.display_name?.charAt(0) || "B"}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-white">{profile?.display_name || "Intermediario"}</h1>
                  {getLevelBadge()}
                </div>
                <p className="text-slate-400">Intermediario WEEK-CHAIN™</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                <Link href="/dashboard/broker/card">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Mi Tarjeta
                </Link>
              </Button>
              <Button
                onClick={exportToCSV}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600"
              >
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Total Earnings */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="h-5 w-5 text-emerald-400" />
                  <span className="text-xs text-emerald-400 flex items-center">
                    <ArrowUpRight className="h-3 w-3" />
                    +12%
                  </span>
                </div>
                <p className="text-2xl font-bold text-white">${stats.commission.toLocaleString()}</p>
                <p className="text-xs text-slate-400">Honorarios Totales</p>
              </CardContent>
            </Card>

            {/* This Month */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Calendar className="h-5 w-5 text-blue-400" />
                  <span className="text-xs text-blue-400 flex items-center">
                    <ArrowUpRight className="h-3 w-3" />
                    +8%
                  </span>
                </div>
                <p className="text-2xl font-bold text-white">${stats.thisMonthCommission.toLocaleString()}</p>
                <p className="text-xs text-slate-400">Este Mes</p>
              </CardContent>
            </Card>

            {/* Clients */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Users className="h-5 w-5 text-purple-400" />
                  <span className="text-xs text-purple-400 flex items-center">
                    <ArrowUpRight className="h-3 w-3" />
                    +5
                  </span>
                </div>
                <p className="text-2xl font-bold text-white">{stats.activeClients}</p>
                <p className="text-xs text-slate-400">Clientes Activos</p>
              </CardContent>
            </Card>

            {/* Conversion */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="h-5 w-5 text-amber-400" />
                </div>
                <p className="text-2xl font-bold text-white">{stats.closingRate.toFixed(1)}%</p>
                <p className="text-xs text-slate-400">Tasa de Cierre</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid lg:grid-cols-3 gap-4">
            {/* Main Chart */}
            <Card className="lg:col-span-2 bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-emerald-400" />
                  Rendimiento Mensual
                </CardTitle>
                <CardDescription className="text-slate-400">Últimos 6 meses</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    ventas: { label: "Ventas", color: "#10b981" },
                    honorarios: { label: "Honorarios", color: "#3b82f6" },
                  }}
                  className="h-[250px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={salesData}>
                      <defs>
                        <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorHonorarios" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="month" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          border: "1px solid #334155",
                          borderRadius: "8px",
                        }}
                        labelStyle={{ color: "#fff" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="ventas"
                        stroke="#10b981"
                        fillOpacity={1}
                        fill="url(#colorVentas)"
                      />
                      <Area
                        type="monotone"
                        dataKey="honorarios"
                        stroke="#3b82f6"
                        fillOpacity={1}
                        fill="url(#colorHonorarios)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Resumen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 rounded-xl p-4 border border-emerald-500/30">
                  <p className="text-emerald-400 font-bold text-2xl">{reservations.length}</p>
                  <p className="text-sm text-slate-400">Contratos Cerrados</p>
                </div>
                <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-xl p-4 border border-blue-500/30">
                  <p className="text-blue-400 font-bold text-2xl">${stats.totalSales.toLocaleString()}</p>
                  <p className="text-sm text-slate-400">Volumen Total</p>
                </div>
                <div className="bg-gradient-to-r from-amber-500/20 to-amber-600/20 rounded-xl p-4 border border-amber-500/30">
                  <p className="text-amber-400 font-bold text-2xl">4%</p>
                  <p className="text-sm text-slate-400">Tasa de Honorarios</p>
                </div>
                <div className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-xl p-4 border border-purple-500/30">
                  <p className="text-purple-400 font-bold text-2xl">${stats.avgDealSize.toLocaleString()}</p>
                  <p className="text-sm text-slate-400">Venta Promedio</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity & Actions */}
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Recent Activity */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="h-5 w-5 text-slate-400" />
                  Actividad Reciente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">{activity.title}</p>
                            <p className="text-slate-400 text-xs">{activity.subtitle}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-emerald-400 font-bold">${activity.amount?.toLocaleString()}</p>
                          <p className="text-slate-500 text-xs">{new Date(activity.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Briefcase className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-400">Sin actividad reciente</p>
                      <p className="text-slate-500 text-sm">Tus ventas aparecerán aquí</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-slate-400" />
                  Acciones Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/dashboard/broker/properties">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 hover:border-emerald-500/40 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                        <Eye className="h-5 w-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Ver Propiedades</p>
                        <p className="text-slate-400 text-xs">Explora propiedades disponibles</p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-emerald-400" />
                  </div>
                </Link>

                <Link href="/dashboard/broker/commissions">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 hover:border-blue-500/40 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Mis Comisiones</p>
                        <p className="text-slate-400 text-xs">Historial de honorarios</p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-blue-400" />
                  </div>
                </Link>

                <Link href="/dashboard/broker/calculator">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 hover:border-purple-500/40 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <BarChart3 className="h-5 w-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Calculadora</p>
                        <p className="text-slate-400 text-xs">Calcula tus ganancias</p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-purple-400" />
                  </div>
                </Link>

                <Link href="/dashboard/broker/materials">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 hover:border-amber-500/40 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                        <Download className="h-5 w-5 text-amber-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Materiales</p>
                        <p className="text-slate-400 text-xs">Recursos de marketing</p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-amber-400" />
                  </div>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Transactions Table */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Historial de Transacciones</CardTitle>
              <CardDescription className="text-slate-400">Todas tus ventas y honorarios generados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl overflow-hidden border border-white/10">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-white/5">
                      <TableHead className="text-slate-400">Fecha</TableHead>
                      <TableHead className="text-slate-400">Propiedad</TableHead>
                      <TableHead className="text-slate-400">Semana</TableHead>
                      <TableHead className="text-slate-400">Monto</TableHead>
                      <TableHead className="text-slate-400">Honorarios</TableHead>
                      <TableHead className="text-slate-400">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reservations.slice(0, 10).map((r) => (
                      <TableRow key={r.id} className="border-white/10 hover:bg-white/5">
                        <TableCell className="text-white">{new Date(r.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-white">{r.properties?.name || "N/A"}</TableCell>
                        <TableCell className="text-slate-400">
                          Semana {r.weeks?.week_number} - {r.weeks?.season}
                        </TableCell>
                        <TableCell className="text-white">${r.usdc_equivalent?.toLocaleString()}</TableCell>
                        <TableCell className="text-emerald-400 font-medium">
                          ${((r.usdc_equivalent || 0) * 0.04).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              r.status === "completed"
                                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                : r.status === "pending"
                                  ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                                  : "bg-red-500/20 text-red-400 border-red-500/30"
                            }
                          >
                            {r.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {reservations.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                          No hay transacciones aún
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center py-6">
            <p className="text-slate-500 text-sm">
              WEEK-CHAIN™ · Panel de Intermediario · Los honorarios son calculados al 4% sobre ventas efectivas
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default function BrokerDashboardPage() {
  return (
    <RoleGuard allowedRoles={["broker", "admin"]}>
      <BrokerDashboardContent />
    </RoleGuard>
  )
}
