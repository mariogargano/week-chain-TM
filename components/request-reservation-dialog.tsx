"use client"

import type React from "react"

import { useState } from "react"
import { Calendar, AlertCircle, CheckCircle2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface RequestReservationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  propertyName: string
  propertyId: string
  certificateId?: string
}

export function RequestReservationDialog({
  open,
  onOpenChange,
  propertyName,
  propertyId,
  certificateId,
}: RequestReservationDialogProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    checkIn: "",
    checkOut: "",
    guests: 2,
    notes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/reservations/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          certificateId,
          propertyId,
          checkIn: formData.checkIn,
          checkOut: formData.checkOut,
          guests: formData.guests,
          notes: formData.notes,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to submit request")
      }

      setSuccess(true)
      setTimeout(() => {
        onOpenChange(false)
        setSuccess(false)
      }, 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Solicitar Uso de Certificado</DialogTitle>
          <DialogDescription>
            Destino: <strong>{propertyName}</strong>
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Solicitud enviada exitosamente. Recibirás confirmación dentro de 24-48 horas.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Disclaimer */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Esta es una <strong>solicitud de uso</strong>, no una reserva confirmada. La aprobación está sujeta a
                disponibilidad del sistema WEEK-CHAIN.
              </AlertDescription>
            </Alert>

            {/* Check-in */}
            <div className="space-y-2">
              <Label htmlFor="checkIn">Fecha de Check-in Deseada</Label>
              <Input
                id="checkIn"
                type="date"
                required
                value={formData.checkIn}
                onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            {/* Check-out */}
            <div className="space-y-2">
              <Label htmlFor="checkOut">Fecha de Check-out Deseada</Label>
              <Input
                id="checkOut"
                type="date"
                required
                value={formData.checkOut}
                onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                min={formData.checkIn || new Date().toISOString().split("T")[0]}
              />
            </div>

            {/* Guests */}
            <div className="space-y-2">
              <Label htmlFor="guests">Número de Huéspedes</Label>
              <Input
                id="guests"
                type="number"
                min={1}
                max={8}
                required
                value={formData.guests}
                onChange={(e) => setFormData({ ...formData, guests: Number.parseInt(e.target.value) })}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notas Adicionales (Opcional)</Label>
              <Textarea
                id="notes"
                placeholder="Ocasión especial, requerimientos especiales, etc."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Submit */}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                <Calendar className="mr-2 h-4 w-4" />
                {loading ? "Enviando..." : "Enviar Solicitud"}
              </Button>
            </div>

            {/* Legal disclaimer */}
            <p className="text-xs text-muted-foreground">
              Al enviar esta solicitud, reconoces que no constituye una reserva garantizada ni asigna fechas, destinos
              ni propiedades específicas. La aprobación está sujeta a la capacidad disponible del sistema.
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
