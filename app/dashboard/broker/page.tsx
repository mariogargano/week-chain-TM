"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DollarSign, Users, TrendingUp, Briefcase, Download, Eye, ArrowUpRight,
  Calendar, CreditCard, Clock, CheckCircle2, Loader2, AlertCircle, Copy,
  RefreshCw, Share2, ExternalLink, ArrowUp
} from "lucide-react"
import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { RoleGuard } from "@/components/role-guard"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"
import { ChartContainer } from "@/components/ui/chart"
import { toast } from "sonner"

/* ---------- Glass utility classes ---------- */
const glass = "bg-gradient-to-br from-sky-500/[0.08] to-blue-600/[0.04] backdrop-blur-xl border border-sky-500/20 rounded-2xl shadow-[0_4px_24px_rgba(14,165,233,0.1)]"
const glassHover = "hover:shadow-[0_8px_32px_rgba(14,165,233,0.18)] hover:border-sky-400/30 transition-all duration-300"
const glassCard = `${glass} ${glassHover}`

/* ---------- Types ---------- */
interface BrokerStats {
  totalSales: number
  totalCommission: number
  pendingCommission: number
  thisMonthSales: number
  thisMonthCommission: number
  activeClients: number
  closingRate: number
  avgDealSize: number
}

interface Sale {
  id: string
  created_at: string
  status: string
  amount: number
  client_name?: string
  property_name?: string
}

interface BrokerProfile {
  id: string
  display_name: string
  referral_code: string
  email?: string
}

const defaultStats: BrokerStats = {
  totalSales: 0,
  totalCommission: 0,
  pendingCommission: 0,
  thisMonthSales: 0,
  thisMonthCommission: 0,
  activeClients: 0,
  closingRate: 0,
  avgDealSize: 0,
}

