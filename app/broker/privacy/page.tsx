import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Lock, Eye, Database, Mail, UserCheck, FileText, Trash2, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Aviso de Privacidad para Intermediarios | WEEK-CHAIN",
  description:
    "Política de privacidad y tratamiento de datos personales para el programa de intermediarios de WEEK-CHAIN",
}

export default function BrokerPrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-[#B5EAD7]/10">
      {/* Header */}
      <div className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Shield className="h-4 w-4 text-[#B5EAD7]" />
              <span className="text-sm">Programa de Intermediarios</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Aviso de Privacidad</h1>
            <p className="text-xl text-slate-300">Tratamiento de Datos Personales para Intermediarios</p>
            <p className="text-sm text-slate-400 mt-4">Última actualización: Enero 2025</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* LFPDPPP Notice */}
          <Card className="mb-8 border-emerald-200 bg-emerald-50">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <Shield className="h-6 w-6 text-emerald-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-emerald-800 mb-2">Aviso conforme a la LFPDPPP</h3>
                  <p className="text-emerald-700 text-sm">
                    Este aviso de privacidad se emite en cumplimiento de la Ley Federal de Protección de Datos
                    Personales en Posesión de los Particulares (LFPDPPP) y su Reglamento, aplicable específicamente al
                    programa de intermediarios comerciales de WEEK-CHAIN™.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6">
            {/* Section 1 */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#B5EAD7]/20 rounded-lg">
                    <UserCheck className="h-5 w-5 text-emerald-600" />
                  </div>
                  <CardTitle>1. Responsable del Tratamiento</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="font-semibold text-slate-900">WEEK-CHAIN SAPI de CV</p>
                  <p className="text-sm text-slate-600 mt-2">
                    Es la empresa responsable del tratamiento de sus datos personales recabados a través del programa de
                    intermediarios comerciales.
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-500">Domicilio</p>
                    <p className="font-medium text-slate-700">Ciudad de México, México</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-500">Contacto de Privacidad</p>
                    <p className="font-medium text-slate-700">privacy@week-chain.com</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 2 */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#C7CEEA]/20 rounded-lg">
                    <Database className="h-5 w-5 text-indigo-600" />
                  </div>
                  <CardTitle>2. Datos Personales que Recopilamos</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-600">
                  Para el registro y operación como intermediario, recopilamos los siguientes datos:
                </p>

                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="font-semibold text-slate-900 mb-3">Persona Física (Individual)</p>
                    <ul className="grid sm:grid-cols-2 gap-2 text-sm text-slate-600">
                      <li>• Nombre completo</li>
                      <li>• Correo electrónico</li>
                      <li>• Número telefónico</li>
                      <li>• País y ciudad de residencia</li>
                      <li>• Tipo y número de identificación</li>
                      <li>• RFC o identificación fiscal</li>
                      <li>• Fotografía (opcional)</li>
                      <li>• Datos de cuenta bancaria</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="font-semibold text-slate-900 mb-3">Persona Moral (Empresa)</p>
                    <ul className="grid sm:grid-cols-2 gap-2 text-sm text-slate-600">
                      <li>• Razón social</li>
                      <li>• RFC de la empresa</li>
                      <li>• Domicilio fiscal</li>
                      <li>• Teléfono de la empresa</li>
                      <li>• Datos del representante legal</li>
                      <li>• Correo electrónico corporativo</li>
                      <li>• Datos bancarios de la empresa</li>
                      <li>• Constancia de situación fiscal</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="flex gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-amber-800">Datos Sensibles</p>
                        <p className="text-sm text-amber-700">
                          NO recopilamos datos sensibles como origen étnico, estado de salud, creencias religiosas,
                          preferencias sexuales u opiniones políticas.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 3 */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#FF9AA2]/10 rounded-lg">
                    <FileText className="h-5 w-5 text-rose-600" />
                  </div>
                  <CardTitle>3. Finalidades del Tratamiento</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <p className="font-semibold text-emerald-800 mb-3">Finalidades Primarias (Necesarias)</p>
                  <ul className="space-y-2 text-sm text-emerald-700">
                    <li>• Verificar su identidad y aprobar su registro como intermediario</li>
                    <li>• Generar su tarjeta digital y código de referido único</li>
                    <li>• Calcular, registrar y pagar sus honorarios por ventas</li>
                    <li>• Emitir comprobantes fiscales (CFDI) por los pagos realizados</li>
                    <li>• Comunicarnos sobre su cuenta, ventas y cambios en el programa</li>
                    <li>• Cumplir obligaciones legales, fiscales y regulatorias</li>
                    <li>• Prevenir fraudes y actividades ilícitas</li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="font-semibold text-slate-900 mb-3">Finalidades Secundarias (Opcionales)</p>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li>• Enviar información promocional sobre nuevos productos y destinos</li>
                    <li>• Invitar a eventos de capacitación y networking</li>
                    <li>• Realizar encuestas de satisfacción</li>
                    <li>• Elaborar estadísticas y análisis de desempeño</li>
                  </ul>
                  <p className="text-xs text-slate-500 mt-3 italic">
                    Puede oponerse a las finalidades secundarias enviando un correo a privacy@week-chain.com
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Section 4 */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#FFDAC1]/30 rounded-lg">
                    <Eye className="h-5 w-5 text-orange-600" />
                  </div>
                  <CardTitle>4. Transferencia de Datos</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-600">Sus datos personales podrán ser transferidos a:</p>
                <div className="space-y-3">
                  {[
                    {
                      entity: "Procesadores de pago (Stripe, Conekta)",
                      purpose: "Para procesar el pago de sus honorarios",
                      consent: false,
                    },
                    {
                      entity: "Autoridades fiscales (SAT)",
                      purpose: "Para cumplir obligaciones legales y fiscales",
                      consent: false,
                    },
                    {
                      entity: "Proveedores de servicios en la nube",
                      purpose: "Para almacenamiento seguro de información",
                      consent: false,
                    },
                    {
                      entity: "Autoridades judiciales",
                      purpose: "Cuando exista requerimiento legal",
                      consent: false,
                    },
                  ].map((item, i) => (
                    <div key={i} className="p-4 bg-slate-50 rounded-lg">
                      <p className="font-medium text-slate-900">{item.entity}</p>
                      <p className="text-sm text-slate-600">{item.purpose}</p>
                      {!item.consent && (
                        <p className="text-xs text-amber-600 mt-1">
                          * No requiere consentimiento conforme a la LFPDPPP
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Section 5 */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#E2F0CB]/30 rounded-lg">
                    <Lock className="h-5 w-5 text-lime-600" />
                  </div>
                  <CardTitle>5. Medidas de Seguridad</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">Implementamos las siguientes medidas para proteger sus datos:</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { icon: Lock, title: "Cifrado SSL/TLS", desc: "Toda comunicación está encriptada" },
                    { icon: Database, title: "Bases de datos seguras", desc: "Almacenamiento con acceso restringido" },
                    { icon: UserCheck, title: "Control de acceso", desc: "Solo personal autorizado" },
                    { icon: Shield, title: "Auditorías", desc: "Revisiones periódicas de seguridad" },
                  ].map((item, i) => (
                    <div key={i} className="p-4 bg-slate-50 rounded-lg flex gap-3">
                      <item.icon className="h-5 w-5 text-lime-600 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-slate-900">{item.title}</p>
                        <p className="text-sm text-slate-600">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Section 6 - ARCO Rights */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FileText className="h-5 w-5 text-purple-600" />
                  </div>
                  <CardTitle>6. Derechos ARCO</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-600">Usted tiene derecho a:</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="font-semibold text-purple-800">Acceso</p>
                    <p className="text-sm text-purple-700">Conocer qué datos tenemos sobre usted y cómo los usamos</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="font-semibold text-purple-800">Rectificación</p>
                    <p className="text-sm text-purple-700">Solicitar la corrección de datos inexactos o incompletos</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="font-semibold text-purple-800">Cancelación</p>
                    <p className="text-sm text-purple-700">
                      Solicitar la eliminación de sus datos de nuestros registros
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="font-semibold text-purple-800">Oposición</p>
                    <p className="text-sm text-purple-700">
                      Oponerse al tratamiento de sus datos para fines específicos
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="font-medium text-slate-900 mb-2">¿Cómo ejercer sus derechos?</p>
                  <p className="text-sm text-slate-600 mb-3">
                    Envíe su solicitud a <strong>privacy@week-chain.com</strong> incluyendo:
                  </p>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• Nombre completo y correo registrado</li>
                    <li>• Derecho que desea ejercer</li>
                    <li>• Descripción clara de su solicitud</li>
                    <li>• Copia de identificación oficial</li>
                  </ul>
                  <p className="text-sm text-slate-500 mt-3">Responderemos en un plazo máximo de 20 días hábiles.</p>
                </div>
              </CardContent>
            </Card>

            {/* Section 7 */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <Trash2 className="h-5 w-5 text-slate-600" />
                  </div>
                  <CardTitle>7. Conservación de Datos</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-600">Conservaremos sus datos personales durante:</p>
                <div className="space-y-3">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="font-medium text-slate-900">Mientras sea intermediario activo</p>
                    <p className="text-sm text-slate-600">Para gestionar su participación en el programa</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="font-medium text-slate-900">5 años después de terminación</p>
                    <p className="text-sm text-slate-600">
                      Para cumplir obligaciones fiscales y legales (Art. 30 Código Fiscal)
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="font-medium text-slate-900">10 años para documentos mercantiles</p>
                    <p className="text-sm text-slate-600">Conforme al Código de Comercio</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 8 */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Mail className="h-5 w-5 text-blue-600" />
                  </div>
                  <CardTitle>8. Cambios al Aviso de Privacidad</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Nos reservamos el derecho de modificar este aviso de privacidad. Los cambios serán notificados
                  mediante:
                </p>
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  <li>• Correo electrónico a la dirección registrada</li>
                  <li>• Aviso en su dashboard de intermediario</li>
                  <li>• Publicación en esta página con fecha de actualización</li>
                </ul>
              </CardContent>
            </Card>

            {/* INAI Notice */}
            <Card className="border-indigo-200 bg-indigo-50">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <Shield className="h-6 w-6 text-indigo-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-indigo-800 mb-2">Instituto Nacional de Transparencia (INAI)</h3>
                    <p className="text-indigo-700 text-sm">
                      Si considera que su derecho a la protección de datos personales ha sido vulnerado, puede
                      interponer una queja ante el INAI: <strong>www.inai.org.mx</strong>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="bg-slate-900 text-white">
              <CardContent className="p-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2">Contacto de Privacidad</h3>
                  <p className="text-slate-300 mb-4">
                    Para cualquier duda sobre el tratamiento de sus datos personales
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <div className="text-sm text-slate-400">
                      Email:{" "}
                      <a href="mailto:privacy@week-chain.com" className="text-[#B5EAD7] hover:underline">
                        privacy@week-chain.com
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Back button */}
            <div className="text-center pt-4">
              <Link href="/broker/apply">
                <Button variant="outline" size="lg">
                  Volver al Registro de Intermediarios
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
