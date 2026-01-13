import { AlertTriangle, Scale, FileText, Info, BookOpen } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"

export const metadata = {
  title: "Disclaimer Legal | WEEK-CHAIN Smart Vacational Certificates",
  description:
    "Avisos legales obligatorios sobre el Smart Vacational Certificate (SVC). Conoce tus derechos y limitaciones bajo el modelo REQUEST → OFFER → CONFIRM.",
}

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-amber-100 rounded-full">
              <AlertTriangle className="h-10 w-10 text-amber-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Disclaimer Legal</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Avisos legales obligatorios sobre el Smart Vacational Certificate (SVC) y el modelo de servicio WEEK-CHAIN
          </p>
        </div>

        {/* Aviso principal */}
        <Alert className="mb-8 border-2 border-amber-500 bg-amber-50">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <AlertTitle className="text-lg font-bold text-amber-900">Aviso Importante - Lectura Obligatoria</AlertTitle>
          <AlertDescription className="text-amber-800 leading-relaxed mt-2">
            Los Smart Vacational Certificates (SVC) de WEEK-CHAIN otorgan derechos personales y temporales de solicitud
            de uso vacacional por hasta 15 años. NO son propiedad inmobiliaria, inversión financiera ni instrumentos que
            generen rendimientos. Lea cuidadosamente este disclaimer antes de adquirir un certificado.
          </AlertDescription>
        </Alert>

        <div className="space-y-8">
          {/* Lo que NO es el SVC */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-red-600" />
                Lo que NO es el Smart Vacational Certificate
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-600 leading-relaxed">
                El Smart Vacational Certificate (SVC) <strong className="text-slate-900">NO es</strong>:
              </p>
              <ul className="list-disc list-inside text-slate-600 ml-4 space-y-2">
                <li>
                  <strong>Propiedad inmobiliaria:</strong> No otorga derechos reales sobre bienes inmuebles
                </li>
                <li>
                  <strong>Copropiedad:</strong> No constituye participación en propiedad de ninguna clase
                </li>
                <li>
                  <strong>Servicio de propiedad compartida:</strong> No asigna semanas específicas con derechos de
                  propiedad
                </li>
                <li>
                  <strong>Fracción inmobiliaria:</strong> No representa división de propiedad
                </li>
                <li>
                  <strong>Inversión financiera:</strong> No es un instrumento bursátil ni de rendimiento
                </li>
                <li>
                  <strong>Instrumento con rendimientos:</strong> No genera ganancias, dividendos ni retornos
                </li>
                <li>
                  <strong>Activo transferible libremente:</strong> Requiere autorización para transferencia
                </li>
                <li>
                  <strong>Garantía de destinos:</strong> No asegura acceso a propiedades, fechas o ubicaciones
                  específicas
                </li>
              </ul>
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-red-900 font-semibold">
                  ADVERTENCIA: No adquiera un certificado SVC esperando ganancias económicas, valorización de activo o
                  garantías de disponibilidad. El SVC es exclusivamente un servicio de solicitud de uso vacacional
                  temporal.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Lo que SÍ es el SVC */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-green-600" />
                Lo que SÍ es el Smart Vacational Certificate
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-600 leading-relaxed">
                El Smart Vacational Certificate (SVC) <strong className="text-slate-900">SÍ es</strong>:
              </p>
              <ul className="list-disc list-inside text-slate-600 ml-4 space-y-2">
                <li>
                  <strong>Derecho personal y temporal:</strong> Derecho de solicitar uso vacacional por hasta 15 años
                </li>
                <li>
                  <strong>Sistema REQUEST → OFFER → CONFIRM:</strong> Flujo obligatorio donde solicitas, recibes oferta
                  y confirmas
                </li>
                <li>
                  <strong>Servicio sujeto a disponibilidad:</strong> Todas las solicitudes requieren aprobación
                  administrativa
                </li>
                <li>
                  <strong>Certificado digital:</strong> Documento electrónico con vigencia y términos específicos
                </li>
                <li>
                  <strong>Derecho intransferible (salvo autorización):</strong> Requiere permiso expreso para
                  transferencia
                </li>
                <li>
                  <strong>Servicio no heredable automáticamente:</strong> La vigencia termina con el titular salvo
                  acuerdo escrito
                </li>
              </ul>
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-green-900">
                  <strong>Correcto:</strong> El SVC te permite solicitar estadías en destinos participantes durante la
                  vigencia, sujeto a disponibilidad real y aprobación caso por caso.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Flujo REQUEST → OFFER → CONFIRM */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Modelo de Solicitud Obligatorio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-600 leading-relaxed">
                El flujo <strong className="text-slate-900">REQUEST → OFFER → CONFIRM</strong> es obligatorio para todas
                las solicitudes de uso:
              </p>
              <div className="space-y-4 mt-4">
                <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                  <h4 className="font-semibold text-blue-900 mb-2">1. REQUEST (Solicitud)</h4>
                  <p className="text-sm text-blue-800">
                    El usuario envía una solicitud indicando fechas deseadas, destino preferido, número de personas y
                    duración de estadía. Esta es una SOLICITUD, no una reserva.
                  </p>
                </div>
                <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                  <h4 className="font-semibold text-blue-900 mb-2">2. OFFER (Oferta)</h4>
                  <p className="text-sm text-blue-800">
                    El sistema revisa disponibilidad real en la red de destinos participantes y envía una oferta con
                    opciones concretas (propiedad específica, fechas disponibles, precio final). El usuario tiene 48-72
                    horas para responder.
                  </p>
                </div>
                <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                  <h4 className="font-semibold text-blue-900 mb-2">3. CONFIRM (Confirmación)</h4>
                  <p className="text-sm text-blue-800">
                    El usuario acepta o rechaza la oferta. Solo al aceptar se confirma la reservación. Si rechaza, puede
                    hacer una nueva solicitud pero sin garantía de mejores opciones.
                  </p>
                </div>
              </div>
              <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-amber-900 font-semibold">
                  IMPORTANTE: No existe reserva directa ni garantía de que recibirás oferta para tus fechas/destino
                  solicitado. El sistema ofrece alternativas disponibles, no necesariamente tu primera opción.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Limitaciones y Riesgos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                Limitaciones y Riesgos del Servicio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-600 leading-relaxed">
                Al adquirir un SVC, usted acepta las siguientes limitaciones y riesgos:
              </p>
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-semibold text-slate-900 mb-2">Riesgo de Disponibilidad</h4>
                  <p className="text-sm text-slate-600">
                    Las fechas, destinos o propiedades solicitadas pueden NO estar disponibles. Temporadas altas
                    (diciembre, semana santa, verano) tienen demanda mayor y disponibilidad limitada.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-semibold text-slate-900 mb-2">Riesgo de Alternativas No Deseadas</h4>
                  <p className="text-sm text-slate-600">
                    El sistema puede ofrecer destinos alternativos diferentes a tu solicitud original. No hay obligación
                    de aceptar la oferta, pero tampoco garantía de recibir mejor opción en siguiente solicitud.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-semibold text-slate-900 mb-2">Riesgo de Liquidez (Transferencia)</h4>
                  <p className="text-sm text-slate-600">
                    Puede ser difícil o imposible encontrar compradores para tu certificado. WEEK-CHAIN NO garantiza
                    mercado secundario ni compra-venta de certificados. La transferencia requiere autorización previa.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-semibold text-slate-900 mb-2">Riesgo Tecnológico</h4>
                  <p className="text-sm text-slate-600">
                    La plataforma puede tener interrupciones, errores técnicos o cambios en funcionalidad. Los
                    certificados digitales dependen de infraestructura tecnológica funcional.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-semibold text-slate-900 mb-2">Riesgo Regulatorio</h4>
                  <p className="text-sm text-slate-600">
                    Cambios en leyes mexicanas o internacionales pueden afectar el servicio. WEEK-CHAIN cumple con
                    normativa actual (NOM-029, NOM-151, PROFECO) pero no puede garantizar cumplimiento futuro ante
                    reformas legislativas.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-semibold text-slate-900 mb-2">Riesgo de Continuidad del Servicio</h4>
                  <p className="text-sm text-slate-600">
                    WEEK-CHAIN puede suspender o terminar operaciones por causas de fuerza mayor, decisión empresarial o
                    regulación. En tal caso, se aplicarán términos contractuales de terminación sin garantía de
                    reembolso completo.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sin Garantías */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-purple-600" />
                Ausencia de Garantías
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-600 leading-relaxed">
                WEEK-CHAIN proporciona el servicio "tal cual" (AS IS) sin garantías explícitas ni implícitas:
              </p>
              <ul className="list-disc list-inside text-slate-600 ml-4 space-y-2">
                <li>NO garantizamos disponibilidad continua de la plataforma 24/7</li>
                <li>NO garantizamos que el servicio esté libre de errores o interrupciones</li>
                <li>NO garantizamos que recibirás ofertas para todas tus solicitudes</li>
                <li>NO garantizamos calidad específica de destinos ofrecidos</li>
                <li>NO garantizamos que los destinos cumplan tus expectativas personales</li>
                <li>NO garantizamos permanencia de destinos en la red (pueden salir del catálogo)</li>
                <li>NO garantizamos que podrás transferir tu certificado a terceros</li>
              </ul>
              <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-purple-900">
                  <strong>Cláusula de Exclusión:</strong> WEEK-CHAIN excluye expresamente cualquier garantía implícita
                  de comerciabilidad, idoneidad para propósito particular o no infracción.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Limitación de Responsabilidad */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-orange-600" />
                Limitación de Responsabilidad Legal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-600 leading-relaxed">
                WEEK-CHAIN, sus directores, accionistas, empleados, proveedores y afiliados NO serán responsables por:
              </p>
              <ul className="list-disc list-inside text-slate-600 ml-4 space-y-2">
                <li>Pérdidas económicas derivadas del uso o imposibilidad de uso del servicio</li>
                <li>Daños indirectos, incidentales, especiales, consecuentes o punitivos</li>
                <li>Lucro cesante o pérdida de oportunidades</li>
                <li>Pérdida de datos, certificados digitales o información de usuario</li>
                <li>Interrupciones del servicio por causas técnicas, legales o de fuerza mayor</li>
                <li>Acciones u omisiones de terceros (destinos participantes, proveedores)</li>
                <li>Expectativas no cumplidas sobre disponibilidad o calidad de destinos</li>
              </ul>
              <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-orange-900 font-semibold">
                  Responsabilidad Máxima Limitada: La responsabilidad total de WEEK-CHAIN bajo cualquier circunstancia
                  está limitada al monto efectivamente pagado por el usuario por el certificado específico en los
                  últimos 12 meses, sin incluir costos adicionales, daños o lucro cesante.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* No es Asesoría */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-600" />
                No Constituye Asesoría Profesional
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-600 leading-relaxed">
                La información proporcionada por WEEK-CHAIN es exclusivamente para fines informativos generales y NO
                constituye:
              </p>
              <ul className="list-disc list-inside text-slate-600 ml-4 space-y-2">
                <li>Asesoría financiera, de inversión o económica</li>
                <li>Asesoría legal, fiscal o contable</li>
                <li>Recomendaciones de compra, venta o transferencia</li>
                <li>Garantías sobre rendimientos, beneficios o resultados futuros</li>
                <li>Evaluación de idoneidad del producto para circunstancias personales</li>
              </ul>
              <p className="text-slate-600 leading-relaxed mt-4 font-semibold">
                RECOMENDACIÓN IMPORTANTE: Consulte con abogados, contadores y asesores financieros independientes antes
                de adquirir un SVC para evaluar si se ajusta a su situación personal, fiscal y legal.
              </p>
            </CardContent>
          </Card>

          {/* Marco Legal y Normativo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-teal-600" />
                Marco Legal y Normativo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-600 leading-relaxed">
                WEEK-CHAIN opera conforme a la legislación mexicana aplicable:
              </p>
              <ul className="list-disc list-inside text-slate-600 ml-4 space-y-2">
                <li>
                  <strong>NOM-029-SE-2021:</strong> Prácticas comerciales y información comercial
                </li>
                <li>
                  <strong>NOM-151-SCFI-2016:</strong> Requisitos para contratos de adhesión
                </li>
                <li>
                  <strong>Ley Federal de Protección al Consumidor:</strong> Derechos del consumidor
                </li>
                <li>
                  <strong>Contratos registrados ante PROFECO:</strong> Cumplimiento de registro obligatorio
                </li>
              </ul>
              <div className="bg-teal-50 border-2 border-teal-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-teal-900">
                  <strong>Aclaración Importante:</strong> El registro del contrato ante PROFECO NO constituye aval,
                  certificación ni garantía de PROFECO sobre el modelo de negocio, viabilidad económica ni resultados
                  del servicio. Solo certifica que el contrato cumple requisitos formales de información al consumidor.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Derechos del Consumidor */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-emerald-600" />
                Derechos del Consumidor PROFECO
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-600 leading-relaxed">
                Como consumidor en México, tienes los siguientes derechos protegidos por PROFECO:
              </p>
              <div className="space-y-3">
                <div className="p-3 bg-emerald-50 border-l-4 border-emerald-500 rounded">
                  <h4 className="font-semibold text-emerald-900 text-sm mb-1">Derecho de Retracto (5 días hábiles)</h4>
                  <p className="text-xs text-emerald-800">
                    Puedes cancelar el contrato dentro de 5 días hábiles posteriores a la firma y recibir reembolso
                    completo sin penalización. Este derecho es irrenunciable.
                  </p>
                </div>
                <div className="p-3 bg-emerald-50 border-l-4 border-emerald-500 rounded">
                  <h4 className="font-semibold text-emerald-900 text-sm mb-1">Derecho a Información Clara y Veraz</h4>
                  <p className="text-xs text-emerald-800">
                    Derecho a recibir información completa, clara y veraz sobre términos, condiciones, limitaciones y
                    riesgos del servicio antes de contratar.
                  </p>
                </div>
                <div className="p-3 bg-emerald-50 border-l-4 border-emerald-500 rounded">
                  <h4 className="font-semibold text-emerald-900 text-sm mb-1">Derecho a Presentar Quejas</h4>
                  <p className="text-xs text-emerald-800">
                    Puedes presentar quejas ante PROFECO si consideras que WEEK-CHAIN incumplió términos contractuales o
                    prácticas comerciales.
                  </p>
                </div>
                <div className="p-3 bg-emerald-50 border-l-4 border-emerald-500 rounded">
                  <h4 className="font-semibold text-emerald-900 text-sm mb-1">Derecho a Resolución de Controversias</h4>
                  <p className="text-xs text-emerald-800">
                    Acceso a procesos de resolución alternativa de controversias establecidos en el contrato antes de
                    litigio formal.
                  </p>
                </div>
              </div>
              <p className="text-sm text-slate-600 mt-4">
                Para más información sobre tus derechos, visita{" "}
                <a
                  href="https://www.gob.mx/profeco"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-semibold"
                >
                  www.gob.mx/profeco
                </a>
              </p>
            </CardContent>
          </Card>

          {/* Contacto Legal */}
          <Card className="border-2 border-slate-300 bg-gradient-to-br from-slate-50 to-white">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">¿Preguntas sobre este Disclaimer Legal?</h3>
                <p className="text-slate-600">
                  Contacte a nuestro equipo legal en{" "}
                  <a href="mailto:legal@week-chain.com" className="text-blue-600 hover:underline font-semibold">
                    legal@week-chain.com
                  </a>
                </p>
                <div className="pt-4 space-y-2">
                  <p className="text-sm text-slate-500">
                    Última actualización:{" "}
                    {new Date().toLocaleDateString("es-MX", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <div className="flex justify-center gap-4 text-sm">
                    <Link href="/faq" className="text-blue-600 hover:underline">
                      Preguntas Frecuentes
                    </Link>
                    <Link href="/centro-de-ayuda" className="text-blue-600 hover:underline">
                      Centro de Ayuda
                    </Link>
                    <Link href="/terms" className="text-blue-600 hover:underline">
                      Términos y Condiciones
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
