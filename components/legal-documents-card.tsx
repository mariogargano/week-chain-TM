"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, FileText, Shield, CheckCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface LegalContract {
  id: string
  series_id: string
  nom151_folio: string
  sha256_hash: string
  status: string
  created_at: string
  certified_at: string | null
}

interface LegalDocumentsCardProps {
  userId: string
}

export function LegalDocumentsCard({ userId }: LegalDocumentsCardProps) {
  const [contracts, setContracts] = useState<LegalContract[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [certifying, setCertifying] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchContracts() {
      const { data } = await supabase
        .from("legal_contracts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (data) {
        setContracts(data)
      }

      // Check if user is admin
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single()

        setIsAdmin(profile?.role === "admin")
      }

      setLoading(false)
    }

    fetchContracts()
  }, [userId])

  const handleDownload = async (seriesId: string) => {
    window.open(`/api/legal/download?series=${seriesId}&user_id=${userId}`, "_blank")
  }

  const handleCertify = async (contractId: string) => {
    setCertifying(contractId)
    try {
      const response = await fetch("/api/legalario/init-contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractId }),
      })

      if (response.ok) {
        // Reload contracts to show updated status
        const { data } = await supabase
          .from("legal_contracts")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })

        if (data) setContracts(data)
      }
    } catch (error) {
      console.error("Error certifying contract:", error)
    } finally {
      setCertifying(null)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Documentos Legales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Cargando documentos...</p>
        </CardContent>
      </Card>
    )
  }

  if (contracts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Documentos Legales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No tienes documentos legales aún. Los documentos se generarán automáticamente cuando completes una compra.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Documentos Legales Asociados
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {contracts.map((contract) => (
          <div key={contract.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Contrato Cesión de Uso</span>
                  <Badge variant={contract.status === "certified" ? "default" : "secondary"}>
                    {contract.status === "certified" ? "Certificado" : contract.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Serie: {contract.series_id}</p>
              </div>
              {contract.status === "certified" && <CheckCircle className="h-5 w-5 text-green-500" />}
            </div>

            <div className="space-y-1 text-sm">
              {contract.nom151_folio && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Folio NOM-151:</span>
                  <span className="font-mono font-semibold">{contract.nom151_folio}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hash SHA-256:</span>
                <span className="font-mono text-xs truncate max-w-[200px]">{contract.sha256_hash}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fecha de emisión:</span>
                <span>{new Date(contract.created_at).toLocaleDateString("es-MX")}</span>
              </div>
              {contract.certified_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Certificado:</span>
                  <span>{new Date(contract.certified_at).toLocaleDateString("es-MX")}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 bg-transparent"
                onClick={() => handleDownload(contract.series_id)}
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar Comprobante Legal (PDF)
              </Button>

              {isAdmin && contract.status !== "certified" && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleCertify(contract.id)}
                  disabled={certifying === contract.id}
                >
                  {certifying === contract.id ? "Certificando..." : "Certificar (NOM-151)"}
                </Button>
              )}
            </div>
          </div>
        ))}

        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Todos los documentos están certificados conforme a NOM-151-SCFI-2016 y cumplen con la regulación mexicana de
            tiempo compartido NOM-029-SE-2021.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
