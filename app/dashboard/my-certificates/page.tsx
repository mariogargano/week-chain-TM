"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, FileText, QrCode } from "lucide-react"
import Link from "next/link"
import { InvoiceRequestDialog } from "@/components/invoice-request-dialog"

export default function MyCertificatesPage() {
  const [certificates, setCertificates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCertificate, setSelectedCertificate] = useState<string | null>(null)

  useEffect(() => {
    loadCertificates()
  }, [])

  async function loadCertificates() {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from("certificate_purchases")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (!error && data) {
      setCertificates(data)
    }
    setLoading(false)
  }

  if (loading) {
    return <div className="p-8">Cargando certificados...</div>
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Mis Certificados</h1>
        <p className="text-slate-600 mt-2">Gestiona tus certificados digitales y solicita facturas</p>
      </div>

      {certificates.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <p className="text-slate-600 mb-4">No tienes certificados aún</p>
            <Link href="/certificates">
              <Button>Ver Certificados Disponibles</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {certificates.map((cert) => (
            <Card key={cert.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{cert.certificate_number}</CardTitle>
                    <CardDescription>Tipo: {cert.certificate_type.toUpperCase()}</CardDescription>
                  </div>
                  <Badge variant={cert.status === "active" ? "default" : "secondary"}>
                    {cert.status === "active" ? "Activo" : cert.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600">Código:</span>
                    <p className="font-mono font-medium">{cert.certificate_code}</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Monto:</span>
                    <p className="font-medium">
                      {cert.currency} ${cert.amount_usd}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-600">Activado:</span>
                    <p>{cert.activated_at ? new Date(cert.activated_at).toLocaleDateString() : "Pendiente"}</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Expira:</span>
                    <p>{cert.expires_at ? new Date(cert.expires_at).toLocaleDateString() : "N/A"}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  {cert.voucher_url && (
                    <Button variant="outline" asChild>
                      <a href={cert.voucher_url} target="_blank" rel="noopener noreferrer">
                        <Download className="w-4 h-4 mr-2" />
                        Descargar Voucher
                      </a>
                    </Button>
                  )}

                  {cert.invoice_url ? (
                    <Button variant="outline" asChild>
                      <a href={cert.invoice_url} target="_blank" rel="noopener noreferrer">
                        <FileText className="w-4 h-4 mr-2" />
                        Descargar Factura
                      </a>
                    </Button>
                  ) : (
                    cert.status === "active" && (
                      <Button variant="default" onClick={() => setSelectedCertificate(cert.id)}>
                        <FileText className="w-4 h-4 mr-2" />
                        Solicitar Factura
                      </Button>
                    )
                  )}

                  <Button variant="outline" asChild>
                    <Link href={`/dashboard/my-certificates/${cert.id}/qr`}>
                      <QrCode className="w-4 h-4 mr-2" />
                      Ver QR
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedCertificate && (
        <InvoiceRequestDialog
          open={!!selectedCertificate}
          certificateId={selectedCertificate}
          onClose={() => setSelectedCertificate(null)}
          onSuccess={() => {
            setSelectedCertificate(null)
            loadCertificates()
          }}
        />
      )}
    </div>
  )
}
