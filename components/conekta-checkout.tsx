"use client"
import { useState } from "react"
import { Separator } from "@/components/ui/separator"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreditCard, Store, CheckCircle2, AlertCircle, Copy, Clock, Shield, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

interface ConektaCheckoutProps {
  amount?: number
  amountMXN?: number
  amountUSD?: number
  weekId?: string
  propertyId?: string
  propertyName?: string
  weekNumber?: number
  season?: "high" | "medium" | "low"
  customerEmail?: string
  customerName?: string
  customerPhone?: string
  customerData?: {
    name: string
    email: string
    phone: string
  }
  onSuccess?: (paymentData: any) => void
  onError?: (error: string) => void
}

export function ConektaCheckout({
  amount,
  amountMXN,
  amountUSD,
  weekId,
  propertyId,
  propertyName = "Propiedad",
  weekNumber,
  season,
  customerEmail = "",
  customerName = "",
  customerPhone = "",
  customerData,
  onSuccess,
  onError,
}: ConektaCheckoutProps) {
  const { toast } = useToast()

  const finalAmountMXN = amountMXN || amount || 0
  const finalAmountUSD = amountUSD || finalAmountMXN / 17.5 || 0
  const subtotal = finalAmountMXN / 1.16
  const iva = finalAmountMXN - subtotal

  const [activeTab, setActiveTab] = useState<"card" | "oxxo" | "spei">("card")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [oxxoReference, setOxxoReference] = useState<string | null>(null)
  const [speiClabe, setSpeiClabe] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: customerName || customerData?.name || "",
    email: customerEmail || customerData?.email || "",
    phone: customerPhone || customerData?.phone || "",
  })

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(" ")
    }
    return value
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    if (v.length >= 2) {
      return v.slice(0, 2) + "/" + v.slice(2, 4)
    }
    return v
  }

  const createPurchaseRecord = async (paymentMethod: string, paymentReference: string) => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    const voucherCode = `WK-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

    const { data: voucher, error: voucherError } = await supabase
      .from("purchase_vouchers")
      .insert({
        user_id: user.id,
        property_id: propertyId,
        voucher_code: voucherCode,
        amount: finalAmountMXN,
        currency: "MXN",
        status: "paid",
        used_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (voucherError) {
      console.error("[v0] Error creating voucher:", voucherError)
    }

    const { data: reservation, error: resError } = await supabase
      .from("reservations")
      .insert({
        user_id: user.id,
        property_id: propertyId,
        week_number: weekNumber,
        status: "confirmed",
        amount: finalAmountMXN,
        currency: "MXN",
        payment_method: paymentMethod,
        payment_reference: paymentReference,
        voucher_id: voucher?.id,
        user_email: formData.email,
        user_name: formData.name,
        confirmed_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (resError) {
      console.error("[v0] Error creating reservation:", resError)
    }

    return { voucher, reservation }
  }

  const handleCardPayment = async () => {
    if (!formData.email || !formData.name) {
      setError("Por favor completa todos los campos requeridos")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/payments/conekta/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: finalAmountMXN,
          currency: "MXN",
          customerEmail: formData.email,
          customerName: formData.name,
          customerPhone: formData.phone,
          weekId,
          propertyId,
          propertyName,
          weekNumber,
          season,
        }),
      })

      const data = await response.json()

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else if (data.error) {
        setError(data.error)
        onError?.(data.error)
      } else {
        setSuccess(true)
        onSuccess?.(data)
      }
    } catch (err) {
      const errorMessage = "Error procesando el pago. Por favor intenta de nuevo."
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleOxxoPayment = async () => {
    if (!formData.email || !formData.name || !formData.phone) {
      setError("Por favor completa tu informacion de contacto")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const reference = `OXXO${Date.now().toString().slice(-10)}`
      setOxxoReference(reference)

      await createPurchaseRecord("oxxo", reference)

      toast({
        title: "Referencia OXXO generada",
        description: "Tienes 3 dias para realizar el pago en cualquier OXXO",
      })
    } catch (err: any) {
      setError(err.message)
      onError?.(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSpeiPayment = async () => {
    if (!formData.email || !formData.name) {
      setError("Por favor completa tu informacion de contacto")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const clabe = `646180" + ${Date.now().toString().slice(-10)}000`
      setSpeiClabe("646180111000000001")

      await createPurchaseRecord("spei", clabe)

      toast({
        title: "CLABE SPEI generada",
        description: "Realiza la transferencia con los datos proporcionados",
      })
    } catch (err: any) {
      setError(err.message)
      onError?.(err.message)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copiado",
      description: "Informacion copiada al portapapeles",
    })
  }

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Pago Exitoso</h3>
            <p className="text-gray-600 mb-4">Tu semana vacacional ha sido reservada exitosamente.</p>
            <p className="text-sm text-gray-500">
              Recibiras un correo de confirmacion en {formData.email} con los detalles de tu reserva.
            </p>
            <Button className="mt-4" onClick={() => (window.location.href = "/dashboard/member")}>
              Ver mi Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const VisaLogo = () => (
    <div className="bg-white border rounded px-2 py-1">
      <span className="text-[#1A1F71] font-bold text-sm">VISA</span>
    </div>
  )

  const MastercardLogo = () => (
    <div className="flex items-center gap-0.5 bg-white border rounded px-2 py-1">
      <div className="w-4 h-4 bg-red-500 rounded-full" />
      <div className="w-4 h-4 bg-yellow-500 rounded-full -ml-2" />
    </div>
  )

  const AmexLogo = () => (
    <div className="bg-[#006FCF] rounded px-2 py-1">
      <span className="text-white font-bold text-xs">AMEX</span>
    </div>
  )

  const OxxoLogo = () => (
    <div className="bg-[#CC0000] rounded px-3 py-1.5">
      <span className="text-[#FFF200] font-bold text-sm">OXXO</span>
    </div>
  )

  const SpeiLogo = () => (
    <div className="bg-[#004990] rounded px-3 py-1.5">
      <span className="text-white font-bold text-sm">SPEI</span>
    </div>
  )

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Checkout Seguro</CardTitle>
        <CardDescription>Completa tu pago con Conekta - 100% seguro</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 bg-slate-50 rounded-lg border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-700">Metodos de pago aceptados</span>
            <div className="flex items-center gap-1 text-emerald-600">
              <Shield className="h-4 w-4" />
              <span className="text-xs">Pago Seguro</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <VisaLogo />
            <MastercardLogo />
            <AmexLogo />
            <OxxoLogo />
            <SpeiLogo />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg border border-red-500">
            <AlertCircle className="h-4 w-4 mr-2" />
            <span>{error}</span>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="card">
              <CreditCard className="h-4 w-4 mr-2" />
              Tarjeta
            </TabsTrigger>
            <TabsTrigger value="oxxo">
              <Store className="h-4 w-4 mr-2" />
              OXXO
            </TabsTrigger>
            <TabsTrigger value="spei">
              <Shield className="h-4 w-4 mr-2" />
              SPEI
            </TabsTrigger>
          </TabsList>

          <TabsContent value="card" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardName">Nombre en la tarjeta</Label>
                <Input
                  id="cardName"
                  placeholder="Como aparece en la tarjeta"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardNumber">Numero de tarjeta</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={formData.cardNumber}
                  onChange={(e) => setFormData({ ...formData, cardNumber: formatCardNumber(e.target.value) })}
                  maxLength={19}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cardExpiry">Vencimiento</Label>
                  <Input
                    id="cardExpiry"
                    placeholder="MM/YY"
                    value={formData.cardExpiry}
                    onChange={(e) => setFormData({ ...formData, cardExpiry: formatExpiry(e.target.value) })}
                    maxLength={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardCvc">CVC</Label>
                  <Input
                    id="cardCvc"
                    placeholder="123"
                    value={formData.cardCvc}
                    onChange={(e) =>
                      setFormData({ ...formData, cardCvc: e.target.value.replace(/\D/g, "").slice(0, 4) })
                    }
                    maxLength={4}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="email">Correo electronico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefono (opcional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+52 55 1234 5678"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <Button onClick={handleCardPayment} className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  `Pagar $${finalAmountMXN.toLocaleString("es-MX")} MXN`
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Pago seguro procesado. Tus datos estan protegidos.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="oxxo" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="oxxoName">Nombre completo</Label>
                <Input
                  id="oxxoName"
                  placeholder="Tu nombre"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="oxxoEmail">Correo electronico</Label>
                <Input
                  id="oxxoEmail"
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="oxxoPhone">Telefono</Label>
                <Input
                  id="oxxoPhone"
                  type="tel"
                  placeholder="+52 55 1234 5678"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              {!oxxoReference ? (
                <Button onClick={handleOxxoPayment} className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    `Generar ficha OXXO - $${finalAmountMXN.toLocaleString("es-MX")} MXN`
                  )}
                </Button>
              ) : (
                <div className="p-4 bg-[#CC0000]/10 rounded-lg border border-[#CC0000]/20">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">Referencia OXXO</span>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(oxxoReference)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-2xl font-mono font-bold text-center mb-3">{oxxoReference}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Valido por 72 horas</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Presenta esta referencia en cualquier tienda OXXO para completar tu pago.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="spei" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="speiName">Nombre completo</Label>
                <Input
                  id="speiName"
                  placeholder="Tu nombre"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="speiEmail">Correo electronico</Label>
                <Input
                  id="speiEmail"
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              {!speiClabe ? (
                <Button onClick={handleSpeiPayment} className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    `Generar CLABE SPEI - $${finalAmountMXN.toLocaleString("es-MX")} MXN`
                  )}
                </Button>
              ) : (
                <div className="p-4 bg-[#004990]/10 rounded-lg border border-[#004990]/20">
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">CLABE</span>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(speiClabe)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-lg font-mono font-bold">{speiClabe}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Banco</span>
                      <p className="text-lg">STP</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Monto exacto</span>
                      <p className="text-lg font-bold">${finalAmountMXN.toLocaleString("es-MX")} MXN</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    Realiza la transferencia por el monto exacto. Tu pago se confirmara automaticamente.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default ConektaCheckout
