"use client"

export const dynamic = "force-dynamic"

import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, HelpCircle, Calendar, Shield, Clock, AlertTriangle, FileText, Ban, MapPin } from "lucide-react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { SiteFooter } from "@/components/site-footer"

export default function FAQPage() {
  const categories = [
    {
      id: "general",
      name: "General - Modelo SVC",
      icon: HelpCircle,
      color: "from-blue-500 to-cyan-500",
      questions: [
        {
          q: "¿Qué es exactamente el Smart Vacational Certificate?",
          a: "El SVC es un certificado digital que otorga al titular un derecho personal, temporal y revocable de solicitar uso vacacional anual durante hasta 15 años, sujeto a disponibilidad del sistema WEEK-CHAIN. NO constituye propiedad inmobiliaria, tiempo compartido, copropiedad, inversión ni asigna propiedades, fechas o destinos específicos. Es un derecho de solicitud conforme a la normativa mexicana NOM-151.",
        },
        {
          q: "¿Qué NO es el Smart Vacational Certificate?",
          a: "El SVC NO es: (1) Propiedad inmobiliaria o fracción de propiedad, (2) Tiempo compartido tradicional con semanas asignadas, (3) Inversión financiera o instrumento que genere rendimientos, (4) Garantía de acceso a destinos, fechas o propiedades específicas, (5) Derecho de reventa con utilidad garantizada. Es exclusivamente un derecho temporal de solicitud de uso vacacional.",
        },
        {
          q: "¿Cuánto cuesta un certificado y qué incluye el precio?",
          a: "Los certificados varían desde $3,500 USD (2 PAX / 1 Estancia) hasta $25,000 USD (8 PAX / 4 Estancias). El precio representa el nivel de PAX (capacidad de personas) y el número de estancias anuales que puedes solicitar durante 15 años. NO incluye gastos de hospedaje final, transporte, alimentación ni servicios adicionales en destino. El precio es por el derecho temporal de solicitud, no por la asignación de propiedades específicas.",
        },
        {
          q: "¿Por qué varían los precios entre certificados?",
          a: "El precio refleja: (1) Capacidad PAX (2/4/6/8 personas), (2) Número de estancias anuales (1-4 solicitudes por año), (3) Duración del derecho (15 años). Un certificado de mayor precio permite solicitar más estancias anuales para más personas durante la vigencia. Los precios NO representan temporadas, fechas específicas ni garantizan acceso a destinos concretos.",
        },
        {
          q: "¿Hay cuotas de mantenimiento anuales?",
          a: "NO. El certificado SVC no tiene cuotas de mantenimiento anuales. El pago es único al momento de activar tu certificado. Esto es una diferencia fundamental con el tiempo compartido tradicional donde las cuotas pueden costar $500-$1,500 USD anuales y aumentan cada año. Sin embargo, los gastos específicos de cada estancia (hospedaje final confirmado, servicios en destino) se determinan al momento de aceptar la oferta.",
        },
      ],
    },
    {
      id: "process",
      name: "Proceso REQUEST → OFFER → CONFIRM",
      icon: Calendar,
      color: "from-purple-500 to-pink-500",
      questions: [
        {
          q: "¿Cómo funciona el flujo REQUEST → OFFER → CONFIRM?",
          a: "1) REQUEST: Envías una solicitud indicando fechas deseadas, destino preferido y número de personas. 2) OFFER: El sistema revisa disponibilidad en la red de destinos participantes y te envía una oferta con opciones concretas (propiedad, fechas, precio final). 3) CONFIRM: Tienes 48 horas para aceptar o declinar la oferta. Si aceptas, se confirma tu reservación. Este flujo es obligatorio y no existe reserva directa.",
        },
        {
          q: "¿Puedo elegir fechas y destinos específicos?",
          a: "Puedes SOLICITAR fechas y destinos preferidos, pero la asignación final depende de la disponibilidad del sistema al momento de tu solicitud. El sistema te ofrecerá las mejores opciones disponibles que coincidan con tus preferencias. NO hay garantía de obtener fechas o destinos específicos, especialmente en temporadas altas o destinos de alta demanda.",
        },
        {
          q: "¿Cuánto tiempo tengo para aceptar una oferta?",
          a: "Tienes 48 horas desde que recibes la oferta para aceptarla o declinarla. Si no respondes dentro de este plazo, la oferta expira automáticamente y deberás enviar una nueva solicitud. Este tiempo permite asegurar que las opciones ofrecidas se mantengan disponibles para ti.",
        },
        {
          q: "¿Qué pasa si declino una oferta?",
          a: "Si declinas una oferta, puedes enviar una nueva solicitud con preferencias diferentes. No hay penalización por declinar ofertas. Sin embargo, si declinas múltiples ofertas consecutivas sin justificación, el sistema puede solicitar aclaración de tus preferencias reales para mejorar futuras ofertas. Tu derecho de solicitud anual se mantiene activo.",
        },
        {
          q: "¿Qué pasa si no hay disponibilidad para mis preferencias?",
          a: "Si no hay disponibilidad exacta, el sistema te ofrecerá alternativas similares (fechas cercanas, destinos equivalentes, propiedades con características parecidas). Siempre recibirás al menos una alternativa viable. Si rechazas todas las alternativas, puedes enviar una nueva solicitud en cualquier momento durante el año. Tu derecho anual NO se pierde por falta de disponibilidad del sistema.",
        },
        {
          q: "¿Puedo solicitar varias estancias al mismo tiempo?",
          a: "Depende de tu certificado. Si tienes un certificado de múltiples estancias anuales (2, 3 o 4), puedes enviar solicitudes para cada una de ellas conforme las necesites. Sin embargo, solo puedes tener una solicitud activa a la vez. Debes completar el flujo CONFIRM o DECLINE antes de enviar la siguiente solicitud.",
        },
      ],
    },
    {
      id: "rights",
      name: "Derechos y Limitaciones",
      icon: Shield,
      color: "from-green-500 to-emerald-500",
      questions: [
        {
          q: "¿Qué derechos específicos adquiero con el certificado?",
          a: "Adquieres: (1) Derecho personal y temporal de solicitar uso vacacional anual durante 15 años, (2) Derecho de recibir ofertas basadas en disponibilidad del sistema, (3) Derecho de aceptar o declinar ofertas sin penalización, (4) Derecho de solicitar gestión opcional de tu periodo (sujeto a aprobación). NO adquieres propiedad, derechos reales sobre inmuebles, ni garantías de acceso a destinos específicos.",
        },
        {
          q: "¿Puedo transferir o vender mi certificado?",
          a: "El certificado es personal e intransferible durante su vigencia conforme a términos del contrato. Al finalizar los 15 años, el derecho expira automáticamente. NO existe mercado secundario garantizado ni obligación de WEEK-CHAIN de recomprar certificados. Cualquier cesión de derechos requiere autorización previa y cumplimiento de requisitos contractuales.",
        },
        {
          q: "¿Puedo heredar el certificado?",
          a: "En caso de fallecimiento del titular, los términos de sucesión se rigen por las cláusulas específicas del contrato de adhesión. Generalmente, los herederos directos pueden solicitar la transferencia del derecho restante cumpliendo con requisitos de KYC y aceptación de términos. Esto NO constituye derecho patrimonial heredable automáticamente.",
        },
        {
          q: "¿El certificado tiene valor de reventa?",
          a: "NO. El certificado NO es un instrumento financiero ni tiene garantía de valor de reventa. No existe obligación de WEEK-CHAIN de recomprar certificados ni mercado secundario oficial. Cualquier transacción entre particulares es responsabilidad exclusiva de las partes y NO está respaldada por WEEK-CHAIN. El certificado NO debe adquirirse con expectativa de ganancia o reventa.",
        },
        {
          q: "¿Qué pasa si WEEK-CHAIN deja de operar?",
          a: "En caso de cese de operaciones, se aplicarán las cláusulas de salvaguarda establecidas en el contrato de adhesión. Esto puede incluir: (1) Transferencia de derechos a operador sucesor, (2) Compensación proporcional por tiempo restante, (3) Liquidación ordenada conforme a legislación aplicable. Sin embargo, NO existe garantía de recuperación total del monto pagado ni de continuidad del servicio.",
        },
      ],
    },
    {
      id: "availability",
      name: "Disponibilidad y Destinos",
      icon: MapPin,
      color: "from-orange-500 to-red-500",
      questions: [
        {
          q: "¿Qué destinos están disponibles?",
          a: "La red incluye destinos participantes en México (Cancún, Tulum, Playa del Carmen), Estados Unidos (Miami, Orlando), Canadá (Vancouver, Toronto), Brasil (Río, São Paulo), Italia (Toscana, Roma) y Albania (Saranda, Tirana). La disponibilidad específica de cada destino varía según temporada, demanda y capacidad operativa del sistema. Los destinos pueden cambiar sin previo aviso.",
        },
        {
          q: "¿Puedo garantizar mi destino favorito cada año?",
          a: "NO. No existe garantía de acceso a destinos específicos. El sistema asigna ofertas basándose en disponibilidad al momento de tu solicitud. Destinos de alta demanda (playas en verano, nieve en invierno) pueden tener disponibilidad limitada. Se recomienda enviar solicitudes con 3-6 meses de anticipación y considerar fechas flexibles para mayor probabilidad de acceso.",
        },
        {
          q: "¿Cuándo es mejor solicitar para alta temporada?",
          a: "Para temporadas altas (Semana Santa, verano, fin de año), se recomienda enviar solicitudes 4-6 meses antes. Las solicitudes de último momento tienen menor probabilidad de disponibilidad en destinos populares. Sin embargo, el sistema SIEMPRE te ofrecerá alternativas disponibles, que pueden incluir destinos menos demandados o fechas cercanas a tus preferencias.",
        },
        {
          q: "¿Hay blackout dates (fechas bloqueadas)?",
          a: "No existen fechas bloqueadas de forma permanente. Sin embargo, la disponibilidad en fechas de altísima demanda (24-31 diciembre, Semana Santa, eventos especiales) es limitada y se asigna por orden de solicitud. Tu derecho de solicitud anual NO se pierde si no hay disponibilidad; simplemente recibirás alternativas viables.",
        },
        {
          q: "¿Qué tipo de alojamientos se ofrecen?",
          a: "Los alojamientos varían según destino y disponibilidad: condominios, villas, apartamentos, resorts. Todos los alojamientos participantes cumplen con estándares de calidad verificados por el sistema. Las características específicas (recámaras, baños, amenidades) se detallan en cada oferta que recibes. NO se garantiza acceso a categorías específicas de alojamiento.",
        },
      ],
    },
    {
      id: "timeline",
      name: "Vigencia y Timeframe",
      icon: Clock,
      color: "from-cyan-500 to-blue-500",
      questions: [
        {
          q: "¿Cuánto dura la vigencia del certificado?",
          a: "El certificado SVC tiene vigencia de 15 años a partir de la fecha de activación. Durante este periodo, tienes derecho de solicitar uso vacacional anual conforme a tu nivel de certificado (1-4 estancias por año). Al finalizar los 15 años, el derecho expira automáticamente y NO es renovable. No existe obligación de WEEK-CHAIN de extender la vigencia.",
        },
        {
          q: "¿Cuándo comienza a contar la vigencia de 15 años?",
          a: "La vigencia comienza a partir de la fecha de activación de tu certificado, que ocurre después de completar: (1) Pago completo, (2) Proceso KYC, (3) Aceptación de términos y condiciones, (4) Emisión del contrato NOM-151. La fecha exacta de inicio se especifica en tu contrato digital y NO puede modificarse posteriormente.",
        },
        {
          q: "¿Puedo pausar o congelar mi certificado?",
          a: "NO. El certificado NO puede pausarse o congelarse. La vigencia de 15 años corre continuamente desde la activación. Si no utilizas tu derecho anual en un año determinado, ese derecho NO se acumula ni se transfiere al siguiente año. Cada año es independiente conforme a tu nivel de certificado.",
        },
        {
          q: "¿Los derechos no utilizados se acumulan?",
          a: "NO. Si no solicitas tu estancia anual en un año específico, ese derecho expira al finalizar el año calendario (31 de diciembre). Los derechos NO se acumulan para años futuros. Por ejemplo, si tienes 2 estancias anuales y solo usas 1, no tendrás 3 estancias el año siguiente. Cada año se reinicia conforme a tu certificado.",
        },
        {
          q: "¿Puedo renovar mi certificado antes de que expire?",
          a: "Actualmente NO existe programa de renovación automática. Al finalizar los 15 años, si WEEK-CHAIN ofrece nuevos certificados, podrías adquirir uno nuevo bajo las condiciones vigentes en ese momento, que pueden ser diferentes a las actuales. NO hay garantía de continuidad ni de condiciones similares.",
        },
      ],
    },
    {
      id: "costs",
      name: "Costos y Pagos",
      icon: AlertTriangle,
      color: "from-amber-500 to-yellow-500",
      questions: [
        {
          q: "¿Qué costos adicionales debo considerar?",
          a: "Además del precio del certificado, debes considerar: (1) Gastos de hospedaje final confirmado en cada oferta, (2) Transporte hacia/desde destino, (3) Alimentación durante la estancia, (4) Servicios adicionales en destino (tours, spa, etc.), (5) Posibles fees de gestión según el servicio. El precio del certificado NO incluye estos gastos operativos de cada estancia.",
        },
        {
          q: "¿Cuánto cuesta cada estancia una vez confirmada?",
          a: "El costo final de cada estancia se determina en la OFFER que recibes y varía según: (1) Destino seleccionado, (2) Temporada (alta/media/baja), (3) Tipo de alojamiento asignado, (4) Duración de la estancia. Este costo es adicional al precio del certificado y debe pagarse antes de la confirmación final. Los montos exactos se especifican en cada oferta.",
        },
        {
          q: "¿Acepta pagos en mensualidades o meses sin intereses?",
          a: "El certificado debe pagarse en una sola exhibición al momento de la activación. NO se ofrecen planes de financiamiento ni mensualidades. Aceptamos múltiples métodos de pago (tarjetas, transferencias, PayPal) pero el pago debe completarse antes de la emisión del certificado. Esto asegura que tu derecho esté activo inmediatamente.",
        },
        {
          q: "¿Puedo obtener reembolso después de activar?",
          a: "Después del periodo de retracto de 5 días hábiles establecido por PROFECO, los reembolsos se rigen por las cláusulas específicas del contrato de adhesión. Generalmente, NO hay reembolsos totales después de la activación. Sin embargo, casos excepcionales (enfermedad grave, fuerza mayor) pueden evaluarse individualmente sin garantía de aprobación.",
        },
      ],
    },
    {
      id: "cancellation",
      name: "Cancelación y Cambios",
      icon: Ban,
      color: "from-red-500 to-rose-500",
      questions: [
        {
          q: "¿Cuál es el periodo de cancelación legal?",
          a: "Conforme a PROFECO y la Ley Federal de Protección al Consumidor, tienes 5 días hábiles después de la fecha de firma del contrato para cancelar sin penalización y recibir reembolso completo. Este derecho es irrenunciable. Después de este período, aplican las condiciones de cancelación establecidas en el contrato de adhesión.",
        },
        {
          q: "¿Puedo cancelar una reserva ya confirmada?",
          a: "Una vez que aceptas una OFFER y se confirma tu reservación, las políticas de cancelación varían según el tiempo restante antes del check-in: (1) 30+ días antes: cancelación posible con penalización del 25%, (2) 15-29 días antes: penalización del 50%, (3) Menos de 15 días: NO reembolsable. Estas políticas protegen la red de destinos participantes.",
        },
        {
          q: "¿Puedo cambiar fechas después de confirmar?",
          a: "Los cambios de fecha después de CONFIRM están sujetos a disponibilidad del sistema y pueden aplicar fees de cambio. Debes solicitar el cambio con al menos 30 días de anticipación. NO hay garantía de que el sistema pueda ofrecer fechas alternativas. Si no hay disponibilidad, tu reservación original se mantiene o puedes cancelarla conforme a políticas aplicables.",
        },
        {
          q: "¿Qué pasa si tengo una emergencia y no puedo viajar?",
          a: "En casos de emergencia médica grave, fallecimiento de familiar directo o fuerza mayor (desastres naturales, pandemias), puedes solicitar consideración especial proporcionando documentación probatoria. El sistema evaluará cada caso individualmente. Sin embargo, NO existe garantía de reembolso o reprogramación. Se recomienda contratar seguro de viaje.",
        },
      ],
    },
    {
      id: "management",
      name: "Gestión y Servicios Opcionales",
      icon: FileText,
      color: "from-indigo-500 to-purple-500",
      questions: [
        {
          q: "¿Puedo solicitar que WEEK-CHAIN gestione la renta de mi periodo?",
          a: "Sí, puedes solicitar el servicio opcional WEEK-Management donde el equipo coordina la gestión operativa de tu derecho de uso en plataformas externas. Este servicio está sujeto a: (1) Aprobación del sistema, (2) Disponibilidad de demanda, (3) Comisiones operativas del 15-25%, (4) Cumplimiento de estándares de alojamiento. NO constituye rendimiento de inversión ni está garantizado.",
        },
        {
          q: "¿Cuánto puedo ganar con WEEK-Management?",
          a: "Los ingresos por gestión operativa NO están garantizados y varían según: (1) Destino y temporada, (2) Demanda real de mercado, (3) Competencia de otros alojamientos, (4) Estándares de la propiedad asignada. Los ingresos históricos NO garantizan resultados futuros. Este servicio NO debe considerarse como inversión ni rendimiento financiero. Es una coordinación operativa sujeta a condiciones de mercado.",
        },
        {
          q: "¿El servicio de management está garantizado?",
          a: "NO. WEEK-Management es un servicio opcional sujeto a disponibilidad, aprobación y cumplimiento de requisitos operativos. El sistema puede rechazar solicitudes si el destino, temporada o condiciones no son viables para gestión. Tampoco hay garantía de que se logre renta efectiva aún con el servicio activo. Es coordinación operativa, NO inversión.",
        },
        {
          q: "¿Puedo intercambiar mi periodo con otros usuarios?",
          a: "El sistema puede habilitar función de intercambio entre titulares de certificados, sujeto a: (1) Ambos usuarios acepten el intercambio, (2) Los certificados sean de niveles compatibles (PAX y estancias similares), (3) Ambos cumplan con requisitos del sistema. Los intercambios NO constituyen compraventa ni generan obligaciones financieras entre usuarios. Es simplemente coordinación de preferencias.",
        },
      ],
    },
    {
      id: "legal",
      name: "Marco Legal y Compliance",
      icon: Shield,
      color: "from-slate-600 to-slate-800",
      questions: [
        {
          q: "¿Qué normativas cumple WEEK-CHAIN?",
          a: "WEEK-CHAIN opera conforme a: (1) NOM-151-SCFI-2016 para certificación digital de contratos, (2) Ley Federal de Protección al Consumidor, (3) NOM-029-SCFI-2010 para prácticas comerciales, (4) Legislación mexicana aplicable a prestación de servicios. El modelo SVC NO está regulado como tiempo compartido tradicional pues NO constituye propiedad inmobiliaria ni derechos reales.",
        },
        {
          q: "¿El certificado está registrado ante PROFECO?",
          a: "Los contratos de adhesión de WEEK-CHAIN están registrados ante PROFECO conforme a la legislación aplicable. El número de registro y términos específicos se detallan en tu contrato digital. Este registro NO constituye aval de PROFECO sobre el modelo de negocio ni garantiza resultados, solo certifica que el contrato cumple requisitos formales de información al consumidor.",
        },
        {
          q: "¿Qué protección tengo como consumidor?",
          a: "Tienes protección bajo: (1) Derecho de retracto de 5 días hábiles, (2) Información clara y transparente pre-contractual, (3) Contrato de adhesión registrado ante PROFECO, (4) Derecho de presentar quejas ante PROFECO, (5) Procesos de resolución de controversias establecidos. Sin embargo, estas protecciones NO incluyen garantías sobre disponibilidad, destinos específicos ni resultados del servicio de management.",
        },
        {
          q: "¿Puedo demandar si no hay disponibilidad?",
          a: "El contrato establece claramente que el derecho es de SOLICITUD sujeta a disponibilidad, NO de reservación directa garantizada. Si el sistema consistentemente no ofrece alternativas viables para tus solicitudes, puedes presentar queja ante PROFECO o iniciar proceso de resolución conforme a términos contractuales. Sin embargo, la falta de disponibilidad en fechas/destinos específicos NO constituye incumplimiento si se ofrecen alternativas razonables.",
        },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />

      <main className="container mx-auto px-4 py-24">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2">
            <HelpCircle className="h-4 w-4 mr-2 inline" />
            Centro de Preguntas Frecuentes
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">Preguntas Frecuentes - SVC</h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto mb-8">
            Todo lo que necesitas saber sobre el Smart Vacational Certificate y el modelo REQUEST → OFFER → CONFIRM
          </p>
          <div className="inline-flex items-center gap-2 bg-amber-50 border-2 border-amber-300 rounded-full px-6 py-3">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <span className="text-sm font-semibold text-amber-900">
              Lee cuidadosamente - Contenido crucial para entender tus derechos
            </span>
          </div>
        </div>

        {/* Legal Disclaimer Banner */}
        <Card className="max-w-5xl mx-auto mb-12 border-2 border-red-200 bg-gradient-to-br from-red-50 to-rose-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl text-red-900">
              <AlertTriangle className="h-6 w-6" />
              Aviso Legal Importante - Lectura Obligatoria
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-red-800">
            <p className="font-semibold">
              El Smart Vacational Certificate otorga un derecho personal, temporal y revocable de solicitar uso
              vacacional, sujeto a disponibilidad. NO constituye:
            </p>
            <div className="grid sm:grid-cols-2 gap-2">
              <div className="flex items-start gap-2">
                <span className="text-red-600 font-bold text-lg">✗</span>
                <span>Propiedad inmobiliaria ni derechos reales</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-600 font-bold text-lg">✗</span>
                <span>Tiempo compartido con semanas asignadas</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-600 font-bold text-lg">✗</span>
                <span>Inversión financiera ni instrumento de rendimientos</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-600 font-bold text-lg">✗</span>
                <span>Garantía de destinos, fechas o propiedades específicas</span>
              </div>
            </div>
            <p className="font-semibold text-red-900 pt-2">
              Todas las solicitudes están sujetas al flujo REQUEST → OFFER → CONFIRM obligatorio y a disponibilidad real
              del sistema.
            </p>
          </CardContent>
        </Card>

        {/* FAQ Categories */}
        <div className="max-w-5xl mx-auto space-y-6">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <Card
                key={category.id}
                className="border-2 border-slate-200 shadow-xl hover:shadow-2xl transition-shadow"
              >
                <CardHeader className={`bg-gradient-to-r ${category.color} text-white rounded-t-lg`}>
                  <CardTitle className="flex items-center gap-3 text-xl md:text-2xl">
                    <div className="p-2 rounded-lg bg-white/20">
                      <Icon className="h-6 w-6" />
                    </div>
                    {category.name}
                  </CardTitle>
                  <CardDescription className="text-white/90">
                    {category.questions.length} preguntas en esta categoría
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <Accordion type="single" collapsible className="w-full">
                    {category.questions.map((q, index) => (
                      <AccordionItem key={index} value={`${category.id}-${index}`} className="border-slate-200">
                        <AccordionTrigger className="text-left font-semibold text-slate-900 hover:text-blue-600 text-base">
                          {q.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-slate-700 leading-relaxed text-sm md:text-base pt-2">
                          {q.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* CTA Section */}
        <Card className="max-w-4xl mx-auto mt-16 border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl mb-2">¿Aún tienes dudas?</CardTitle>
            <CardDescription className="text-lg text-slate-700">
              Nuestro equipo está disponible para responder todas tus preguntas
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90">
              <Link href="/contact">
                <MessageCircle className="mr-2 h-5 w-5" />
                Contactar Soporte
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-2 bg-transparent">
              <Link href="/centro-de-ayuda">
                <HelpCircle className="mr-2 h-5 w-5" />
                Centro de Ayuda
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Bottom Disclaimer */}
        <div className="max-w-4xl mx-auto mt-12 p-6 bg-slate-100 rounded-xl border border-slate-300">
          <p className="text-xs text-slate-600 text-center leading-relaxed">
            Esta información es orientativa y NO sustituye la lectura completa de los términos y condiciones del
            contrato de adhesión. El contrato prevalece sobre cualquier información aquí presentada. Consulta
            <Link href="/terms" className="text-blue-600 hover:underline mx-1">
              Términos y Condiciones
            </Link>
            y
            <Link href="/disclaimer" className="text-blue-600 hover:underline mx-1">
              Disclaimer Legal
            </Link>
            para información completa sobre tus derechos y obligaciones.
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
