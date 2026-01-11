"use client"

import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { HelpCircle, MessageSquare, Mail, Phone, FileText, Shield } from "lucide-react"
import { SiteFooter } from "@/components/site-footer"

export default function HelpPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Navbar />

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto max-w-6xl px-6">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-6">
              <HelpCircle className="h-4 w-4" />
              Centro de Ayuda
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">¿Cómo podemos ayudarte?</h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Encuentra respuestas sobre nuestro sistema de Smart Vacational Certificates y derechos de solicitud de uso
              temporal.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* FAQ Section */}
            <div className="lg:col-span-2">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Preguntas Frecuentes
                  </CardTitle>
                  <CardDescription>Respuestas a las dudas más comunes sobre WEEK-CHAIN</CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>¿Qué es WEEK-CHAIN?</AccordionTrigger>
                      <AccordionContent>
                        WEEK-CHAIN es una plataforma digital de Smart Vacational Certificates (SVC) que otorgan derechos
                        personales y temporales de solicitud de uso vacacional por hasta 15 años en destinos
                        participantes. El sistema opera bajo el flujo REQUEST → OFFER → CONFIRM, donde todas las
                        solicitudes están sujetas a disponibilidad operativa sin garantías de acceso a destinos
                        específicos.
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-2">
                      <AccordionTrigger>¿Cómo activo un Smart Vacational Certificate?</AccordionTrigger>
                      <AccordionContent>
                        Para activar tu SVC: (1) Selecciona la capacidad PAX (2/4/6/8 personas) y número de estancias
                        anuales (1-4), (2) Completa el proceso de activación con pago único, (3) Elige tu método de
                        pago, (4) Recibe tu certificado digital certificado NOM-151, (5) Accede a tu panel para realizar
                        solicitudes de uso. El proceso cumple con la Ley Federal de Protección al Consumidor.
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-3">
                      <AccordionTrigger>¿Qué obtengo al activar un certificado?</AccordionTrigger>
                      <AccordionContent>
                        Al activar un Smart Vacational Certificate obtienes: (1) Derecho personal de solicitud de uso
                        vacacional por 15 años sujeto a disponibilidad, (2) Contrato de adhesión certificado NOM-151,
                        (3) Acceso al sistema de solicitudes REQUEST → OFFER → CONFIRM, (4) Posibilidad de coordinar
                        gestión operativa opcional (sujeto a aprobación). IMPORTANTE: El certificado NO constituye
                        propiedad inmobiliaria, inversión ni garantiza acceso a destinos o fechas específicas.
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-4">
                      <AccordionTrigger>¿Puedo cancelar mi activación?</AccordionTrigger>
                      <AccordionContent>
                        Sí. Conforme a la NOM-029-SE-2021 y la Ley Federal de Protección al Consumidor, tienes 5 días
                        hábiles después de la firma del contrato para cancelar sin penalización y recibir el reembolso
                        completo. Después de este período, aplican las condiciones establecidas en el contrato.
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-5">
                      <AccordionTrigger>¿Qué métodos de pago aceptan?</AccordionTrigger>
                      <AccordionContent>
                        Aceptamos múltiples métodos de pago: Tarjetas de crédito y débito (Visa, Mastercard, American
                        Express), PayPal, Apple Pay, Google Pay, transferencia SPEI, y pago en efectivo en OXXO. Todos
                        los precios incluyen IVA (16%).
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-6">
                      <AccordionTrigger>¿Cómo funciona el programa de intermediarios?</AccordionTrigger>
                      <AccordionContent>
                        Nuestro programa de intermediarios permite a personas y empresas recibir honorarios por referir
                        clientes que activen certificados. Los honorarios se calculan como porcentaje del valor de
                        activación según el nivel de desempeño. Este programa NO constituye un esquema de inversión,
                        multinivel ni de compensación basado en reclutamiento; es exclusivamente un sistema de
                        honorarios por intermediación comercial conforme a legislación aplicable.
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-7">
                      <AccordionTrigger>¿Cómo funciona el servicio de gestión operativa?</AccordionTrigger>
                      <AccordionContent>
                        Puedes solicitar el servicio opcional "WEEK-Management" para que el equipo coordine la gestión
                        operativa de tu derecho de uso en plataformas externas. Este servicio está sujeto a: (1)
                        Aprobación del sistema, (2) Disponibilidad de demanda, (3) Comisiones operativas del 15-25%, (4)
                        Cumplimiento de estándares. IMPORTANTE: Los ingresos NO están garantizados, varían según
                        condiciones de mercado y NO constituyen rendimiento de inversión.
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-8">
                      <AccordionTrigger>¿La certificación digital tiene validez legal?</AccordionTrigger>
                      <AccordionContent>
                        Sí. Todos los contratos se certifican bajo la NOM-151-SCFI-2016, lo que les otorga la misma
                        validez legal que un documento físico firmado. La certificación digital es exclusivamente
                        probatoria para la integridad documental del contrato de derechos de solicitud temporal y no
                        representa activos financieros, propiedad inmobiliaria ni derechos patrimoniales sobre
                        inmuebles.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </div>

            {/* Contact Section */}
            <div className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Contacto Directo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">soporte@week-chain.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Phone className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Teléfono</p>
                      <p className="text-sm text-muted-foreground">+52 55 1234 5678</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Aviso Legal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    WEEK-CHAIN opera un sistema de Smart Vacational Certificates que otorgan derechos personales y
                    temporales de solicitud de uso vacacional por hasta 15 años, sujetos a disponibilidad del sistema.
                    Los certificados NO constituyen propiedad inmobiliaria, tiempo compartido tradicional, inversión ni
                    garantizan acceso a destinos o fechas específicas. Conforme a legislación mexicana de protección al
                    consumidor y NOM-029-SE-2021.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
