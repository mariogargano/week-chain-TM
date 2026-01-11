"use client"

import { Suspense } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, Lock, ShieldCheck } from "lucide-react"
import { Navbar } from "@/components/navbar"

function ReservarContent() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFDAC1]/30 via-white to-[#B5EAD7]/30">
      <Navbar />

      <div className="container mx-auto max-w-3xl px-4 py-20 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="h-10 w-10 text-red-600" />
        </div>

        <h1 className="text-3xl font-bold text-slate-900 mb-4">La Compra Directa de Semanas No Está Disponible</h1>

        <Card className="mb-6 border-2 border-amber-200 bg-amber-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-1" />
              <div className="text-left">
                <h3 className="font-bold text-amber-900 mb-2">Modelo de Certificados de Uso Temporal</h3>
                <p className="text-sm text-amber-800 mb-3">
                  WEEK-CHAIN opera bajo un modelo de <strong>Certificados de Uso Vacacional Temporal</strong> con
                  validez de 15 años. NO vendemos semanas específicas, propiedades, ni fracciones inmobiliarias.
                </p>
                <p className="text-sm text-amber-800">
                  Los certificados otorgan <strong>derechos de solicitud de uso</strong> sujetos a disponibilidad,
                  coordinados mediante nuestro sistema de reservaciones request-based.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 border-2 border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
              <div className="text-left">
                <h3 className="font-bold text-blue-900 mb-2">¿Cómo Funciona?</h3>
                <ol className="text-sm text-blue-800 space-y-2">
                  <li>
                    1. <strong>Adquiere un Certificado</strong> (Silver, Gold, Platinum, o Signature)
                  </li>
                  <li>
                    2. <strong>Solicita uso</strong> de alojamientos en nuestro pool global de suministro
                  </li>
                  <li>
                    3. <strong>Recibe oferta</strong> del equipo administrativo según disponibilidad
                  </li>
                  <li>
                    4. <strong>Confirma tu reservación</strong> cuando aceptes la oferta
                  </li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => router.push("/auth")}
            size="lg"
            className="bg-[#FF9AA2] hover:bg-[#FF9AA2]/90 text-lg px-8"
          >
            Ver Certificados Disponibles
          </Button>
          <Button asChild variant="outline" size="lg" className="text-lg px-8 bg-transparent">
            <Link href="/properties">Explorar Destinos</Link>
          </Button>
        </div>

        <p className="text-xs text-slate-500 mt-8 max-w-2xl mx-auto">
          Este modelo NO es multipropiedad, NO es timeshare, NO es inversión inmobiliaria. Es un derecho de uso temporal
          coordinado mediante solicitud.
        </p>
      </div>
    </div>
  )
}

export default function ReservarPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
      <ReservarContent />
    </Suspense>
  )
}
