"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  CreditCard,
  Clock,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Percent,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Loader2,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Star,
  Briefcase,
} from "lucide-react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface KPIData {
  // SLA
  avgRequestToOfferHours: number
  requestsOver48h: number
  totalPendingRequests: number
  
  // Occupancy
  totalWeeks: number
  soldWeeks: number
  reservedWeeks: number
  availableWeeks: number
  
  // Revenue
  totalRevenue: number
  revenueThisMonth: number
  revenuePrevMonth: number
  avgTicket: number
  
  // Risk
  pendingKYC: number
  activeDisputes: number
  canceledReservations: number
  
  // Quality
  avgNPS: number
  openTickets: number
  avgResolutionHours: number
  
  // Forecast
  sellableCapacity: number
  committedCapacity: number
  projectedCashflow: number
  
  // By Property
  propertyStats: Array<{
    id: string
    name: string
    location: string
    occupancy: number
    revenue: number
    margin: number
  }>
  
  // By Tier
  tierStats: {
    silver: { sold: number; revenue: number }
    gold: { sold: number; revenue: number }
    platinum: { sold: number; revenue: number }
    signature: { sold: number; revenue: number }
  }
}

export default function AdminReportsPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<KPIData | null>(null)
  const [period, setPeriod] = useState("month")
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = async () => {
    setRefreshing(true)
    const supabase = createClient()

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    const [
      requestsRes,
      weeksRes,
      paymentsRes,
      paymentsThisMonthRes,
      paymentsPrevMonthRes,
      kycRes,
      disputesRes,
      ticketsRes,
      propertiesRes,
      certsRes,
    ] = await Promise.all([
      supabase.from("reservation_requests").select("id, status, created_at"),
      supabase.from("weeks").select("id, status, property_id"),
      supabase.from("payments").select("amount, status"),
      supabase.from("payments").select("amount").eq("status", "completed").gte("created_at", startOfMonth.toISOString()),
      supabase.from("payments").select("amount").eq("status", "completed").gte("created_at", startOfPrevMonth.toISOString()).lte("created_at", endOfPrevMonth.toISOString()),
      supabase.from("kyc_users").select("id, status").eq("status", "pending"),
      supabase.from("payments").select("id").eq("status", "disputed"),
      supabase.from("support_tickets").select("id, status, created_at"),
      supabase.from("properties").select("id, name, location, valor_total_usd"),
      supabase.from("user_certificates_v2").select("tier, payment_amount"),
    ])

    const requests = requestsRes.data || []
    const weeks = weeksRes.data || []
    const payments = paymentsRes.data || []
    const paymentsThisMonth = paymentsThisMonthRes.data || []
    const paymentsPrevMonth = paymentsPrevMonthRes.data || []
    const properties = propertiesRes.data || []
    const certs = certsRes.data || []

    // Calculate SLA
    const pendingRequests = requests.filter(r => r.status === "requested" || r.status === "processing")
    const over48h = pendingRequests.filter(r => {
      const hours = (Date.now() - new Date(r.created_at).getTime()) / (1000 * 60 * 60)
      return hours > 48
    })

    // Calculate weeks stats
    const soldWeeks = weeks.filter(w => w.status === "sold").length
    const reservedWeeks = weeks.filter(w => w.status === "reserved").length
    const availableWeeks = weeks.filter(w => w.status === "available").length

    // Calculate revenue
    const totalRevenue = payments.filter(p => p.status === "completed").reduce((s, p) => s + (p.amount || 0), 0)
    const revenueThisMonth = paymentsThisMonth.reduce((s, p) => s + (p.amount || 0), 0)
    const revenuePrevMonth = paymentsPrevMonth.reduce((s, p) => s + (p.amount || 0), 0)

    // Calculate tier stats
    const tierStats = {
      silver: { sold: certs.filter(c => c.tier === "silver").length, revenue: certs.filter(c => c.tier === "silver").reduce((s, c) => s + (c.payment_amount || 0), 0) },
      gold: { sold: certs.filter(c => c.tier === "gold").length, revenue: certs.filter(c => c.tier === "gold").reduce((s, c) => s + (c.payment_amount || 0), 0) },
      platinum: { sold: certs.filter(c => c.tier === "platinum").length, revenue: certs.filter(c => c.tier === "platinum").reduce((s, c) => s + (c.payment_amount || 0), 0) },
      signature: { sold: certs.filter(c => c.tier === "signature").length, revenue: certs.filter(c => c.tier === "signature").reduce((s, c) => s + (c.payment_amount || 0), 0) },
    }

    // Property stats
    const propertyStats = properties.map(p => {
      const propWeeks = weeks.filter(w => w.property_id === p.id)
      const sold = propWeeks.filter(w => w.status === "sold").length
      const total = propWeeks.length || 52
      return {
        id: p.id,
        name: p.name,
        location: p.location,
        occupancy: Math.round((sold / total) * 100),
        revenue: p.valor_total_usd || 0,
        margin: 35, // Placeholder
      }
    })

    setData({
      avgRequestToOfferHours: 24, // Placeholder
      requestsOver48h: over48h.length,
      totalPendingRequests: pendingRequests.length,
      totalWeeks: weeks.length,
      soldWeeks,
      reservedWeeks,
      availableWeeks,
      totalRevenue,
      revenueThisMonth,
      revenuePrevMonth,
      avgTicket: payments.length > 0 ? totalRevenue / payments.filter(p => p.status === "completed").length : 0,
      pendingKYC: kycRes.data?.length || 0,
      activeDisputes: disputesRes.data?.length || 0,
      canceledReservations: requests.filter(r => r.status === "canceled").length,
      avgNPS: 78, // Placeholder
      openTickets: ticketsRes.data?.filter(t => t.status === "open").length || 0,
      avgResolutionHours: 12, // Placeholder
      sellableCapacity: availableWeeks,
      committedCapacity: soldWeeks + reservedWeeks,
      projectedCashflow: revenueThisMonth * 1.15,
      propertyStats,
      tierStats,
    })

    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => {
    fetchData()
  }, [period])

  const exportReport = (type: string) => {
    if (!data) return
    
    let csv = ""
    if (type === "kpi") {
      csv = [
        ["Metrica", "Valor"],
        ["Revenue Total", data.totalRevenue],
        ["Revenue Este Mes", data.revenueThisMonth],
        ["Ticket Promedio", data.avgTicket],
        ["Semanas Vendidas", data.soldWeeks],
        ["Ocupacion %", Math.round((data.soldWeeks / data.totalWeeks) * 100)],
        ["SLA Promedio (hrs)", data.avgRequestToOfferHours],
        ["KYC Pendientes", data.pendingKYC],
        ["Disputas Activas", data.activeDisputes],
        ["NPS Promedio", data.avgNPS],
      ].map(row => row.join(",")).join("\n")
    }
    
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `reporte-${type}-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    )
  }

  if (!data) return null

  const revenueChange = data.revenuePrevMonth > 0 
    ? ((data.revenueThisMonth - data.revenuePrevMonth) / data.revenuePrevMonth * 100).toFixed(1)
    : "0"
  const isRevenueUp = Number(revenueChange) >= 0
  const occupancyRate = data.totalWeeks > 0 ? Math.round((data.soldWeeks / data.totalWeeks) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Reportes y KPIs Ejecutivos</h1>
          <p className="text-slate-500">Torre de control operativo WEEK-CHAIN</p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[140px] border-sky-500/20">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Esta Semana</SelectItem>
              <SelectItem value="month">Este Mes</SelectItem>
              <SelectItem value="quarter">Este Trimestre</SelectItem>
              <SelectItem value="year">Este Año</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchData} disabled={refreshing} className="border-sky-500/20">
            {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
          <Button onClick={() => exportReport("kpi")} className="bg-sky-500 hover:bg-sky-600">
            <Download className="h-4 w-4 mr-2" /> Exportar
          </Button>
        </div>
      </div>

      {/* Main KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-emerald-500/20 bg-white/80 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Revenue Total</p>
                <p className="text-2xl font-bold text-slate-900">${(data.totalRevenue / 1000).toFixed(0)}K</p>
                <div className={`flex items-center gap-1 text-xs ${isRevenueUp ? "text-emerald-600" : "text-red-600"}`}>
                  {isRevenueUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {revenueChange}% vs mes anterior
                </div>
              </div>
              <div className="p-2.5 bg-emerald-100 rounded-xl"><DollarSign className="h-5 w-5 text-emerald-600" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-sky-500/20 bg-white/80 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Ocupacion</p>
                <p className="text-2xl font-bold text-slate-900">{occupancyRate}%</p>
                <p className="text-xs text-slate-500">{data.soldWeeks} de {data.totalWeeks} semanas</p>
              </div>
              <div className="p-2.5 bg-sky-100 rounded-xl"><Building2 className="h-5 w-5 text-sky-600" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className={`${data.requestsOver48h > 0 ? "border-red-500/30 bg-red-50/50" : "border-amber-500/20 bg-white/80"} backdrop-blur-xl`}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">SLA REQUEST-OFFER</p>
                <p className="text-2xl font-bold text-slate-900">{data.avgRequestToOfferHours}h</p>
                {data.requestsOver48h > 0 && (
                  <Badge className="bg-red-100 text-red-700 border-red-200 text-xs mt-1">{data.requestsOver48h} over 48h</Badge>
                )}
              </div>
              <div className={`p-2.5 ${data.requestsOver48h > 0 ? "bg-red-100" : "bg-amber-100"} rounded-xl`}>
                <Clock className={`h-5 w-5 ${data.requestsOver48h > 0 ? "text-red-600" : "text-amber-600"}`} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={`${data.avgNPS >= 70 ? "border-emerald-500/20 bg-white/80" : "border-amber-500/20 bg-amber-50/50"} backdrop-blur-xl`}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">NPS Score</p>
                <p className="text-2xl font-bold text-slate-900">{data.avgNPS}</p>
                <p className="text-xs text-slate-500">{data.avgNPS >= 70 ? "Excelente" : data.avgNPS >= 50 ? "Bueno" : "Necesita mejora"}</p>
              </div>
              <div className={`p-2.5 ${data.avgNPS >= 70 ? "bg-emerald-100" : "bg-amber-100"} rounded-xl`}>
                <Star className={`h-5 w-5 ${data.avgNPS >= 70 ? "text-emerald-600" : "text-amber-600"}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="bg-white/80 backdrop-blur-xl border border-sky-500/20">
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="sales">Ventas por Tier</TabsTrigger>
          <TabsTrigger value="properties">Por Propiedad</TabsTrigger>
          <TabsTrigger value="risk">Riesgo</TabsTrigger>
          <TabsTrigger value="forecast">Forecast</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* SLA Panel */}
            <Card className="border-sky-500/20 bg-white/80 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-sky-500" /> SLA Operativo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">REQUEST - OFFER {"<"}48h</span>
                  <Badge className={data.requestsOver48h === 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}>
                    {data.requestsOver48h === 0 ? "OK" : `${data.requestsOver48h} atrasados`}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Backlog Requests</span>
                  <span className="font-semibold">{data.totalPendingRequests}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Tickets Abiertos</span>
                  <span className="font-semibold">{data.openTickets}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Tiempo Resolucion Prom.</span>
                  <span className="font-semibold">{data.avgResolutionHours}h</span>
                </div>
              </CardContent>
            </Card>

            {/* Revenue Panel */}
            <Card className="border-emerald-500/20 bg-white/80 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-emerald-500" /> Ingresos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Este Mes</span>
                  <span className="font-semibold text-emerald-600">${data.revenueThisMonth.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Mes Anterior</span>
                  <span className="font-semibold">${data.revenuePrevMonth.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Ticket Promedio</span>
                  <span className="font-semibold">${data.avgTicket.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">Meta Mensual</span>
                    <span className="text-sm text-slate-500">75%</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Capacity Panel */}
            <Card className="border-purple-500/20 bg-white/80 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-500" /> Capacidad
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-emerald-50">
                    <p className="text-lg font-bold text-emerald-600">{data.availableWeeks}</p>
                    <p className="text-xs text-slate-500">Disponibles</p>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-50">
                    <p className="text-lg font-bold text-amber-600">{data.reservedWeeks}</p>
                    <p className="text-xs text-slate-500">Reservadas</p>
                  </div>
                  <div className="p-2 rounded-lg bg-sky-50">
                    <p className="text-lg font-bold text-sky-600">{data.soldWeeks}</p>
                    <p className="text-xs text-slate-500">Vendidas</p>
                  </div>
                </div>
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">Utilizacion</span>
                    <span className="text-sm font-semibold">{occupancyRate}%</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden flex">
                    <div className="bg-sky-500" style={{ width: `${(data.soldWeeks / data.totalWeeks) * 100}%` }} />
                    <div className="bg-amber-400" style={{ width: `${(data.reservedWeeks / data.totalWeeks) * 100}%` }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="mt-4">
          <Card className="border-sky-500/20 bg-white/80 backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Ventas por Tier de Certificado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { tier: "silver", label: "Silver", color: "slate", data: data.tierStats.silver },
                  { tier: "gold", label: "Gold", color: "amber", data: data.tierStats.gold },
                  { tier: "platinum", label: "Platinum", color: "purple", data: data.tierStats.platinum },
                  { tier: "signature", label: "Signature", color: "sky", data: data.tierStats.signature },
                ].map((item) => (
                  <div key={item.tier} className={`p-4 rounded-xl border bg-${item.color}-50 border-${item.color}-200`}>
                    <h4 className={`font-semibold text-${item.color}-700`}>{item.label}</h4>
                    <p className="text-2xl font-bold text-slate-900 mt-2">{item.data.sold}</p>
                    <p className="text-sm text-slate-500">certificados</p>
                    <p className="text-lg font-semibold text-emerald-600 mt-2">${item.data.revenue.toLocaleString()}</p>
                    <p className="text-xs text-slate-500">revenue</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="properties" className="mt-4">
          <Card className="border-sky-500/20 bg-white/80 backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Rendimiento por Propiedad</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.propertyStats.length === 0 ? (
                  <p className="text-center py-8 text-slate-500">No hay propiedades registradas</p>
                ) : (
                  data.propertyStats.map((prop) => (
                    <div key={prop.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-sky-500/20 bg-white gap-4">
                      <div>
                        <h4 className="font-semibold text-slate-900">{prop.name}</h4>
                        <p className="text-sm text-slate-500">{prop.location}</p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-lg font-bold text-sky-600">{prop.occupancy}%</p>
                          <p className="text-xs text-slate-500">Ocupacion</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-emerald-600">${(prop.revenue / 1000).toFixed(0)}K</p>
                          <p className="text-xs text-slate-500">Valor</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-purple-600">{prop.margin}%</p>
                          <p className="text-xs text-slate-500">Margen</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="mt-4">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className={`${data.pendingKYC > 5 || data.activeDisputes > 0 ? "border-red-500/30" : "border-sky-500/20"} bg-white/80 backdrop-blur-xl`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" /> Indicadores de Riesgo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={`flex items-center justify-between p-3 rounded-lg ${data.pendingKYC > 5 ? "bg-red-50 border border-red-200" : "bg-slate-50"}`}>
                  <div className="flex items-center gap-2">
                    <Shield className={`h-4 w-4 ${data.pendingKYC > 5 ? "text-red-500" : "text-slate-500"}`} />
                    <span className="text-sm">KYC Pendientes</span>
                  </div>
                  <Badge className={data.pendingKYC > 5 ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-700"}>{data.pendingKYC}</Badge>
                </div>
                <div className={`flex items-center justify-between p-3 rounded-lg ${data.activeDisputes > 0 ? "bg-red-50 border border-red-200" : "bg-slate-50"}`}>
                  <div className="flex items-center gap-2">
                    <CreditCard className={`h-4 w-4 ${data.activeDisputes > 0 ? "text-red-500" : "text-slate-500"}`} />
                    <span className="text-sm">Disputas/Chargebacks</span>
                  </div>
                  <Badge className={data.activeDisputes > 0 ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}>{data.activeDisputes}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    <span className="text-sm">Cancelaciones</span>
                  </div>
                  <Badge className="bg-slate-100 text-slate-700">{data.canceledReservations}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-sky-500/20 bg-white/80 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500" /> Calidad de Servicio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm">NPS Score</span>
                  </div>
                  <span className="font-bold text-emerald-700">{data.avgNPS}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-slate-500" />
                    <span className="text-sm">Tickets Abiertos</span>
                  </div>
                  <span className="font-semibold">{data.openTickets}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-500" />
                    <span className="text-sm">Resolucion Promedio</span>
                  </div>
                  <span className="font-semibold">{data.avgResolutionHours}h</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="forecast" className="mt-4">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="border-sky-500/20 bg-white/80 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-sky-500" /> Capacidad vs Comprometido
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                    <p className="text-3xl font-bold text-emerald-600">{data.sellableCapacity}</p>
                    <p className="text-sm text-slate-600">Semanas Vendibles</p>
                  </div>
                  <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 text-center">
                    <p className="text-3xl font-bold text-sky-600">{data.committedCapacity}</p>
                    <p className="text-sm text-slate-600">Comprometidas</p>
                  </div>
                </div>
                <div className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">Capacidad Utilizada</span>
                    <span className="text-sm font-semibold">{Math.round((data.committedCapacity / (data.sellableCapacity + data.committedCapacity)) * 100)}%</span>
                  </div>
                  <Progress value={(data.committedCapacity / (data.sellableCapacity + data.committedCapacity)) * 100} className="h-3" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-emerald-500/20 bg-white/80 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-500" /> Proyeccion Cashflow
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <p className="text-sm text-slate-600">Proyeccion Proximas 4 Semanas</p>
                  <p className="text-3xl font-bold text-emerald-600">${data.projectedCashflow.toLocaleString()}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                    <span className="text-slate-600">Ingresos Esperados</span>
                    <span className="font-semibold text-emerald-600">+${(data.projectedCashflow * 0.7).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                    <span className="text-slate-600">Payouts Programados</span>
                    <span className="font-semibold text-red-600">-${(data.projectedCashflow * 0.3).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
