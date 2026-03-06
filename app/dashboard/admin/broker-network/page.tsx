"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Briefcase, Users, DollarSign, TrendingUp, Search, Download, Eye, Mail,
  RefreshCw, Loader2, AlertCircle, CheckCircle2, Clock, ArrowUpRight, Copy, ExternalLink
} from "lucide-react"
import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"

/* ---------- Glass utility classes ---------- */
const glass = "bg-gradient-to-br from-sky-500/[0.08] to-blue-600/[0.04] backdrop-blur-xl border border-sky-500/20 rounded-2xl shadow-[0_4px_24px_rgba(14,165,233,0.1)]"
const glassHover = "hover:shadow-[0_8px_32px_rgba(14,165,233,0.18)] hover:border-sky-400/30 transition-all duration-300"
const glassCard = `${glass} ${glassHover}`

/* ---------- Types ---------- */
interface Broker {
  id: string
  user_id: string
  referral_code: string
  status: string
  created_at: string
  total_sales: number
  total_commission: number
  users?: {
    full_name: string
    email: string
  }
}

interface BrokerStats {
  totalBrokers: number
  activeBrokers: number
  pendingBrokers: number
  totalSalesVolume: number
  totalCommissionsPaid: number
  totalCommissionsPending: number
  avgSalesPerBroker: number
}

const defaultStats: BrokerStats = {
  totalBrokers: 0,
  activeBrokers: 0,
  pendingBrokers: 0,
  totalSalesVolume: 0,
  totalCommissionsPaid: 0,
  totalCommissionsPending: 0,
  avgSalesPerBroker: 0,
}

