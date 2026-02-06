"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  CheckCircle,
  XCircle,
  ArrowLeft,
  AlertCircle,
  Wallet,
  Shield,
  Percent,
  DollarSign,
  Lock,
  Unlock,
  Activity,
  Loader2,
} from "lucide-react"
import { RoleGuard } from "@/components/role-guard"
import { Navbar } from "@/components/navbar"
import Link from "next/link"

interface VafiPosition {
  id: string
  user_id: string
  certificate_id: string
  wrapped_amount: number
  loan_amount_usdc: number
  interest_rate: number
  ltv_ratio: number
  health_factor: number
  status: string
  created_at: string
  due_date: string
}

interface PoolStats {
  total_liquidity: number
  total_borrowed: number
  utilization_rate: number
  base_apy: number
}

export default function VaFiDashboard() {
  return (
    <RoleGuard allowedRoles={["vafi_manager", "admin", "member"]}>
      <VaFiDashboardContent />
    </RoleGuard>
  )
}

function VaFiDashboardContent() {
  const [positions, setPositions] = useState<VafiPosition[]>([])
  const [poolStats, setPoolStats] = useState<PoolStats>({
    total_liquidity: 0,
    total_borrowed: 0,
    utilization_rate: 0,
    base_apy: 8.5,
  })
  const [stats, setStats] = useState({
    activePositions: 0,
    totalBorrowed: 0,
    totalCollateral: 0,
    avgHealthFactor: 0,
    atRisk: 0,
    repaid: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const supabase = createClient()

    const [positionsRes, poolRes, loansRes] = await Promise.all([
      supabase.from("vafi_positions").select("*").order("created_at", { ascending: false }),
      supabase.from("vafi_liquidity_pool").select("*").limit(1).single(),
      supabase.from("vafi_loans").select("*").order("created_at", { ascending: false }),
    ])

    const allPositions = positionsRes.data || []
    const loans = loansRes.data || []
    setPositions(allPositions)

    if (poolRes.data) {
      setPoolStats({
        total_liquidity: poolRes.data.total_liquidity || 0,
        total_borrowed: poolRes.data.total_borrowed || 0,
        utilization_rate: poolRes.data.utilization_rate || 0,
        base_apy: poolRes.data.base_apy || 8.5,
      })
    }

    const activePositions = allPositions.filter((p) => p.status === "active").length
    const totalBorrowed = allPositions
      .filter((p) => p.status === "active")
      .reduce((sum, p) => sum + (p.loan_amount_usdc || 0), 0)
    const totalCollateral = allPositions
      .filter((p) => p.status === "active")
      .reduce((sum, p) => sum + (p.wrapped_amount || 0), 0)
    const activeOnes = allPositions.filter((p) => p.status === "active")
    const avgHF =
      activeOnes.length > 0
        ? activeOnes.reduce((sum, p) => sum + (p.health_factor || 0), 0) / activeOnes.length
        : 0
    const atRisk = allPositions.filter(
      (p) => (p.health_factor || 999) < 1.2 && p.status === "active"
    ).length
    const repaid = loans.filter((l: any) => l.status === "repaid").length

    setStats({ activePositions, totalBorrowed, totalCollateral, avgHealthFactor: avgHF, atRisk, repaid })
    setLoading(false)
  }

  const getHealthColor = (hf: number) => {
    if (hf >= 1.5) return "text-teal-600 bg-teal-50 border-teal-200"
    if (hf >= 1.2) return "text-amber-600 bg-amber-50 border-amber-200"
    return "text-red-600 bg-red-50 border-red-200"
  }

  const getHealthLabel = (hf: number) => {
    if (hf >= 1.5) return "Saludable"
    if (hf >= 1.2) return "Precaucion"
    return "En Riesgo"
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-sky-500 text-white">Activo</Badge>
      case "repaid":
        return <Badge className="bg-teal-500 text-white">Pagado</Badge>
      case "liquidated":
        return <Badge className="bg-red-500 text-white">Liquidado</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen flex-col overflow-hidden bg-gradient-to-br from-sky-50 via-cyan-50 to-teal-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="glass-card rounded-2xl p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-sky-500 mx-auto mb-4" />
            <p className="text-slate-600">Cargando VA-FI...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gradient-to-br from-sky-50 via-cyan-50 to-teal-50">
      <Navbar />
      <div className="flex-1 overflow-y-auto pt-16">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 text-balance">
                VA-FI
                <sup className="text-xs ml-1 text-sky-500">TM</sup>
              </h1>
              <p className="text-slate-600 mt-1">Prestamos respaldados por Smart Vacational Certificates</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button variant="outline" className="glass-input bg-transparent">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>

          {/* Liquidity Pool Stats */}
          <Card className="glass-card rounded-2xl border-sky-100 overflow-hidden">
            <div className="bg-gradient-to-r from-sky-500 to-cyan-500 p-6">
              <h2 className="text-xl font-bold text-white mb-1">Pool de Liquidez VA-FI</h2>
              <p className="text-sky-100 text-sm">Protocolo de prestamos descentralizado para certificados vacacionales</p>
            </div>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Liquidez Total</p>
                  <p className="text-2xl font-bold text-slate-900">
                    ${poolStats.total_liquidity.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-400">USDC disponible</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Total Prestado</p>
                  <p className="text-2xl font-bold text-slate-900">
                    ${poolStats.total_borrowed.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-400">USDC en prestamos</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Utilizacion</p>
                  <p className="text-2xl font-bold text-sky-600">
                    {poolStats.utilization_rate.toFixed(1)}%
                  </p>
                  <p className="text-xs text-slate-400">del pool</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">APY Base</p>
                  <p className="text-2xl font-bold text-teal-600">{poolStats.base_apy}%</p>
                  <p className="text-xs text-slate-400">para proveedores</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Position Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card className="glass-card rounded-xl border-sky-100 p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-sky-100 rounded-lg">
                  <Activity className="h-4 w-4 text-sky-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{stats.activePositions}</p>
              <p className="text-xs text-slate-500">Posiciones Activas</p>
            </Card>
            <Card className="glass-card rounded-xl border-sky-100 p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-cyan-100 rounded-lg">
                  <DollarSign className="h-4 w-4 text-cyan-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">${stats.totalBorrowed.toLocaleString()}</p>
              <p className="text-xs text-slate-500">Total Prestado</p>
            </Card>
            <Card className="glass-card rounded-xl border-sky-100 p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-teal-100 rounded-lg">
                  <Lock className="h-4 w-4 text-teal-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">${stats.totalCollateral.toLocaleString()}</p>
              <p className="text-xs text-slate-500">Colateral Total</p>
            </Card>
            <Card className="glass-card rounded-xl border-sky-100 p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Shield className="h-4 w-4 text-emerald-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{stats.avgHealthFactor.toFixed(2)}</p>
              <p className="text-xs text-slate-500">Health Factor Prom.</p>
            </Card>
            <Card className="glass-card rounded-xl border-sky-100 p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{stats.atRisk}</p>
              <p className="text-xs text-slate-500">En Riesgo</p>
            </Card>
            <Card className="glass-card rounded-xl border-sky-100 p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{stats.repaid}</p>
              <p className="text-xs text-slate-500">Liquidados</p>
            </Card>
          </div>

          {/* Positions Table */}
          <Card className="glass-card rounded-2xl border-sky-100">
            <CardHeader>
              <CardTitle className="text-slate-900">Posiciones VA-FI</CardTitle>
              <CardDescription>Prestamos activos respaldados por certificados</CardDescription>
            </CardHeader>
            <CardContent>
              {positions.length === 0 ? (
                <div className="text-center py-12">
                  <Wallet className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No hay posiciones activas</h3>
                  <p className="text-slate-500 mb-6 max-w-md mx-auto">
                    Usa tus Smart Vacational Certificates como colateral para obtener prestamos USDC instantaneos.
                  </p>
                  <Button className="bg-sky-500 hover:bg-sky-600 text-white">
                    <Lock className="h-4 w-4 mr-2" />
                    Crear Posicion VA-FI
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {positions.map((pos) => (
                    <div
                      key={pos.id}
                      className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-sky-100 hover:border-sky-200 transition-colors gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-sky-50 rounded-xl">
                          <Lock className="h-5 w-5 text-sky-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            Posicion #{pos.id.slice(0, 8)}
                          </p>
                          <p className="text-sm text-slate-500">
                            {new Date(pos.created_at).toLocaleDateString("es-MX")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 flex-wrap">
                        <div className="text-center">
                          <p className="text-xs text-slate-500">Prestamo</p>
                          <p className="font-bold text-slate-900">
                            ${(pos.loan_amount_usdc || 0).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-slate-500">Colateral</p>
                          <p className="font-bold text-slate-900">
                            ${(pos.wrapped_amount || 0).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-slate-500">LTV</p>
                          <p className="font-bold text-slate-900">
                            {((pos.ltv_ratio || 0) * 100).toFixed(0)}%
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-slate-500">Tasa</p>
                          <p className="font-bold text-slate-900">
                            {(pos.interest_rate || 0).toFixed(1)}%
                          </p>
                        </div>
                        <div className={`px-3 py-1.5 rounded-lg border ${getHealthColor(pos.health_factor || 0)}`}>
                          <p className="text-xs font-medium">HF: {(pos.health_factor || 0).toFixed(2)}</p>
                          <p className="text-[10px]">{getHealthLabel(pos.health_factor || 0)}</p>
                        </div>
                        {getStatusBadge(pos.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
