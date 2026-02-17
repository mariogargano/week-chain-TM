"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { RoleGuard } from "@/components/role-guard"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, TrendingUp, Calendar, Download, Filter, Building2 } from "lucide-react"

export default function OwnerSalesPage() {
  return (
    <RoleGuard allowedRoles={["property_owner", "admin"]}>
      <OwnerSalesContent />
    </RoleGuard>
  )
}

function OwnerSalesContent() {
  const router = useRouter()
  const [confirmedStays, setConfirmedStays] = useState<any[]>([])
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProperty, setSelectedProperty] = useState<string>("all")
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalStays: 0,
    upcomingStays: 0,
    occupancyRate: 0,
  })

  useEffect(() => {
    fetchData()
  }, [selectedProperty])

  const fetchData = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data: propsData } = await supabase
      .from("supply_properties")
      .select("id, name, country, supply_weeks_per_year, status")
      .eq("status", "active")

    if (propsData) {
      setProperties(propsData)
    }

    let staysQuery = supabase
      .from("confirmed_reservations")
      .select("*, supply_properties(name, country)")
      .order("check_in_date", { ascending: false })

    if (selectedProperty !== "all") {
      staysQuery = staysQuery.eq("property_id", selectedProperty)
    }

    const { data: staysData } = await staysQuery

    if (staysData) {
      setConfirmedStays(staysData)

      const now = new Date()
      const upcomingCount = staysData.filter((s) => new Date(s.check_in_date) > now).length
      const totalRevenue = staysData.length * 0 // No direct revenue - this is for operational visibility
      const occupancyRate =
        propsData && propsData.length > 0
          ? Math.round((staysData.length / (propsData[0].supply_weeks_per_year * propsData.length)) * 100)
          : 0

      setStats({
        totalRevenue,
        totalStays: staysData.length,
        upcomingStays: upcomingCount,
        occupancyRate,
      })
    }

    setLoading(false)
  }

  const exportToCSV = () => {
    const headers = ["Fecha Check-In", "Fecha Check-Out", "Propiedad", "Ubicación", "Estado"]
    const rows = confirmedStays.map((stay) => [
      new Date(stay.check_in_date).toLocaleDateString("es-ES"),
      new Date(stay.check_out_date).toLocaleDateString("es-ES"),
      stay.supply_properties?.name || "N/A",
      stay.supply_properties?.country || "N/A",
      stay.status,
    ])

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `estancias-confirmadas-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  return (
    <>
      <Navbar user={true} />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push("/dashboard/owner")}
              className="bg-white/90 backdrop-blur-xl"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
                Estancias Confirmadas
              </h1>
              <p className="text-slate-600">Visibilidad operacional de reservas en tus propiedades</p>
            </div>
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-purple-200/50 bg-white/90 backdrop-blur-xl shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Ocupación Total</CardTitle>
                <Building2 className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{stats.occupancyRate}%</div>
                <p className="text-xs text-slate-500 mt-1">Tasa de uso</p>
              </CardContent>
            </Card>

            <Card className="border-purple-200/50 bg-white/90 backdrop-blur-xl shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Total Estancias</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{stats.totalStays}</div>
                <p className="text-xs text-slate-500 mt-1">confirmadas</p>
              </CardContent>
            </Card>

            <Card className="border-purple-200/50 bg-white/90 backdrop-blur-xl shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Próximas</CardTitle>
                <Calendar className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{stats.upcomingStays}</div>
                <p className="text-xs text-slate-500 mt-1">pendientes</p>
              </CardContent>
            </Card>

            <Card className="border-purple-200/50 bg-white/90 backdrop-blur-xl shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Propiedades</CardTitle>
                <Building2 className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{properties.length}</div>
                <p className="text-xs text-slate-500 mt-1">activas</p>
              </CardContent>
            </Card>
          </div>

          {/* Filter */}
          <Card className="border-purple-200/50 bg-white/90 backdrop-blur-xl shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Filter className="h-5 w-5 text-slate-600" />
                <select
                  value={selectedProperty}
                  onChange={(e) => setSelectedProperty(e.target.value)}
                  className="flex h-10 w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="all">Todas las propiedades</option>
                  {properties.map((prop) => (
                    <option key={prop.id} value={prop.id}>
                      {prop.name}
                    </option>
                  ))}
                </select>
              </div>
            </CardHeader>
          </Card>

          {/* Stays Table */}
          <Card className="border-purple-200/50 bg-white/90 backdrop-blur-xl shadow-lg">
            <CardHeader>
              <CardTitle>Reservas Detalladas</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex min-h-[200px] items-center justify-center">
                  <p className="text-slate-600">Cargando estancias...</p>
                </div>
              ) : confirmedStays.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Check-In</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Check-Out</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Propiedad</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Ubicación</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {confirmedStays.map((stay) => (
                        <tr key={stay.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-4 text-sm text-slate-700">
                            {new Date(stay.check_in_date).toLocaleDateString("es-ES")}
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-700">
                            {new Date(stay.check_out_date).toLocaleDateString("es-ES")}
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-700">{stay.supply_properties?.name || "N/A"}</td>
                          <td className="py-3 px-4 text-sm text-slate-700">
                            {stay.supply_properties?.country || "N/A"}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge className="bg-green-100 text-green-700">Confirmada</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex min-h-[200px] items-center justify-center">
                  <div className="text-center">
                    <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600">No hay estancias confirmadas aún</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
