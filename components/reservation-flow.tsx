"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/lib/wallet/wallet-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, Loader2, CreditCard, Shield, Ticket } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { PaymentMethodSelector } from "@/components/payment-method-selector"
import { getEnvironment } from "@/lib/config/environment"
import { logger } from "@/lib/config/logger"
import { OxxoPartialPaymentsDialog } from "@/components/oxxo-partial-payments-dialog"
import { requiresPartialPayments } from "@/lib/payments/oxxo-partial"

interface ReservationFlowProps {
  weekId: string
  propertyId: string
  weekNumber: number
  weekPrice: number
  propertyName: string
  onComplete?: () => void
}

type FlowStep = "payment" | "processing" | "voucher" | "complete"
type PaymentMethod = "usdc" | "card" | "spei" | "oxxo"
type PaymentProcessor = "stripe" | "conekta"

export function ReservationFlow({
  weekId,
  propertyId,
  weekNumber,
  weekPrice,
  propertyName,
  onComplete,
}: ReservationFlowProps) {
  const { connected, publicKey } = useWallet()
  const [currentStep, setCurrentStep] = useState<FlowStep>("payment")
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)
  const [processor, setProcessor] = useState<PaymentProcessor | null>(null)
  const [voucherId, setVoucherId] = useState<string | null>(null)
  const [voucherCode, setVoucherCode] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [kycVerified, setKycVerified] = useState<boolean | null>(null)
  const [checkingKYC, setCheckingKYC] = useState(true)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [showPartialPaymentsDialog, setShowPartialPaymentsDialog] = useState(false)
  const [partialPaymentsData, setPartialPaymentsData] = useState<any>(null)

  useEffect(() => {
    const env = getEnvironment()
    const isDemo = env.isDemoMode
    setIsDemoMode(isDemo)
    logger.debug("Demo mode detected", { isDemo })

    const checkKYCStatus = async () => {
      if (isDemo) {
        logger.debug("Demo mode: Skipping KYC verification")
        setKycVerified(true)
        setCheckingKYC(false)
        return
      }

      try {
        const response = await fetch("/api/user/kyc-status")
        const data = await response.json()
        setKycVerified(data.verified)
      } catch (error) {
        logger.error("Error checking KYC", { error })
        setKycVerified(false)
      } finally {
        setCheckingKYC(false)
      }
    }
    checkKYCStatus()
  }, [])

  const steps = [
    { id: "payment", label: "Seleccionar Pago", icon: CreditCard },
    { id: "processing", label: "Procesando", icon: Shield },
    { id: "voucher", label: "Recibir Voucher", icon: Ticket },
    { id: "complete", label: "Completado", icon: CheckCircle2 },
  ]

  const handlePaymentMethodSelect = async (method: PaymentMethod, selectedProcessor?: PaymentProcessor) => {
    logger.debug("Payment method selected", { method, processor: selectedProcessor })

    if (!isDemoMode && !kycVerified) {
      setError("Debes completar la verificación KYC antes de realizar un pago.")
      alert(
        "⚠️ Verificación KYC Requerida\n\nPara proteger tu compra y cumplir con regulaciones, debes completar la verificación de identidad antes de comprar.\n\nSerás redirigido a tu perfil para completar el KYC.",
      )
      window.location.href = "/profile?tab=kyc"
      return
    }

    setPaymentMethod(method)
    setProcessor(selectedProcessor || null)
    setIsProcessing(true)
    setCurrentStep("processing")
    setError(null)

    try {
      if (method === "usdc") {
        if (!connected || !publicKey) {
          throw new Error("Wallet not connected")
        }
        await handleUSDCPayment()
      } else {
        if (selectedProcessor === "conekta") {
          await handleConektaPayment(method)
        } else {
          await handleFiatPayment(method)
        }
      }
    } catch (error) {
      logger.error("Payment error", { error })
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      setError(errorMessage)
      alert(`Payment failed: ${errorMessage}`)
      setIsProcessing(false)
      setCurrentStep("payment")
    }
  }

  const handleUSDCPayment = async () => {
    logger.debug("Processing USDC payment")
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const response = await fetch("/api/vouchers/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_wallet: publicKey?.toString(),
        week_id: weekId,
        property_id: propertyId,
        week_number: weekNumber,
        amount_usdc: weekPrice,
        amount_paid: weekPrice,
        payment_method: "usdc_crypto",
      }),
    })

    const data = await response.json()
    logger.debug("Voucher creation response", { success: data.success })

    if (data.success) {
      setVoucherId(data.voucher.id)
      setVoucherCode(data.voucher.voucher_code)
      setCurrentStep("voucher")
      setIsProcessing(false)
    } else {
      throw new Error(data.error || "Failed to create voucher")
    }
  }

  const handleConektaPayment = async (method: PaymentMethod) => {
    logger.debug("Processing Conekta payment", { method })

    try {
      const seedResponse = await fetch("/api/demo/seed-data", {
        method: "POST",
      })
      const seedData = await seedResponse.json()
      logger.debug("Demo data seed result", { success: seedData.success })
    } catch (error) {
      logger.warn("Could not seed demo data", { error })
    }

    const exchange_rate = 17.5
    const amount_mxn = weekPrice * exchange_rate

    if (method === "oxxo" && requiresPartialPayments(amount_mxn)) {
      logger.info("OXXO payment requires partial payments", { amount_mxn })

      const response = await fetch("/api/payments/oxxo/create-partial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          week_id: weekId,
          property_id: propertyId,
          week_number: weekNumber,
          property_name: propertyName,
          amount: weekPrice,
          user_email: "user@example.com",
          user_name: "Usuario Demo",
        }),
      })

      const data = await response.json()
      logger.debug("Partial payments response", { success: data.success })

      if (data.success) {
        setPartialPaymentsData(data)
        setVoucherId(data.voucher_id)
        setVoucherCode(data.voucher_code)
        setShowPartialPaymentsDialog(true)
        setIsProcessing(false)
        setCurrentStep("voucher")
        return
      } else {
        throw new Error(data.error || "Failed to create partial payments")
      }
    }

    let response
    try {
      response = await fetch("/api/payments/conekta/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          week_id: weekId,
          property_id: propertyId,
          week_number: weekNumber,
          property_name: propertyName,
          amount: weekPrice,
          payment_method: method,
          user_email: "user@example.com",
          user_name: "Usuario Demo",
        }),
      })
    } catch (error) {
      logger.error("Network error calling Conekta API", { error })
      throw new Error("Error de red. Por favor verifica tu conexión.")
    }

    let data
    try {
      data = await response.json()
    } catch (jsonError) {
      logger.error("Failed to parse JSON response", {
        status: response.status,
        statusText: response.statusText,
      })

      const textResponse = await response.text()
      logger.error("Response text", { textResponse })

      throw new Error(
        `Error del servidor (${response.status}). La propiedad o semana no existe. Por favor ejecuta el script SQL 029 para crear datos demo.`,
      )
    }

    logger.debug("Conekta order response", { success: data.success, demoMode: data.demo_mode })

    if (!data.success) {
      if (data.error === "property_not_found" || data.error === "week_not_found") {
        throw new Error(data.message || "Datos no encontrados. Ejecuta el script SQL 029.")
      }
      throw new Error(data.message || data.error || "Error al crear la orden")
    }

    if (data.error === "oxxo_limit_exceeded") {
      alert(`⚠️ Límite de Oxxo Excedido\n\n${data.message}`)
      setIsProcessing(false)
      setCurrentStep("payment")
      return
    }

    if (data.success) {
      if (data.demo_mode && method === "card" && data.payment_status === "paid") {
        alert(
          `💳 Pago con Tarjeta (Demo)\n\n✅ En producción, aquí se abriría el checkout de Conekta.\n\nSimulando pago exitoso...`,
        )
        await simulatePendingVoucher(method, "conekta")
        return
      }

      if (data.demo_mode) {
        alert(
          `💳 ${data.message || `Pago ${method.toUpperCase()} (Demo)`}\n\n✅ En producción, aquí se mostrarían los detalles de pago.\n\nSimulando pago pendiente...`,
        )
        await simulatePendingVoucher(method, "conekta")
      } else {
        if (method === "card" && data.payment_url) {
          window.location.href = data.payment_url
        } else if (data.requires_action) {
          alert(`💳 ${data.message}`)
          await simulatePendingVoucher(method, "conekta")
        }
      }
    }
  }

  const handleFiatPayment = async (method: PaymentMethod) => {
    logger.debug("Processing fiat payment", { method })

    try {
      const seedResponse = await fetch("/api/demo/seed-data", {
        method: "POST",
      })
      const seedData = await seedResponse.json()
      logger.debug("Demo data seed result", { success: seedData.success })
    } catch (error) {
      logger.warn("Could not seed demo data", { error })
    }

    let response
    try {
      response = await fetch("/api/payments/fiat/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          week_id: weekId,
          property_id: propertyId,
          week_number: weekNumber,
          property_name: propertyName,
          amount: weekPrice,
          payment_method: method,
          user_email: "user@example.com",
        }),
      })
    } catch (error) {
      logger.error("Network error calling payment API", { error })
      throw new Error("Error de red. Por favor verifica tu conexión.")
    }

    let data
    try {
      data = await response.json()
    } catch (jsonError) {
      logger.error("Failed to parse JSON response", {
        status: response.status,
        statusText: response.statusText,
      })

      const textResponse = await response.text()
      logger.error("Response text", { textResponse })

      throw new Error(
        `Error del servidor (${response.status}). La propiedad o semana no existe. Por favor ejecuta el script SQL 029 para crear datos demo.`,
      )
    }

    logger.debug("Payment intent response", { success: data.success })

    if (!data.success) {
      if (data.error === "property_not_found" || data.error === "week_not_found") {
        throw new Error(data.message || "Datos no encontrados. Ejecuta el script SQL 029.")
      }
      throw new Error(data.message || data.error || "Error al crear el pago")
    }

    if (data.error === "oxxo_limit_exceeded") {
      alert(
        `⚠️ Límite de Oxxo Excedido\n\n${data.message}\n\nNecesitas hacer ${data.required_payments} pagos:\n${data.payment_amounts.map((amt: number, i: number) => `Pago ${i + 1}: $${amt.toLocaleString()} MXN`).join("\n")}`,
      )
      setIsProcessing(false)
      setCurrentStep("payment")
      return
    }

    if (data.success) {
      if (data.payment_url) {
        if (data.requires_action) {
          alert(
            `💳 ${data.message}\n\n✅ Modo Demo: En producción, aquí se abrirá la ventana de pago.\n\nPor ahora, simularemos que el pago está pendiente.`,
          )
          await simulatePendingVoucher(method, "stripe")
        } else {
          window.location.href = data.payment_url
        }
      }
    }
  }

  const simulatePendingVoucher = async (method: PaymentMethod, paymentProcessor: string) => {
    logger.debug("Simulating pending voucher for demo", { method, processor: paymentProcessor })

    await new Promise((resolve) => setTimeout(resolve, 1500))

    const response = await fetch("/api/vouchers/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_wallet: publicKey?.toString() || "demo-wallet",
        week_id: weekId,
        property_id: propertyId,
        week_number: weekNumber,
        amount_usdc: weekPrice,
        amount_paid: weekPrice,
        payment_method: `${paymentProcessor}_${method}`,
        status: "pending",
      }),
    })

    const data = await response.json()
    if (data.success) {
      setVoucherId(data.voucher.id)
      setVoucherCode(data.voucher.voucher_code)
      setCurrentStep("voucher")
      setIsProcessing(false)
    }
  }

  const pollPaymentStatus = async (paymentIntentId: string) => {
    logger.debug("Starting payment status polling", { paymentIntentId })
    let attempts = 0
    const maxAttempts = 60

    const interval = setInterval(async () => {
      attempts++
      logger.debug("Polling attempt", { attempts })

      if (attempts > maxAttempts) {
        clearInterval(interval)
        setError("Payment confirmation timeout. Please check your vouchers dashboard.")
        setIsProcessing(false)
        setCurrentStep("payment")
        return
      }

      try {
        const response = await fetch(`/api/payments/fiat/status?id=${paymentIntentId}`)
        const data = await response.json()

        logger.debug("Payment status", { status: data.status })

        if (data.status === "succeeded") {
          clearInterval(interval)
          setVoucherId(data.voucher_id)
          setVoucherCode(data.voucher_code)
          setCurrentStep("voucher")
          setIsProcessing(false)
        } else if (data.status === "failed" || data.status === "canceled") {
          clearInterval(interval)
          setError("Payment failed or was cancelled")
          setIsProcessing(false)
          setCurrentStep("payment")
        }
      } catch (error) {
        logger.error("Error polling payment status", { error })
      }
    }, 5000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon
          const isActive = step.id === currentStep
          const isCompleted = steps.findIndex((s) => s.id === currentStep) > index

          return (
            <div key={step.id} className="flex flex-1 flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                  isCompleted
                    ? "border-green-500 bg-green-500 text-white"
                    : isActive
                      ? "border-blue-500 bg-blue-500 text-white"
                      : "border-gray-300 bg-white text-gray-400"
                }`}
              >
                {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </div>
              <span className="mt-2 text-xs text-center">{step.label}</span>
            </div>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {currentStep === "payment" && "Selecciona tu Método de Pago"}
            {currentStep === "processing" && "Procesando tu Pago"}
            {currentStep === "voucher" && "Tu Certificado de Compra"}
            {currentStep === "complete" && "¡Reserva Completada!"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentStep === "payment" && (
            <>
              {isDemoMode && (
                <Alert className="bg-blue-50 border-blue-200">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>🧪 Modo Demo:</strong> Estás en modo de prueba. Los pagos no son reales y puedes probar el
                    flujo completo sin KYC.
                  </AlertDescription>
                </Alert>
              )}

              {checkingKYC ? (
                <Alert>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <AlertDescription>Verificando estado KYC...</AlertDescription>
                </Alert>
              ) : !kycVerified && !isDemoMode ? (
                <Alert className="bg-amber-50 border-amber-200">
                  <Shield className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    <strong>Verificación KYC Requerida:</strong> Debes completar la verificación de identidad antes de
                    realizar un pago.
                    <Button
                      variant="link"
                      className="p-0 h-auto text-amber-900 underline ml-1"
                      onClick={() => (window.location.href = "/profile?tab=kyc")}
                    >
                      Completar KYC ahora
                    </Button>
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="bg-green-50 border-green-200">
                  <Shield className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    {isDemoMode ? (
                      <>🧪 Modo Demo - Paga con USDC, tarjeta, SPEI o en cualquier Oxxo (sin KYC requerido).</>
                    ) : (
                      <>✅ KYC Verificado - Paga con USDC, tarjeta, SPEI o en cualquier Oxxo.</>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <div className="rounded-lg bg-muted p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Propiedad</span>
                  <span className="font-medium">{propertyName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Semana</span>
                  <span className="font-medium">Semana {weekNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Monto</span>
                  <span className="font-bold">${weekPrice.toLocaleString()} USD</span>
                </div>
              </div>

              <PaymentMethodSelector
                amount={weekPrice}
                onSelectMethod={handlePaymentMethodSelect}
                disabled={isProcessing || (!isDemoMode && !kycVerified)}
              />
            </>
          )}

          {currentStep === "processing" && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
              <p className="text-center text-muted-foreground">
                {paymentMethod === "oxxo"
                  ? "Esperando confirmación de pago en Oxxo..."
                  : "Procesando tu pago de forma segura..."}
              </p>
            </div>
          )}

          {currentStep === "voucher" && (
            <>
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {paymentMethod === "oxxo" || paymentMethod === "spei" ? (
                    <>
                      ¡Certificado creado! Tu pago está <strong>pendiente de confirmación</strong>. Una vez que se
                      confirme el pago en {paymentMethod === "oxxo" ? "Oxxo" : "SPEI"}, podrás canjear tu voucher por
                      NFT cuando la propiedad alcance 48 semanas vendidas.
                    </>
                  ) : (
                    <>
                      ¡Pago confirmado! Tu certificado de compra está listo. Podrás canjearlo por NFT cuando la
                      propiedad alcance 48 semanas vendidas.
                    </>
                  )}
                </AlertDescription>
              </Alert>

              {error && (
                <Alert className="bg-red-50 border-red-200">
                  <CheckCircle2 className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              <div className="rounded-lg border-2 border-green-200 bg-green-50 p-6 space-y-3">
                <div className="flex items-center gap-2 mb-4">
                  <Ticket className="h-6 w-6 text-green-600" />
                  <h4 className="font-bold text-lg">Certificado de Compra</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Código</span>
                    <span className="font-mono font-bold">{voucherCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Propiedad</span>
                    <span>{propertyName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Semana</span>
                    <span>Semana {weekNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estado</span>
                    <Badge
                      variant="outline"
                      className={
                        paymentMethod === "oxxo" || paymentMethod === "spei" ? "bg-amber-100" : "bg-yellow-100"
                      }
                    >
                      {paymentMethod === "oxxo" || paymentMethod === "spei" ? "Pago Pendiente" : "Pendiente de Canje"}
                    </Badge>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => {
                  setCurrentStep("complete")
                  if (onComplete) onComplete()
                }}
                className="w-full"
                size="lg"
              >
                Ver Mi Certificado
              </Button>
            </>
          )}

          {currentStep === "complete" && (
            <div className="flex flex-col items-center justify-center py-8">
              <CheckCircle2 className="h-16 w-16 text-green-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">¡Felicidades!</h3>
              <p className="text-center text-muted-foreground mb-4">
                Has reservado la Semana {weekNumber} en {propertyName}
              </p>
              {voucherCode && (
                <div className="w-full rounded-lg bg-muted p-4">
                  <p className="text-xs text-muted-foreground mb-1">Código de Voucher</p>
                  <p className="font-mono text-lg font-bold text-center">{voucherCode}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {partialPaymentsData && (
        <OxxoPartialPaymentsDialog
          open={showPartialPaymentsDialog}
          onOpenChange={setShowPartialPaymentsDialog}
          payments={partialPaymentsData.orders}
          totalPayments={partialPaymentsData.total_payments}
          voucherCode={partialPaymentsData.voucher_code}
          propertyName={propertyName}
          weekNumber={weekNumber}
        />
      )}
    </div>
  )
}
