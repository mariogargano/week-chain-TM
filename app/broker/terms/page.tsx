import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Shield,
  FileText,
  Briefcase,
  Percent,
  Scale,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Banknote,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Términos y Condiciones para Intermediarios | WEEK-CHAIN",
  description: "Términos y condiciones del programa de intermediarios comerciales de WEEK-CHAIN",
}

export default function BrokerTermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-[#C7CEEA]/10">
      {/* Header */}
      <div className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Briefcase className="h-4 w-4 text-[#FF9AA2]" />
              <span className="text-sm">Programa de Intermediarios</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Términos y Condiciones</h1>
            <p className="text-xl text-slate-300">Contrato de Intermediación Comercial WEEK-CHAIN™</p>
            <p className="text-sm text-slate-400 mt-4">Última actualización: Enero 2025</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Important Notice */}
          <Card className="mb-8 border-amber-200 bg-amber-50">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-amber-800 mb-2">Aviso Importante</h3>
                  <p className="text-amber-700 text-sm">
                    Este documento constituye un contrato de intermediación comercial. Al registrarse como intermediario
                    de WEEK-CHAIN™, usted acepta todos los términos aquí establecidos.
                    <strong> Este programa NO constituye una relación laboral</strong> ni implica subordinación de
                    ningún tipo.
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
                  <div className="p-2 bg-[#FF9AA2]/10 rounded-lg">
                    <FileText className="h-5 w-5 text-[#FF9AA2]" />
                  </div>
                  <CardTitle>1. Definiciones</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="font-medium text-slate-900">WEEK-CHAIN™</p>
                    <p className="text-sm text-slate-600">
                      Plataforma de comercialización de derechos de uso vacacional operada por WEEK-CHAIN SAPI de CV.
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="font-medium text-slate-900">Intermediario</p>
                    <p className="text-sm text-slate-600">
                      Persona física o moral que promociona y facilita la venta de semanas vacacionales a cambio de
                      honorarios por éxito.
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="font-medium text-slate-900">Semana Vacacional</p>
                    <p className="text-sm text-slate-600">
                      Derecho de uso temporal sobre una unidad de tiempo compartido en desarrollos turísticos afiliados
                      a WEEK-CHAIN™, conforme a la NOM-029-SCFI.
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="font-medium text-slate-900">Honorarios</p>
                    <p className="text-sm text-slate-600">
                      Remuneración variable que recibe el intermediario exclusivamente por ventas efectivamente
                      concretadas y pagadas.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 2 */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#B5EAD7]/20 rounded-lg">
                    <Briefcase className="h-5 w-5 text-emerald-600" />
                  </div>
                  <CardTitle>2. Naturaleza de la Relación</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-600">
                  El presente contrato establece una relación de <strong>intermediación comercial independiente</strong>
                  , bajo las siguientes condiciones:
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                      <p className="font-medium text-emerald-800">Lo que SÍ es:</p>
                    </div>
                    <ul className="space-y-2 text-sm text-emerald-700">
                      <li>• Contrato de intermediación comercial</li>
                      <li>• Relación mercantil independiente</li>
                      <li>• Actividad autónoma y flexible</li>
                      <li>• Remuneración por resultados</li>
                      <li>• Libertad de horario y métodos</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2 mb-3">
                      <XCircle className="h-5 w-5 text-red-600" />
                      <p className="font-medium text-red-800">Lo que NO es:</p>
                    </div>
                    <ul className="space-y-2 text-sm text-red-700">
                      <li>• Relación laboral subordinada</li>
                      <li>• Contrato de trabajo</li>
                      <li>• Empleo con salario fijo</li>
                      <li>• Franquicia o esquema MLM</li>
                      <li>• Inversión con rendimientos</li>
                    </ul>
                  </div>
                </div>

                <p className="text-sm text-slate-500 italic">
                  El intermediario actúa bajo su propio riesgo empresarial, sin exclusividad territorial ni obligación
                  de resultados mínimos.
                </p>
              </CardContent>
            </Card>

            {/* Section 3 */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#C7CEEA]/20 rounded-lg">
                    <Percent className="h-5 w-5 text-indigo-600" />
                  </div>
                  <CardTitle>3. Sistema de Honorarios</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-600">
                  Los honorarios se calculan como un porcentaje del valor de la venta efectivamente concretada:
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="p-3 text-left border">Nivel</th>
                        <th className="p-3 text-left border">Honorario Directo</th>
                        <th className="p-3 text-left border">Requisitos</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-3 border font-medium">Broker</td>
                        <td className="p-3 border text-[#FF9AA2] font-bold">6%</td>
                        <td className="p-3 border text-sm">Registro aprobado</td>
                      </tr>
                      <tr className="bg-slate-50">
                        <td className="p-3 border font-medium">Silver Broker</td>
                        <td className="p-3 border text-[#FF9AA2] font-bold">6%</td>
                        <td className="p-3 border text-sm">100 semanas vendidas + 10 afiliados</td>
                      </tr>
                      <tr>
                        <td className="p-3 border font-medium">Broker Elite</td>
                        <td className="p-3 border text-[#FF9AA2] font-bold">6%</td>
                        <td className="p-3 border text-sm">500 semanas vendidas + 50 afiliados</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="font-medium text-slate-900 mb-2">Condiciones de Pago:</p>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li>
                      • Los honorarios se generan <strong>únicamente</strong> por ventas completadas y pagadas
                    </li>
                    <li>
                      • El pago se realiza dentro de los 15 días hábiles siguientes a la confirmación del pago del
                      cliente
                    </li>
                    <li>
                      • En caso de cancelación o reembolso al cliente, los honorarios se reversan proporcionalmente
                    </li>
                    <li>• El intermediario es responsable de sus propias obligaciones fiscales</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Section 4 */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#FFB7B2]/20 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-rose-600" />
                  </div>
                  <CardTitle>4. Obligaciones del Intermediario</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    "Proporcionar información veraz y completa durante el registro",
                    "Promocionar los productos de manera ética, transparente y conforme a la ley",
                    "No realizar promesas o garantías de rendimientos financieros",
                    "No presentarse como empleado o representante legal de WEEK-CHAIN™",
                    "Cumplir con la normativa aplicable (NOM-029-SCFI, Ley Federal de Protección al Consumidor)",
                    "Mantener actualizados sus datos de contacto y fiscales",
                    "Respetar los precios oficiales establecidos por WEEK-CHAIN™",
                    "No utilizar prácticas de venta engañosas o de alta presión",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Section 5 */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#E2F0CB]/30 rounded-lg">
                    <Shield className="h-5 w-5 text-lime-600" />
                  </div>
                  <CardTitle>5. Obligaciones de WEEK-CHAIN™</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    "Proporcionar acceso a la plataforma y herramientas de venta",
                    "Emitir la tarjeta digital de intermediario con código QR único",
                    "Calcular y pagar los honorarios en tiempo y forma",
                    "Proporcionar materiales promocionales actualizados",
                    "Ofrecer capacitación sobre los productos y la plataforma",
                    "Notificar cambios en términos con al menos 30 días de anticipación",
                    "Mantener la confidencialidad de los datos del intermediario",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-lime-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Section 6 */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                  </div>
                  <CardTitle>6. Prohibiciones</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  El intermediario tiene <strong>expresamente prohibido</strong>:
                </p>
                <ul className="space-y-3">
                  {[
                    "Prometer servicios con beneficios garantizados a los clientes",
                    "Cobrar tarifas adicionales no autorizadas por WEEK-CHAIN™",
                    "Modificar o falsificar documentos, contratos o certificados",
                    "Realizar ventas fuera de la plataforma oficial",
                    "Suplantar la identidad de WEEK-CHAIN™ o sus representantes",
                    "Utilizar la marca WEEK-CHAIN™ sin autorización expresa",
                    "Realizar prácticas de venta de alta presión o engañosas",
                    "Captar dinero directamente de los clientes",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-600">{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-red-600 mt-4 p-3 bg-red-50 rounded-lg">
                  El incumplimiento de estas prohibiciones resultará en la terminación inmediata del contrato y la
                  pérdida de honorarios pendientes.
                </p>
              </CardContent>
            </Card>

            {/* Section 7 */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <Clock className="h-5 w-5 text-slate-600" />
                  </div>
                  <CardTitle>7. Vigencia y Terminación</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="font-medium text-slate-900 mb-2">Vigencia:</p>
                  <p className="text-sm text-slate-600">
                    El contrato tiene vigencia indefinida desde la aprobación del registro.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="font-medium text-slate-900 mb-2">Terminación por el Intermediario:</p>
                  <p className="text-sm text-slate-600">
                    El intermediario puede terminar el contrato en cualquier momento mediante notificación escrita a
                    soporte@week-chain.com con 15 días de anticipación.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="font-medium text-slate-900 mb-2">Terminación por WEEK-CHAIN™:</p>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• Incumplimiento de cualquier término de este contrato</li>
                    <li>• Conducta que dañe la reputación de WEEK-CHAIN™</li>
                    <li>• Inactividad por más de 12 meses consecutivos</li>
                    <li>• Por decisión unilateral con 30 días de aviso</li>
                  </ul>
                </div>

                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-sm text-amber-800">
                    <strong>Nota:</strong> Al terminar el contrato, el intermediario recibirá los honorarios pendientes
                    por ventas ya concretadas, menos cualquier reversión por cancelaciones.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Section 8 */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Banknote className="h-5 w-5 text-indigo-600" />
                  </div>
                  <CardTitle>8. Aspectos Fiscales</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-600">El intermediario reconoce y acepta que:</p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>• Es responsable único de sus obligaciones fiscales</li>
                  <li>• Deberá emitir comprobante fiscal (CFDI) por los honorarios recibidos</li>
                  <li>• WEEK-CHAIN™ retendrá impuestos cuando la ley lo requiera</li>
                  <li>• Deberá mantener su situación fiscal en regla para recibir pagos</li>
                </ul>
                <div className="p-4 bg-indigo-50 rounded-lg">
                  <p className="text-sm text-indigo-800">
                    <strong>Personas Morales:</strong> Deberán proporcionar Constancia de Situación Fiscal actualizada
                    para el procesamiento de pagos.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Section 9 */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Scale className="h-5 w-5 text-purple-600" />
                  </div>
                  <CardTitle>9. Jurisdicción y Ley Aplicable</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-600">
                  Este contrato se rige por las leyes de los Estados Unidos Mexicanos, incluyendo:
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>• Código de Comercio</li>
                  <li>• Ley Federal de Protección al Consumidor</li>
                  <li>• NOM-029-SCFI-2010 (Certificados Digitales)</li>
                  <li>• Ley Federal de Protección de Datos Personales</li>
                </ul>
                <p className="text-slate-600 mt-4">
                  Para cualquier controversia, las partes se someten a la jurisdicción de los tribunales competentes de
                  la Ciudad de México, renunciando a cualquier otro fuero que pudiera corresponderles.
                </p>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="bg-slate-900 text-white">
              <CardContent className="p-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2">¿Tienes preguntas?</h3>
                  <p className="text-slate-300 mb-4">Contacta a nuestro equipo de soporte para intermediarios</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <div className="text-sm text-slate-400">
                      Email:{" "}
                      <a href="mailto:brokers@week-chain.com" className="text-[#FF9AA2] hover:underline">
                        brokers@week-chain.com
                      </a>
                    </div>
                    <div className="text-sm text-slate-400">
                      WhatsApp:{" "}
                      <a href="https://wa.me/521234567890" className="text-[#FF9AA2] hover:underline">
                        +52 1 234 567 890
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