export default function BrokerNetworkPage() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [brokers, setBrokers] = useState<Broker[]>([])
  const [stats, setStats] = useState<BrokerStats>(defaultStats)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "active" | "pending">("all")
  const fetchedRef = useRef(false)

  const fetchData = async () => {
    try {
      setRefreshing(true)
      setError(null)
      const supabase = createClient()

      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData?.session) {
        setError("Sesion no valida")
        setLoading(false)
        setRefreshing(false)
        return
      }

      // Fetch brokers from intermediary_profiles with user info
      const { data: brokersData, error: brokersError } = await supabase
        .from("intermediary_profiles")
        .select(`
          id,
          user_id,
          referral_code,
          status,
          created_at,
          total_sales,
          total_commission,
          users!intermediary_profiles_user_id_fkey (
            full_name,
            email
          )
        `)
        .order("created_at", { ascending: false })

      if (brokersError) {
        // Fallback if join fails
        const { data: fallbackData } = await supabase
          .from("intermediary_profiles")
          .select("*")
          .order("created_at", { ascending: false })
        
        setBrokers(fallbackData || [])
      } else {
        setBrokers(brokersData || [])
      }

      const brokersList = brokersData || []
      const activeBrokers = brokersList.filter(b => b.status === "active" || b.status === "approved")
      const pendingBrokers = brokersList.filter(b => b.status === "pending")
      const totalSales = brokersList.reduce((sum, b) => sum + (Number(b.total_sales) || 0), 0)
      const totalCommPaid = brokersList.filter(b => b.status === "active").reduce((sum, b) => sum + (Number(b.total_commission) || 0), 0)
      const totalCommPending = brokersList.filter(b => b.status === "pending").reduce((sum, b) => sum + (Number(b.total_commission) || 0), 0)

      setStats({
        totalBrokers: brokersList.length,
        activeBrokers: activeBrokers.length,
        pendingBrokers: pendingBrokers.length,
        totalSalesVolume: totalSales,
        totalCommissionsPaid: totalCommPaid,
        totalCommissionsPending: totalCommPending,
        avgSalesPerBroker: activeBrokers.length > 0 ? totalSales / activeBrokers.length : 0,
      })

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

  const copyReferralLink = (code: string) => {
    navigator.clipboard.writeText(`https://week-chain.com/register?ref=${code}`)
    toast.success("Link copiado al portapapeles")
  }

  const exportToCSV = () => {
    const headers = ["Nombre", "Email", "Codigo Referido", "Status", "Ventas Totales", "Comisiones (4%)", "Fecha Registro"]
    const rows = filteredBrokers.map(b => [
      b.users?.full_name || "N/A",
      b.users?.email || "N/A",
      b.referral_code || "N/A",
      b.status,
      b.total_sales || 0,
      ((b.total_sales || 0) * 0.04).toFixed(2),
      new Date(b.created_at).toLocaleDateString(),
    ])
    const csvContent = [headers.join(","), ...rows.map(row => row.map(cell => `"${cell}"`).join(","))].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.setAttribute("href", URL.createObjectURL(blob))
    link.setAttribute("download", `brokers-${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Reporte exportado")
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-MX", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount)

  const filteredBrokers = brokers.filter(b => {
    const matchesSearch = 
      (b.users?.full_name?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (b.users?.email?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (b.referral_code?.toLowerCase() || "").includes(search.toLowerCase())
    
    if (filter === "active") return matchesSearch && (b.status === "active" || b.status === "approved")
    if (filter === "pending") return matchesSearch && b.status === "pending"
    return matchesSearch
  })

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className={`${glass} p-10 text-center`}>
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-sky-500" />
          <p className="mt-4 text-sm text-slate-500 font-medium">Cargando red de brokers...</p>
        </div>
      </div>
    )
  }

  /* ---------- Error ---------- */
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-6">
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Red de Brokers</h1>
          <p className="text-sm text-slate-500 mt-0.5">Gestion de intermediarios - Comision fija 4%</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={() => fetchData()}
            disabled={refreshing}
            variant="outline"
            className="border-sky-500/30 text-sky-700 hover:bg-sky-50 rounded-xl text-sm"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          <Button
            onClick={exportToCSV}
            className="bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-sky-400 hover:to-blue-500 rounded-xl shadow-[0_4px_16px_rgba(14,165,233,0.3)] text-sm"
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Commission Info Banner */}
      <div className="bg-gradient-to-r from-emerald-500/10 to-green-600/5 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-2 rounded-xl shadow-lg">
            <DollarSign className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-emerald-700">Comision Unica: 4% por venta referida</p>
            <p className="text-xs text-slate-500">Todos los brokers registrados reciben el mismo porcentaje sin niveles ni tiers</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {[
          { label: "Total Brokers", value: stats.totalBrokers, icon: Users, iconBg: "bg-gradient-to-br from-sky-500 to-blue-600" },
          { label: "Brokers Activos", value: stats.activeBrokers, icon: CheckCircle2, iconBg: "bg-gradient-to-br from-emerald-500 to-green-600" },
          { label: "Volumen Ventas", value: formatCurrency(stats.totalSalesVolume), icon: TrendingUp, iconBg: "bg-gradient-to-br from-violet-500 to-purple-600", isString: true },
          { label: "Comisiones (4%)", value: formatCurrency(stats.totalSalesVolume * 0.04), icon: DollarSign, iconBg: "bg-gradient-to-br from-amber-500 to-orange-600", isString: true },
        ].map((kpi) => (
          <div key={kpi.label} className={`${glassCard} p-4 sm:p-5`}>
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className={`${kpi.iconBg} p-2 sm:p-2.5 rounded-xl shadow-lg`}>
                <kpi.icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-sky-700">{kpi.isString ? kpi.value : (kpi.value as number).toLocaleString()}</p>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Pending Approvals Alert */}
      {stats.pendingBrokers > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-600/5 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-amber-600" />
              <div>
                <p className="font-semibold text-amber-700">{stats.pendingBrokers} broker(s) pendiente(s) de aprobacion</p>
                <p className="text-xs text-slate-500">Revisa las solicitudes para activar nuevos intermediarios</p>
              </div>
            </div>
            <Button
              onClick={() => setFilter("pending")}
              variant="outline"
              size="sm"
              className="border-amber-500/30 text-amber-700 hover:bg-amber-50 rounded-xl text-xs"
            >
              Ver pendientes
            </Button>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className={`${glass} p-4`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar por nombre, email o codigo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-sky-500/[0.05] border-sky-500/20 rounded-xl focus:border-sky-500/40 focus:ring-sky-500/20"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "active", "pending"] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(f)}
                className={filter === f 
                  ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl text-xs"
                  : "border-sky-500/20 text-slate-600 hover:bg-sky-50 rounded-xl text-xs"
                }
              >
                {f === "all" ? "Todos" : f === "active" ? "Activos" : "Pendientes"}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Brokers Table */}
      <div className={`${glass} overflow-hidden`}>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-sky-500/10 hover:bg-transparent">
                <TableHead className="text-slate-600 font-semibold text-xs sm:text-sm">Broker</TableHead>
                <TableHead className="text-slate-600 font-semibold text-xs sm:text-sm hidden sm:table-cell">Codigo</TableHead>
                <TableHead className="text-slate-600 font-semibold text-xs sm:text-sm">Status</TableHead>
                <TableHead className="text-slate-600 font-semibold text-xs sm:text-sm text-right">Ventas</TableHead>
                <TableHead className="text-slate-600 font-semibold text-xs sm:text-sm text-right hidden md:table-cell">Comision 4%</TableHead>
                <TableHead className="text-slate-600 font-semibold text-xs sm:text-sm text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBrokers.length > 0 ? (
                filteredBrokers.map((broker) => (
                  <TableRow key={broker.id} className="border-sky-500/10 hover:bg-sky-500/[0.04]">
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{broker.users?.full_name || "Sin nombre"}</p>
                        <p className="text-xs text-slate-500 truncate max-w-[150px] sm:max-w-none">{broker.users?.email || "Sin email"}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex items-center gap-1.5">
                        <code className="text-xs bg-sky-500/10 px-2 py-1 rounded-lg text-sky-700 font-mono">
                          {broker.referral_code || "N/A"}
                        </code>
                        {broker.referral_code && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyReferralLink(broker.referral_code)}
                            className="h-7 w-7 p-0 hover:bg-sky-500/10"
                          >
                            <Copy className="h-3.5 w-3.5 text-sky-600" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        broker.status === "active" || broker.status === "approved"
                          ? "bg-emerald-500/20 text-emerald-700 border-emerald-500/30 text-[10px] sm:text-xs"
                          : broker.status === "pending"
                          ? "bg-amber-500/20 text-amber-700 border-amber-500/30 text-[10px] sm:text-xs"
                          : "bg-slate-500/20 text-slate-700 border-slate-500/30 text-[10px] sm:text-xs"
                      }>
                        {broker.status === "active" || broker.status === "approved" ? "Activo" : broker.status === "pending" ? "Pendiente" : broker.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-semibold text-slate-900 text-sm">{formatCurrency(broker.total_sales || 0)}</span>
                    </TableCell>
                    <TableCell className="text-right hidden md:table-cell">
                      <span className="font-semibold text-emerald-600 text-sm">{formatCurrency((broker.total_sales || 0) * 0.04)}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-sky-500/10"
                        >
                          <Eye className="h-4 w-4 text-sky-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-sky-500/10"
                        >
                          <Mail className="h-4 w-4 text-sky-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <Briefcase className="h-10 w-10 mx-auto mb-3 text-sky-300" />
                    <p className="text-sm font-medium text-slate-500">No se encontraron brokers</p>
                    <p className="text-xs text-slate-400 mt-1">Ajusta los filtros o espera nuevos registros</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Summary Footer */}
      <div className={`${glass} p-4`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm">
          <div className="text-slate-600">
            Mostrando <span className="font-semibold text-slate-900">{filteredBrokers.length}</span> de <span className="font-semibold text-slate-900">{brokers.length}</span> brokers
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Venta promedio: <span className="font-semibold text-sky-700">{formatCurrency(stats.avgSalesPerBroker)}</span></span>
          </div>
        </div>
      </div>
    </div>
  )
}
