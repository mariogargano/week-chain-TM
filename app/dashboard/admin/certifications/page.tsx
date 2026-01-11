"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle2, XCircle, Clock, Download, RefreshCw } from "lucide-react"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function CertificationsPage() {
  const [certificates, setCertificates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ pending: 0, certified: 0, failed: 0 })

  useEffect(() => {
    loadCertificates()
  }, [])

  async function loadCertificates() {
    setLoading(true)
    const { data } = await supabase
      .from("nom151_certificates")
      .select("*, contracts(series, folio)")
      .order("created_at", { ascending: false })

    if (data) {
      setCertificates(data)
      setStats({
        pending: data.filter((c) => c.status === "pending").length,
        certified: data.filter((c) => c.status === "certified").length,
        failed: data.filter((c) => c.status === "failed").length,
      })
    }
    setLoading(false)
  }

  async function retryCertification(certId: string) {
    await fetch("/api/legalario/init-contract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ certificateId: certId }),
    })
    loadCertificates()
  }

  async function certifyContract(contractId: string) {
    await fetch("/api/legalario/init-contract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contractId }),
    })
    loadCertificates()
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "certified":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Certificado
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600">
            <Clock className="w-3 h-3 mr-1" />
            Pendiente
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Fallido
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Certificaciones NOM-151</h1>
        <p className="text-muted-foreground">Gestión de certificaciones legales vía Legalario</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Certificados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.certified}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Fallidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Certificados</CardTitle>
          <CardDescription>Historial de certificaciones NOM-151 vía Legalario</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Cargando...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Folio NOM-151</TableHead>
                  <TableHead>Serie</TableHead>
                  <TableHead>Hash SHA-256</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {certificates.map((cert) => (
                  <TableRow key={cert.id}>
                    <TableCell className="font-mono text-sm font-semibold">
                      {cert.folio || <span className="text-muted-foreground">Pendiente</span>}
                    </TableCell>
                    <TableCell>{cert.contracts?.series || "-"}</TableCell>
                    <TableCell className="font-mono text-xs">{cert.sha256_hash.slice(0, 16)}...</TableCell>
                    <TableCell>{getStatusBadge(cert.status)}</TableCell>
                    <TableCell>{new Date(cert.created_at).toLocaleDateString("es-MX")}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {cert.status === "certified" && cert.certificate_url && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(cert.certificate_url, "_blank")}
                              title="Ver Certificado Legalario"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <a
                              href={cert.certificate_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary underline hover:text-primary/80"
                            >
                              Ver Certificado
                            </a>
                          </>
                        )}
                        {cert.status === "pending" && (
                          <Button size="sm" variant="default" onClick={() => certifyContract(cert.contract_id)}>
                            Certificar (NOM-151)
                          </Button>
                        )}
                        {cert.status === "failed" && (
                          <Button size="sm" variant="outline" onClick={() => retryCertification(cert.id)}>
                            <RefreshCw className="w-4 h-4 mr-1" />
                            Reintentar
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
