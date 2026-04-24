import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  FileText,
  Shield,
  Scale,
  Building,
  Download,
  ExternalLink,
  CheckCircle,
  BookOpen,
  Users,
  Globe,
} from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Centro Legal | WEEK-CHAIN",
  description: "Documentos legales, contratos modelo, políticas de privacidad y términos y condiciones de WEEK-CHAIN.",
}

const legalDocuments = [
  {
    title: "Términos y Condiciones",
    description: "Condiciones generales de uso de la plataforma y adquisición de semanas vacacionales",
    icon: FileText,
    href: "/terms",
    version: "1.0",
    updated: "Enero 2025",
    type: "Obligatorio",
  },
  {
    title: "Política de Privacidad",
    description: "Cómo recopilamos, usamos y protegemos tus datos personales conforme a LFPDPPP",
    icon: Shield,
    href: "/privacy",
    version: "1.0",
    updated: "Diciembre 2024",
    type: "Obligatorio",
  },
  {
    title: "Acuerdo de Procesamiento de Datos (DPA)",
    description: "Detalle de subencargados, transferencias internacionales y medidas de seguridad",
    icon: Globe,
    href: "/legal/dpa",
    version: "1.0",
    updated: "Enero 2025",
    type: "Informativo",
  },
  {
    title: "Contrato Modelo de Tiempo Compartido",
    description: "Contrato tipo conforme a NOM-029-SCFI-2010 para adquisición de derechos de uso",
    icon: Scale,
    href: "/legal/contrato-modelo",
    version: "1.0",
    updated: "Enero 2025",
    type: "Descargable",
    downloadable: true,
  },
  {
    title: "Términos para Intermediarios",
    description: "Condiciones específicas para el programa de brokers e intermediarios",
    icon: Users,
    href: "/broker/terms",
    version: "1.0",
    updated: "Enero 2025",
    type: "Brokers",
  },
  {
    title: "Aviso de Privacidad para Intermediarios",
    description: "Política de privacidad específica para brokers y su tratamiento de datos",
    icon: Shield,
    href: "/broker/privacy",
    version: "1.0",
    updated: "Enero 2025",
    type: "Brokers",
  },
]

const complianceInfo = [
  {
    title: "NOM-029-SCFI-2010",
    description: "Cumplimiento con la norma oficial mexicana para tiempo compartido",
    status: "Cumple",
  },
  {
    title: "NOM-151-SCFI-2016",
    description: "Certificación digital de contratos y documentos electrónicos",
    status: "Cumple",
  },
  {
    title: "LFPDPPP",
    description: "Ley Federal de Protección de Datos Personales en Posesión de los Particulares",
    status: "Cumple",
  },
  {
    title: "PROFECO",
    description: "Registro ante la Procuraduría Federal del Consumidor",
    status: "Cumple",
  },
  {
    title: "PCI DSS",
    description: "Estándar de seguridad de datos para la industria de tarjetas de pago",
    status: "Via Stripe/Conekta",
  },
]

export default function LegalCenterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-[#0F1628] text-white">Transparencia Legal</Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Centro Legal WEEK-CHAIN</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Accede a todos nuestros documentos legales, contratos modelo y políticas. Nuestro compromiso es la
            transparencia total con nuestros usuarios.
          </p>
        </div>

        {/* Company Info Card */}
        <Card className="mb-8 border-[#0F1628]/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-[#E91E63]" />
              Información de la Empresa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Razón Social</p>
                <p className="font-medium">WEEK-CHAIN SAPI de CV</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">RFC</p>
                <p className="font-medium">WCH240101XXX</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Domicilio Fiscal</p>
                <p className="font-medium">Tulum, Quintana Roo, México</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Contacto Legal</p>
                <p className="font-medium">
                  <a href="mailto:legal@week-chain.com" className="text-blue-600 hover:underline">
                    legal@week-chain.com
                  </a>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Documentos Legales</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {legalDocuments.map((doc, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <doc.icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {doc.type}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{doc.title}</CardTitle>
                  <CardDescription>{doc.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>Versión {doc.version}</span>
                    <span>Actualizado: {doc.updated}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild variant="outline" className="flex-1 bg-transparent">
                      <Link href={doc.href}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Ver Documento
                      </Link>
                    </Button>
                    {doc.downloadable && (
                      <Button asChild variant="secondary">
                        <Link href={`${doc.href}?download=pdf`}>
                          <Download className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Compliance Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Cumplimiento Normativo</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {complianceInfo.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-gray-900">{item.title}</p>
                        <p className="text-sm text-gray-500">{item.description}</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">{item.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Certificate Verification */}
        <Card className="mb-12 bg-[#0F1628] text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#E91E63]" />
              Verificación de Certificados
            </CardTitle>
            <CardDescription className="text-gray-300">
              Verifica la autenticidad de cualquier certificado digital emitido por WEEK-CHAIN
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 mb-4">
              Cada certificado de derecho de uso emitido por WEEK-CHAIN tiene un identificador único que puede ser
              verificado públicamente en nuestro sistema.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild variant="secondary" className="flex-1">
                <Link href="/verify/ejemplo">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Ver Ejemplo de Verificación
                </Link>
              </Button>
              <div className="text-sm text-gray-400 flex items-center">
                URL: week-chain.com/verify/[ID-DEL-CERTIFICADO]
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle>¿Tienes preguntas legales?</CardTitle>
            <CardDescription>
              Nuestro equipo legal está disponible para resolver cualquier duda sobre nuestros términos, políticas o el
              funcionamiento de la plataforma.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4">
                <p className="text-sm text-gray-500 mb-1">Consultas Generales</p>
                <a href="mailto:info@week-chain.com" className="text-blue-600 hover:underline font-medium">
                  info@week-chain.com
                </a>
              </div>
              <div className="text-center p-4">
                <p className="text-sm text-gray-500 mb-1">Asuntos Legales</p>
                <a href="mailto:legal@week-chain.com" className="text-blue-600 hover:underline font-medium">
                  legal@week-chain.com
                </a>
              </div>
              <div className="text-center p-4">
                <p className="text-sm text-gray-500 mb-1">Privacidad y Datos</p>
                <a href="mailto:privacy@week-chain.com" className="text-blue-600 hover:underline font-medium">
                  privacy@week-chain.com
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
