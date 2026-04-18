"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle2,
  Loader2,
  CreditCard,
  Shield,
  Ticket,
  Coins,
  FileCheck,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from "lucide-react"
import { logger } from "@/lib/config/logger"

interface CompleteDemoFlowProps {
  propertyId: string
  weekId: string
  weekNumber: number
  weekPrice: number
  propertyName: string
}

interface FlowStep {
  id: string
  label: string
  description: string
  icon: any
  status: "pending" | "processing" | "completed" | "error"
}

export function CompleteDemoFlow({ propertyId, weekId, weekNumber, weekPrice, propertyName }: CompleteDemoFlowProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(-1)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)

  const [steps, setSteps] = useState<FlowStep[]>([
    {
      id: "payment",
      label: "Procesar Pago",
      description: "Simulando pago con tarjeta",
      icon: CreditCard,
      status: "pending",
    },
    {
      id: "voucher",
      label: "Crear Certificado",
      description: "Generando certificado de compra",
      icon: Ticket,
      status: "pending",
    },
    {
      id: "escrow",
      label: "Depósito Escrow",
      description: "Depositando fondos en escrow",
      icon: Shield,
      status: "pending",
    },
    {
      id: "confirm",
      label: "Confirmación Admin",
      description: "Aprobación automática del admin",
      icon: FileCheck,
      status: "pending",
    },
    {
      id: "reservation",
      label: "Crear Reservación",
      description: "Registrando reservación en sistema",
      icon: CheckCircle2,
      status: "pending",
    },
    {
      id: "nft",
      label: "Mintear NFT",
      description: "Creando NFT en blockchain",
      icon: Coins,
      status: "pending",
    },
    {
      id: "complete",
      label: "Completado",
      description: "Proceso finalizado exitosamente",
      icon: Sparkles,
      status: "pending",
    },
  ])

  const updateStepStatus = (index: number, status: FlowStep["status"]) => {
    setSteps((prev) => prev.map((step, i) => (i === index ? { ...step, status } : step)))
  }

  const runCompleteFlow = async () => {
    setIsRunning(true)
    setError(null)
    setResult(null)
    setCurrentStepIndex(0)

    try {
      // Simulate each step with delays for visual effect
      for (let i = 0; i < steps.length - 1; i++) {
        setCurrentStepIndex(i)
        updateStepStatus(i, "processing")

        // Delay between steps for visual effect
        await new Promise((resolve) => setTimeout(resolve, 1500))

        updateStepStatus(i, "completed")
      }

      // Execute the complete flow API call
      logger.info("Executing complete demo flow", { propertyId, weekId })

      const response = await fetch("/api/demo/complete-flow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property_id: propertyId,
          week_id: weekId,
          week_number: weekNumber,
          amount: weekPrice,
          payment_method: "card",
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || data.details || "Failed to complete flow")
      }

      logger.info("Complete demo flow successful", data)

      // Mark final step as completed
      setCurrentStepIndex(steps.length - 1)
      updateStepStatus(steps.length - 1, "completed")

      setResult(data)
    } catch (err) {
      logger.error("Complete demo flow error", { error: err })
      const errorMessage = err instanceof Error ? err.message : "Unknown error"
      setError(errorMessage)

      if (currentStepIndex >= 0) {
        updateStepStatus(currentStepIndex, "error")
      }
    } finally {
      setIsRunning(false)
    }
  }

  const resetFlow = () => {
    setSteps((prev) => prev.map((step) => ({ ...step, status: "pending" })))
    setCurrentStepIndex(-1)
    setError(null)
    setResult(null)
  }

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-blue-600" />
          <div>
            <CardTitle>Demostración Completa del Flujo</CardTitle>
            <CardDescription>Simula todo el proceso desde el pago hasta recibir el NFT en segundos</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Property Info */}
        <div className="rounded-lg bg-white/80 p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Propiedad</span>
            <span className="font-medium">{propertyName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Semana</span>
            <span className="font-medium">Semana {weekNumber}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Precio</span>
            <span className="font-bold text-lg">${weekPrice.toLocaleString()} USD</span>
          </div>
        </div>

        {/* Steps Progress */}
        <div className="space-y-3">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = index === currentStepIndex
            const isCompleted = step.status === "completed"
            const isError = step.status === "error"
            const isProcessing = step.status === "processing"

            return (
              <div
                key={step.id}
                className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
                  isActive
                    ? "bg-blue-100 border-2 border-blue-300"
                    : isCompleted
                      ? "bg-green-50 border border-green-200"
                      : isError
                        ? "bg-red-50 border border-red-200"
                        : "bg-white/50 border border-gray-200"
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full flex-shrink-0 ${
                    isCompleted
                      ? "bg-green-500 text-white"
                      : isProcessing
                        ? "bg-blue-500 text-white"
                        : isError
                          ? "bg-red-500 text-white"
                          : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {isProcessing ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : isCompleted ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{step.label}</p>
                    {isCompleted && (
                      <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                        ✓ Completado
                      </Badge>
                    )}
                    {isProcessing && (
                      <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                        En proceso...
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="bg-red-50 border-red-200">
            <AlertDescription className="text-red-800">
              <strong>Error:</strong> {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Success Result */}
        {result && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <div className="space-y-2">
                <p className="font-bold">¡Proceso Completado Exitosamente!</p>
                <div className="text-xs space-y-1 mt-2">
                  <p>
                    • Certificado: <code className="bg-white px-1 rounded">{result.data?.voucher?.code}</code>
                  </p>
                  <p>
                    • NFT: <code className="bg-white px-1 rounded">{result.data?.nft?.mint_address}</code>
                  </p>
                  <p>
                    • Reservación: <code className="bg-white px-1 rounded">{result.data?.reservation?.booking_id}</code>
                  </p>
                </div>
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-green-700 mt-2"
                  onClick={() => (window.location.href = "/dashboard/my-weeks")}
                >
                  Ver en Mi Dashboard <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {!result ? (
            <Button onClick={runCompleteFlow} disabled={isRunning} className="flex-1" size="lg">
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Ejecutando Flujo...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Iniciar Demostración Completa
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          ) : (
            <>
              <Button onClick={resetFlow} variant="outline" className="flex-1 bg-transparent">
                Reiniciar Demo
              </Button>
              <Button onClick={() => (window.location.href = "/dashboard/my-weeks")} className="flex-1">
                Ver Mi Dashboard
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </>
          )}
        </div>

        {/* Info */}
        <Alert>
          <AlertDescription className="text-xs text-muted-foreground">
            💡 Esta demostración ejecuta todo el flujo automáticamente: pago → certificado → escrow → confirmación admin
            → NFT. En producción, algunos pasos requieren aprobaciones manuales y transacciones blockchain reales.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
