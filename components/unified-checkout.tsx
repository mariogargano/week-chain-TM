"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

function CardCheckout({
  amountMxn,
  reference,
  email,
  propertyId,
  weekId,
  weekNumber,
  propertyName,
}: {
  amountMxn: number
  reference: string
  email: string
  propertyId?: string
  weekId?: string
  weekNumber?: number
  propertyName?: string
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handlePayment = async () => {
    if (!email) {
      setError("Por favor ingresa tu email")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/payments/conekta/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountMxn,
          currency: "MXN",
          customerEmail: email,
          weekId,
          propertyId,
          propertyName,
          weekNumber,
        }),
      })
      const data = await res.json()

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else if (data.error) {
        setError(data.error)
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError("Error de red. Por favor intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="p-6">
        <p className="text-green-600 font-medium">¡Pago procesado exitosamente!</p>
      </Card>
    )
  }

  return (
    <Card className="p-6 space-y-4">
      <p className="text-muted-foreground">Serás redirigido a Conekta para completar el pago de forma segura.</p>
      {error && <p className="text-destructive text-sm">{error}</p>}
      <Button onClick={handlePayment} className="w-full" disabled={loading}>
        {loading ? "Procesando..." : `Pagar $${amountMxn.toLocaleString()} MXN (IVA incluido)`}
      </Button>
      <p className="text-xs text-muted-foreground text-center">Pago seguro procesado por Conekta</p>
    </Card>
  )
}

function OxxoCheckout({
  amountMxn,
  reference,
  email,
  propertyId,
  weekId,
  weekNumber,
  propertyName,
}: {
  amountMxn: number
  reference: string
  email: string
  propertyId?: string
  weekId?: string
  weekNumber?: number
  propertyName?: string
}) {
  const [oxxoReference, setOxxoReference] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createOxxo = async () => {
    if (!email) {
      setError("Por favor ingresa tu email")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/payments/conekta/oxxo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountMxn,
          currency: "MXN",
          customerEmail: email,
          weekId,
          propertyId,
        }),
      })
      const data = await res.json()

      if (data.reference) {
        setOxxoReference(data.reference)
      } else {
        setError(data.error || "Error al generar referencia OXXO")
      }
    } catch (err) {
      setError("Error de red. Por favor intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6">
      <Button onClick={createOxxo} className="w-full" disabled={loading || !!oxxoReference}>
        {loading ? "Generando..." : `Generar Ficha OXXO ($${amountMxn.toLocaleString()} MXN - IVA incluido)`}
      </Button>

      {error && <p className="text-destructive text-sm mt-3">{error}</p>}

      {oxxoReference && (
        <div className="mt-4 space-y-3 p-4 bg-muted rounded-lg">
          <p className="font-medium">Referencia OXXO:</p>
          <p className="text-2xl font-mono font-bold">{oxxoReference}</p>
          <p className="text-xs text-muted-foreground">
            Tienes 3 días para pagar en cualquier OXXO. Recibirás confirmación por email.
          </p>
        </div>
      )}
    </Card>
  )
}

export default function UnifiedCheckout({
  propertyId,
  weekId,
  weekNumber,
  propertyName,
  defaultAmountUsd = 199.0,
  defaultAmountMxn = 3499,
}: {
  propertyId?: string
  weekId?: string
  weekNumber?: number
  propertyName?: string
  defaultAmountUsd?: number
  defaultAmountMxn?: number
}) {
  const [email, setEmail] = useState("")
  const [amountMxn, setAmountMxn] = useState(defaultAmountMxn)
  const [reference] = useState(() => `RES-${Date.now()}`)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Tu email</Label>
          <Input
            id="email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="amountMxn">Monto (MXN)</Label>
          <Input
            id="amountMxn"
            type="number"
            value={amountMxn}
            onChange={(e) => setAmountMxn(Number.parseInt(e.target.value))}
          />
          <p className="text-xs text-muted-foreground">IVA incluido</p>
        </div>
      </div>

      <Tabs defaultValue="card" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="card">Tarjeta</TabsTrigger>
          <TabsTrigger value="oxxo">OXXO</TabsTrigger>
        </TabsList>

        <TabsContent value="card" className="mt-4">
          <CardCheckout
            amountMxn={amountMxn}
            reference={reference}
            email={email}
            propertyId={propertyId}
            weekId={weekId}
            weekNumber={weekNumber}
            propertyName={propertyName}
          />
        </TabsContent>

        <TabsContent value="oxxo" className="mt-4">
          <OxxoCheckout
            amountMxn={amountMxn}
            reference={reference}
            email={email}
            propertyId={propertyId}
            weekId={weekId}
            weekNumber={weekNumber}
            propertyName={propertyName}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
