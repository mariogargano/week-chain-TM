"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Clock, CheckCircle, XCircle, Eye } from "lucide-react"

interface KYCUser {
  id: string
  user_id: string
  status: "pending" | "approved" | "rejected" | "review"
  persona_inquiry_id: string
  created_at: string
  kyc_updated_at: string
  users?: { email: string; full_name: string }
}

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function KYCApprovalsClient() {
  const [selectedKYC, setSelectedKYC] = useState<KYCUser | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showReject, setShowReject] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const supabase = createClient()

  const { data: kycUsers, isLoading, mutate } = useSWR(
    "/api/admin/kyc-users",
    fetcher,
    { refreshInterval: 30000 }
  )

  const pending = (kycUsers || []).filter((k: KYCUser) => k.status === "pending")

  const handleApprove = async (kycId: string) => {
    setIsProcessing(true)
    try {
      await supabase
        .from("kyc_users")
        .update({ status: "approved" })
        .eq("id", kycId)

      setShowDetails(false)
      mutate()
    } catch (error) {
      console.error("Error approving KYC:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selectedKYC || !rejectReason) return

    setIsProcessing(true)
    try {
      await supabase
        .from("kyc_users")
        .update({
          status: "rejected",
          rejection_reason: rejectReason,
        })
        .eq("id", selectedKYC.id)

      setShowReject(false)
      setRejectReason("")
      mutate()
    } catch (error) {
      console.error("Error rejecting KYC:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-amber-100 text-amber-700"><Clock className="h-3 w-3 mr-1" />Pendiente</Badge>
      case "approved":
        return <Badge className="bg-emerald-100 text-emerald-700"><CheckCircle className="h-3 w-3 mr-1" />Aprobado</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-700"><XCircle className="h-3 w-3 mr-1" />Rechazado</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-600" />
            Solicitudes Pendientes
            <Badge className="ml-auto">{pending.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Usuario</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha Solicitud</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">Cargando...</TableCell>
                  </TableRow>
                ) : pending.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                      No hay solicitudes pendientes
                    </TableCell>
                  </TableRow>
                ) : (
                  pending.map((kyc: KYCUser) => (
                    <TableRow key={kyc.id} className="hover:bg-slate-50">
                      <TableCell className="font-medium">{kyc.users?.full_name}</TableCell>
                      <TableCell className="text-sm">{kyc.users?.email}</TableCell>
                      <TableCell>{getStatusBadge(kyc.status)}</TableCell>
                      <TableCell className="text-sm">
                        {new Date(kyc.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedKYC(kyc)
                              setShowDetails(true)
                            }}
                            className="h-8"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleApprove(kyc.id)}
                            disabled={isProcessing}
                            className="h-8"
                          >
                            Aprobar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedKYC(kyc)
                              setShowReject(true)
                            }}
                            disabled={isProcessing}
                            className="h-8"
                          >
                            Rechazar
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

      {showDetails && selectedKYC && (
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Detalles de Solicitud KYC</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Usuario</label>
                <p className="text-slate-700">{selectedKYC.users?.full_name}</p>
                <p className="text-sm text-slate-500">{selectedKYC.users?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium">ID de Solicitud Persona</label>
                <p className="font-mono text-xs break-all">{selectedKYC.persona_inquiry_id}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Estado</label>
                <p>{getStatusBadge(selectedKYC.status)}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {showReject && selectedKYC && (
        <Dialog open={showReject} onOpenChange={setShowReject}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rechazar Solicitud KYC</DialogTitle>
              <DialogDescription>Proporciona una razón para el rechazo</DialogDescription>
            </DialogHeader>
            <Textarea
              placeholder="Motivo del rechazo..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="min-h-24"
            />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowReject(false)}>Cancelar</Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={!rejectReason || isProcessing}
              >
                Confirmar Rechazo
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
