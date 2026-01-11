"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { FileText, Shield, Scale, Calendar, CreditCard, Home, AlertCircle, CheckCircle, Printer } from "lucide-react"
import Link from "next/link"

export default function ContratoModeloClient() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-blue-50 print:bg-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header - Hidden on print */}
        <div className="text-center mb-8 print:hidden">
          <Badge className="mb-4 bg-[#0F1628] text-white">Documento Descargable</Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Contrato Modelo de Tiempo Compartido</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Contrato tipo conforme a la NOM-029-SCFI-2010 para la adquisición de derechos de uso temporal de semanas
            vacacionales
          </p>
          <div className="flex items-center justify-center gap-4 mt-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              Versión 1.0
            </span>
            <span>|</span>
            <span>Última actualización: Enero 2025</span>
          </div>
          <div className="flex justify-center gap-4 mt-6">
            <Button onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
            <Button variant="outline" asChild>
              <Link href="/legal">Volver al Centro Legal</Link>
            </Button>
          </div>
        </div>

        {/* Contract Content */}
        <Card className="print:shadow-none print:border-none">
          <CardHeader className="text-center border-b">
            <div className="flex justify-center mb-4 print:mb-2">
              <div className="p-3 bg-[#0F1628] rounded-full print:bg-gray-200">
                <Scale className="h-8 w-8 text-white print:text-gray-800" />
              </div>
            </div>
            <CardTitle className="text-2xl">
              CONTRATO DE DERECHO DE USO TEMPORAL
              <br />
              <span className="text-lg font-normal">(Tiempo Compartido)</span>
            </CardTitle>
            <CardDescription>
              Conforme a la NOM-029-SCFI-2010 y la Ley Federal de Protección al Consumidor
            </CardDescription>
          </CardHeader>

          <CardContent className="prose prose-gray max-w-none p-8 print:p-4">
            {/* Parties */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="bg-[#0F1628] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">
                  1
                </span>
                PARTES CONTRATANTES
              </h2>

              <div className="bg-gray-50 p-4 rounded-lg mb-4 print:bg-white print:border">
                <h3 className="font-semibold mb-2">EL PROVEEDOR:</h3>
                <p className="text-sm">
                  <strong>WEEK-CHAIN SAPI de CV</strong>, sociedad mercantil debidamente constituida conforme a las
                  leyes de los Estados Unidos Mexicanos, con RFC WCH240101XXX, con domicilio en Tulum, Quintana Roo,
                  México, representada en este acto por su representante legal.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg print:bg-white print:border">
                <h3 className="font-semibold mb-2">EL USUARIO:</h3>
                <p className="text-sm">
                  [NOMBRE COMPLETO], mayor de edad, con identificación oficial [TIPO DE ID] número [NÚMERO], con
                  domicilio en [DIRECCIÓN COMPLETA], correo electrónico [EMAIL], en lo sucesivo "El Usuario".
                </p>
              </div>
            </section>

            <Separator className="my-8" />

            {/* Declarations */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="bg-[#0F1628] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">
                  2
                </span>
                DECLARACIONES
              </h2>

              <h3 className="font-semibold mt-4 mb-2">Declara el Proveedor:</h3>
              <ol className="list-decimal list-inside text-sm space-y-2">
                <li>Que es una sociedad mercantil legalmente constituida y vigente conforme a las leyes mexicanas.</li>
                <li>
                  Que cuenta con capacidad jurídica para celebrar el presente contrato y obligarse en los términos del
                  mismo.
                </li>
                <li>
                  Que está debidamente inscrito ante la Procuraduría Federal del Consumidor (PROFECO) como proveedor de
                  servicios de tiempo compartido.
                </li>
                <li>
                  Que cuenta con los derechos necesarios para comercializar los servicios de tiempo compartido objeto
                  del presente contrato.
                </li>
                <li>Que los servicios ofrecidos cumplen con lo establecido en la NOM-029-SCFI-2010.</li>
              </ol>

              <h3 className="font-semibold mt-4 mb-2">Declara el Usuario:</h3>
              <ol className="list-decimal list-inside text-sm space-y-2">
                <li>Que es mayor de edad y cuenta con capacidad legal para contratar.</li>
                <li>
                  Que ha recibido información clara, veraz y completa sobre el servicio de tiempo compartido objeto del
                  presente contrato.
                </li>
                <li>
                  Que entiende que el presente contrato NO representa la adquisición de propiedad inmobiliaria ni
                  participación accionaria en el Proveedor.
                </li>
                <li>Que los datos proporcionados para la celebración del presente contrato son verídicos.</li>
              </ol>
            </section>

            <Separator className="my-8" />

            {/* Object */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="bg-[#0F1628] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">
                  3
                </span>
                OBJETO DEL CONTRATO
              </h2>

              <p className="text-sm mb-4">
                Por medio del presente contrato, el Proveedor otorga al Usuario el derecho de uso temporal sobre:
              </p>

              <div className="bg-blue-50 p-4 rounded-lg mb-4 print:bg-white print:border">
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Propiedad:</p>
                    <p className="font-semibold">[NOMBRE DE LA PROPIEDAD]</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Ubicación:</p>
                    <p className="font-semibold">[DIRECCIÓN COMPLETA]</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Semana Asignada:</p>
                    <p className="font-semibold">Semana [NÚMERO] del año</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Temporada:</p>
                    <p className="font-semibold">[ALTA/MEDIA/BAJA]</p>
                  </div>
                </div>
              </div>

              <p className="text-sm">
                El derecho de uso temporal adquirido permite al Usuario disfrutar de la unidad vacacional durante el
                período específico señalado, así como acceder a los servicios complementarios que ofrece el Proveedor a
                través de su plataforma digital.
              </p>
            </section>

            <Separator className="my-8" />

            {/* Duration */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="bg-[#0F1628] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">
                  4
                </span>
                VIGENCIA
              </h2>

              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg print:bg-white print:border">
                <Calendar className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-green-800">Duración del Derecho: 15 años</p>
                  <p className="text-green-700">
                    El presente contrato tiene una vigencia de quince (15) años contados a partir de la fecha de emisión
                    del Certificado Digital, momento en el cual concluye el derecho de uso sin necesidad de aviso
                    previo.
                  </p>
                </div>
              </div>
            </section>

            <Separator className="my-8" />

            {/* Price */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="bg-[#0F1628] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">
                  5
                </span>
                PRECIO Y FORMA DE PAGO
              </h2>

              <div className="bg-gray-50 p-4 rounded-lg mb-4 print:bg-white print:border">
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Precio Total:</p>
                    <p className="font-semibold text-xl">[PRECIO] USD</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Incluye:</p>
                    <p className="font-semibold">IVA y costos de emisión del Certificado Digital</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-lg mb-4 print:bg-white print:border-emerald-400">
                <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold text-emerald-800 mb-2">$0 CUOTAS DE MANTENIMIENTO Y $0 GASTOS EXTRA</p>
                  <p className="text-emerald-700 mb-2">
                    El Usuario{" "}
                    <strong>NO pagará cuotas de mantenimiento, derramas extraordinarias ni cargos adicionales</strong>{" "}
                    durante la vigencia del presente contrato. Por política de WEEK-CHAIN, se retienen cuatro (4)
                    semanas de baja temporada de cada propiedad destinadas a:
                  </p>
                  <p className="text-emerald-700 font-medium mb-1">1. Cobertura de Gastos del Inmueble:</p>
                  <ul className="text-emerald-700 space-y-1 ml-4 mb-2">
                    <li>• Mantenimiento preventivo y correctivo</li>
                    <li>• Limpieza profesional periódica</li>
                    <li>• Seguro de la propiedad</li>
                    <li>• Administración y gestión del inmueble</li>
                    <li>• Reparaciones menores y generales</li>
                  </ul>
                  <p className="text-emerald-700 font-medium mb-1">2. Incentivar el Ecosistema WEEK-CHAIN:</p>
                  <ul className="text-emerald-700 space-y-1 ml-4 mb-2">
                    <li>• Desarrollo continuo de la plataforma</li>
                    <li>• Soporte al cliente 24/7</li>
                    <li>• Alianzas estratégicas</li>
                    <li>• Mejoras y actualizaciones del servicio</li>
                  </ul>
                  <p className="text-emerald-700 mt-2">
                    Este modelo garantiza una <strong>experiencia sin fricción</strong> donde el precio pagado por el
                    Usuario es el único costo durante los 15 años de vigencia del derecho de uso.
                  </p>
                </div>
              </div>

              <h3 className="font-semibold mt-4 mb-2">Formas de Pago Aceptadas:</h3>
              <ul className="text-sm space-y-2">
                <li className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-blue-600" />
                  Tarjeta de crédito o débito (Visa, Mastercard, AMEX)
                </li>
                <li className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-blue-600" />
                  Transferencia bancaria (SPEI)
                </li>
                <li className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-blue-600" />
                  Pago en efectivo en tiendas OXXO (cargo adicional del 3%)
                </li>
              </ul>
            </section>

            <Separator className="my-8" />

            {/* Reflection Right */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="bg-[#0F1628] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">
                  6
                </span>
                DERECHO DE REFLEXIÓN
              </h2>

              <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4 print:bg-white">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold text-yellow-800 mb-2">IMPORTANTE - LEA CON ATENCIÓN</p>
                  <p className="text-yellow-700 mb-2">
                    Conforme al Artículo 56 de la Ley Federal de Protección al Consumidor, el Usuario tiene derecho a
                    cancelar el presente contrato dentro de los <strong>cinco (5) días hábiles</strong> siguientes a su
                    firma, sin responsabilidad alguna y sin necesidad de justificar su decisión.
                  </p>
                  <p className="text-yellow-700">
                    Para ejercer este derecho, deberá enviar notificación por escrito a{" "}
                    <strong>soporte@week-chain.com</strong> indicando su deseo de cancelar. El reembolso del 100% del
                    precio pagado se realizará dentro de los 15 días naturales siguientes.
                  </p>
                </div>
              </div>
            </section>

            <Separator className="my-8" />

            {/* Digital Certificate */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="bg-[#0F1628] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">
                  7
                </span>
                CERTIFICADO DIGITAL
              </h2>

              <p className="text-sm mb-4">
                Una vez confirmado el pago y transcurrido el plazo de reflexión sin que el Usuario haya ejercido su
                derecho de cancelación, el Proveedor emitirá un Certificado Digital que acredita el derecho de uso
                temporal adquirido.
              </p>

              <div className="bg-blue-50 p-4 rounded-lg print:bg-white print:border">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  El Certificado Digital incluye:
                </h3>
                <ul className="text-sm space-y-1">
                  <li>• Identificador único verificable en línea</li>
                  <li>• Datos de la propiedad y semana asignada</li>
                  <li>• Datos del Usuario titular</li>
                  <li>• Fecha de emisión y vigencia</li>
                  <li>• Firma digital conforme a NOM-151-SCFI-2016</li>
                </ul>
              </div>

              <p className="text-sm mt-4">
                El Certificado Digital podrá ser transferido a terceros a través del marketplace de la plataforma,
                sujeto a los términos y condiciones aplicables.
              </p>
            </section>

            <Separator className="my-8" />

            {/* Rights and Obligations */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="bg-[#0F1628] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">
                  8
                </span>
                DERECHOS Y OBLIGACIONES
              </h2>

              <h3 className="font-semibold mt-4 mb-2">Derechos del Usuario:</h3>
              <ul className="text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  Uso exclusivo de la unidad vacacional durante la semana asignada
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  Acceso a los servicios WEEK-Management para gestión de rentas
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  Acceso a los servicios WEEK-Service (concierge) con tarifas preferenciales
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  Transferir el Certificado Digital a terceros
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  Participar en el marketplace de intercambio de semanas
                </li>
              </ul>

              <h3 className="font-semibold mt-4 mb-2">Obligaciones del Usuario:</h3>
              <ul className="text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <Home className="h-4 w-4 text-blue-600 mt-0.5" />
                  Cuidar las instalaciones y mobiliario durante su estancia
                </li>
                <li className="flex items-start gap-2">
                  <Home className="h-4 w-4 text-blue-600 mt-0.5" />
                  Respetar el reglamento interno de la propiedad
                </li>
                <li className="flex items-start gap-2">
                  <Home className="h-4 w-4 text-blue-600 mt-0.5" />
                  Notificar con anticipación su llegada a la propiedad
                </li>
                <li className="flex items-start gap-2">
                  <Home className="h-4 w-4 text-blue-600 mt-0.5" />
                  Mantener actualizados sus datos de contacto
                </li>
              </ul>
            </section>

            <Separator className="my-8" />

            {/* Cancellation */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="bg-[#0F1628] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">
                  9
                </span>
                CANCELACIÓN Y TERMINACIÓN
              </h2>

              <p className="text-sm mb-4">El presente contrato podrá darse por terminado:</p>

              <ul className="text-sm space-y-2">
                <li>a) Por vencimiento del plazo de vigencia (15 años)</li>
                <li>b) Por ejercicio del derecho de reflexión dentro de los 5 días hábiles posteriores a la firma</li>
                <li>c) Por mutuo acuerdo de las partes</li>
                <li>d) Por incumplimiento grave de cualquiera de las partes</li>
                <li>e) Por transferencia del Certificado Digital a un tercero</li>
              </ul>
            </section>

            <Separator className="my-8" />

            {/* Jurisdiction */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="bg-[#0F1628] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">
                  10
                </span>
                JURISDICCIÓN Y LEY APLICABLE
              </h2>

              <p className="text-sm mb-4">
                El presente contrato se rige por las leyes de los Estados Unidos Mexicanos. Para cualquier controversia
                derivada del presente contrato, las partes se someten a:
              </p>

              <ol className="text-sm space-y-2 list-decimal list-inside">
                <li>
                  En primera instancia, a los procedimientos de conciliación y arbitraje de la Procuraduría Federal del
                  Consumidor (PROFECO)
                </li>
                <li>
                  En su defecto, a la jurisdicción de los tribunales competentes de la Ciudad de México, renunciando a
                  cualquier otro fuero que por razón de domicilio presente o futuro pudiera corresponderles
                </li>
              </ol>
            </section>

            <Separator className="my-8" />

            {/* Signatures */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="bg-[#0F1628] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">
                  11
                </span>
                FIRMAS
              </h2>

              <p className="text-sm mb-6">
                Leído que fue el presente contrato y enteradas las partes de su contenido y alcance legal, lo firman de
                conformidad en [LUGAR], a [FECHA].
              </p>

              <div className="grid md:grid-cols-2 gap-8 mt-8">
                <div className="text-center">
                  <div className="border-b border-gray-400 mb-2 h-16"></div>
                  <p className="font-semibold">EL PROVEEDOR</p>
                  <p className="text-sm text-gray-500">WEEK-CHAIN SAPI de CV</p>
                  <p className="text-sm text-gray-500">Representante Legal</p>
                </div>
                <div className="text-center">
                  <div className="border-b border-gray-400 mb-2 h-16"></div>
                  <p className="font-semibold">EL USUARIO</p>
                  <p className="text-sm text-gray-500">[NOMBRE COMPLETO]</p>
                  <p className="text-sm text-gray-500">[IDENTIFICACIÓN]</p>
                </div>
              </div>

              <div className="mt-8 p-4 bg-gray-50 rounded-lg text-center print:bg-white print:border">
                <p className="text-sm text-gray-600">
                  <strong>Nota:</strong> La aceptación digital a través de la plataforma WEEK-CHAIN tiene la misma
                  validez legal que la firma autógrafa, conforme a lo establecido en la NOM-151-SCFI-2016 y el Código de
                  Comercio.
                </p>
              </div>
            </section>

            {/* Footer */}
            <div className="text-center text-sm text-gray-500 mt-8 pt-4 border-t">
              <p>WEEK-CHAIN SAPI de CV | RFC: WCH240101XXX</p>
              <p>Tulum, Quintana Roo, México</p>
              <p>legal@week-chain.com | www.week-chain.com</p>
              <p className="mt-2">Versión 1.0 - Enero 2025</p>
            </div>
          </CardContent>
        </Card>

        {/* Actions - Hidden on print */}
        <div className="flex flex-wrap gap-4 justify-center mt-8 print:hidden">
          <Button onClick={() => window.print()} size="lg">
            <Printer className="h-4 w-4 mr-2" />
            Imprimir Contrato
          </Button>
          <Button variant="outline" asChild size="lg">
            <Link href="/legal">
              <FileText className="h-4 w-4 mr-2" />
              Ver Más Documentos
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
