"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, TrendingUp, Activity, BarChart3 } from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function CapacityRiskPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [capacityStatus, setCapacityStatus] = useState<any>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const supabase = createClient()

      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        router.push("/auth")
        return
      }

      const { data: adminUser } = await supabase.from("admin_users").select("*").eq("user_id", session.user.id).single()

      if (!adminUser || adminUser.status !== "active") {
        router.push("/dashboard")
        return
      }

      // Fetch latest capacity status
      const response = await fetch("/api/admin/capacity/global-status")
      const data = await response.json()

      setCapacityStatus(data)
      setLoading(false)
    } catch (error) {
      console.error("Error loading capacity data:", error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-600">Cargando datos de capacidad...</p>
        </div>
      </div>
    )
  }

  const systemStatus = capacityStatus?.globalMetrics?.systemStatus || "UNKNOWN"
  const utilization = capacityStatus?.globalMetrics?.currentUtilization || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Capacidad & Riesgo</h1>
          <p className="text-slate-600">Proyecciones de capacidad y control de riesgo operacional</p>
        </div>

        {/* System Semaphore */}
        <Card
          className={`border-4 ${
            systemStatus === "RED"
              ? "border-red-500 bg-red-50"
              : systemStatus === "YELLOW"
                ? "border-yellow-500 bg-yellow-50"
                : "border-green-500 bg-green-50"
          }`}
        >
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">SEMÁFORO DEL SISTEMA</p>
                <p className="text-6xl font-bold mt-2">{systemStatus}</p>
                <p className="text-lg text-slate-700 mt-2">Utilización: {utilization.toFixed(1)}%</p>
                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <div>🟢 VERDE: &lt;50% - Ventas abiertas</div>
                  <div>🟡 AMARILLO: 50-65% - Monitoreo activo</div>
                  <div>🔴 ROJO: &gt;65% - Stop-sale automático</div>
                </div>
              </div>
              <div className="text-right">
                <Activity className="h-24 w-24 text-slate-400 mb-4" />
                <Badge
                  className={`text-lg px-4 py-2 ${
                    systemStatus === "RED" ? "bg-red-600" : systemStatus === "YELLOW" ? "bg-yellow-600" : "bg-green-600"
                  }`}
                >
                  {systemStatus === "RED"
                    ? "DETENER VENTAS"
                    : systemStatus === "YELLOW"
                      ? "PRECAUCIÓN"
                      : "OPERACIÓN NORMAL"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Capacity Metrics */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Supply Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">
                {capacityStatus?.globalMetrics?.totalSupplyWeeks || 0}
              </div>
              <p className="text-sm text-slate-600 mt-1">Semanas disponibles</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Capacidad Segura
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">
                {capacityStatus?.globalMetrics?.safeCapacityWeeks || 0}
              </div>
              <p className="text-sm text-slate-600 mt-1">70% del supply (threshold)</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Propiedades Activas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">
                {capacityStatus?.globalMetrics?.totalSupplyProperties || 0}
              </div>
              <p className="text-sm text-slate-600 mt-1">Destinos operando</p>
            </CardContent>
          </Card>
        </div>

        {/* Certificates by Tier */}
        <Card>
          <CardHeader>
            <CardTitle>Certificados Activos por Tier</CardTitle>
            <CardDescription>Distribución actual de certificados vendidos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              {["silver", "gold", "platinum", "signature"].map((tier) => (
                <div key={tier} className="p-4 border-2 border-slate-200 rounded-lg">
                  <p className="text-sm font-medium text-slate-600 uppercase">{tier}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {capacityStatus?.certificatesActive?.[tier] || 0}
                  </p>
                  <Badge className={capacityStatus?.stopSaleFlags?.[tier] ? "bg-red-600" : "bg-green-600"}>
                    {capacityStatus?.stopSaleFlags?.[tier] ? "DETENIDO" : "Activo"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
