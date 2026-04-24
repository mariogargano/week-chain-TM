import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  CheckCircle,
  XCircle,
  Shield,
  Calendar,
  MapPin,
  User,
  FileText,
  Hash,
  Building,
  Clock,
  ExternalLink,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

interface CertificateData {
  id: string
  status: string
  created_at: string
  max_pax: number
  estancias: number
  year: number
  season: string
  owner_name: string
  owner_email: string
  valid_from: string
  valid_until: string
  price_paid: number
  token_hash: string | null
  property: {
    name: string
    location: string
  }
}

async function getCertificateData(id: string): Promise<CertificateData | null> {
  const supabase = await createClient()

  // Try user_certificates_v2 first (new schema)
  const { data: cert } = await supabase
    .from("user_certificates_v2")
    .select("*")
    .eq("id", id)
    .single()

  if (cert) {
    // Get associated week_token for blockchain hash
    const { data: token } = await supabase
      .from("week_tokens")
      .select("token_hash, qr_code, qr_payload")
      .eq("certificate_id", cert.id)
      .single()

    // Get owner info
    const { data: owner } = await supabase
      .from("users")
      .select("full_name, email")
      .eq("id", cert.user_id)
      .single()

    return {
      id: cert.id,
      status: cert.status || "active",
      created_at: cert.created_at,
      max_pax: cert.max_pax || 2,
      estancias: cert.estancias || 1,
      year: new Date(cert.created_at).getFullYear(),
      season: "standard",
      owner_name: owner?.full_name || "Titular Verificado",
      owner_email: owner?.email ? `${owner.email.slice(0, 3)}***@${owner.email.split("@")[1]}` : "***",
      valid_from: cert.valid_from || cert.created_at,
      valid_until: cert.valid_until || new Date(new Date(cert.created_at).setFullYear(new Date(cert.created_at).getFullYear() + 15)).toISOString(),
      price_paid: cert.price_mxn || 0,
      token_hash: token?.token_hash || null,
      property: {
        name: "Red de Propiedades WEEK-CHAIN",
        location: "Mexico",
      },
    }
  }

  // Fallback: try week_tokens by ID
  const { data: tokenDirect } = await supabase
    .from("week_tokens")
    .select("*, certificate:user_certificates_v2(*)")
    .eq("id", id)
    .single()

  if (tokenDirect?.certificate) {
    const c = Array.isArray(tokenDirect.certificate) ? tokenDirect.certificate[0] : tokenDirect.certificate
    const { data: owner } = await supabase
      .from("users")
      .select("full_name, email")
      .eq("id", c.user_id)
      .single()

    return {
      id: c.id,
      status: c.status || "active",
      created_at: c.created_at,
      max_pax: c.max_pax || 2,
      estancias: c.estancias || 1,
      year: new Date(c.created_at).getFullYear(),
      season: "standard",
      owner_name: owner?.full_name || "Titular Verificado",
      owner_email: owner?.email ? `${owner.email.slice(0, 3)}***@${owner.email.split("@")[1]}` : "***",
      valid_from: c.valid_from || c.created_at,
      valid_until: c.valid_until || new Date(new Date(c.created_at).setFullYear(new Date(c.created_at).getFullYear() + 15)).toISOString(),
      price_paid: c.price_mxn || 0,
      token_hash: tokenDirect.token_hash || null,
      property: {
        name: "Red de Propiedades WEEK-CHAIN",
        location: "Mexico",
      },
    }
  }

  // Fallback: try old user_certificates table
  const { data: oldCert } = await supabase
    .from("user_certificates")
    .select("*")
    .eq("id", id)
    .single()

  if (oldCert) {
    return {
      id: oldCert.id,
      status: oldCert.status || "active",
      created_at: oldCert.created_at,
      max_pax: 2,
      estancias: 1,
      year: new Date(oldCert.created_at).getFullYear(),
      season: "standard",
      owner_name: "Titular Verificado",
      owner_email: "***",
      valid_from: oldCert.created_at,
      valid_until: new Date(new Date(oldCert.created_at).setFullYear(new Date(oldCert.created_at).getFullYear() + 15)).toISOString(),
      price_paid: 0,
      token_hash: null,
      property: {
        name: "Red de Propiedades WEEK-CHAIN",
        location: "Mexico",
      },
    }
  }

  return null
}

