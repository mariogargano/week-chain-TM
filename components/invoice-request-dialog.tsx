"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Loader2 } from "lucide-react"

interface InvoiceRequestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  voucherId: string
  onSuccess?: () => void
}

export function InvoiceRequestDialog({ open, onOpenChange, voucherId, onSuccess }: InvoiceRequestDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    rfc: "",
    razonSocial: "",
    emailFacturacion: "",
    calle: "",
    numeroExterior: "",
    numeroInterior: "",
    colonia: "",
    municipio: "",
    estado: "",
    codigoPostal: "",
    pais: "México",
    usoCfdi: "G03",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/invoices/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voucherId,
          ...formData,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al solicitar factura")
      }

      onSuccess?.()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Solicitar Factura
          </DialogTitle>
          <DialogDescription>Completa tus datos fiscales para generar tu factura automática.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rfc">RFC *</Label>
              <Input
                id="rfc"
                required
                value={formData.rfc}
                onChange={(e) => setFormData({ ...formData, rfc: e.target.value.toUpperCase() })}
                placeholder="XAXX010101000"
                maxLength={13}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="razonSocial">Razón Social *</Label>
              <Input
                id="razonSocial"
                required
                value={formData.razonSocial}
                onChange={(e) => setFormData({ ...formData, razonSocial: e.target.value })}
                placeholder="Empresa S.A. de C.V."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="emailFacturacion">Email para Factura *</Label>
            <Input
              id="emailFacturacion"
              type="email"
              required
              value={formData.emailFacturacion}
              onChange={(e) => setFormData({ ...formData, emailFacturacion: e.target.value })}
              placeholder="facturacion@empresa.com"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="calle">Calle *</Label>
              <Input
                id="calle"
                required
                value={formData.calle}
                onChange={(e) => setFormData({ ...formData, calle: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numeroExterior">No. Ext *</Label>
              <Input
                id="numeroExterior"
                required
                value={formData.numeroExterior}
                onChange={(e) => setFormData({ ...formData, numeroExterior: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numeroInterior">No. Int</Label>
              <Input
                id="numeroInterior"
                value={formData.numeroInterior}
                onChange={(e) => setFormData({ ...formData, numeroInterior: e.target.value })}
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="colonia">Colonia *</Label>
              <Input
                id="colonia"
                required
                value={formData.colonia}
                onChange={(e) => setFormData({ ...formData, colonia: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="municipio">Municipio *</Label>
              <Input
                id="municipio"
                required
                value={formData.municipio}
                onChange={(e) => setFormData({ ...formData, municipio: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">Estado *</Label>
              <Input
                id="estado"
                required
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="codigoPostal">C.P. *</Label>
              <Input
                id="codigoPostal"
                required
                value={formData.codigoPostal}
                onChange={(e) => setFormData({ ...formData, codigoPostal: e.target.value })}
                maxLength={5}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="usoCfdi">Uso de CFDI *</Label>
            <Select value={formData.usoCfdi} onValueChange={(value) => setFormData({ ...formData, usoCfdi: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="G01">G01 - Adquisición de mercancías</SelectItem>
                <SelectItem value="G03">G03 - Gastos en general</SelectItem>
                <SelectItem value="P01">P01 - Por definir</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">{error}</div>}

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generando factura...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Solicitar Factura
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
