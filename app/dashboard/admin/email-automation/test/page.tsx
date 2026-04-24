"use client"

import { useState } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Send, CheckCircle, XCircle, Loader2 } from "lucide-react"

const EMAIL_TYPES = [
  { value: "WELCOME", label: "Welcome Email" },
  { value: "CERTIFICATE_PURCHASED", label: "Certificate Purchased" },
  { value: "RESERVATION_REQUEST_SUBMITTED", label: "Reservation Request Submitted" },
  { value: "RESERVATION_OFFER_AVAILABLE", label: "Reservation Offer Available" },
  { value: "RESERVATION_CONFIRMED", label: "Reservation Confirmed" },
]

export default function EmailTestPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [formData, setFormData] = useState({
    recipientEmail: "",
    templateType: "WELCOME",
  })

  const handleTest = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/email/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient_email: formData.recipientEmail,
          template_type: formData.templateType,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setResult({
          success: true,
          message: `Email enviado exitosamente a ${formData.recipientEmail}. Message ID: ${data.message_id}`,
        })
      } else {
        setResult({
          success: false,
          message: data.error || "Error al enviar el email",
        })
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || "Error de red al enviar el test",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />

      <main className="flex-1 p-8 bg-slate-50">
        <div className="max-w-3xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Test Email System</h1>
            <p className="text-slate-600 mt-1">Envía emails de prueba para verificar templates y funcionalidad</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Configuración del Test</CardTitle>
              <CardDescription>Selecciona el tipo de email y destinatario para la prueba</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="recipient">Email del Destinatario</Label>
                <Input
                  id="recipient"
                  type="email"
                  placeholder="tu-email@example.com"
                  value={formData.recipientEmail}
                  onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
                />
                <p className="text-sm text-slate-500">El email de prueba se enviará a esta dirección</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="template">Tipo de Template</Label>
                <Select
                  value={formData.templateType}
                  onValueChange={(value) => setFormData({ ...formData, templateType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EMAIL_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-slate-500">Selecciona qué tipo de email quieres probar</p>
              </div>

              <Button onClick={handleTest} disabled={loading || !formData.recipientEmail} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Email de Prueba
                  </>
                )}
              </Button>

              {result && (
                <Alert variant={result.success ? "default" : "destructive"}>
                  {result.success ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  <AlertDescription>{result.message}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Variables de Prueba</CardTitle>
              <CardDescription>Los emails de prueba utilizan datos ficticios para las variables</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Usuario:</strong> Juan Pérez (juan.perez@example.com)
                </p>
                <p>
                  <strong>Certificado:</strong> WC-2025-001234 (Gold, 4 PAX)
                </p>
                <p>
                  <strong>Reserva:</strong> BK-2025-5678 (Cancún, 15-22 Marzo 2025)
                </p>
                <p>
                  <strong>Propiedad:</strong> Villa Paradise Cancún (6 PAX, 3 rec, 2 baños)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
