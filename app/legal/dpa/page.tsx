import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import {
  Shield,
  Globe,
  Server,
  Lock,
  FileText,
  Building,
  Mail,
  CheckCircle,
  AlertCircle,
  ExternalLink,
} from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Acuerdo de Procesamiento de Datos (DPA) | WEEK-CHAIN",
  description:
    "Acuerdo de Procesamiento de Datos conforme a LFPDPPP y GDPR para usuarios de WEEK-CHAIN en México y Europa.",
}

const subprocessors = [
  {
    name: "Supabase Inc.",
    service: "Base de datos y autenticación",
    location: "Estados Unidos",
    purpose: "Almacenamiento seguro de datos de usuarios y certificados",
    certifications: ["SOC 2 Type II", "GDPR Compliant"],
  },
  {
    name: "Vercel Inc.",
    service: "Hosting y CDN",
    location: "Estados Unidos (Edge global)",
    purpose: "Infraestructura de la plataforma web",
    certifications: ["SOC 2 Type II", "GDPR Compliant"],
  },
  {
    name: "Stripe Inc.",
    service: "Procesamiento de pagos",
    location: "Estados Unidos",
    purpose: "Procesamiento seguro de transacciones con tarjeta",
    certifications: ["PCI DSS Level 1", "SOC 2", "GDPR Compliant"],
  },
  {
    name: "Conekta SA de CV",
    service: "Procesamiento de pagos México",
    location: "México",
    purpose: "Pagos en OXXO, SPEI y tarjetas mexicanas",
    certifications: ["PCI DSS Level 1"],
  },
  {
    name: "Resend Inc.",
    service: "Envío de correos transaccionales",
    location: "Estados Unidos",
    purpose: "Notificaciones, confirmaciones y comunicaciones",
    certifications: ["SOC 2 Type II"],
  },
  {
    name: "Google LLC (OAuth)",
    service: "Autenticación",
    location: "Estados Unidos",
    purpose: "Inicio de sesión con cuenta Google",
    certifications: ["SOC 2", "ISO 27001", "GDPR Compliant"],
  },
]

