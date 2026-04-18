"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { Loader2, CheckCircle2, XCircle, Clock, RefreshCw } from "lucide-react"

interface EscrowDeposit {
  id: string
  amount_usdc: number
  status: string
  escrow_address: string | null
  user_wallet: string
  transaction_hash: string | null
  created_at: string
  confirmed_at: string | null
  refunded_at: string | null
  metadata: Record<string, unknown> | null
}

interface EscrowStatusProps {
  bookingId?: string
  escrowId?: string
}

export function EscrowStatusComponent({ bookingId, escrowId }: EscrowStatusProps) {
  const [escrow, setEscrow] = useState<EscrowDeposit | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchEscrow() {
      if (!bookingId && !escrowId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const supabase = createClient()

        let query = supabase.from("escrow_deposits").select("*")

        if (escrowId) {
          query = query.eq("id", escrowId)
        }

        const { data, error: fetchError } = await query.single()

        if (fetchError) {
          if (fetchError.code === "PGRST116") {
            setEscrow(null)
          } else {
            throw fetchError
          }
        } else {
          setEscrow(data)
        }
      } catch (err) {
        console.error("Error fetching escrow:", err)
        setError("Error al cargar datos del depósito")
      } finally {
        setLoading(false)
      }
    }

    fetchEscrow()
  }, [bookingId, escrowId])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "confirmed":
        return <CheckCircle2 className="h-4 w-4" />
      case "completed":
        return <CheckCircle2 className="h-4 w-4" />
      case "refunded":
        return <RefreshCw className="h-4 w-4" />
      case "cancelled":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500"
      case "confirmed":
        return "bg-blue-500"
      case "completed":
        return "bg-green-500"
      case "refunded":
        return "bg-orange-500"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Pendiente",
      confirmed: "Confirmado",
      completed: "Completado",
      refunded: "Reembolsado",
      cancelled: "Cancelado",
    }
    return labels[status] || status
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-red-500">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!escrow) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">No se encontró depósito para esta reservación</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Estado del Depósito</CardTitle>
          <Badge className={getStatusColor(escrow.status)}>
            <span className="flex items-center gap-1">
              {getStatusIcon(escrow.status)}
              {getStatusLabel(escrow.status)}
            </span>
          </Badge>
        </div>
        <CardDescription>ID: {escrow.id.slice(0, 8)}...</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Monto</p>
            <p className="font-medium">${escrow.amount_usdc.toLocaleString()} USD</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Fecha de Creación</p>
            <p className="font-medium">{new Date(escrow.created_at).toLocaleDateString("es-MX")}</p>
          </div>
        </div>

        {escrow.confirmed_at && (
          <div>
            <p className="text-sm text-muted-foreground">Fecha de Confirmación</p>
            <p className="font-medium">{new Date(escrow.confirmed_at).toLocaleDateString("es-MX")}</p>
          </div>
        )}

        {escrow.refunded_at && (
          <div>
            <p className="text-sm text-muted-foreground">Fecha de Reembolso</p>
            <p className="font-medium">{new Date(escrow.refunded_at).toLocaleDateString("es-MX")}</p>
          </div>
        )}

        {escrow.transaction_hash && (
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">Referencia de Transacción</p>
            <p className="text-xs font-mono break-all">{escrow.transaction_hash}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
