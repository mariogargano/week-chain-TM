import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Ban, ChevronLeft, Shield, AlertTriangle, Clock, CheckCircle, XCircle, Info } from "lucide-react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { SiteFooter } from "@/components/site-footer"

export default function CancellationsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar />

      <div className="container mx-auto px-4 py-24 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/legal">
            <Button variant="ghost" size="sm" className="mb-4">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Volver a Legal
            </Button>
          </Link>
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold text-slate-900">Política de Cancelaciones y Modificaciones</h1>
            <Badge variant="outline" className="text-xs">
              PROFECO Compliant
            </Badge>
          </div>
          <p className="text-slate-600">Versión 1.0.0 - Última actualización: 27 de Diciembre de 2025</p>
        </div>

        {/* Derecho de Retracto Banner */}
        <Alert className="mb-8 border-2 border-amber-500 bg-amber-50">
          <Shield className="h-5 w-5 text-amber-600" />
          <AlertTitle className="text-lg font-bold text-amber-900">Derecho de Retracto (5 Días Hábiles)</AlertTitle>
          <AlertDescription className="text-amber-800 leading-relaxed mt-2">
            Conforme a la Ley Federal de Protección al Consumidor y PROFECO, usted tiene <strong>5 días hábiles</strong>{" "}
            a partir de la firma del contrato para cancelar su certificado SVC sin penalización y recibir reembolso
            completo del monto pagado. Este derecho es irrenunciable.
          </AlertDescription>
        </Alert>

        <div className="space-y-8">
          {/* Periodo de Retracto */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-600" />
                Periodo de Retracto Legal (Primeros 5 Días Hábiles)
              </CardTitle>
              <CardDescription>Derecho garantizado por ley federal mexicana</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                <h3 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Cancelación Sin Penalización
                </h3>
                <ul className="space-y-2 text-green-800">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>
                      <strong>Plazo:</strong> 5 días hábiles desde la fecha de firma del contrato de adhesión
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>
                      <strong>Reembolso:</strong> 100% del monto pagado, sin deducciones ni penalizaciones
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>
                      <strong>Procesamiento:</strong> Máximo 30 días naturales para devolución del pago
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>
                      <strong>Método:</strong> Solicitud por escrito a legal@week-chain.com o en dashboard
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>
                      <strong>Sin justificación:</strong> No requiere dar razones ni explicaciones
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                <p className="text-sm text-blue-900">
                  <Info className="h-4 w-4 inline mr-2" />
                  <strong>Ejemplo:</strong> Si firmó su contrato el lunes 1 de enero, tiene hasta el lunes 8 de enero
                  (excluyendo sábados y domingos) para solicitar cancelación sin penalización.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Después del Periodo de Retracto */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ban className="h-5 w-5 text-red-600" />
                Cancelación Después del Periodo de Retracto
              </CardTitle>
              <CardDescription>Aplican condiciones específicas del contrato de adhesión</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <AlertTitle className="text-red-900">Importante - No Reembolsable</AlertTitle>
                <AlertDescription className="text-red-800">
                  Después del periodo de retracto de 5 días hábiles, el certificado SVC{" "}
                  <strong>NO es reembolsable</strong> bajo circunstancias normales. El derecho de solicitud de uso
                  vacacional ya fue activado y la vigencia está en curso.
                </AlertDescription>
              </Alert>

              <div className="space-y-4 mt-6">
                <h4 className="font-semibold text-slate-900">Excepciones Evaluables (Sin Garantía)</h4>
                <p className="text-sm text-slate-600">
                  En casos excepcionales, WEEK-CHAIN puede evaluar solicitudes de cancelación parcial o modificación,
                  sin obligación de aprobación:
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <h5 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      Enfermedad Grave
                    </h5>
                    <p className="text-sm text-slate-600">
                      Diagnóstico médico grave que impida viajar durante toda la vigencia del certificado
                      <strong> (requiere certificación médica)</strong>
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <h5 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      Fallecimiento del Titular
                    </h5>
                    <p className="text-sm text-slate-600">
                      Los herederos directos pueden solicitar cancelación con reembolso proporcional{" "}
                      <strong>(requiere acta de defunción)</strong>
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <h5 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      Fuerza Mayor
                    </h5>
                    <p className="text-sm text-slate-600">
                      Desastres naturales, pandemias, conflictos bélicos que impidan operación del servicio
                      <strong> (evaluación caso por caso)</strong>
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <h5 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      Incumplimiento de WEEK-CHAIN
                    </h5>
                    <p className="text-sm text-slate-600">
                      Si el sistema NO ofrece alternativas viables durante 12 meses consecutivos
                      <strong> (requiere registro de solicitudes)</strong>
                    </p>
                  </div>
                </div>

                <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4 mt-4">
                  <p className="text-sm text-amber-900">
                    <AlertTriangle className="h-4 w-4 inline mr-2" />
                    <strong>Sin Garantía:</strong> Estas excepciones se evalúan caso por caso sin obligación de
                    aprobación. El reembolso, si aplica, será proporcional al tiempo restante de vigencia con deducción
                    administrativa del 25%.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cancelación de Reservaciones Confirmadas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-orange-600" />
                Cancelación de Reservaciones Confirmadas
              </CardTitle>
              <CardDescription>Políticas para estancias ya confirmadas (post-OFFER)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-600">
                Una vez que acepta una OFFER y confirma una reservación específica, aplican las siguientes políticas de
                cancelación:
              </p>

              <div className="space-y-4">
                <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded">
                  <h4 className="font-semibold text-green-900 mb-2">30+ Días Antes del Check-In</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>
                      • Penalización: <strong>25%</strong> del monto de la reservación
                    </li>
                    <li>
                      • Reembolso: <strong>75%</strong> del monto pagado
                    </li>
                    <li>• Procesamiento: 15-30 días hábiles</li>
                  </ul>
                </div>

                <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                  <h4 className="font-semibold text-yellow-900 mb-2">15-29 Días Antes del Check-In</h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>
                      • Penalización: <strong>50%</strong> del monto de la reservación
                    </li>
                    <li>
                      • Reembolso: <strong>50%</strong> del monto pagado
                    </li>
                    <li>• Procesamiento: 15-30 días hábiles</li>
                  </ul>
                </div>

                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
                  <h4 className="font-semibold text-red-900 mb-2">Menos de 15 Días o No-Show</h4>
                  <ul className="text-sm text-red-800 space-y-1">
                    <li>
                      • Penalización: <strong>100%</strong> del monto de la reservación
                    </li>
                    <li>
                      • Reembolso: <strong>No reembolsable</strong>
                    </li>
                    <li>• El periodo anual se considera utilizado</li>
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mt-4">
                <p className="text-sm text-blue-900">
                  <Info className="h-4 w-4 inline mr-2" />
                  <strong>Recomendación:</strong> Contrate seguro de viaje para proteger su inversión ante emergencias
                  imprevistas. Las políticas de cancelación protegen a la red de destinos participantes.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Modificaciones de Reservación */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-600" />
                Modificaciones de Fechas o Destino
              </CardTitle>
              <CardDescription>Cambios después de confirmar reservación</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-600">
                Los cambios de fecha o destino después de CONFIRM están sujetos a disponibilidad del sistema y fees
                administrativos:
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Modificación con 30+ Días</h4>
                    <p className="text-sm text-slate-600">
                      Fee administrativo de $150 USD + diferencia de precio si aplica. Sujeto a disponibilidad de nuevas
                      fechas solicitadas.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Modificación con 15-29 Días</h4>
                    <p className="text-sm text-slate-600">
                      Fee administrativo de $300 USD + diferencia de precio si aplica. Disponibilidad muy limitada en
                      este plazo.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Menos de 15 Días</h4>
                    <p className="text-sm text-slate-600">
                      Modificaciones NO permitidas. Debe cancelar conforme a políticas aplicables y enviar nueva
                      solicitud.
                    </p>
                  </div>
                </div>
              </div>

              <Alert className="border-amber-200 bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800 text-sm">
                  Las modificaciones NO están garantizadas. Si no hay disponibilidad para las nuevas fechas solicitadas,
                  su reservación original se mantiene o puede cancelarla conforme a políticas aplicables.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Proceso de Cancelación */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Proceso de Solicitud de Cancelación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h4 className="font-semibold text-slate-900">Pasos para Solicitar Cancelación:</h4>

              <ol className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <h5 className="font-semibold text-slate-900">Enviar Solicitud Formal</h5>
                    <p className="text-sm text-slate-600">
                      Email a <strong>legal@week-chain.com</strong> con asunto "Solicitud de Cancelación - [Tu Código de
                      Certificado]"
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <h5 className="font-semibold text-slate-900">Incluir Información Requerida</h5>
                    <p className="text-sm text-slate-600">
                      Nombre completo, código de certificado, fecha de firma del contrato, motivo de cancelación (si
                      aplica excepción)
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <h5 className="font-semibold text-slate-900">Adjuntar Documentación</h5>
                    <p className="text-sm text-slate-600">
                      Copia del contrato, comprobante de pago, y documentación probatoria si solicita excepción
                      (certificado médico, acta de defunción, etc.)
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">
                    4
                  </div>
                  <div>
                    <h5 className="font-semibold text-slate-900">Recibir Respuesta</h5>
                    <p className="text-sm text-slate-600">
                      WEEK-CHAIN responderá en máximo 10 días hábiles con aprobación/rechazo y monto de reembolso si
                      aplica
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">
                    5
                  </div>
                  <div>
                    <h5 className="font-semibold text-slate-900">Procesamiento de Reembolso</h5>
                    <p className="text-sm text-slate-600">
                      Si se aprueba, el reembolso se procesa en 15-30 días hábiles al método de pago original
                    </p>
                  </div>
                </li>
              </ol>

              <div className="bg-slate-100 rounded-lg p-4 mt-6">
                <h5 className="font-semibold text-slate-900 mb-2">Contacto Legal</h5>
                <div className="text-sm text-slate-700 space-y-1">
                  <p>
                    <strong>Email:</strong> legal@week-chain.com
                  </p>
                  <p>
                    <strong>Horario:</strong> Lunes a Viernes, 9:00 - 18:00 hrs (Tiempo del Centro, México)
                  </p>
                  <p>
                    <strong>Tiempo de respuesta:</strong> Máximo 10 días hábiles
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer Links */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
            <CardHeader className="text-center">
              <CardTitle>Información Legal Adicional</CardTitle>
              <CardDescription>Consulte nuestros documentos legales completos</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap justify-center gap-4">
              <Button asChild variant="outline" className="bg-white">
                <Link href="/legal/terms">Términos y Condiciones</Link>
              </Button>
              <Button asChild variant="outline" className="bg-white">
                <Link href="/legal/privacy">Aviso de Privacidad</Link>
              </Button>
              <Button asChild variant="outline" className="bg-white">
                <Link href="/disclaimer">Disclaimer Legal</Link>
              </Button>
              <Button asChild variant="outline" className="bg-white">
                <Link href="/faq">Preguntas Frecuentes</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <SiteFooter />
    </div>
  )
}