export default function DPAPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-[#0F1628] text-white">Documento Legal</Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Acuerdo de Procesamiento de Datos (DPA)</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Data Processing Agreement conforme a la Ley Federal de Protección de Datos Personales en Posesión de los
            Particulares (LFPDPPP) y el Reglamento General de Protección de Datos (GDPR)
          </p>
          <div className="flex items-center justify-center gap-4 mt-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              Versión 1.0
            </span>
            <span>|</span>
            <span>Última actualización: Enero 2025</span>
          </div>
        </div>

        {/* Parties Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-600" />
              Partes del Acuerdo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600 mb-1">Responsable del Tratamiento</p>
                <p className="font-bold text-gray-900">WEEK-CHAIN SAPI de CV</p>
                <p className="text-sm text-gray-600">RFC: WCH240101XXX</p>
                <p className="text-sm text-gray-600">Tulum, Quintana Roo, México</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Titular de los Datos</p>
                <p className="font-bold text-gray-900">Usuario de la Plataforma</p>
                <p className="text-sm text-gray-600">Persona física o moral que utiliza los servicios</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Section 1 */}
          <Card>
            <CardHeader>
              <CardTitle>1. Objeto del Acuerdo</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p>
                El presente Acuerdo de Procesamiento de Datos ("DPA") establece los términos y condiciones bajo los
                cuales WEEK-CHAIN SAPI de CV ("Responsable") procesa los datos personales de los usuarios ("Titulares")
                de la plataforma de tiempo compartido vacacional.
              </p>
              <p>Este acuerdo es complementario a los Términos y Condiciones y la Política de Privacidad.</p>
            </CardContent>
          </Card>

          {/* Section 2 */}
          <Card>
            <CardHeader>
              <CardTitle>2. Datos Personales Procesados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Datos de Identificación
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Nombre completo</li>
                    <li>• CURP / RFC</li>
                    <li>• Identificación oficial</li>
                    <li>• Fecha de nacimiento</li>
                    <li>• Nacionalidad</li>
                  </ul>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Datos de Contacto
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Correo electrónico</li>
                    <li>• Teléfono</li>
                    <li>• Dirección postal</li>
                    <li>• País de residencia</li>
                  </ul>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Datos Financieros
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Información de tarjetas (tokenizada)</li>
                    <li>• Historial de transacciones</li>
                    <li>• Datos bancarios para reembolsos</li>
                  </ul>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Datos de Uso
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Certificados digitales adquiridos</li>
                    <li>• Historial de reservaciones</li>
                    <li>• Preferencias de la cuenta</li>
                    <li>• Registros de actividad</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 3 */}
          <Card>
            <CardHeader>
              <CardTitle>3. Finalidades del Tratamiento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-green-700 mb-2">Finalidades Primarias (Necesarias)</h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      Gestión de contratos de derecho de uso temporal (tiempo compartido)
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      Emisión de certificados digitales conforme a NOM-151-SCFI-2016
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      Procesamiento de pagos y facturación
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      Comunicaciones transaccionales (confirmaciones, recordatorios)
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      Cumplimiento de obligaciones legales y regulatorias
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      Prevención de fraude y seguridad de la plataforma
                    </li>
                  </ul>
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold text-blue-700 mb-2">Finalidades Secundarias (Con Consentimiento)</h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      Envío de comunicaciones promocionales y ofertas
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      Encuestas de satisfacción
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      Análisis estadísticos y mejora del servicio
                    </li>
                  </ul>
                  <p className="text-xs text-gray-500 mt-2">
                    Puede oponerse a estas finalidades en cualquier momento escribiendo a privacy@week-chain.com
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 4 - Subprocessors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5 text-blue-600" />
                4. Subencargados del Tratamiento
              </CardTitle>
              <CardDescription>
                Lista de terceros autorizados que procesan datos en nombre de WEEK-CHAIN
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subprocessors.map((processor, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{processor.name}</h4>
                        <p className="text-sm text-gray-500">{processor.service}</p>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Globe className="h-4 w-4" />
                        {processor.location}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{processor.purpose}</p>
                    <div className="flex flex-wrap gap-2">
                      {processor.certifications.map((cert, certIndex) => (
                        <Badge key={certIndex} variant="secondary" className="text-xs">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Nota:</strong> Todos los subencargados han firmado acuerdos de procesamiento de datos que
                  incluyen cláusulas contractuales tipo de la UE cuando aplica, y mantienen certificaciones de seguridad
                  reconocidas internacionalmente.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 5 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-600" />
                5. Transferencias Internacionales de Datos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Los datos personales pueden ser transferidos y almacenados en servidores ubicados fuera de México,
                principalmente en Estados Unidos, para la prestación de los servicios.
              </p>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Salvaguardas Implementadas</h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <Lock className="h-4 w-4 text-green-600 mt-0.5" />
                    Cláusulas Contractuales Tipo de la Comisión Europea
                  </li>
                  <li className="flex items-start gap-2">
                    <Lock className="h-4 w-4 text-green-600 mt-0.5" />
                    Proveedores certificados bajo el Data Privacy Framework (DPF)
                  </li>
                  <li className="flex items-start gap-2">
                    <Lock className="h-4 w-4 text-green-600 mt-0.5" />
                    Encriptación de datos en tránsito y en reposo
                  </li>
                  <li className="flex items-start gap-2">
                    <Lock className="h-4 w-4 text-green-600 mt-0.5" />
                    Evaluaciones de impacto de transferencia cuando es requerido
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Section 6 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                6. Medidas de Seguridad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold">Medidas Técnicas</h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• Encriptación TLS 1.3 en todas las comunicaciones</li>
                    <li>• Cifrado AES-256 para datos en reposo</li>
                    <li>• Autenticación de dos factores (2FA)</li>
                    <li>• Monitoreo continuo de amenazas</li>
                    <li>• Respaldos automáticos cifrados</li>
                    <li>• Pruebas de penetración periódicas</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold">Medidas Organizativas</h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• Control de acceso basado en roles (RBAC)</li>
                    <li>• Capacitación en protección de datos</li>
                    <li>• Política de escritorio limpio</li>
                    <li>• Acuerdos de confidencialidad</li>
                    <li>• Auditorías internas de seguridad</li>
                    <li>• Plan de respuesta a incidentes</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 7 */}
          <Card>
            <CardHeader>
              <CardTitle>7. Derechos ARCO</CardTitle>
              <CardDescription>Conforme a la LFPDPPP y GDPR</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-800">Acceso</h4>
                  <p className="text-sm text-green-700">Conocer qué datos personales tenemos sobre usted</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800">Rectificación</h4>
                  <p className="text-sm text-blue-700">Corregir datos inexactos o incompletos</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-semibold text-yellow-800">Cancelación</h4>
                  <p className="text-sm text-yellow-700">Solicitar la eliminación de sus datos</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <h4 className="font-semibold text-red-800">Oposición</h4>
                  <p className="text-sm text-red-700">Oponerse al tratamiento de sus datos</p>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Cómo ejercer sus derechos</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Envíe su solicitud a{" "}
                  <a href="mailto:privacy@week-chain.com" className="text-blue-600 hover:underline">
                    privacy@week-chain.com
                  </a>{" "}
                  incluyendo:
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Nombre completo y correo electrónico de la cuenta</li>
                  <li>• Derecho que desea ejercer (Acceso, Rectificación, Cancelación u Oposición)</li>
                  <li>• Descripción clara de su solicitud</li>
                  <li>• Copia de identificación oficial</li>
                </ul>
                <p className="text-sm text-gray-500 mt-2">Plazo de respuesta: 20 días hábiles conforme a la LFPDPPP</p>
              </div>
            </CardContent>
          </Card>

          {/* Section 8 */}
          <Card>
            <CardHeader>
              <CardTitle>8. Retención de Datos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm">Datos de cuenta y perfil</span>
                  <Badge variant="secondary">Duración de la relación + 5 años</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm">Certificados digitales</span>
                  <Badge variant="secondary">15 años (vigencia del derecho)</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm">Datos de transacciones</span>
                  <Badge variant="secondary">10 años (obligación fiscal)</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm">Registros de seguridad</span>
                  <Badge variant="secondary">2 años</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm">Cookies analíticas</span>
                  <Badge variant="secondary">13 meses</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 9 */}
          <Card>
            <CardHeader>
              <CardTitle>9. Notificación de Brechas de Seguridad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                En caso de una brecha de seguridad que afecte datos personales, WEEK-CHAIN se compromete a:
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  Notificar a los titulares afectados dentro de las 72 horas siguientes al descubrimiento
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  Informar al INAI cuando la brecha afecte derechos patrimoniales o morales
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  Documentar el incidente y las medidas correctivas implementadas
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  Cooperar con las autoridades de protección de datos
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Contact Card */}
          <Card className="border-[#0F1628]/20 bg-[#0F1628]/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-[#E91E63]" />
                Oficial de Protección de Datos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">WEEK-CHAIN SAPI de CV</p>
                <p className="text-sm text-gray-600">
                  Email:{" "}
                  <a href="mailto:privacy@week-chain.com" className="text-blue-600 hover:underline">
                    privacy@week-chain.com
                  </a>
                </p>
                <p className="text-sm text-gray-600">Dirección: Tulum, Quintana Roo, México</p>
                <p className="text-sm text-gray-500 mt-4">
                  Para consultas sobre este DPA o el tratamiento de sus datos personales, contacte a nuestro equipo de
                  privacidad.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Links */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild variant="outline">
              <Link href="/terms">
                <FileText className="h-4 w-4 mr-2" />
                Términos y Condiciones
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/privacy">
                <Shield className="h-4 w-4 mr-2" />
                Política de Privacidad
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/legal">
                <ExternalLink className="h-4 w-4 mr-2" />
                Centro Legal
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
