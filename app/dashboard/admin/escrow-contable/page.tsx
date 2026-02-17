"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Clock, CheckCircle, RefreshCw, Search, Users, AlertCircle } from "lucide-react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { createClient } from "@/lib/supabase/client"

interface EscrowRecord {
  id: string
  property_name: string
  customer_name: string
  customer_email: string
  season: string
  quantity: number
  amount_mxn: number
  amount_usd: number
  status: "held" | "released" | "refunded"
  created_at: string
}

export default function EscrowContablePage() {
  const [escrowRecords, setEscrowRecords] = useState<EscrowRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    loadEscrowRecords()
  }, [])

  async function loadEscrowRecords() {
    const supabase = createClient()
    const { data, error } = await supabase.from("escrow_contable").select("*").order("created_at", { ascending: false })

    if (!error && data) {
      setEscrowRecords(data)
    }
    setLoading(false)
  }

  const filteredRecords = escrowRecords.filter((record) => {
    const matchesSearch =
      record.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.property_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || record.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalHeld = escrowRecords.filter((r) => r.status === "held").reduce((sum, r) => sum + r.amount_mxn, 0)

  const totalReleased = escrowRecords.filter((r) => r.status === "released").reduce((sum, r) => sum + r.amount_mxn, 0)

  const totalRefunded = escrowRecords.filter((r) => r.status === "refunded").reduce((sum, r) => sum + r.amount_mxn, 0)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "held":
        return <Badge className="bg-amber-100 text-amber-700">Retenido</Badge>
      case "released":
        return <Badge className="bg-emerald-100 text-emerald-700">Liberado</Badge>
      case "refunded":
        return <Badge className="bg-rose-100 text-rose-700">Devuelto</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getSeasonLabel = (season: string) => {
    switch (season) {
      case "high":
        return "Alta"
      case "medium":
        return "Media"
      case "low":
        return "Baja"
      default:
        return season
    }
  }

  async function handleReleaseFunds(recordId: string) {
    if (!confirm("¿Estás seguro de liberar estos fondos? Esta acción indica que se vendieron las 48 semanas.")) return

    const supabase = createClient()
    await supabase
      .from("escrow_contable")
      .update({ status: "released", released_at: new Date().toISOString() })
      .eq("id", recordId)

    loadEscrowRecords()
  }

  async function handleRefund(recordId: string) {
    const reason = prompt("Motivo de la devolución (no se vendieron las 48 semanas):")
    if (!reason) return

    const supabase = createClient()
    await supabase
      .from("escrow_contable")
      .update({
        status: "refunded",
        refunded_at: new Date().toISOString(),
        refund_reason: reason,
      })
      .eq("id", recordId)

    loadEscrowRecords()
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Protección Bancaria SAPI</h1>
            <p className="text-slate-600 mt-1">
              Gestión de fondos en cuentas bancarias dedicadas hasta la venta de 48 semanas
            </p>

            <Card className="mt-4 border-amber-200 bg-amber-50">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-900">
                    <p className="font-semibold mb-1">Sistema de Protección Bancaria</p>
                    <p>
                      Los fondos se depositan en cuentas bancarias corporativas dedicadas de WEEK-CHAIN SAPI de CV, con
                      registro contable segregado por serie de propiedad conforme a la estructura legal de la empresa.
                      Los fondos se liberan al vendedor cuando se venden las 48 semanas, o se devuelven al comprador si
                      no se completa la venta.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-100 rounded-xl">
                    <Clock className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Fondos Retenidos</p>
                    <p className="text-2xl font-bold">${totalHeld.toLocaleString()}</p>
                    <p className="text-xs text-slate-400">MXN</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-100 rounded-xl">
                    <CheckCircle className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Fondos Liberados</p>
                    <p className="text-2xl font-bold">${totalReleased.toLocaleString()}</p>
                    <p className="text-xs text-slate-400">MXN</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-rose-100 rounded-xl">
                    <RefreshCw className="h-6 w-6 text-rose-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Fondos Devueltos</p>
                    <p className="text-2xl font-bold">${totalRefunded.toLocaleString()}</p>
                    <p className="text-xs text-slate-400">MXN</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Total Transacciones</p>
                    <p className="text-2xl font-bold">{escrowRecords.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Buscar por nombre, email o propiedad..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  {["all", "held", "released", "refunded"].map((status) => (
                    <Button
                      key={status}
                      variant={statusFilter === status ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStatusFilter(status)}
                    >
                      {status === "all"
                        ? "Todos"
                        : status === "held"
                          ? "Retenidos"
                          : status === "released"
                            ? "Liberados"
                            : "Devueltos"}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Records Table */}
          <Card>
            <CardHeader>
              <CardTitle>Registros de Escrow</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Cargando...</div>
              ) : filteredRecords.length === 0 ? (
                <div className="text-center py-8 text-slate-500">No se encontraron registros</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold text-slate-600">Cliente</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-600">Propiedad</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-600">Temporada</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-600">Semanas</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-600">Monto MXN</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-600">Estado</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-600">Fecha</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-600">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecords.map((record) => (
                        <tr key={record.id} className="border-b hover:bg-slate-50">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{record.customer_name}</p>
                              <p className="text-sm text-slate-500">{record.customer_email}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">{record.property_name}</td>
                          <td className="py-3 px-4">{getSeasonLabel(record.season)}</td>
                          <td className="py-3 px-4">{record.quantity}</td>
                          <td className="py-3 px-4 font-semibold">${record.amount_mxn.toLocaleString()}</td>
                          <td className="py-3 px-4">{getStatusBadge(record.status)}</td>
                          <td className="py-3 px-4 text-sm text-slate-500">
                            {new Date(record.created_at).toLocaleDateString("es-MX")}
                          </td>
                          <td className="py-3 px-4">
                            {record.status === "held" && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-emerald-600 bg-transparent"
                                  onClick={() => handleReleaseFunds(record.id)}
                                >
                                  Liberar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-rose-600 bg-transparent"
                                  onClick={() => handleRefund(record.id)}
                                >
                                  Devolver
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
