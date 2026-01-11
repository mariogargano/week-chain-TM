"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, ArrowRight } from "lucide-react"
import { Navbar } from "@/components/navbar"
import Link from "next/link"

export default function WeeksManagementPage() {
  const router = useRouter()

  useEffect(() => {
    // Auto-redirect after 5 seconds
    const timer = setTimeout(() => {
      router.push("/dashboard/user/certificate")
    }, 5000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Navbar user={true} />

      <div className="container mx-auto max-w-4xl px-6 py-16">
        <Card className="border-2 border-amber-500 bg-gradient-to-br from-amber-50 to-white shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-amber-100 rounded-full">
                <AlertTriangle className="h-12 w-12 text-amber-600" />
              </div>
            </div>
            <CardTitle className="text-3xl text-amber-900">Sistema de Semanas Deshabilitado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-white rounded-lg p-6 border border-amber-200">
              <h3 className="font-bold text-lg text-amber-900 mb-3">
                WEEK-CHAIN Ahora Opera con Smart Vacational Certificates
              </h3>
              <p className="text-amber-800 leading-relaxed mb-4">
                La gestión de semanas individuales ha sido discontinuada. El sistema ahora utiliza el modelo{" "}
                <span className="font-bold">Smart Vacational Certificate</span>, que otorga derechos de solicitud de uso
                temporal en lugar de asignación de semanas específicas.
              </p>
              <p className="text-sm text-amber-700 font-medium">
                Este cambio garantiza compliance con NOM-151 y regulaciones PROFECO de protección al consumidor.
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
              <h3 className="font-bold text-lg text-blue-900 mb-3">Tu Nuevo Dashboard de Certificados</h3>
              <p className="text-blue-800 mb-4">
                Accede a tu dashboard actualizado para ver tus certificados activos, solicitar reservas, y gestionar tus
                derechos de uso temporal.
              </p>
              <Link href="/dashboard/user/certificate">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg h-12">
                  Ir a Dashboard de Certificados
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm text-slate-600">Serás redirigido automáticamente en 5 segundos...</p>
              <p className="text-xs text-slate-500">
                ¿Tienes preguntas?{" "}
                <Link href="/help" className="underline font-semibold">
                  Visita nuestro centro de ayuda
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
