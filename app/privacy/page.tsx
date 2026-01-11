import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Shield, Lock, Eye, Database, Mail, UserCheck } from "lucide-react"
import { PrivacyActions } from "./privacy-actions"

export const dynamic = "force-dynamic"

const privacyContent = {
  title: "Política de Privacidad",
  company: "WEEK-CHAIN SAPI de CV",
  subtitle: "Última actualización: Diciembre 2025",
  sections: {
    responsible: {
      title: "1. Responsable del Tratamiento",
      content:
        "WEEK-CHAIN SAPI de CV es responsable del tratamiento de sus datos personales conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP).",
      contact: "Contacto: privacy@week-chain.com",
    },
    data: {
      title: "2. Datos que Recopilamos",
      intro: "Recopilamos los siguientes datos personales:",
      items: [
        "Datos de identificación: nombre, CURP, INE",
        "Datos de contacto: correo electrónico, teléfono, dirección",
        "Datos financieros: información bancaria para pagos",
        "Datos de verificación KYC: documentos de identidad",
        "Datos de certificados digitales",
        "Datos de navegación: cookies, IP, preferencias",
      ],
    },
    purposes: {
      title: "3. Finalidades del Tratamiento",
      primary: "Finalidades Primarias:",
      primaryItems: [
        "Gestión de contratos de derecho de uso",
        "Procesamiento de pagos y transacciones",
        "Emisión de certificados digitales NOM-151",
        "Comunicaciones sobre tu cuenta y reservaciones",
        "Cumplimiento de obligaciones legales",
      ],
      secondary: "Finalidades Secundarias:",
      secondaryItems: [
        "Envío de comunicaciones promocionales",
        "Encuestas de satisfacción",
        "Estadísticas y mejora del servicio",
      ],
    },
    sharing: {
      title: "4. Transferencia de Datos",
      intro: "Podemos compartir tus datos con:",
      items: [
        "Stripe: Procesamiento de pagos (PCI DSS compliant)",
        "Supabase: Almacenamiento seguro de datos",
        "Vercel: Infraestructura de hosting",
        "Proveedores KYC: Verificación de identidad",
        "Certificados: Emisión de certificados digitales",
        "Autoridades: Cuando sea requerido por ley",
      ],
    },
    rights: {
      title: "5. Tus Derechos ARCO",
      intro: "Tienes derecho a:",
      items: [
        "Acceso: Conocer qué datos tenemos sobre ti",
        "Rectificación: Corregir datos inexactos",
        "Cancelación: Solicitar eliminación de datos",
        "Oposición: Oponerte al tratamiento de datos",
      ],
      footer: "Para ejercer estos derechos, contacta a privacy@week-chain.com",
    },
    security: {
      title: "6. Medidas de Seguridad",
      intro: "Implementamos medidas de seguridad técnicas y administrativas:",
      items: [
        "Encriptación SSL/TLS en todas las comunicaciones",
        "Almacenamiento seguro con cifrado AES-256",
        "Control de acceso basado en roles",
        "Auditorías de seguridad periódicas",
        "Cumplimiento NOM-151 para certificados digitales",
      ],
    },
    cookies: {
      title: "7. Uso de Cookies",
      content:
        "Utilizamos cookies esenciales para el funcionamiento de la plataforma y cookies analíticas para mejorar nuestros servicios. Puedes configurar tu navegador para rechazar cookies, aunque esto puede afectar la funcionalidad.",
    },
    changes: {
      title: "8. Cambios a esta Política",
      content:
        "Nos reservamos el derecho de modificar esta política. Te notificaremos sobre cambios significativos por correo electrónico o mediante un aviso en la plataforma.",
    },
  },
  contactInfo: {
    title: "Información de Contacto",
    company: "WEEK-CHAIN SAPI de CV",
    address: "Tulum, Quintana Roo, México",
    email: "Email: privacy@week-chain.com",
    version: "Versión: 1.0",
  },
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Card className="border-2">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold">{privacyContent.title}</CardTitle>
            <CardDescription className="text-base">{privacyContent.company}</CardDescription>
            <p className="text-sm text-muted-foreground">{privacyContent.subtitle}</p>
          </CardHeader>

          <CardContent className="space-y-6">
            <ScrollArea className="h-[500px] rounded-md border p-6">
              <div className="space-y-6">
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <UserCheck className="h-5 w-5 text-purple-600" />
                    <h3 className="text-xl font-semibold">{privacyContent.sections.responsible.title}</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{privacyContent.sections.responsible.content}</p>
                  <p className="text-muted-foreground leading-relaxed mt-2">
                    <strong>{privacyContent.sections.responsible.contact}</strong>
                  </p>
                </section>

                <Separator />

                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Database className="h-5 w-5 text-blue-600" />
                    <h3 className="text-xl font-semibold">{privacyContent.sections.data.title}</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-2">{privacyContent.sections.data.intro}</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                    {privacyContent.sections.data.items.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </section>

                <Separator />

                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Eye className="h-5 w-5 text-green-600" />
                    <h3 className="text-xl font-semibold">{privacyContent.sections.purposes.title}</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-2">
                    <strong>{privacyContent.sections.purposes.primary}</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 mb-3">
                    {privacyContent.sections.purposes.primaryItems.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                  <p className="text-muted-foreground leading-relaxed mb-2">
                    <strong>{privacyContent.sections.purposes.secondary}</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                    {privacyContent.sections.purposes.secondaryItems.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </section>

                <Separator />

                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Lock className="h-5 w-5 text-orange-600" />
                    <h3 className="text-xl font-semibold">{privacyContent.sections.sharing.title}</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-2">{privacyContent.sections.sharing.intro}</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                    {privacyContent.sections.sharing.items.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </section>

                <Separator />

                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <h3 className="text-xl font-semibold">{privacyContent.sections.rights.title}</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-2">{privacyContent.sections.rights.intro}</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                    {privacyContent.sections.rights.items.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                  <p className="text-muted-foreground leading-relaxed mt-2">{privacyContent.sections.rights.footer}</p>
                </section>

                <Separator />

                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Lock className="h-5 w-5 text-purple-600" />
                    <h3 className="text-xl font-semibold">{privacyContent.sections.security.title}</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{privacyContent.sections.security.intro}</p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground ml-4">
                    {privacyContent.sections.security.items.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </section>

                <Separator />

                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Eye className="h-5 w-5 text-green-600" />
                    <h3 className="text-xl font-semibold">{privacyContent.sections.cookies.title}</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{privacyContent.sections.cookies.content}</p>
                </section>

                <Separator />

                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Mail className="h-5 w-5 text-orange-600" />
                    <h3 className="text-xl font-semibold">{privacyContent.sections.changes.title}</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{privacyContent.sections.changes.content}</p>
                </section>

                <Separator />

                <section className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">{privacyContent.contactInfo.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    <strong>{privacyContent.contactInfo.company}</strong>
                    <br />
                    {privacyContent.contactInfo.address}
                    <br />
                    {privacyContent.contactInfo.email}
                    <br />
                    {privacyContent.contactInfo.version}
                  </p>
                </section>
              </div>
            </ScrollArea>

            <Suspense fallback={<div className="h-48 animate-pulse bg-muted rounded-lg" />}>
              <PrivacyActions />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
