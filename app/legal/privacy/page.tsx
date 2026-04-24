import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, Download, ChevronLeft } from "lucide-react"
import Link from "next/link"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Volver al inicio
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Aviso de Privacidad</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Versión 1.0.0 - Última actualización: 12 de Diciembre de 2025
          </p>
        </div>

        {/* Warning Banner */}
        <Card className="mb-6 border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
          <CardHeader>
            <CardTitle className="text-blue-900 dark:text-blue-100 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Protección de Datos
            </CardTitle>
            <CardDescription className="text-blue-700 dark:text-blue-300">
              Su privacidad es importante. Este aviso cumple con la LFPDPPP.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full sm:w-auto bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              Descargar PDF
            </Button>
          </CardContent>
        </Card>

        {/* Content */}
        <Card>
          <CardContent className="prose dark:prose-invert max-w-none p-8">
            <Suspense fallback={<div>Cargando...</div>}>
              <PrivacyContent />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function PrivacyContent() {
  return (
    <div className="space-y-6 text-slate-700 dark:text-slate-300">
      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">RESPONSABLE</h2>
        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-6">
          <p className="mb-2">
            <strong>Email:</strong> privacy@weekchain.com
          </p>
          <p className="mb-2">
            <strong>Teléfono:</strong> [TELÉFONO]
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">DATOS QUE RECOPILAMOS</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Identificación:</strong> Nombre, CURP, RFC, INE/Pasaporte
          </li>
          <li>
            <strong>Contacto:</strong> Email, teléfono, dirección
          </li>
          <li>
            <strong>Financieros:</strong> Información bancaria, transacciones
          </li>
          <li>
            <strong>Técnicos:</strong> IP, dispositivo, cookies
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">DERECHOS ARCO</h2>
        <div className="bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100 mb-2">Sus Derechos</h3>
          <ul className="text-emerald-800 dark:text-emerald-200 space-y-1">
            <li>
              ✓ <strong>Acceder</strong> a sus datos personales
            </li>
            <li>
              ✓ <strong>Rectificar</strong> datos incorrectos
            </li>
            <li>
              ✓ <strong>Cancelar</strong> el uso de sus datos
            </li>
            <li>
              ✓ <strong>Oponerse</strong> al tratamiento
            </li>
          </ul>
          <p className="mt-4 text-sm">
            Para ejercer sus derechos, contacte a: <strong>privacy@weekchain.com</strong>
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">SEGURIDAD</h2>
        <p>
          Implementamos medidas de seguridad como encriptación SSL/TLS, autenticación de dos factores, monitoreo de
          accesos y auditorías periódicas para proteger su información.
        </p>
      </section>
    </div>
  )
}
