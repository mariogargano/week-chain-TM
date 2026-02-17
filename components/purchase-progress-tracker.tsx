"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Clock, Loader2, CreditCard, Shield, Ticket, Coins, Sparkles } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PurchaseProgressTrackerProps {
  voucherId: string
  voucherCode: string
  propertyName: string
  weekNumber: number
  paymentMethod: string
  isDemoMode?: boolean
}

type ProgressStep = {
  id: string
  label: string
  description: string
  icon: any
  status: "completed" | "in_progress" | "pending"
  timestamp?: string
}

export function PurchaseProgressTracker({
  voucherId,
  voucherCode,
  propertyName,
  weekNumber,
  paymentMethod,
  isDemoMode = false,
}: PurchaseProgressTrackerProps) {
  const [steps, setSteps] = useState<ProgressStep[]>([
    {
      id: "payment",
      label: "Pago Recibido",
      description: `Pago procesado vía ${paymentMethod.toUpperCase()}`,
      icon: CreditCard,
      status: "completed",
      timestamp: new Date().toISOString(),
    },
    {
      id: "voucher",
      label: "Certificado Generado",
      description: `Código: ${voucherCode}`,
      icon: Ticket,
      status: "in_progress",
    },
    {
      id: "escrow",
      label: "Fondos en Escrow",
      description: "Depósito seguro en blockchain",
      icon: Shield,
      status: "pending",
    },
    {
      id: "confirmation",
      label: "Confirmación Admin",
      description: "Verificación y aprobación",
      icon: CheckCircle2,
      status: "pending",
    },
    {
      id: "nft",
      label: "NFT Minteado",
      description: "Token de propiedad en blockchain",
      icon: Sparkles,
      status: "pending",
    },
  ])

  const [currentStepIndex, setCurrentStepIndex] = useState(1)
  const [isSimulating, setIsSimulating] = useState(false)

  useEffect(() => {
    if (isDemoMode && currentStepIndex < steps.length) {
      const timer = setTimeout(() => {
        completeCurrentStep()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [currentStepIndex, isDemoMode])

  const completeCurrentStep = () => {
    setSteps((prev) =>
      prev.map((step, index) => {
        if (index === currentStepIndex) {
          return {
            ...step,
            status: "completed" as const,
            timestamp: new Date().toISOString(),
          }
        }
        if (index === currentStepIndex + 1) {
          return { ...step, status: "in_progress" as const }
        }
        return step
      }),
    )
    setCurrentStepIndex((prev) => prev + 1)
  }

  const simulateFullFlow = async () => {
    setIsSimulating(true)
    for (let i = currentStepIndex; i < steps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      completeCurrentStep()
    }
    setIsSimulating(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-50 border-green-200"
      case "in_progress":
        return "text-blue-600 bg-blue-50 border-blue-200"
      default:
        return "text-gray-400 bg-gray-50 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case "in_progress":
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  const allCompleted = steps.every((step) => step.status === "completed")

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Progreso de tu Compra</CardTitle>
          {isDemoMode && !allCompleted && (
            <Badge variant="outline" className="bg-blue-50">
              🧪 Modo Demo
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isDemoMode && !allCompleted && (
          <Alert className="bg-blue-50 border-blue-200">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Simulación Automática:</strong> En modo demo, el proceso se completa automáticamente cada 3
              segundos. En producción, cada paso requiere confirmación real.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isLast = index === steps.length - 1

            return (
              <div key={step.id} className="relative">
                {!isLast && (
                  <div
                    className={`absolute left-5 top-12 h-full w-0.5 ${
                      step.status === "completed" ? "bg-green-200" : "bg-gray-200"
                    }`}
                  />
                )}

                <div className="flex gap-4">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${getStatusColor(step.status)}`}
                  >
                    {step.status === "completed" ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : step.status === "in_progress" ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{step.label}</h4>
                      {step.status === "completed" && step.timestamp && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(step.timestamp).toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{step.description}</p>

                    {step.status === "in_progress" && (
                      <div className="mt-2">
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                          <div className="h-full w-full animate-pulse bg-gradient-to-r from-blue-500 to-blue-600" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {allCompleted && (
          <Alert className="bg-green-50 border-green-200">
            <Sparkles className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>¡Proceso Completado!</strong> Tu NFT ha sido minteado exitosamente. Ahora eres propietario de la
              Semana {weekNumber} en {propertyName}.
            </AlertDescription>
          </Alert>
        )}

        {isDemoMode && !allCompleted && !isSimulating && (
          <Button onClick={simulateFullFlow} className="w-full bg-transparent" variant="outline">
            <Sparkles className="mr-2 h-4 w-4" />
            Simular Proceso Completo
          </Button>
        )}

        {allCompleted && (
          <div className="grid gap-2 sm:grid-cols-2">
            <Button variant="outline" className="w-full bg-transparent">
              <Ticket className="mr-2 h-4 w-4" />
              Ver Certificado
            </Button>
            <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600">
              <Coins className="mr-2 h-4 w-4" />
              Ver NFT
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
