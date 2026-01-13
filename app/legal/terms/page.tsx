import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, Download, ChevronLeft, AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function TermsPage() {
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
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Términos y Condiciones</h1>
            <Badge variant="outline" className="text-xs">
              NOM-029 Compliant
            </Badge>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            Versión 1.0.0 - Última actualización: 12 de Diciembre de 2025
          </p>
        </div>

        {/* Warning Banner - Derecho de Retracto */}
        <Card className="mb-6 border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
          <CardHeader>
            <CardTitle className="text-amber-900 dark:text-amber-100 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Derecho de Retracto (NOM-029)
            </CardTitle>
            <CardDescription className="text-amber-700 dark:text-amber-300">
              Tiene 5 días hábiles para cancelar su compra sin penalización
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
              <TermsContent />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function TermsContent() {
  return (
    <div className="space-y-6 text-slate-700 dark:text-slate-300">
      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">1. INFORMACIÓN GENERAL</h2>
        <p>
          WEEK-CHAIN ("la Plataforma") es operada por [RAZÓN SOCIAL], con domicilio en [DIRECCIÓN], en cumplimiento con
          la NOM-029-SCFI-2016 y demás leyes aplicables en México.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">2. NATURALEZA DEL SERVICIO</h2>
        <p className="mb-4">
          Los certificados digitales emitidos por WEEK-CHAIN representan{" "}
          <strong>derechos de uso vacacional temporal</strong> registrados en blockchain Solana para trazabilidad
          inmutable, y NO son:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Instrumentos financieros ni valores bursátiles</li>
          <li>Promesas de retorno financiero</li>
          <li>Participaciones accionarias</li>
          <li>Propiedad inmobiliaria o copropiedad</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">3. DERECHO DE RETRACTO (NOM-029)</h2>
        <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-2 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Periodo de Reflexión
          </h3>
          <ul className="text-amber-800 dark:text-amber-200 space-y-2">
            <li>✓ Puede cancelar su compra dentro de 5 días hábiles</li>
            <li>✓ Reembolso total sin penalizaciones</li>
            <li>✓ Procesamiento en máximo 30 días naturales</li>
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">4. PROGRAMA DE REFERIDOS</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Límite: 50 referidos por mes (usuarios en México)</li>
          <li>Comisión: 10% del monto de la primera compra</li>
          <li>Retención fiscal según legislación vigente</li>
          <li>Reset automático cada 1ro del mes</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">5. PROTECCIÓN DE DATOS</h2>
        <p>
          Su información personal se maneja conforme a nuestro{" "}
          <Link href="/legal/privacy" className="text-blue-600 hover:underline">
            Aviso de Privacidad
          </Link>{" "}
          y la Ley Federal de Protección de Datos Personales.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">6. CONTACTO</h2>
        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-6">
          <p className="mb-2">
            <strong>Email Legal:</strong> legal@weekchain.com
          </p>
          <p className="mb-2">
            <strong>Email Privacidad:</strong> privacy@weekchain.com
          </p>
          <p className="mb-2">
            <strong>Horario:</strong> Lunes a Viernes, 9:00 - 18:00 hrs
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">7. TECNOLOGÍA BLOCKCHAIN SOLANA</h2>
        <p className="mb-4">
          WEEK-CHAIN utiliza la blockchain de Solana para registrar de forma inmutable cada certificado SVC emitido:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Cada certificado se registra en Solana con un hash único</li>
          <li>La trazabilidad es pública y verificable por cualquier usuario</li>
          <li>Los registros en blockchain NO constituyen propiedad digital ni activo financiero</li>
          <li>La blockchain solo sirve como capa de verificación y auditoría</li>
        </ul>
        <div className="bg-purple-100 dark:bg-purple-900 rounded-lg p-6 mt-4">
          <p className="mb-2">
            <strong>Aclaración Importante:</strong> El registro en blockchain Solana NO convierte el certificado en
            criptomoneda, NFT comercializable ni activo digital con valor de mercado.
          </p>
        </div>
      </section>
    </div>
  )
}
