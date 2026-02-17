"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Store, Copy, CheckCircle2, AlertCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface PartialPayment {
  order_id: string
  sequence: number
  amount: number
  reference?: string
}

interface OxxoPartialPaymentsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  payments: PartialPayment[]
  totalPayments: number
  voucherCode: string
  propertyName: string
  weekNumber: number
}

export function OxxoPartialPaymentsDialog({
  open,
  onOpenChange,
  payments,
  totalPayments,
  voucherCode,
  propertyName,
  weekNumber,
}: OxxoPartialPaymentsDialogProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const copyReference = (reference: string, index: number) => {
    navigator.clipboard.writeText(reference)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Store className="h-5 w-5 text-purple-600" />
            Pagos Parciales en OXXO
          </DialogTitle>
          <DialogDescription>
            Tu compra se ha dividido en {totalPayments} pagos para cumplir con el límite de OXXO ($10,000 MXN)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Voucher Info */}
          <Alert className="bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Certificado Creado:</strong> {voucherCode}
              <br />
              Tu certificado estará en estado <strong>pendiente</strong> hasta que completes todos los pagos.
            </AlertDescription>
          </Alert>

          {/* Property Info */}
          <Card className="bg-muted">
            <CardContent className="pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Propiedad</span>
                <span className="font-medium">{propertyName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Semana</span>
                <span className="font-medium">Semana {weekNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total de Pagos</span>
                <Badge variant="outline">{totalPayments} pagos</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Payment Instructions */}
          <Alert>
            <Store className="h-4 w-4" />
            <AlertDescription>
              <strong>Instrucciones:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>Puedes pagar en cualquier orden</li>
                <li>Cada pago tiene 3 días para completarse</li>
                <li>Guarda las referencias para pagar en OXXO</li>
                <li>Tu certificado se confirmará cuando completes todos los pagos</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Payment Cards */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Referencias de Pago</h4>
            {payments.map((payment, index) => (
              <Card key={payment.order_id} className="border-2">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <Badge className="bg-purple-500 mb-2">
                        Pago {payment.sequence} de {totalPayments}
                      </Badge>
                      <p className="text-2xl font-bold">${payment.amount.toLocaleString()} MXN</p>
                    </div>
                    <Store className="h-8 w-8 text-purple-600" />
                  </div>

                  {payment.reference && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between bg-muted p-3 rounded-lg">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Referencia OXXO</p>
                          <p className="font-mono text-lg font-bold">{payment.reference}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyReference(payment.reference!, index)}
                          className="ml-2"
                        >
                          {copiedIndex === index ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Copiado
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-1" />
                              Copiar
                            </>
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Presenta esta referencia en cualquier OXXO para realizar el pago
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Progress Tracker */}
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Progreso de Pagos</span>
                  <span className="text-muted-foreground">0 de {totalPayments} completados</span>
                </div>
                <Progress value={0} className="h-2" />
                <p className="text-xs text-muted-foreground">Puedes ver el progreso en tu dashboard de certificados</p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={() => (window.location.href = "/dashboard/user/vouchers")} className="flex-1">
              Ver Mis Certificados
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
