"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CreditCard, Building2, Store, Coins, AlertCircle } from "lucide-react"
import { requiresPartialPayments, calculateOxxoPartialPayments } from "@/lib/payments/oxxo-partial"

interface PaymentMethodSelectorProps {
  amount: number
  onSelectMethod: (method: "usdc" | "card" | "spei" | "oxxo", processor?: "conekta") => void
  disabled?: boolean
}

export function PaymentMethodSelector({ amount, onSelectMethod, disabled = false }: PaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)

  const amount_usdc = amount || 0
  const exchange_rate = 17.5
  const amount_mxn = amount_usdc * exchange_rate

  const needsPartialPayments = requiresPartialPayments(amount_mxn)
  const partialPayments = needsPartialPayments ? calculateOxxoPartialPayments(amount_mxn) : []

  const paymentMethods = [
    {
      id: "oxxo",
      name: "Pago en Oxxo",
      description: needsPartialPayments
        ? `${partialPayments.length} pagos de hasta $10,000 MXN`
        : "Paga en efectivo en cualquier Oxxo",
      icon: Store,
      badge: needsPartialPayments ? `${partialPayments.length} pagos` : "Popular",
      badgeColor: needsPartialPayments ? "bg-amber-500" : "bg-purple-500",
      disabled: false, // Always enabled, now supports partial payments
      processor: "conekta" as const,
    },
    {
      id: "card",
      name: "Tarjeta",
      description: "Crédito o débito",
      icon: CreditCard,
      badge: "Inmediato",
      badgeColor: "bg-blue-500",
      processor: "conekta" as const,
    },
    {
      id: "spei",
      name: "SPEI",
      description: "Transferencia bancaria",
      icon: Building2,
      badge: "1-2 días",
      badgeColor: "bg-orange-500",
      processor: "conekta" as const,
    },
    {
      id: "usdc",
      name: "USDC",
      description: "Pago con crypto",
      icon: Coins,
      badge: "Instantáneo",
      badgeColor: "bg-green-500",
      processor: undefined,
    },
  ]

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
        <div className="flex items-center gap-2">
          <Badge className="bg-blue-500">Modo Demo</Badge>
          <span className="text-sm text-blue-800">Los pagos están en modo de prueba para testing de UX</span>
        </div>
      </div>

      <div className="rounded-lg bg-muted p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Monto a pagar</span>
          <div className="text-right">
            <p className="font-bold text-lg">${amount_usdc.toLocaleString()} USD</p>
            <p className="text-xs text-muted-foreground">≈ ${amount_mxn.toLocaleString()} MXN</p>
          </div>
        </div>
      </div>

      {needsPartialPayments && (
        <Alert className="bg-purple-50 border-purple-200">
          <AlertCircle className="h-4 w-4 text-purple-600" />
          <AlertDescription className="text-purple-800 text-sm">
            <strong>💳 Pagos Parciales Habilitados</strong>
            <br />
            Tu compra se dividirá en {partialPayments.length} pagos de OXXO:
            <ul className="list-disc list-inside mt-2 space-y-1">
              {partialPayments.map((p) => (
                <li key={p.sequence}>
                  Pago {p.sequence}: ${p.amount.toLocaleString()} MXN
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs">Cada pago tendrá su propia referencia y podrás pagarlos en cualquier orden.</p>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <h3 className="font-semibold text-sm">Selecciona tu método de pago</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {paymentMethods.map((method) => {
            const Icon = method.icon
            const isDisabled = disabled || method.disabled
            return (
              <Card
                key={method.id}
                className={`cursor-pointer transition-all hover:border-primary ${
                  selectedMethod === method.id ? "border-primary ring-2 ring-primary/20" : ""
                } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={() => {
                  if (isDisabled) return
                  setSelectedMethod(method.id)
                  onSelectMethod(method.id as "usdc" | "card" | "spei" | "oxxo", method.processor)
                }}
              >
                <CardContent className="flex items-center gap-3 p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted flex-shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="font-semibold text-sm truncate">{method.name}</h4>
                      <Badge className={`${method.badgeColor} text-xs px-1.5 py-0`}>{method.badge}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{method.description}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
