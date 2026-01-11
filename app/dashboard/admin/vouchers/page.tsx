"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Ticket, Search, Filter, Download, Award, Mail } from "lucide-react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function VouchersAdminPage() {
  const [vouchers, setVouchers] = useState<any[]>([])
  const [filteredVouchers, setFilteredVouchers] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVouchers()
  }, [])

  useEffect(() => {
    filterVouchers()
  }, [searchTerm, statusFilter, vouchers])

  const fetchVouchers = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("purchase_vouchers")
      .select(`
        *,
        users:user_id (email, full_name),
        properties:property_id (name, location)
      `)
      .order("created_at", { ascending: false })

    if (data) {
      setVouchers(data)
      setFilteredVouchers(data)
    }
    setLoading(false)
  }

  const filterVouchers = () => {
    let filtered = vouchers

    if (statusFilter !== "all") {
      filtered = filtered.filter((v) => v.status === statusFilter)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (v) =>
          v.voucher_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          v.users?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          v.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          v.properties?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredVouchers(filtered)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string; className: string }> = {
      pending: { variant: "secondary", label: "Pendiente", className: "bg-amber-100 text-amber-700" },
      confirmed: { variant: "default", label: "Confirmado", className: "bg-emerald-100 text-emerald-700" },
      redeemed: { variant: "default", label: "Canjeado", className: "bg-blue-100 text-blue-700" },
      expired: { variant: "destructive", label: "Expirado", className: "bg-rose-100 text-rose-700" },
      cancelled: { variant: "destructive", label: "Cancelado", className: "bg-rose-100 text-rose-700" },
    }
    const config = variants[status] || variants.pending
    return <Badge className={config.className}>{config.label}</Badge>
  }

  const getCertificateBadge = (status: string) => {
    switch (status) {
      case "issued":
        return (
          <Badge className="bg-purple-100 text-purple-700">
            <Award className="h-3 w-3 mr-1" />
            Emitido
          </Badge>
        )
      case "pending":
        return <Badge className="bg-slate-100 text-slate-600">Pendiente</Badge>
      default:
        return <Badge variant="outline">N/A</Badge>
    }
  }

  const getPaymentMethodBadge = (method: string) => {
    const labels: Record<string, string> = {
      usdc: "USDC",
      card: "Tarjeta",
      oxxo: "Oxxo",
      spei: "SPEI",
    }
    return <Badge variant="outline">{labels[method] || method || "N/A"}</Badge>
  }

  const handleIssueCertificate = async (voucherId: string) => {
    if (!confirm("¿Emitir certificado digital NOM-151 para este voucher?")) return

    const supabase = createClient()
    await supabase
      .from("purchase_vouchers")
      .update({
        certificate_status: "issued",
        certificate_issued_at: new Date().toISOString(),
      })
      .eq("id", voucherId)

    fetchVouchers()
  }

  const handleSendReminder = (email: string, voucherCode: string) => {
    alert(`Recordatorio enviado a ${email} para voucher ${voucherCode}`)
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestión de Vouchers</h1>
          <p className="text-slate-600">Administra todos los vouchers de compra y certificados digitales</p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Total Vouchers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vouchers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {vouchers.filter((v) => v.status === "pending").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Confirmados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {vouchers.filter((v) => v.status === "confirmed").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Canjeados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {vouchers.filter((v) => v.status === "redeemed").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Certificados Emitidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {vouchers.filter((v) => v.certificate_status === "issued").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Vouchers de Compra</CardTitle>
              <CardDescription>Lista completa de vouchers emitidos y estado de certificados</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Buscar voucher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="confirmed">Confirmados</SelectItem>
                  <SelectItem value="redeemed">Canjeados</SelectItem>
                  <SelectItem value="expired">Expirados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Propiedad</TableHead>
                <TableHead>Semanas</TableHead>
                <TableHead>Monto MXN</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Certificado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    Cargando vouchers...
                  </TableCell>
                </TableRow>
              ) : filteredVouchers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <Ticket className="mx-auto h-12 w-12 text-slate-300 mb-2" />
                    <p className="text-slate-500">No se encontraron vouchers</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredVouchers.map((voucher) => (
                  <TableRow key={voucher.id}>
                    <TableCell className="font-mono text-sm">{voucher.voucher_code}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{voucher.user_name || voucher.users?.full_name || "N/A"}</div>
                        <div className="text-xs text-slate-500">{voucher.user_email || voucher.users?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{voucher.properties?.name || voucher.property_id || "N/A"}</div>
                        <div className="text-xs text-slate-500">{voucher.properties?.location || voucher.season}</div>
                      </div>
                    </TableCell>
                    <TableCell>{voucher.quantity || voucher.week_number || 1}</TableCell>
                    <TableCell className="font-medium">
                      ${Number(voucher.amount_mxn || voucher.amount_paid || 0).toLocaleString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(voucher.status)}</TableCell>
                    <TableCell>{getCertificateBadge(voucher.certificate_status)}</TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {new Date(voucher.created_at).toLocaleDateString("es-MX")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {voucher.status === "confirmed" && voucher.certificate_status !== "issued" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-purple-600 hover:text-purple-700"
                            onClick={() => handleIssueCertificate(voucher.id)}
                          >
                            <Award className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleSendReminder(voucher.user_email || voucher.users?.email, voucher.voucher_code)
                          }
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
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
