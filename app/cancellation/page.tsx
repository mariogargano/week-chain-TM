"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Clock, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function CancellationPage() {
  const [escrowTx, setEscrowTx] = useState("")
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleRefund = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/legal/request-cancellation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          escrow_tx: escrowTx,
          reason: reason,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al procesar cancelación")
      }

      toast({
        title: "Solicitud enviada",
        description: data.within_reflection_period
          ? "Tu solicitud de cancelación ha sido recibida. Recibirás tu reembolso en 5-7 días hábiles."
          : "Tu solicitud ha sido recibida y será revisada por nuestro equipo.",
      })

      // Redirect to dashboard
      setTimeout(() => router.push("/dashboard"), 2000)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo procesar la solicitud. Intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-red-50">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <Card className="border-2">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-orange-100 rounded-full">
                <RefreshCw className="h-8 w-8 text-orange-600" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold">Solicitud de Cancelación</CardTitle>
            <CardDescription className="text-base">Periodo de Reflexión — NOM-029-SE-2021</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Información del periodo de reflexión */}
            <Alert className="border-blue-200 bg-blue-50">
              <Clock className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-sm leading-relaxed">
                <strong>Periodo de Reflexión:</strong> Conforme a la NOM-029-SE-2021, tienes derecho a cancelar tu
                compra dentro de los <strong>5 días hábiles</strong> siguientes a la aceptación del contrato, sin
                penalización y con devolución total del pago.
              </AlertDescription>
            </Alert>

            {/* Formulario */}
            <form onSubmit={handleRefund} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="escrowTx">
                  ID de Transacción o Voucher <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="escrowTx"
                  placeholder="Ingrese su ID de transacción o voucher"
                  value={escrowTx}
                  onChange={(e) => setEscrowTx(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Puedes encontrar este ID en tu dashboard o en el correo de confirmación
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">
                  Motivo de Cancelación <span className="text-muted-foreground">(Opcional)</span>
                </Label>
                <Textarea
                  id="reason"
                  placeholder="Cuéntanos por qué deseas cancelar (esto nos ayuda a mejorar)"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Información importante */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm space-y-2">
                  <p>
                    <strong>Información importante:</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Si estás dentro del periodo de reflexión (5 días hábiles), recibirás el reembolso completo</li>
                    <li>El reembolso se procesará al mismo método de pago utilizado</li>
                    <li>Los reembolsos tardan entre 5-7 días hábiles en reflejarse</li>
                    <li>Recibirás un correo de confirmación con el estatus de tu solicitud</li>
                  </ul>
                </AlertDescription>
              </Alert>

              {/* Botones */}
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
                  Volver
                </Button>
                <Button type="submit" disabled={!escrowTx || loading} className="flex-1" variant="destructive">
                  {loading ? "Procesando..." : "Solicitar Cancelación"}
                </Button>
              </div>
            </form>

            {/* Contacto */}
            <div className="pt-4 border-t">
              <p className="text-sm text-center text-muted-foreground">
                ¿Necesitas ayuda? Contáctanos en{" "}
                <a href="mailto:support@weekchain.com" className="text-blue-600 hover:underline">
                  support@weekchain.com
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
