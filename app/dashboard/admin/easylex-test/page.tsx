"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { EasylexSignatureWidget } from "@/components/easylex-signature-widget"

export default function EasylexTestPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [documentId, setDocumentId] = useState<string>("")
  const [signerId, setSignerId] = useState<string>("")

  const [formData, setFormData] = useState({
    signerName: "",
    signerEmail: "",
    documentName: "Contrato de Prueba - NOM-151",
    documentContent: "Este es un documento de prueba para verificar la integración con EasyLex.",
  })

  const testEasylexIntegration = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/easylex/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error en la prueba")
      }

      setResult(data)
      setDocumentId(data.documentId)
      setSignerId(data.signerId)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignatureComplete = (data: any) => {
    console.log("[v0] Signature completed:", data)
    setResult((prev: any) => ({
      ...prev,
      signatureCompleted: true,
      signatureData: data,
    }))
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">EasyLex Integration Test</h1>
        <p className="text-muted-foreground">Prueba la integración con EasyLex para firma electrónica NOM-151</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuración de Prueba</CardTitle>
          <CardDescription>Completa los datos para crear un documento de prueba</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signerName">Nombre del Firmante</Label>
            <Input
              id="signerName"
              value={formData.signerName}
              onChange={(e) => setFormData({ ...formData, signerName: e.target.value })}
              placeholder="Juan Pérez"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signerEmail">Email del Firmante</Label>
            <Input
              id="signerEmail"
              type="email"
              value={formData.signerEmail}
              onChange={(e) => setFormData({ ...formData, signerEmail: e.target.value })}
              placeholder="juan@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="documentName">Nombre del Documento</Label>
            <Input
              id="documentName"
              value={formData.documentName}
              onChange={(e) => setFormData({ ...formData, documentName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="documentContent">Contenido del Documento</Label>
            <Textarea
              id="documentContent"
              value={formData.documentContent}
              onChange={(e) => setFormData({ ...formData, documentContent: e.target.value })}
              rows={4}
            />
          </div>

          <Button
            onClick={testEasylexIntegration}
            disabled={loading || !formData.signerName || !formData.signerEmail}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando documento...
              </>
            ) : (
              "Crear Documento de Prueba"
            )}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Documento Creado Exitosamente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <div className="text-sm">
                <span className="font-semibold">Document ID:</span> {result.documentId}
              </div>
              <div className="text-sm">
                <span className="font-semibold">Status:</span> {result.status}
              </div>
              <div className="text-sm">
                <span className="font-semibold">NOM-151 Hash:</span>
                <code className="block mt-1 p-2 bg-muted rounded text-xs break-all">{result.nom151Hash}</code>
              </div>
            </div>

            {documentId && signerId && !result.signatureCompleted && (
              <div className="mt-6">
                <h3 className="font-semibold mb-4">Widget de Firma</h3>
                <EasylexSignatureWidget
                  documentId={documentId}
                  signerId={signerId}
                  onComplete={handleSignatureComplete}
                  height="600px"
                />
              </div>
            )}

            {result.signatureCompleted && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  ¡Firma completada exitosamente! El documento ha sido firmado con cumplimiento NOM-151.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
