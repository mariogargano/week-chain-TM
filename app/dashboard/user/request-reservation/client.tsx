"use client"

import { useState } from "react"
import { Calendar, Home, Clock, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RequestReservationDialog } from "@/components/request-reservation-dialog"
import { ConsentCheckpoint } from "@/components/consent-checkpoint"

interface Certificate {
  id: string
  tier: string
  status: string
  issued_at: string
  valid_until: string
}

interface RequestReservationClientProps {
  certificates: Certificate[]
}

export function RequestReservationClient({ certificates }: RequestReservationClientProps) {
  const [selectedCertificate, setSelectedCertificate] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [showConsentCheckpoint, setShowConsentCheckpoint] = useState(false)
  const [userId, setUserId] = useState<string>("")

  const activeCertificates = certificates.filter((c) => c.status === "active")

  const getTierLabel = (tier: string) => {
    const labels: Record<string, string> = {
      silver: "Silver",
      gold: "Gold",
      platinum: "Platinum",
      signature: "Signature",
      wedding: "Wedding",
    }
    return labels[tier] || tier
  }

  const getTierColor = (tier: string) => {
    const colors: Record<string, string> = {
      silver: "bg-slate-100 text-slate-800",
      gold: "bg-yellow-100 text-yellow-800",
      platinum: "bg-purple-100 text-purple-800",
      signature: "bg-blue-100 text-blue-800",
      wedding: "bg-pink-100 text-pink-800",
    }
    return colors[tier] || "bg-gray-100 text-gray-800"
  }

  const handleRequestClick = async (certId: string) => {
    setSelectedCertificate(certId)

    // Get user ID for consent checkpoint
    const response = await fetch("/api/auth/user")
    if (response.ok) {
      const data = await response.json()
      setUserId(data.user.id)
      setShowConsentCheckpoint(true)
    }
  }

  const handleConsentGranted = () => {
    setShowConsentCheckpoint(false)
    setDialogOpen(true)
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Solicitar Uso de Certificado</h1>
        <p className="text-muted-foreground">
          Solicita el uso de tu certificado para acceder a destinos participantes según disponibilidad
        </p>
      </div>

      {/* Disclaimer */}
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Importante:</strong> Esta es una solicitud de uso temporal, no una reserva garantizada. La aprobación
          está sujeta a la capacidad disponible del sistema WEEK-CHAIN y no asigna fechas, destinos ni propiedades
          específicas.
        </AlertDescription>
      </Alert>

      {/* Active Certificates */}
      {activeCertificates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Home className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">No tienes certificados activos</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Necesitas adquirir un certificado para solicitar uso de destinos
            </p>
            <Button onClick={() => (window.location.href = "/auth")}>Adquirir Certificado</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <h2 className="font-semibold text-lg">Tus Certificados Activos</h2>
          {activeCertificates.map((cert) => (
            <Card key={cert.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Certificado {getTierLabel(cert.tier)}
                  </CardTitle>
                  <Badge className={getTierColor(cert.tier)}>{getTierLabel(cert.tier)}</Badge>
                </div>
                <CardDescription>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    Válido hasta: {new Date(cert.valid_until).toLocaleDateString()}
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => handleRequestClick(cert.id)} className="w-full">
                  <Home className="mr-2 h-4 w-4" />
                  Solicitar Uso de Este Certificado
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ConsentCheckpoint */}
      {showConsentCheckpoint && userId && (
        <ConsentCheckpoint
          userId={userId}
          consentType="reservation"
          onConsentGranted={handleConsentGranted}
          onCancel={() => setShowConsentCheckpoint(false)}
        />
      )}

      {/* Request Dialog */}
      <RequestReservationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        propertyName="Destinos Participantes"
        propertyId="example-property-id"
        certificateId={selectedCertificate || undefined}
      />
    </div>
  )
}
