"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, AlertTriangle, CheckCircle2, Clock } from "lucide-react"

interface Payment {
  id: string
  amount: number
  currency: string
  status: string
  cooling_off_ends: string
  created_at: string
  properties: {
    name: string
  } | null
}

export default function CancelPurchasePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const supabase = createClient()

  const [payment, setPayment] = useState<Payment | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState(false)
  const [reason, setReason] = useState("")
  const [timeRemaining, setTimeRemaining] = useState<string>("")

  useEffect(() => {
    async function loadPayment() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/auth")
          return
        }

        const { data, error } = await supabase
          .from("payments")
          .select("*, properties(name)")
          .eq("id", params.id)
          .eq("user_id", user.id)
          .single()

        if (error || !data) {
          setError("No se encontró esta compra")
          setLoading(false)
          return
        }

        setPayment(data)
        setLoading(false)
      } catch (err: any) {
        setError(err.message || "Error al cargar datos")
        setLoading(false)
      }
    }

    loadPayment()
  }, [params.id, router, supabase])

  useEffect(() => {
    if (!payment || payment.status !== "cooling_off") return

    const interval = setInterval(() => {
      const now = new Date()
      const end = new Date(payment.cooling_off_ends)
      const diff = end.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeRemaining("Expirado")
        clearInterval(interval)
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      setTimeRemaining(`${days}d ${hours}h`)
    }, 1000)

    return () => clearInterval(interval)
  }, [payment])

  async function handleCancel() {
    if (!payment) return

    setCancelling(true)
    setError("")

    try {
      const response = await fetch(`/api/purchase/cancel/${payment.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason || "Usuario ejerció derecho NOM-029" }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al cancelar")
      }

      setSuccess(true)
      setTimeout(() => router.push("/dashboard/member"), 3000)
    } catch (err: any) {
      setError(err.message || "Error al procesar cancelación")
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold">Cancelación Exitosa</h2>
            <p className="text-gray-600">Tu compra ha sido cancelada y el reembolso está en proceso.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!payment || payment.status !== "cooling_off") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Esta compra no puede ser cancelada. El periodo de reflexión ha expirado.
              </AlertDescription>
            </Alert>
            <Button onClick={() => router.push("/dashboard/member")} className="w-full mt-4">
              Volver al dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Cancelar Compra</CardTitle>
          <CardDescription>Periodo de reflexión - Derecho garantizado por NOM-029-SE-2021</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-900">Tiempo restante</p>
                <p className="text-2xl font-bold text-blue-600">{timeRemaining}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold">Detalles de la compra</h3>
            <div className="text-sm space-y-1">
              <p>
                <strong>Orden:</strong> {payment.id}
              </p>
              <p>
                <strong>Propiedad:</strong> {payment.properties?.name || "N/A"}
              </p>
              <p>
                <strong>Monto:</strong> {payment.currency} ${payment.amount.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Razón de cancelación (opcional)</Label>
            <Textarea
              id="reason"
              placeholder="Ej: Encontré una mejor opción..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={cancelling}
              rows={3}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/member")}
              disabled={cancelling}
              className="flex-1"
            >
              Mantener compra
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={cancelling} className="flex-1">
              {cancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelando...
                </>
              ) : (
                "Cancelar compra"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
