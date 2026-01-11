"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Home, Calendar, Shield, FileText, CreditCard } from "lucide-react"
import { useRouter } from "next/navigation"

const steps = [
  {
    id: 1,
    title: "Bienvenido a WEEK-CHAIN",
    description: "Tu plataforma de servicios de tiempo compartido vacacional",
    icon: Home,
    content: (
      <div className="space-y-4">
        <p className="text-lg">
          WEEK-CHAIN te permite contratar derechos de uso vacacional en destinos premium de México por 15 años.
        </p>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
            <div>
              <p className="font-medium">Derecho de Uso Garantizado</p>
              <p className="text-sm text-muted-foreground">
                Tu contrato te da derecho a disfrutar tu semana vacacional cada año durante 15 años
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
            <div>
              <p className="font-medium">Flexibilidad Total</p>
              <p className="text-sm text-muted-foreground">
                Disfruta tu semana, renta en Airbnb o cede tu derecho cuando quieras
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
            <div>
              <p className="font-medium">Gestión Profesional</p>
              <p className="text-sm text-muted-foreground">
                WEEK Management se encarga de todo el mantenimiento y administración
              </p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 2,
    title: "Crea tu Cuenta",
    description: "Registro rápido y seguro",
    icon: FileText,
    content: (
      <div className="space-y-4">
        <p className="text-lg">
          Para contratar tu semana vacacional necesitas crear una cuenta. Es gratis y solo toma 2 minutos.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold mb-2">Proceso Simple</h4>
          <p className="text-sm text-muted-foreground mb-3">Solo necesitas tu correo electrónico para comenzar.</p>
          <ol className="text-sm space-y-2 list-decimal list-inside">
            <li>Ingresa tu correo electrónico</li>
            <li>Crea una contraseña segura</li>
            <li>Verifica tu correo</li>
            <li>Completa tu perfil (opcional)</li>
          </ol>
        </div>
        <p className="text-xs text-muted-foreground">
          Tu información está protegida conforme a la Ley Federal de Protección de Datos Personales.
        </p>
      </div>
    ),
  },
  {
    id: 3,
    title: "Explora Destinos",
    description: "Encuentra tu semana vacacional perfecta",
    icon: Calendar,
    content: (
      <div className="space-y-4">
        <p className="text-lg">Cada destino tiene 52 semanas disponibles. Los precios varían según la temporada.</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="font-semibold text-sm">Temporada Ultra Alta</p>
            <p className="text-xs text-muted-foreground">Navidad, Año Nuevo</p>
            <p className="text-lg font-bold text-red-600 mt-1">2x precio base</p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <p className="font-semibold text-sm">Temporada Alta</p>
            <p className="text-xs text-muted-foreground">Verano, Semana Santa</p>
            <p className="text-lg font-bold text-orange-600 mt-1">1.5x precio base</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="font-semibold text-sm">Temporada Media</p>
            <p className="text-xs text-muted-foreground">Primavera, Otoño</p>
            <p className="text-lg font-bold text-blue-600 mt-1">1x precio base</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="font-semibold text-sm">Temporada Baja</p>
            <p className="text-xs text-muted-foreground">Fuera de temporada</p>
            <p className="text-lg font-bold text-green-600 mt-1">0.7x precio base</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Todos los precios incluyen IVA (16%).</p>
      </div>
    ),
  },
  {
    id: 4,
    title: "Métodos de Pago",
    description: "Múltiples opciones para tu comodidad",
    icon: CreditCard,
    content: (
      <div className="space-y-4">
        <p className="text-lg">Aceptamos los métodos de pago más populares en México.</p>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
            <div>
              <p className="font-medium">Tarjeta de Crédito/Débito</p>
              <p className="text-sm text-muted-foreground">Visa, Mastercard, American Express con 3D Secure</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
            <div>
              <p className="font-medium">OXXO Pay</p>
              <p className="text-sm text-muted-foreground">Paga en efectivo en cualquier OXXO</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
            <div>
              <p className="font-medium">Transferencia SPEI</p>
              <p className="text-sm text-muted-foreground">Transferencia bancaria directa</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
            <div>
              <p className="font-medium">PayPal, Apple Pay, Google Pay</p>
              <p className="text-sm text-muted-foreground">Pagos digitales rápidos y seguros</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 5,
    title: "Seguridad y Transparencia",
    description: "Tu contratación está protegida",
    icon: Shield,
    content: (
      <div className="space-y-4">
        <p className="text-lg">Todos los contratos están respaldados legalmente conforme a la normativa mexicana.</p>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
            <div>
              <p className="font-medium">Certificación NOM-151</p>
              <p className="text-sm text-muted-foreground">Firma electrónica con validez legal vía Legalario</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
            <div>
              <p className="font-medium">Conforme a NOM-029</p>
              <p className="text-sm text-muted-foreground">Cumplimiento con regulación de tiempo compartido</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
            <div>
              <p className="font-medium">Período de Reflexión</p>
              <p className="text-sm text-muted-foreground">5 días hábiles para cancelar sin penalización</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
            <div>
              <p className="font-medium">KYC Verificado</p>
              <p className="text-sm text-muted-foreground">Verificación de identidad para transacciones mayores</p>
            </div>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
          <p className="text-xs text-amber-800">
            <strong>Aviso:</strong> WEEK-CHAIN ofrece servicios de tiempo compartido vacacional. El usuario adquiere un
            derecho personal de uso temporal y NO adquiere propiedad, copropiedad ni expectativa de ganancia.
          </p>
        </div>
      </div>
    ),
  },
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const router = useRouter()
  const progress = ((currentStep + 1) / steps.length) * 100

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      router.push("/properties")
    }
  }

  const handleSkip = () => {
    router.push("/properties")
  }

  const CurrentIcon = steps[currentStep].icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <CurrentIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">{steps[currentStep].title}</CardTitle>
                <CardDescription>{steps[currentStep].description}</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSkip}>
              Saltar
            </Button>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">
            Paso {currentStep + 1} de {steps.length}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {steps[currentStep].content}

          <div className="flex gap-3">
            {currentStep > 0 && (
              <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)} className="flex-1">
                Anterior
              </Button>
            )}
            <Button onClick={handleNext} className="flex-1">
              {currentStep === steps.length - 1 ? "Ver Destinos" : "Siguiente"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