function BrokerDashboardContent() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<BrokerProfile | null>(null)
  const [stats, setStats] = useState<BrokerStats>(defaultStats)
  const [sales, setSales] = useState<Sale[]>([])
  const [salesData, setSalesData] = useState<any[]>([])
  const fetchedRef = useRef(false)

  const COMMISSION_RATE = 0.04 // Flat 4% for all brokers

  const fetchData = async () => {
    try {
      setRefreshing(true)
      setError(null)
      const supabase = createClient()

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError("Sesion no valida")
        setLoading(false)
        setRefreshing(false)
        return
      }

      // Get broker profile
      const { data: profileData } = await supabase
        .from("intermediary_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single()

      if (profileData) {
        setProfile({
          id: profileData.id,
          display_name: profileData.display_name || user.email?.split("@")[0] || "Broker",
          referral_code: profileData.referral_code || "",
          email: user.email,
        })
      } else {
        // Fallback to profiles table
        const { data: fallbackProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        setProfile({
          id: user.id,
          display_name: fallbackProfile?.display_name || user.email?.split("@")[0] || "Broker",
          referral_code: fallbackProfile?.referral_code || "",
          email: user.email,
        })
      }

      // Get broker sales (from broker_sales or referral_purchases)
      const { data: salesData } = await supabase
        .from("broker_sales")
        .select("*")
        .eq("broker_id", user.id)
        .order("created_at", { ascending: false })

      const salesList = salesData || []
      setSales(salesList.map(s => ({
        id: s.id,
        created_at: s.created_at,
        status: s.status || "completed",
        amount: Number(s.sale_amount) || 0,
        client_name: s.client_name,
        property_name: s.property_name,
      })))

      // Calculate stats
      const completedSales = salesList.filter(s => s.status === "completed" || s.status === "paid")
      const pendingSales = salesList.filter(s => s.status === "pending")
      const totalSalesAmount = completedSales.reduce((sum, s) => sum + (Number(s.sale_amount) || 0), 0)
      const pendingSalesAmount = pendingSales.reduce((sum, s) => sum + (Number(s.sale_amount) || 0), 0)

      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const thisMonthSales = salesList.filter(s => new Date(s.created_at) >= monthStart)
      const thisMonthAmount = thisMonthSales.reduce((sum, s) => sum + (Number(s.sale_amount) || 0), 0)

      const uniqueClients = new Set(salesList.map(s => s.client_id || s.client_name)).size

      setStats({
        totalSales: totalSalesAmount,
        totalCommission: totalSalesAmount * COMMISSION_RATE,
        pendingCommission: pendingSalesAmount * COMMISSION_RATE,
        thisMonthSales: thisMonthAmount,
        thisMonthCommission: thisMonthAmount * COMMISSION_RATE,
        activeClients: uniqueClients,
        closingRate: salesList.length > 0 ? (completedSales.length / salesList.length) * 100 : 0,
        avgDealSize: completedSales.length > 0 ? totalSalesAmount / completedSales.length : 0,
      })

      // Generate chart data for last 6 months
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date()
        d.setMonth(d.getMonth() - (5 - i))
        const monthSales = salesList.filter(s => {
          const saleDate = new Date(s.created_at)
          return saleDate.getMonth() === d.getMonth() && saleDate.getFullYear() === d.getFullYear()
        })
        const monthAmount = monthSales.reduce((sum, s) => sum + (Number(s.sale_amount) || 0), 0)
        return {
          month: d.toLocaleDateString("es-ES", { month: "short" }),
          ventas: monthAmount,
          comision: monthAmount * COMMISSION_RATE,
        }
      })
      setSalesData(last6Months)

      setLoading(false)
      setRefreshing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar datos")
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true
    fetchData()
  }, [])

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-MX", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount)

  const copyReferralLink = () => {
    if (profile?.referral_code) {
      navigator.clipboard.writeText(`https://week-chain.com/register?ref=${profile.referral_code}`)
      toast.success("Link de referido copiado")
    }
  }

  const shareReferralLink = () => {
    if (profile?.referral_code && navigator.share) {
      navigator.share({
        title: "WEEK-CHAIN - Invitacion",
        text: "Unete a WEEK-CHAIN con mi codigo de referido",
        url: `https://week-chain.com/register?ref=${profile.referral_code}`,
      })
    } else {
      copyReferralLink()
    }
  }

  const exportToCSV = () => {
    const headers = ["Fecha", "Cliente", "Propiedad", "Monto Venta", "Comision (4%)", "Estado"]
    const rows = sales.map(s => [
      new Date(s.created_at).toLocaleDateString(),
      s.client_name || "N/A",
      s.property_name || "N/A",
      s.amount,
      (s.amount * COMMISSION_RATE).toFixed(2),
      s.status,
    ])
    const csvContent = [headers.join(","), ...rows.map(row => row.map(cell => `"${cell}"`).join(","))].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.setAttribute("href", URL.createObjectURL(blob))
    link.setAttribute("download", `reporte-broker-${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Reporte exportado")
  }

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/30 to-blue-50/20 flex items-center justify-center p-6">
        <div className={`${glass} p-10 text-center`}>
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-sky-500" />
          <p className="mt-4 text-sm text-slate-500 font-medium">Cargando tu dashboard...</p>
        </div>
      </div>
    )
  }

  /* ---------- Error ---------- */
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/30 to-blue-50/20 flex items-center justify-center p-6">
        <div className={`${glass} max-w-md w-full p-8 text-center`}>
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Error al cargar</h3>
          <p className="text-sm text-red-600 mb-6">{error}</p>
          <Button onClick={() => { fetchedRef.current = false; fetchData() }} className="bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl">
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/30 to-blue-50/20">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
              {profile?.display_name?.charAt(0) || "B"}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{profile?.display_name || "Broker"}</h1>
              <p className="text-sm text-slate-500">Intermediario WEEK-CHAIN</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => fetchData()}
              disabled={refreshing}
              variant="outline"
              size="sm"
              className="border-sky-500/30 text-sky-700 hover:bg-sky-50 rounded-xl"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Actualizar
            </Button>
            <Button
              onClick={exportToCSV}
              size="sm"
              className="bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl shadow-[0_4px_16px_rgba(14,165,233,0.3)]"
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Referral Link Card */}
        <div className={`${glass} p-4 sm:p-5`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-700 mb-2">Tu Link de Referido</p>
              <div className="flex items-center gap-2 bg-sky-500/[0.06] rounded-xl p-3 border border-sky-500/15">
                <code className="flex-1 text-sm text-sky-700 font-mono truncate">
                  week-chain.com/register?ref={profile?.referral_code || "..."}
                </code>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={copyReferralLink}
                variant="outline"
                size="sm"
                className="border-sky-500/30 text-sky-700 hover:bg-sky-50 rounded-xl"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copiar
              </Button>
              <Button
                onClick={shareReferralLink}
                size="sm"
                className="bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Compartir
              </Button>
            </div>
          </div>
        </div>

        {/* Commission Rate Banner */}
        <div className="bg-gradient-to-r from-emerald-500/10 to-green-600/5 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-2.5 rounded-xl shadow-lg">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-emerald-700">Tu comision: 4% por cada venta referida</p>
              <p className="text-xs text-slate-500">Ganas automaticamente con cada cliente que compre usando tu codigo</p>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {[
            { label: "Comisiones Totales", value: formatCurrency(stats.totalCommission), sub: `${formatCurrency(stats.totalSales)} en ventas`, icon: DollarSign, iconBg: "bg-gradient-to-br from-emerald-500 to-green-600", trend: stats.thisMonthCommission > 0 },
            { label: "Este Mes", value: formatCurrency(stats.thisMonthCommission), sub: `${formatCurrency(stats.thisMonthSales)} en ventas`, icon: Calendar, iconBg: "bg-gradient-to-br from-sky-500 to-blue-600", trend: true },
            { label: "Clientes Activos", value: stats.activeClients, sub: `${stats.closingRate.toFixed(0)}% tasa cierre`, icon: Users, iconBg: "bg-gradient-to-br from-violet-500 to-purple-600" },
            { label: "Venta Promedio", value: formatCurrency(stats.avgDealSize), sub: `${sales.length} ventas totales`, icon: TrendingUp, iconBg: "bg-gradient-to-br from-amber-500 to-orange-600" },
          ].map((kpi) => (
            <div key={kpi.label} className={`${glassCard} p-4 sm:p-5`}>
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className={`${kpi.iconBg} p-2 sm:p-2.5 rounded-xl shadow-lg`}>
                  <kpi.icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                {kpi.trend && (
                  <span className="flex items-center text-[10px] sm:text-xs text-emerald-600 font-semibold bg-emerald-500/10 px-1.5 sm:px-2 py-0.5 rounded-full">
                    <ArrowUp className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5" />+4%
                  </span>
                )}
              </div>
              <p className="text-lg sm:text-2xl font-bold text-sky-700">{typeof kpi.value === "number" ? kpi.value.toLocaleString() : kpi.value}</p>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1">{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* Chart + Summary */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Chart */}
          <div className={`${glass} p-4 sm:p-5 lg:col-span-2`}>
            <h3 className="text-base font-semibold text-slate-900 mb-4">Rendimiento Mensual</h3>
            <div className="h-[200px] sm:h-[250px]">
              <ChartContainer
                config={{
                  ventas: { label: "Ventas", color: "#0ea5e9" },
                  comision: { label: "Comision", color: "#10b981" },
                }}
                className="h-full w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesData}>
                    <defs>
                      <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorComision" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Area type="monotone" dataKey="ventas" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorVentas)" />
                    <Area type="monotone" dataKey="comision" stroke="#10b981" fillOpacity={1} fill="url(#colorComision)" />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-emerald-500/15 to-green-600/10 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-4">
              <p className="text-emerald-700 font-bold text-2xl">{formatCurrency(stats.totalCommission)}</p>
              <p className="text-sm text-slate-600">Comisiones Ganadas</p>
            </div>
            <div className="bg-gradient-to-r from-sky-500/15 to-blue-600/10 backdrop-blur-xl border border-sky-500/20 rounded-2xl p-4">
              <p className="text-sky-700 font-bold text-2xl">{formatCurrency(stats.totalSales)}</p>
              <p className="text-sm text-slate-600">Volumen de Ventas</p>
            </div>
            <div className="bg-gradient-to-r from-amber-500/15 to-orange-600/10 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-4">
              <p className="text-amber-700 font-bold text-2xl">4%</p>
              <p className="text-sm text-slate-600">Tu Tasa de Comision</p>
            </div>
            {stats.pendingCommission > 0 && (
              <div className="bg-gradient-to-r from-violet-500/15 to-purple-600/10 backdrop-blur-xl border border-violet-500/20 rounded-2xl p-4">
                <p className="text-violet-700 font-bold text-2xl">{formatCurrency(stats.pendingCommission)}</p>
                <p className="text-sm text-slate-600">Comisiones Pendientes</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Sales Table */}
        <div className={`${glass} overflow-hidden`}>
          <div className="p-4 sm:p-5 border-b border-sky-500/10">
            <h3 className="text-base font-semibold text-slate-900">Ventas Recientes</h3>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-sky-500/10 hover:bg-transparent">
                  <TableHead className="text-slate-600 font-semibold text-xs sm:text-sm">Fecha</TableHead>
                  <TableHead className="text-slate-600 font-semibold text-xs sm:text-sm hidden sm:table-cell">Cliente</TableHead>
                  <TableHead className="text-slate-600 font-semibold text-xs sm:text-sm">Monto</TableHead>
                  <TableHead className="text-slate-600 font-semibold text-xs sm:text-sm">Comision</TableHead>
                  <TableHead className="text-slate-600 font-semibold text-xs sm:text-sm">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.length > 0 ? (
                  sales.slice(0, 10).map((sale) => (
                    <TableRow key={sale.id} className="border-sky-500/10 hover:bg-sky-500/[0.04]">
                      <TableCell className="text-sm text-slate-700">
                        {new Date(sale.created_at).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-slate-700">
                        {sale.client_name || "Cliente"}
                      </TableCell>
                      <TableCell className="text-sm font-semibold text-slate-900">
                        {formatCurrency(sale.amount)}
                      </TableCell>
                      <TableCell className="text-sm font-semibold text-emerald-600">
                        {formatCurrency(sale.amount * COMMISSION_RATE)}
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          sale.status === "completed" || sale.status === "paid"
                            ? "bg-emerald-500/20 text-emerald-700 border-emerald-500/30 text-[10px] sm:text-xs"
                            : "bg-amber-500/20 text-amber-700 border-amber-500/30 text-[10px] sm:text-xs"
                        }>
                          {sale.status === "completed" || sale.status === "paid" ? "Pagado" : "Pendiente"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12">
                      <Briefcase className="h-10 w-10 mx-auto mb-3 text-sky-300" />
                      <p className="text-sm font-medium text-slate-500">Aun no tienes ventas</p>
                      <p className="text-xs text-slate-400 mt-1">Comparte tu link de referido para empezar a ganar</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link href="/dashboard/broker/card">
            <div className={`${glassCard} p-4 text-center cursor-pointer`}>
              <CreditCard className="h-6 w-6 text-sky-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">Mi Tarjeta</p>
            </div>
          </Link>
          <Link href="/dashboard/broker/clients">
            <div className={`${glassCard} p-4 text-center cursor-pointer`}>
              <Users className="h-6 w-6 text-sky-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">Mis Clientes</p>
            </div>
          </Link>
          <Link href="/dashboard/broker/materials">
            <div className={`${glassCard} p-4 text-center cursor-pointer`}>
              <Download className="h-6 w-6 text-sky-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">Materiales</p>
            </div>
          </Link>
          <Link href="/dashboard/broker/support">
            <div className={`${glassCard} p-4 text-center cursor-pointer`}>
              <ExternalLink className="h-6 w-6 text-sky-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">Soporte</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function BrokerDashboard() {
  return (
    <RoleGuard allowedRoles={["broker", "admin"]}>
      <BrokerDashboardContent />
    </RoleGuard>
  )
}
