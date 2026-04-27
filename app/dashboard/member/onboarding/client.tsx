"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ShieldCheck,
  ShoppingCart,
  Zap,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  Lock,
  Loader2,
} from "lucide-react"

interface OnboardingClientProps {
  user: {
    id: string
    full_name: string
    email: string
    onboarding_status: string
  } | null
  kyc: {
    status: string
    kyc_updated_at: string | null
  } | null
  userEmail: string
}

export default function OnboardingClient({ user, kyc, userEmail }: OnboardingClientProps) {
  const [isStartingKyc, setIsStartingKyc] = useState(false)

  const kycStatus = kyc?.status || "missing"
  const isBusy = kycStatus === "pending"
  const isApproved = kycStatus === "approved"
  const isFailed = kycStatus === "failed"

  const handleStartKyc = async () => {
    setIsStartingKyc(true)
    try {
      window.location.href = "/dashboard/member/kyc?next=onboarding"
    } finally {
      setIsStartingKyc(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">Bienvenido a WEEK-CHAIN</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          En 3 pasos estás listo para disfrutar de vacaciones en nuestras mejores propiedades
        </p>
      </div>

      {/* Steps Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Step 1: KYC */}
        <Card className={`border-2 ${isApproved ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-base">Paso 1: Verifica tu identidad</CardTitle>
                <CardDescription className="text-xs">KYC / Persona</CardDescription>
              </div>
              {isApproved ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
              ) : isBusy ? (
                <Clock className="h-5 w-5 text-amber-600 flex-shrink-0 animate-pulse" />
              ) : (
                <AlertCircle className="h-5 w-5 text-sky-600 flex-shrink-0" />
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {isApproved
                ? "✓ Tu identidad ha sido verificada exitosamente"
                : isBusy
                  ? "⏳ Estamos revisando tu documentación..."
                  : "Necesitamos verificar tu identidad para poder comprar certificados"}
            </p>
            {!isApproved && !isBusy && (
              <Button
                onClick={handleStartKyc}
                disabled={isStartingKyc}
                className="w-full bg-sky-500 hover:bg-sky-600"
                size="sm"
              >
                {isStartingKyc ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Redireccionando...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    Iniciar verificación
                  </>
                )}
              </Button>
            )}
            {isBusy && (
              <p className="text-xs text-muted-foreground">
                Revisaremos tu documentación en las próximas 24 horas. Te notificaremos por correo.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Compra */}
        <Card className={`border-2 ${isApproved ? "border-sky-200" : "border-border opacity-50"}`}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-base">Paso 2: Compra certificado</CardTitle>
                <CardDescription className="text-xs">SVC PAX 2-8</CardDescription>
              </div>
              {isApproved ? (
                <ShoppingCart className="h-5 w-5 text-sky-600 flex-shrink-0" />
              ) : (
                <Lock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {isApproved
                ? "Tu identidad está verificada. ¡Ya puedes comprar!"
                : "Se habilitará una vez completes tu verificación KYC"}
            </p>
            {isApproved && (
              <Button asChild className="w-full bg-emerald-500 hover:bg-emerald-600" size="sm">
                <Link href="/#certificados">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Ver certificados
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Step 3: Usa */}
        <Card className={`border-2 ${isApproved ? "border-sky-200" : "border-border opacity-50"}`}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-base">Paso 3: Usa tus semanas</CardTitle>
                <CardDescription className="text-xs">Reservar estancia</CardDescription>
              </div>
              {isApproved ? (
                <Zap className="h-5 w-5 text-sky-600 flex-shrink-0" />
              ) : (
                <Lock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Después de comprar, accede a tu calendario para reservar tus vacaciones
            </p>
            <Button disabled variant="outline" className="w-full" size="sm">
              <ChevronRight className="h-4 w-4 mr-2" />
              Próximamente
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-sky-200 bg-sky-50">
          <CardHeader>
            <CardTitle className="text-base">¿Por qué necesito verificar mi identidad?</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            La verificación KYC es un requisito legal para transacciones financieras. Protege a todos los participantes del sistema y cumple con regulaciones de AML (Anti-Lavado de Dinero).
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50">
          <CardHeader>
            <CardTitle className="text-base">¿Cuánto tarda?</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            La verificación es rápida (5 minutos). Normalmente obtenemos resultados en minutos. En casos excepcionales puede tomar hasta 24 horas.
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-base">¿Qué documentos necesito?</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Una identificación oficial vigente (INE, pasaporte) y una selfie. El proceso es 100% digital y seguro.
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="text-base">¿Es seguro?</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Usamos Persona, una plataforma certificada con encriptación de grado bancario. Tus datos están completamente protegidos.
          </CardContent>
        </Card>
      </div>

      {/* CTA Section */}
      <div className="text-center space-y-4 pt-4">
        {!isApproved && !isBusy && (
          <>
            <p className="text-muted-foreground">El siguiente paso es completar tu verificación de identidad</p>
            <Button
              onClick={handleStartKyc}
              disabled={isStartingKyc}
              size="lg"
              className="bg-sky-500 hover:bg-sky-600 px-8"
            >
              {isStartingKyc ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Iniciando...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-5 w-5 mr-2" />
                  Iniciar verificación KYC
                </>
              )}
            </Button>
          </>
        )}

        {isApproved && (
          <>
            <p className="text-emerald-600 font-medium">✓ Tu verificación está completa</p>
            <Button asChild size="lg" className="bg-emerald-500 hover:bg-emerald-600 px-8">
              <Link href="/#certificados">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Compra tu certificado ahora
              </Link>
            </Button>
          </>
        )}

        {isBusy && (
          <p className="text-amber-600 text-sm">
            Tu verificación está en revisión. Te notificaremos por correo cuando esté lista.
          </p>
        )}
      </div>
    </div>
  )
}
