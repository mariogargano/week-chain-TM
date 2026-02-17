import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Shield, FileText, Calendar, CreditCard, Lock, Scale, Globe } from "lucide-react"
import { TermsActions } from "./terms-actions"

const termsContent = {
  title: "Términos y Condiciones",
  company: "WEEK-CHAIN SAPI de CV",
  subtitle: "Última actualización: Enero 2025",
  sections: {
    object: {
      title: "1. Objeto del Contrato",
      content:
        "El presente contrato regula la adquisición de derechos de uso temporal (semanas vacacionales) sobre unidades de tiempo compartido en desarrollos turísticos selectos de México, operados bajo el modelo WEEK-CHAIN.",
    },
    nature: {
      title: "2. Naturaleza del Producto",
      content: "El usuario adquiere:",
      items: [
        "Un Smart Vacational Certificate certificado NOM-151 que otorga derecho de solicitud de uso vacacional anual por 15 años en destinos participantes",
        "Acceso a la plataforma de coordinación de solicitudes y marketplace",
        "Beneficios del programa de lealtad WEEK-CHAIN",
        "Posibilidad de transferir o ceder su certificado conforme a las condiciones establecidas",
      ],
      footer: "El certificado digital NO representa propiedad inmobiliaria ni participación accionaria en la empresa.",
    },
    duration: {
      title: "3. Duración y Vigencia",
      duration:
        "Cada semana adquirida tiene una vigencia de 15 años desde la fecha de emisión del certificado digital.",
      weeks: "Las semanas son transferibles según las condiciones del contrato.",
    },
    availability: {
      title: "4. Disponibilidad Internacional",
      content:
        "Los certificados digitales de WEEK-CHAIN pueden ser adquiridos por personas de cualquier país del mundo. No existen restricciones geográficas para la compra.",
      footer: "Las propiedades se encuentran en México y están sujetas a las leyes mexicanas aplicables.",
    },
    reflection: {
      title: "5. Derecho de Reflexión",
      content:
        "Conforme a la Ley Federal de Protección al Consumidor (Art. 56), el comprador tiene derecho a cancelar su compra dentro de los 5 días hábiles siguientes a la firma del contrato, sin penalización alguna.",
      footer: "Para ejercer este derecho, contacte a soporte@week-chain.com",
    },
    payment: {
      title: "6. Formas de Pago",
      intro: "WEEK-CHAIN acepta los siguientes métodos de pago:",
      methods: {
        card: "Tarjeta de crédito/débito (Visa, Mastercard, AMEX)",
        spei: "Transferencia bancaria SPEI",
        oxxo: "Pago en efectivo en tiendas OXXO (cargo adicional del 3%)",
      },
      footer:
        "Todos los pagos son procesados de forma segura a través de proveedores certificados PCI-DSS. Precios con IVA incluido.",
    },
    delivery: {
      title: "7. Entrega del Producto",
      intro: "Una vez confirmado el pago, el usuario recibirá:",
      items: [
        "Certificado digital NOM-151 emitido en su cuenta (dentro de 24-48 horas)",
        "Confirmación por correo electrónico",
        "Acceso a su dashboard personal con los detalles de su semana",
        "Documentación legal correspondiente",
      ],
      footer: "La entrega del certificado digital se considera realizada cuando es visible en su dashboard de usuario.",
    },
    jurisdiction: {
      title: "8. Jurisdicción",
      content:
        "Este contrato se rige por las leyes de los Estados Unidos Mexicanos. Cualquier controversia será resuelta en los tribunales competentes de Quintana Roo, México, o mediante arbitraje comercial conforme al Reglamento de la Cámara de Comercio.",
    },
    acceptance: {
      title: "9. Aceptación",
      content:
        "Al marcar la casilla de aceptación y completar la compra, el usuario declara haber leído, entendido y aceptado íntegramente estos términos y condiciones.",
      footer:
        "La aceptación digital tiene la misma validez legal que una firma autógrafa conforme a la NOM-151-SCFI-2016.",
    },
  },
  companyInfo: {
    title: "Información de la Empresa",
    rfc: "RFC: WCH240101XXX",
    address: "Domicilio: Cancún, Quintana Roo, México",
    contact: "Contacto: legal@week-chain.com",
    version: "Versión del documento: 2.0",
  },
  acceptLabel:
    "He leído y acepto los Términos y Condiciones de WEEK-CHAIN. Entiendo que estoy adquiriendo derechos de uso temporal y no propiedad inmobiliaria.",
  backButton: "Volver",
  acceptButton: "Aceptar y Continuar",
  processing: "Procesando...",
  digitalSignature: "Tu aceptación quedará registrada con firma digital conforme a la NOM-151-SCFI-2016",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-pink-50">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Card className="border-2">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold">{termsContent.title}</CardTitle>
            <CardDescription className="text-base">{termsContent.company}</CardDescription>
            <p className="text-sm text-muted-foreground">{termsContent.subtitle}</p>
          </CardHeader>

          <CardContent className="space-y-6">
            <ScrollArea className="h-[500px] rounded-md border p-6">
              <div className="space-y-6">
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <h3 className="text-xl font-semibold">{termsContent.sections.object.title}</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{termsContent.sections.object.content}</p>
                </section>

                <Separator />

                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Lock className="h-5 w-5 text-purple-600" />
                    <h3 className="text-xl font-semibold">{termsContent.sections.nature.title}</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{termsContent.sections.nature.content}</p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground ml-4">
                    {termsContent.sections.nature.items.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                  <p className="text-muted-foreground leading-relaxed mt-2">{termsContent.sections.nature.footer}</p>
                </section>

                <Separator />

                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="h-5 w-5 text-green-600" />
                    <h3 className="text-xl font-semibold">{termsContent.sections.duration.title}</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    <strong>{termsContent.sections.duration.duration}</strong>
                  </p>
                  <p className="text-muted-foreground leading-relaxed mt-2">{termsContent.sections.duration.weeks}</p>
                </section>

                <Separator />

                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Globe className="h-5 w-5 text-blue-600" />
                    <h3 className="text-xl font-semibold">{termsContent.sections.availability.title}</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{termsContent.sections.availability.content}</p>
                  <p className="text-muted-foreground leading-relaxed mt-2">
                    {termsContent.sections.availability.footer}
                  </p>
                </section>

                <Separator />

                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-5 w-5 text-orange-600" />
                    <h3 className="text-xl font-semibold">{termsContent.sections.reflection.title}</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{termsContent.sections.reflection.content}</p>
                  <p className="text-muted-foreground leading-relaxed mt-2">
                    {termsContent.sections.reflection.footer}
                  </p>
                </section>

                <Separator />

                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    <h3 className="text-xl font-semibold">{termsContent.sections.payment.title}</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{termsContent.sections.payment.intro}</p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground ml-4">
                    <li>
                      <strong>Tarjeta:</strong> {termsContent.sections.payment.methods.card}
                    </li>
                    <li>{termsContent.sections.payment.methods.spei}</li>
                    <li>{termsContent.sections.payment.methods.oxxo}</li>
                  </ul>
                  <p className="text-muted-foreground leading-relaxed mt-2">{termsContent.sections.payment.footer}</p>
                </section>

                <Separator />

                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="h-5 w-5 text-purple-600" />
                    <h3 className="text-xl font-semibold">{termsContent.sections.delivery.title}</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{termsContent.sections.delivery.intro}</p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground ml-4">
                    {termsContent.sections.delivery.items.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                  <p className="text-muted-foreground leading-relaxed mt-2">{termsContent.sections.delivery.footer}</p>
                </section>

                <Separator />

                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Scale className="h-5 w-5 text-green-600" />
                    <h3 className="text-xl font-semibold">{termsContent.sections.jurisdiction.title}</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{termsContent.sections.jurisdiction.content}</p>
                </section>

                <Separator />

                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Lock className="h-5 w-5 text-blue-600" />
                    <h3 className="text-xl font-semibold">{termsContent.sections.acceptance.title}</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{termsContent.sections.acceptance.content}</p>
                  <p className="text-muted-foreground leading-relaxed mt-2">
                    {termsContent.sections.acceptance.footer}
                  </p>
                </section>

                <Separator />

                <section className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">{termsContent.companyInfo.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {termsContent.companyInfo.rfc}
                    <br />
                    {termsContent.companyInfo.address}
                    <br />
                    {termsContent.companyInfo.contact}
                    <br />
                    {termsContent.companyInfo.version}
                    <br />
                    Última actualización: {new Date().toLocaleDateString()}
                  </p>
                </section>
              </div>
            </ScrollArea>

            <Suspense fallback={<div className="h-32 animate-pulse bg-muted rounded-lg" />}>
              <TermsActions
                acceptLabel={termsContent.acceptLabel}
                backButton={termsContent.backButton}
                acceptButton={termsContent.acceptButton}
                processing={termsContent.processing}
                digitalSignature={termsContent.digitalSignature}
              />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
