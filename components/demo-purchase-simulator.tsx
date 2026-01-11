"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle2, Circle, PlayCircle } from "lucide-react"
import { toast } from "sonner"

interface DemoStep {
  id: string
  title: string
  description: string
  status: "pending" | "processing" | "completed"
  data?: any
}

interface DemoPurchaseSimulatorProps {
  propertyId: string
  weekId: string
  weekNumber: number
  amountUsdc: number
  propertyName: string
}

export function DemoPurchaseSimulator({
  propertyId,
  weekId,
  weekNumber,
  amountUsdc,
  propertyName,
}: DemoPurchaseSimulatorProps) {
  const [isSimulating, setIsSimulating] = useState(false)
  const [steps, setSteps] = useState<DemoStep[]>([
    {
      id: "payment",
      title: "Procesando Pago",
      description: "Simulando pago con tarjeta...",
      status: "pending",
    },
    {
      id: "voucher",
      title: "Generando Certificado",
      description: "Creando certificado de compra...",
      status: "pending",
    },
    {
      id: "escrow",
      title: "Depósito en Escrow",
      description: "Asegurando fondos en contrato inteligente...",
      status: "pending",
    },
    {
      id: "confirmation",
      title: "Confirmación Admin",
      description: "Verificando y confirmando transacción...",
      status: "pending",
    },
    {
      id: "nft",
      title: "Minting NFT",
      description: "Creando tu NFT de propiedad...",
      status: "pending",
    },
  ])

  const updateStepStatus = (stepId: string, status: DemoStep["status"], data?: any) => {
    setSteps((prev) => prev.map((step) => (step.id === stepId ? { ...step, status, data } : step)))
  }

  const simulatePurchase = async () => {
    setIsSimulating(true)
    console.log("[v0] Starting demo purchase simulation")

    try {
      // Step 1: Payment
      updateStepStatus("payment", "processing")
      await new Promise((resolve) => setTimeout(resolve, 1500))
      updateStepStatus("payment", "completed", { payment_id: `DEMO_PAY_${Date.now()}` })

      // Step 2: Voucher
      updateStepStatus("voucher", "processing")
      await new Promise((resolve) => setTimeout(resolve, 1500))
      const voucherCode = `DEMO-${propertyId.slice(0, 8)}-W${weekNumber}`
      updateStepStatus("voucher", "completed", { voucher_code: voucherCode })

      // Step 3: Escrow
      updateStepStatus("escrow", "processing")
      await new Promise((resolve) => setTimeout(resolve, 2000))
      const bookingId = `DEMO_BOOK_${Date.now()}`
      updateStepStatus("escrow", "completed", { booking_id: bookingId })

      // Step 4: Confirmation
      updateStepStatus("confirmation", "processing")
      await new Promise((resolve) => setTimeout(resolve, 1500))
      updateStepStatus("confirmation", "completed", { confirmed_at: new Date().toISOString() })

      // Step 5: NFT Minting
      updateStepStatus("nft", "processing")

      console.log("[v0] Calling simulation API with:", {
        property_id: propertyId,
        week_id: weekId,
        week_number: weekNumber,
        amount_usdc: amountUsdc,
      })

      // Call the actual simulation API
      const response = await fetch("/api/demo/simulate-flow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property_id: propertyId,
          week_id: weekId,
          week_number: weekNumber,
          amount_usdc: amountUsdc,
          payment_method: "card",
        }),
      })

      console.log("[v0] API response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.log("[v0] API error response:", errorData)
        throw new Error(errorData.details || errorData.error || "Simulation failed")
      }

      const result = await response.json()
      console.log("[v0] API success response:", result)

      await new Promise((resolve) => setTimeout(resolve, 2000))
      updateStepStatus("nft", "completed", {
        mint_address: result.data?.nft?.mint_address,
        transaction_hash: result.data?.nft?.transaction_hash,
      })

      toast.success("¡Simulación completada!", {
        description: "Todos los pasos del proceso se ejecutaron exitosamente",
      })

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        window.location.href = "/dashboard/my-weeks"
      }, 2000)
    } catch (error) {
      console.error("[v0] Simulation error:", error)
      toast.error("Error en la simulación", {
        description: error instanceof Error ? error.message : "Por favor intenta nuevamente",
      })

      setSteps((prev) => prev.map((step) => ({ ...step, status: "pending" })))
    } finally {
      setIsSimulating(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Simulador de Compra (DEMO)</CardTitle>
            <CardDescription>
              Simula el proceso completo de compra para {propertyName} - Semana {weekNumber}
            </CardDescription>
          </div>
          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
            Modo Demo
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                {step.status === "completed" ? (
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                ) : step.status === "processing" ? (
                  <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
                ) : (
                  <Circle className="h-6 w-6 text-gray-300" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{step.title}</p>
                  {step.status === "completed" && (
                    <Badge variant="outline" className="text-xs">
                      Completado
                    </Badge>
                  )}
                  {step.status === "processing" && (
                    <Badge variant="outline" className="text-xs bg-blue-50">
                      En proceso...
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{step.description}</p>
                {step.data && (
                  <div className="mt-2 p-2 bg-muted rounded-md text-xs font-mono">
                    {Object.entries(step.data).map(([key, value]) => (
                      <div key={key}>
                        <span className="text-muted-foreground">{key}:</span>{" "}
                        <span className="text-foreground">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <Button onClick={simulatePurchase} disabled={isSimulating} className="w-full" size="lg">
          {isSimulating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Simulando proceso...
            </>
          ) : (
            <>
              <PlayCircle className="mr-2 h-4 w-4" />
              Iniciar Simulación Demo
            </>
          )}
        </Button>

        {/* Info */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900">
            <strong>Nota:</strong> Esta es una simulación completa del proceso de compra. Todos los pasos se ejecutarán
            automáticamente y se crearán registros reales en la base de datos para que puedas mostrar el flujo completo
            a los inversionistas.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
