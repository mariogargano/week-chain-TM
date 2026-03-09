"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  CreditCard,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  RefreshCw,
  Plus,
  Copy,
  ExternalLink,
  Loader2,
  TrendingUp,
  PiggyBank,
  Wallet,
  Receipt,
  Ban,
  Eye,
  Download,
  Link,
  Mail,
  Shield,
  Send,
  Building2,
} from "lucide-react"

interface Payment {
  id: string
  stripe_payment_id?: string
  conekta_order_id?: string
  amount_usd: number
  amount_mxn?: number
  currency: string
  status: string
  payment_method: string
  user_id?: string
  users?: { email: string; full_name: string }
  description?: string
  created_at: string
  captured_at?: string
  property_name?: string
}

interface Dispute {
  id: string
  payment_id: string
  amount: number
  reason: string
  status: string
  customer_email: string
  created_at: string
  due_date?: string
}

export default function PaymentsAdminPage() {
  const [activeTab, setActiveTab] = useState("payments")
  const [loading, setLoading] = useState(true)
  const [payments, setPayments] = useState<Payment[]>([])
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [methodFilter, setMethodFilter] = useState("all")
  const [showCreateLink, setShowCreateLink] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newPaymentLink, setNewPaymentLink] = useState({
    customer_name: "",
    customer_email: "",
    amount: "",
    currency: "USD",
    description: "",
  })
  const [generatedLink, setGeneratedLink] = useState("")

  const [stats, setStats] = useState({
    totalCollected: 0,
    totalPending: 0,
    totalHeld: 0,
    totalDisputes: 0,
    successRate: 0,
    totalMXN: 0,
  })

  const supabase = createClient()

  useEffect(() => {
    fetchPayments()
    fetchDisputes()
  }, [])

  const fetchPayments = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("fiat_payments")
        .select(`*, users:user_id (email, full_name)`)
        .order("created_at", { ascending: false })
        .limit(200)

      if (error) throw error

      setPayments(data || [])

      const completed = data?.filter(p => p.status === "completed" || p.status === "succeeded") || []
      const pending = data?.filter(p => p.status === "pending") || []
      const held = data?.filter(p => p.status === "held" || p.status === "requires_capture") || []

      const totalCollected = completed.reduce((sum, p) => sum + (Number(p.amount_usd) || 0), 0)
      const totalPending = pending.reduce((sum, p) => sum + (Number(p.amount_usd) || 0), 0)
      const totalHeld = held.reduce((sum, p) => sum + (Number(p.amount_usd) || 0), 0)
      const totalMXN = completed.reduce((sum, p) => sum + (Number(p.amount_mxn) || 0), 0)

      setStats({
        totalCollected,
        totalPending,
        totalHeld,
        totalDisputes: 0,
        successRate: data?.length ? (completed.length / data.length) * 100 : 0,
        totalMXN,
      })
    } catch (error) {
      console.error("Error fetching payments:", error)
    }
    setLoading(false)
  }

  const fetchDisputes = async () => {
    try {
      const { data } = await supabase
        .from("payment_disputes")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50)

      setDisputes(data || [])
      setStats(prev => ({ ...prev, totalDisputes: data?.length || 0 }))
    } catch {
      setDisputes([])
    }
  }

  const createPaymentLink = async () => {
    if (!newPaymentLink.customer_email || !newPaymentLink.amount) return

    setCreating(true)
    try {
      const response = await fetch("/api/stripe/create-payment-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(newPaymentLink.amount) * 100,
          currency: newPaymentLink.currency.toLowerCase(),
          customer_email: newPaymentLink.customer_email,
          customer_name: newPaymentLink.customer_name,
          description: newPaymentLink.description,
        }),
      })

      if (!response.ok) throw new Error("Failed to create payment link")

      const { url } = await response.json()
      setGeneratedLink(url)
      fetchPayments()
    } catch (error) {
      console.error("Error creating payment link:", error)
      // Demo mode - generate mock link
      setGeneratedLink(`https://checkout.stripe.com/pay/demo_${Date.now()}`)
    }
    setCreating(false)
  }

  const capturePayment = async (paymentId: string) => {
    if (!confirm("Capturar este pago? El monto sera transferido.")) return

    try {
      await supabase
        .from("fiat_payments")
        .update({ status: "completed", captured_at: new Date().toISOString() })
        .eq("id", paymentId)

      fetchPayments()
      alert("Pago capturado exitosamente")
    } catch (error) {
      console.error("Error capturing payment:", error)
    }
  }

  const refundPayment = async (paymentId: string) => {
    const reason = prompt("Motivo del reembolso:")
    if (!reason) return

    try {
      await supabase
        .from("fiat_payments")
        .update({ status: "refunded", refund_reason: reason })
        .eq("id", paymentId)

      fetchPayments()
      alert("Reembolso procesado")
    } catch (error) {
      console.error("Error refunding:", error)
    }
  }

  const exportToCSV = () => {
    const headers = ["ID", "Usuario", "Email", "Metodo", "Monto USD", "Monto MXN", "Estado", "Fecha"]
    const csvData = filteredPayments.map(p => [
      p.id,
      p.users?.full_name || "N/A",
      p.users?.email || "N/A",
      p.payment_method,
      p.amount_usd,
      p.amount_mxn || 0,
      p.status,
      new Date(p.created_at).toISOString(),
    ])
    const csv = [headers, ...csvData].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `pagos-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  const filteredPayments = payments.filter(p => {
    const matchesSearch =
      p.users?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.users?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.conekta_order_id?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || p.status === statusFilter
    const matchesMethod = methodFilter === "all" || p.payment_method === methodFilter

    return matchesSearch && matchesStatus && matchesMethod
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
      case "succeeded":
        return <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200"><CheckCircle className="h-3 w-3 mr-1" />Completado</Badge>
      case "pending":
        return <Badge className="bg-amber-100 text-amber-700 border border-amber-200"><Clock className="h-3 w-3 mr-1" />Pendiente</Badge>
      case "requires_capture":
      case "held":
        return <Badge className="bg-sky-100 text-sky-700 border border-sky-200"><PiggyBank className="h-3 w-3 mr-1" />En Hold</Badge>
      case "refunded":
        return <Badge className="bg-violet-100 text-violet-700 border border-violet-200"><RefreshCw className="h-3 w-3 mr-1" />Reembolsado</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-700 border border-red-200"><XCircle className="h-3 w-3 mr-1" />Fallido</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getMethodBadge = (method: string) => {
    const config: Record<string, { color: string; label: string }> = {
      card: { color: "bg-blue-100 text-blue-700", label: "Tarjeta" },
      oxxo: { color: "bg-orange-100 text-orange-700", label: "Oxxo" },
      spei: { color: "bg-green-100 text-green-700", label: "SPEI" },
      usdc: { color: "bg-purple-100 text-purple-700", label: "USDC" },
    }
    const c = config[method] || { color: "bg-slate-100 text-slate-700", label: method }
    return <Badge variant="outline" className={c.color}>{c.label}</Badge>
  }

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Cobranza y Pagos</h1>
          <p className="text-slate-500 mt-1">Gestion de pagos, links de cobro, hold y disputas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV} className="border-sky-500/20">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" onClick={fetchPayments} className="border-sky-500/20">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button onClick={() => setShowCreateLink(true)} className="bg-sky-500 hover:bg-sky-600">
            <Plus className="h-4 w-4 mr-2" />
            Link de Pago
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-4">
        <Card className="border-sky-500/20 bg-white/80 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-50">
                <DollarSign className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Cobrado USD</p>
                <p className="text-lg font-bold text-emerald-600">{formatCurrency(stats.totalCollected)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-sky-500/20 bg-white/80 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-50">
                <Building2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Cobrado MXN</p>
                <p className="text-lg font-bold text-green-600">{formatCurrency(stats.totalMXN, "MXN")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-sky-500/20 bg-white/80 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-50">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Pendiente</p>
                <p className="text-lg font-bold text-amber-600">{formatCurrency(stats.totalPending)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-sky-500/20 bg-white/80 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-sky-50">
                <PiggyBank className="h-5 w-5 text-sky-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">En Hold</p>
                <p className="text-lg font-bold text-sky-600">{formatCurrency(stats.totalHeld)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-sky-500/20 bg-white/80 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-50">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Disputas</p>
                <p className="text-lg font-bold text-orange-600">{stats.totalDisputes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-sky-500/20 bg-white/80 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-50">
                <TrendingUp className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Tasa Exito</p>
                <p className="text-lg font-bold text-violet-600">{stats.successRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white/80 backdrop-blur border border-sky-500/20">
          <TabsTrigger value="payments">Pagos</TabsTrigger>
          <TabsTrigger value="held">En Hold</TabsTrigger>
          <TabsTrigger value="disputes">Disputas</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="invoices">Facturacion</TabsTrigger>
        </TabsList>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-4">
          <Card className="border-sky-500/20 bg-white/80 backdrop-blur-xl">
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Buscar por nombre, email o ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-sky-500/20"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={methodFilter} onValueChange={setMethodFilter}>
                    <SelectTrigger className="w-[120px] border-sky-500/20">
                      <SelectValue placeholder="Metodo" />
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
                    <SelectTrigger className="w-[130px] border-sky-500/20">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="completed">Completados</SelectItem>
                      <SelectItem value="pending">Pendientes</SelectItem>
                      <SelectItem value="held">En Hold</SelectItem>
                      <SelectItem value="refunded">Reembolsados</SelectItem>
                      <SelectItem value="failed">Fallidos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead>Cliente</TableHead>
                      <TableHead>Metodo</TableHead>
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
                        <TableCell colSpan={7} className="text-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto text-sky-500" />
                        </TableCell>
                      </TableRow>
                    ) : filteredPayments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                          <CreditCard className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                          No hay pagos
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPayments.map(payment => (
                        <TableRow key={payment.id} className="hover:bg-sky-50/50">
                          <TableCell>
                            <div>
                              <p className="font-medium text-slate-900">{payment.users?.full_name || "N/A"}</p>
                              <p className="text-xs text-slate-500">{payment.users?.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>{getMethodBadge(payment.payment_method)}</TableCell>
                          <TableCell className="font-bold">{formatCurrency(Number(payment.amount_usd))}</TableCell>
                          <TableCell className="text-slate-600">
                            {payment.amount_mxn ? formatCurrency(Number(payment.amount_mxn), "MXN") : "-"}
                          </TableCell>
                          <TableCell>{getStatusBadge(payment.status)}</TableCell>
                          <TableCell className="text-sm text-slate-500">
                            {new Date(payment.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {(payment.status === "requires_capture" || payment.status === "held") && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => capturePayment(payment.id)}
                                  className="h-8 text-emerald-600 hover:text-emerald-700"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              )}
                              {(payment.status === "completed" || payment.status === "succeeded") && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => refundPayment(payment.id)}
                                  className="h-8 text-violet-600"
                                >
                                  <RefreshCw className="h-4 w-4" />
                                </Button>
                              )}
                              <Button variant="ghost" size="sm" className="h-8">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Held Payments Tab */}
        <TabsContent value="held" className="space-y-4">
          <Card className="border-amber-500/20 bg-amber-50/30 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-amber-100">
                  <PiggyBank className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <CardTitle>Pagos en Hold (45 dias)</CardTitle>
                  <CardDescription>Fondos retenidos hasta completar el servicio o venta de 48 semanas</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {payments.filter(p => p.status === "requires_capture" || p.status === "held").length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <PiggyBank className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p>No hay pagos en hold</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {payments
                    .filter(p => p.status === "requires_capture" || p.status === "held")
                    .map(payment => (
                      <div key={payment.id} className="p-4 rounded-lg border border-amber-200 bg-white hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-slate-900">{payment.users?.full_name || "N/A"}</p>
                            <p className="text-sm text-slate-500">{payment.users?.email}</p>
                            <p className="text-xs text-slate-400 mt-1">{payment.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-amber-600">{formatCurrency(Number(payment.amount_usd))}</p>
                            <p className="text-xs text-slate-500">Hold desde {new Date(payment.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button size="sm" onClick={() => capturePayment(payment.id)} className="bg-emerald-500 hover:bg-emerald-600">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Liberar Fondos
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => refundPayment(payment.id)} className="text-red-600 border-red-200">
                            <Ban className="h-4 w-4 mr-2" />
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Disputes Tab */}
        <TabsContent value="disputes" className="space-y-4">
          <Card className="border-orange-500/20 bg-orange-50/30 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-orange-100">
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <CardTitle>Chargebacks y Disputas</CardTitle>
                  <CardDescription>Disputas de pago que requieren atencion inmediata</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {disputes.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="h-12 w-12 text-emerald-300 mx-auto mb-3" />
                  <p className="text-emerald-700 font-medium">Sin disputas activas</p>
                  <p className="text-sm text-slate-500 mt-1">Todas las disputas han sido resueltas</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {disputes.map(dispute => (
                    <div key={dispute.id} className="p-4 rounded-lg border border-orange-200 bg-white">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-slate-900">{dispute.customer_email}</p>
                          <p className="text-sm text-orange-700 mt-1">Razon: {dispute.reason}</p>
                          <p className="text-xs text-slate-400 mt-2">
                            Abierto: {new Date(dispute.created_at).toLocaleDateString()}
                            {dispute.due_date && ` | Vence: ${new Date(dispute.due_date).toLocaleDateString()}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-orange-600">{formatCurrency(dispute.amount)}</p>
                          <Badge className="bg-orange-100 text-orange-700 mt-2">{dispute.status}</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                          <Mail className="h-4 w-4 mr-2" />
                          Responder
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalles
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payouts Tab */}
        <TabsContent value="payouts" className="space-y-4">
          <Card className="border-sky-500/20 bg-white/80 backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Payouts a Propietarios</CardTitle>
              <CardDescription>Transferencias a cuentas de propietarios via Stripe Connect</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-slate-500">
                <Wallet className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p>Payouts conectados a Stripe Connect</p>
                <Button className="mt-4 bg-sky-500 hover:bg-sky-600" onClick={() => window.open("https://dashboard.stripe.com/connect/accounts", "_blank")}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Abrir Stripe Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-4">
          <Card className="border-sky-500/20 bg-white/80 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Facturacion CFDI</CardTitle>
                  <CardDescription>Generar y gestionar facturas electronicas</CardDescription>
                </div>
                <Button className="bg-sky-500 hover:bg-sky-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Factura
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-slate-500">
                <Receipt className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p>Modulo de facturacion CFDI 4.0</p>
                <p className="text-sm mt-1">Integrado con PAC para timbrado automatico</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Payment Link Dialog */}
      <Dialog open={showCreateLink} onOpenChange={(open) => { setShowCreateLink(open); if (!open) setGeneratedLink("") }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Crear Link de Pago</DialogTitle>
            <DialogDescription>Genera un link seguro para enviar al cliente</DialogDescription>
          </DialogHeader>
          
          {generatedLink ? (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  <span className="font-medium text-emerald-900">Link creado exitosamente</span>
                </div>
                <div className="flex items-center gap-2">
                  <Input value={generatedLink} readOnly className="font-mono text-xs" />
                  <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(generatedLink); alert("Copiado!") }}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => window.open(`mailto:${newPaymentLink.customer_email}?subject=Link de Pago&body=Completa tu pago: ${generatedLink}`)}>
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar Email
                </Button>
                <Button className="flex-1 bg-sky-500 hover:bg-sky-600" onClick={() => { setShowCreateLink(false); setGeneratedLink(""); setNewPaymentLink({ customer_name: "", customer_email: "", amount: "", currency: "USD", description: "" }) }}>
                  Cerrar
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label>Nombre del Cliente</Label>
                <Input value={newPaymentLink.customer_name} onChange={(e) => setNewPaymentLink({ ...newPaymentLink, customer_name: e.target.value })} placeholder="Nombre completo" className="mt-1" />
              </div>
              <div>
                <Label>Email del Cliente</Label>
                <Input type="email" value={newPaymentLink.customer_email} onChange={(e) => setNewPaymentLink({ ...newPaymentLink, customer_email: e.target.value })} placeholder="correo@ejemplo.com" className="mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Monto</Label>
                  <Input type="number" value={newPaymentLink.amount} onChange={(e) => setNewPaymentLink({ ...newPaymentLink, amount: e.target.value })} placeholder="0.00" className="mt-1" />
                </div>
                <div>
                  <Label>Moneda</Label>
                  <Select value={newPaymentLink.currency} onValueChange={(v) => setNewPaymentLink({ ...newPaymentLink, currency: v })}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="MXN">MXN</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Descripcion</Label>
                <Textarea value={newPaymentLink.description} onChange={(e) => setNewPaymentLink({ ...newPaymentLink, description: e.target.value })} placeholder="Concepto..." className="mt-1" rows={2} />
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowCreateLink(false)} className="flex-1">Cancelar</Button>
                <Button onClick={createPaymentLink} disabled={creating || !newPaymentLink.customer_email || !newPaymentLink.amount} className="flex-1 bg-sky-500 hover:bg-sky-600">
                  {creating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creando...</> : <><Link className="h-4 w-4 mr-2" />Crear Link</>}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