function getSeasonName(season: string): string {
  const seasons: Record<string, string> = {
    alta: "Temporada Alta",
    media: "Temporada Media",
    baja: "Temporada Baja",
    high: "Temporada Alta",
    medium: "Temporada Media",
    low: "Temporada Baja",
    standard: "Temporada Estándar",
  }
  return seasons[season?.toLowerCase()] || "Temporada Estándar"
}

function getStatusInfo(status: string): { label: string; color: string; valid: boolean } {
  const statusMap: Record<string, { label: string; color: string; valid: boolean }> = {
    confirmed: { label: "Certificado Válido", color: "bg-green-500", valid: true },
    active: { label: "Certificado Activo", color: "bg-green-500", valid: true },
    sold: { label: "Certificado Válido", color: "bg-green-500", valid: true },
    available: { label: "Disponible", color: "bg-blue-500", valid: true },
    pending: { label: "Pendiente de Confirmación", color: "bg-yellow-500", valid: false },
    cancelled: { label: "Certificado Cancelado", color: "bg-red-500", valid: false },
    expired: { label: "Certificado Expirado", color: "bg-gray-500", valid: false },
  }
  return statusMap[status?.toLowerCase()] || { label: "Estado Desconocido", color: "bg-gray-500", valid: false }
}

function maskWallet(wallet: string): string {
  if (!wallet || wallet.length < 10) return wallet || "N/A"
  return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`
}

export default async function VerifyCertificatePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const certificate = await getCertificateData(id)

  if (!certificate) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 via-white to-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="border-red-200 bg-red-50/50">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-4 bg-red-100 rounded-full w-fit">
                <XCircle className="h-12 w-12 text-red-600" />
              </div>
              <CardTitle className="text-2xl text-red-800">Certificado No Encontrado</CardTitle>
              <CardDescription className="text-red-600">
                El identificador proporcionado no corresponde a ningún certificado válido en nuestro sistema.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="p-4 bg-white rounded-lg border border-red-200">
                <p className="text-sm text-gray-600 mb-2">ID consultado:</p>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">{id}</code>
              </div>
              <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200 text-left">
                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Posibles razones:</p>
                  <ul className="list-disc list-inside space-y-1 text-yellow-700">
                    <li>El ID del certificado está incompleto o incorrecto</li>
                    <li>El certificado aún no ha sido emitido</li>
                    <li>El certificado ha sido revocado o eliminado</li>
                  </ul>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Si crees que esto es un error, contacta a{" "}
                <a href="mailto:soporte@week-chain.com" className="text-blue-600 hover:underline">
                  soporte@week-chain.com
                </a>
              </p>
              <Button asChild variant="outline">
                <Link href="/">Volver al Inicio</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const statusInfo = getStatusInfo(certificate.status)
  const issueDate = new Date(certificate.valid_from || certificate.created_at)
  const expirationDate = new Date(certificate.valid_until || new Date(issueDate).setFullYear(issueDate.getFullYear() + 15))

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#0F1628] text-white rounded-full text-sm mb-4">
            <Shield className="h-4 w-4" />
            Sistema de Verificación WEEK-CHAIN
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Verificación de Certificado Digital</h1>
          <p className="text-gray-600">Resultado de la consulta en tiempo real</p>
        </div>

        {/* Status Card */}
        <Card
          className={`mb-6 border-2 ${statusInfo.valid ? "border-green-200 bg-green-50/30" : "border-yellow-200 bg-yellow-50/30"}`}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${statusInfo.valid ? "bg-green-100" : "bg-yellow-100"}`}>
                  {statusInfo.valid ? (
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-8 w-8 text-yellow-600" />
                  )}
                </div>
                <div>
                  <h2 className={`text-xl font-bold ${statusInfo.valid ? "text-green-800" : "text-yellow-800"}`}>
                    {statusInfo.label}
                  </h2>
                  <p className={`text-sm ${statusInfo.valid ? "text-green-600" : "text-yellow-600"}`}>
                    Verificado el{" "}
                    {new Date().toLocaleDateString("es-MX", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              <Badge className={`${statusInfo.color} text-white`}>{certificate.status?.toUpperCase()}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Certificate Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Detalles del Certificado
            </CardTitle>
            <CardDescription>Información registrada en el sistema WEEK-CHAIN</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Certificate ID */}
            <div className="p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <Hash className="h-4 w-4" />
                Identificador Único del Certificado
              </div>
              <code className="text-sm font-mono text-gray-900 break-all">{certificate.id}</code>
            </div>

            <Separator />

            {/* Property Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Building className="h-4 w-4" />
                  Propiedad
                </div>
                <p className="font-medium text-gray-900">{certificate.property.name}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin className="h-4 w-4" />
                  Ubicación
                </div>
                <p className="font-medium text-gray-900">{certificate.property.location}</p>
              </div>
            </div>

            <Separator />

            {/* Certificate Details */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <User className="h-4 w-4" />
                  Capacidad
                </div>
                <p className="font-medium text-gray-900">{certificate.max_pax} PAX</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  Estancias / Ano
                </div>
                <p className="font-medium text-gray-900">{certificate.estancias} por ano</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <User className="h-4 w-4" />
                  Titular
                </div>
                <p className="font-medium text-gray-900">{certificate.owner_name}</p>
              </div>
            </div>

            <Separator />

            {/* Dates */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-600 mb-1">Fecha de Emisión</div>
                <p className="font-medium text-blue-900">
                  {issueDate.toLocaleDateString("es-MX", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-green-600 mb-1">Vigencia hasta</div>
                <p className="font-medium text-green-900">
                  {expirationDate.toLocaleDateString("es-MX", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <p className="text-xs text-green-600 mt-1">15 años desde la emisión</p>
              </div>
            </div>

            {/* Value */}
            {certificate.price_paid > 0 && (
              <>
                <Separator />
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Valor del Certificado</div>
                  <p className="text-2xl font-bold text-gray-900">
                    ${certificate.price_paid.toLocaleString("es-MX")} MXN
                  </p>
                </div>
              </>
            )}

            {/* Token Hash */}
            {certificate.token_hash && (
              <>
                <Separator />
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <Shield className="h-4 w-4" />
                    Hash de Verificacion
                  </div>
                  <code className="text-xs font-mono text-gray-900 break-all">{certificate.token_hash}</code>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Legal Info */}
        <Card className="mb-6 border-[#0F1628]/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#0F1628]">
              <Shield className="h-5 w-5" />
              Información Legal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Emisor</p>
                <p className="font-medium">WEEK-CHAIN SAPI de CV</p>
              </div>
              <div>
                <p className="text-gray-500">RFC</p>
                <p className="font-medium">WCH240101XXX</p>
              </div>
              <div>
                <p className="text-gray-500">Normativa</p>
                <p className="font-medium">NOM-029-SCFI-2010</p>
              </div>
              <div>
                <p className="text-gray-500">Certificación Digital</p>
                <p className="font-medium">NOM-151-SCFI-2016</p>
              </div>
            </div>

            <Separator />

            <div className="p-4 bg-blue-50 rounded-lg text-sm">
              <p className="text-blue-800">
                <strong>Nota importante:</strong> Este certificado digital representa un derecho de uso temporal sobre
                una semana vacacional específica, conforme a la Ley Federal de Protección al Consumidor y la
                NOM-029-SCFI-2010 para tiempo compartido. No representa propiedad inmobiliaria ni participación
                accionaria.
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg text-sm">
              <p className="text-gray-600">
                <strong>Validación Blockchain (Opcional):</strong> Este certificado puede ser validado adicionalmente
                mediante registro en blockchain como prueba complementaria de autenticidad. La validez legal del
                certificado no depende de esta validación adicional.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="outline">
            <Link href="/legal/contrato-modelo">
              <FileText className="h-4 w-4 mr-2" />
              Ver Contrato Modelo
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/contact">
              <ExternalLink className="h-4 w-4 mr-2" />
              Contactar Soporte
            </Link>
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Verificación realizada a través del sistema oficial de WEEK-CHAIN</p>
          <p className="mt-1">
            <a href="https://week-chain.com" className="text-blue-600 hover:underline">
              week-chain.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
