"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Search, CheckCircle, XCircle, Clock, AlertTriangle, Eye } from "lucide-react"

interface Certificate {
  id: string
  user_id: string
  product_id: string
  status: "active" | "pending_kyc" | "suspended" | "expired"
  max_pax: number
  start_date: string
  end_date: string
  purchase_price_usd: number
  users?: { email: string; full_name: string }
}

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function CertificatesClient() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showSuspend, setShowSuspend] = useState(false)
  const [suspendReason, setSuspendReason] = useState("")
  const supabase = createClient()

  const { data: certificates, isLoading, mutate } = useSWR(
    "/api/admin/certificates",
    fetcher,
    { refreshInterval: 30000 }
  )

  const filtered = (certificates || []).filter((cert: Certificate) => {
    const matchesSearch =
      cert.users?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.users?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.id.includes(searchTerm)

    const matchesStatus = statusFilter === "all" || cert.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleSuspend = async () => {
    if (!selectedCert || !suspendReason) return

    try {
      await supabase
        .from("user_certificates_v2")
        .update({
          status: "suspended",
          suspension_reason: suspendReason,
        })
        .eq("id", selectedCert.id)

      setShowSuspend(false)
      setSuspendReason("")
      mutate()
    } catch (error) {
      console.error("Error suspending certificate:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-emerald-100 text-emerald-700"><CheckCircle className="h-3 w-3 mr-1" />Activo</Badge>
      case "pending_kyc":
        return <Badge className="bg-amber-100 text-amber-700"><Clock className="h-3 w-3 mr-1" />Pendiente KYC</Badge>
      case "suspended":
        return <Badge className="bg-red-100 text-red-700"><AlertTriangle className="h-3 w-3 mr-1" />Suspendido</Badge>
      case "expired":
        return <Badge className="bg-slate-100 text-slate-700"><XCircle className="h-3 w-3 mr-1" />Expirado</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-3 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por usuario, email o ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="pending_kyc">Pendiente KYC</SelectItem>
            <SelectItem value="suspended">Suspendidos</SelectItem>
            <SelectItem value="expired">Expirados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Usuario</TableHead>
                <TableHead>ID Certificado</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">Cargando...</TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-500">Sin certificados</TableCell>
                </TableRow>
              ) : (
                filtered.map((cert: Certificate) => (
                  <TableRow key={cert.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{cert.users?.full_name}</p>
                        <p className="text-xs text-slate-500">{cert.users?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{cert.id.slice(0, 8)}</TableCell>
                    <TableCell>SVC PAX{cert.max_pax}</TableCell>
                    <TableCell>{getStatusBadge(cert.status)}</TableCell>
                    <TableCell>${cert.purchase_price_usd}</TableCell>
                    <TableCell className="text-sm">{new Date(cert.end_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedCert(cert)
                          setShowDetails(true)
                        }}
                        className="h-8"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {showDetails && selectedCert && (
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Detalles del Certificado</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Usuario</label>
                <p>{selectedCert.users?.full_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Estado</label>
                <p>{getStatusBadge(selectedCert.status)}</p>
              </div>
              {selectedCert.status === "active" && (
                <Button
                  variant="destructive"
                  onClick={() => {
                    setShowDetails(false)
                    setShowSuspend(true)
                  }}
                >
                  Suspender Certificado
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {showSuspend && selectedCert && (
        <Dialog open={showSuspend} onOpenChange={setShowSuspend}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Suspender Certificado</DialogTitle>
              <DialogDescription>Proporciona una razón para la suspensión</DialogDescription>
            </DialogHeader>
            <Textarea
              placeholder="Motivo de la suspensión..."
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              className="min-h-24"
            />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowSuspend(false)}>Cancelar</Button>
              <Button variant="destructive" onClick={handleSuspend} disabled={!suspendReason}>
                Confirmar Suspensión
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
