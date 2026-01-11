"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreditCard, Search, Download, CheckCircle, Clock, XCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function PaymentsAdminPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [filteredPayments, setFilteredPayments] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [methodFilter, setMethodFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPayments()
  }, [])

  useEffect(() => {
    filterPayments()
  }, [searchTerm, methodFilter, statusFilter, payments])

  const fetchPayments = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("fiat_payments")
      .select(`
        *,
        users:user_id (email, full_name)
      `)
      .order("created_at", { ascending: false })

    if (data) {
      setPayments(data)
      setFilteredPayments(data)
    }
    setLoading(false)
  }

  const filterPayments = () => {
    let filtered = payments

    if (methodFilter !== "all") {
      filtered = filtered.filter((p) => p.payment_method === methodFilter)
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((p) => p.status === statusFilter)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.conekta_order_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.users?.email?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredPayments(filtered)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string; icon: any }> = {
      pending: { variant: "secondary", label: "Pendiente", icon: Clock },
      completed: { variant: "default", label: "Completado", icon: CheckCircle },
      failed: { variant: "destructive", label: "Fallido", icon: XCircle },
    }
    const config = variants[status] || variants.pending
    const Icon = config.icon
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getMethodBadge = (method: string) => {
    const colors: Record<string, string> = {
      card: "bg-blue-100 text-blue-700",
      oxxo: "bg-orange-100 text-orange-700",
      spei: "bg-green-100 text-green-700",
      usdc: "bg-purple-100 text-purple-700",
    }
    const labels: Record<string, string> = {
      card: "Tarjeta",
      oxxo: "Oxxo",
      spei: "SPEI",
      usdc: "USDC",
    }
    return (
      <Badge variant="outline" className={colors[method]}>
        {labels[method] || method}
      </Badge>
    )
  }

  const totalAmount = filteredPayments.reduce((sum, p) => sum + Number(p.amount_usd || 0), 0)
  const completedAmount = filteredPayments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + Number(p.amount_usd || 0), 0)

  const exportToCSV = () => {
    const headers = [
      "ID de Pago",
      "Usuario",
      "Email",
      "Método",
      "Monto USD",
      "Monto MXN",
      "Estado",
      "Fecha",
      "ID Conekta",
    ]

    const csvData = filteredPayments.map((payment) => [
      payment.id,
      payment.users?.full_name || "N/A",
      payment.users?.email || "N/A",
      payment.payment_method,
      payment.amount_usd,
      payment.amount_mxn || "0",
      payment.status,
      new Date(payment.created_at).toISOString(),
      payment.conekta_order_id || "N/A",
    ])

    const csvContent = [headers, ...csvData].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)

    link.setAttribute("href", url)
    link.setAttribute("download", `pagos-weekchain-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestión de Pagos</h1>
          <p className="text-slate-600">Administra todos los pagos fiat de la plataforma</p>
        </div>
        <Button onClick={exportToCSV}>
          <Download className="mr-2 h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Total Pagos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalAmount.toLocaleString()}</div>
            <p className="text-xs text-slate-500 mt-1">{filteredPayments.length} transacciones</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Completados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${completedAmount.toLocaleString()}</div>
            <p className="text-xs text-slate-500 mt-1">
              {payments.filter((p) => p.status === "completed").length} pagos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {payments.filter((p) => p.status === "pending").length}
            </div>
            <p className="text-xs text-slate-500 mt-1">Requieren atención</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Fallidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {payments.filter((p) => p.status === "failed").length}
            </div>
            <p className="text-xs text-slate-500 mt-1">Necesitan revisión</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Historial de Pagos</CardTitle>
              <CardDescription>Todos los pagos procesados en la plataforma</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Buscar pago..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="card">Tarjeta</SelectItem>
                  <SelectItem value="oxxo">Oxxo</SelectItem>
                  <SelectItem value="spei">SPEI</SelectItem>
                  <SelectItem value="usdc">USDC</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                  <SelectItem value="failed">Fallido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Pago</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Monto USD</TableHead>
                <TableHead>Monto MXN</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Cargando pagos...
                  </TableCell>
                </TableRow>
              ) : filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <CreditCard className="mx-auto h-12 w-12 text-slate-300 mb-2" />
                    <p className="text-slate-500">No se encontraron pagos</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-mono text-xs">
                      {payment.conekta_order_id?.substring(0, 20) || payment.id.substring(0, 20)}...
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{payment.users?.full_name || "N/A"}</div>
                        <div className="text-xs text-slate-500">{payment.users?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getMethodBadge(payment.payment_method)}</TableCell>
                    <TableCell className="font-medium">${Number(payment.amount_usd).toLocaleString()}</TableCell>
                    <TableCell className="text-slate-600">
                      ${Number(payment.amount_mxn || 0).toLocaleString()} MXN
                    </TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {new Date(payment.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        Ver Detalles
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
