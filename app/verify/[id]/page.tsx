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
  week_number: number
  year: number
  season: string
  owner_wallet: string
  property: {
    name: string
    location: string
  }
  reservation: {
    id: string
    usdc_equivalent: number
    created_at: string
  }
  profiles?: {
    display_name: string
    username: string
  }
}

async function getCertificateData(id: string): Promise<CertificateData | null> {
  const supabase = await createClient()

  // First try to find by week ID
  const { data: week, error } = await supabase
    .from("weeks")
    .select(`
      id,
      status,
      created_at,
      week_number,
      season,
      owner_wallet,
      reservation_id,
      property:properties(name, location),
      reservation:reservations(id, usdc_equivalent, created_at)
    `)
    .eq("id", id)
    .single()

  if (error || !week) {
    // Try to find by reservation ID
    const { data: reservation } = await supabase
      .from("reservations")
      .select(`
        id,
        status,
        created_at,
        usdc_equivalent,
        user_wallet,
        week:weeks(id, week_number, season, owner_wallet, property:properties(name, location))
      `)
      .eq("id", id)
      .single()

    if (!reservation || !reservation.week) return null

    const weekData = Array.isArray(reservation.week) ? reservation.week[0] : reservation.week
    const propertyData = weekData?.property

    return {
      id: reservation.id,
      status: reservation.status,
      created_at: reservation.created_at,
      week_number: weekData?.week_number || 0,
      year: new Date().getFullYear(),
      season: weekData?.season || "standard",
      owner_wallet: reservation.user_wallet,
      property: {
        name: Array.isArray(propertyData) ? propertyData[0]?.name : propertyData?.name || "Propiedad WEEK-CHAIN",
        location: Array.isArray(propertyData) ? propertyData[0]?.location : propertyData?.location || "México",
      },
      reservation: {
        id: reservation.id,
        usdc_equivalent: reservation.usdc_equivalent,
        created_at: reservation.created_at,
      },
    }
  }

  const propertyData = week.property
  const reservationData = week.reservation

  return {
    id: week.id,
    status: week.status,
    created_at: week.created_at,
    week_number: week.week_number,
    year: new Date().getFullYear(),
    season: week.season || "standard",
    owner_wallet: week.owner_wallet,
    property: {
      name: Array.isArray(propertyData) ? propertyData[0]?.name : propertyData?.name || "Propiedad WEEK-CHAIN",
      location: Array.isArray(propertyData) ? propertyData[0]?.location : propertyData?.location || "México",
    },
    reservation: reservationData
      ? {
          id: Array.isArray(reservationData) ? reservationData[0]?.id : reservationData?.id,
          usdc_equivalent: Array.isArray(reservationData)
            ? reservationData[0]?.usdc_equivalent
            : reservationData?.usdc_equivalent,
          created_at: Array.isArray(reservationData) ? reservationData[0]?.created_at : reservationData?.created_at,
        }
      : {
          id: "",
          usdc_equivalent: 0,
          created_at: week.created_at,
        },
  }
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
  const issueDate = new Date(certificate.reservation?.created_at || certificate.created_at)
  const expirationDate = new Date(issueDate)
  expirationDate.setFullYear(expirationDate.getFullYear() + 15)

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

            {/* Week Info */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  Semana
                </div>
                <p className="font-medium text-gray-900">Semana {certificate.week_number}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  Temporada
                </div>
                <p className="font-medium text-gray-900">{getSeasonName(certificate.season)}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <User className="h-4 w-4" />
                  Titular
                </div>
                <p className="font-medium text-gray-900 font-mono text-sm">{maskWallet(certificate.owner_wallet)}</p>
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
            {certificate.reservation?.usdc_equivalent > 0 && (
              <>
                <Separator />
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Valor del Certificado</div>
                  <p className="text-2xl font-bold text-gray-900">
                    ${certificate.reservation.usdc_equivalent.toLocaleString("en-US")} USD
                  </p>
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
