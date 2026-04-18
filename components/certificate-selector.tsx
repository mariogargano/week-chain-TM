"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Users, Calendar, Shield, ArrowRight, CheckCircle, Info, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

// PAX-based pricing catalog
const PAX_CATALOG: Record<string, number> = {
  "2_1": 3500,
  "2_2": 6000,
  "2_3": 8000,
  "2_4": 10000,
  "4_1": 5000,
  "4_2": 9000,
  "4_3": 12000,
  "4_4": 15000,
  "6_1": 7500,
  "6_2": 13000,
  "6_3": 18000,
  "6_4": 20000,
  "8_1": 10000,
  "8_2": 15000,
  "8_3": 20000,
  "8_4": 25000,
}

const PAX_OPTIONS = [
  { value: "2", label: "2 personas", description: "Parejas o 2 viajeros" },
  { value: "4", label: "4 personas", description: "Familia pequeña" },
  { value: "6", label: "6 personas", description: "Familia mediana" },
  { value: "8", label: "8 personas", description: "Grupo grande" },
]

const ESTANCIA_OPTIONS = [
  { value: "1", label: "1 estancia", description: "7 noches por año" },
  { value: "2", label: "2 estancias", description: "14 noches por año" },
  { value: "3", label: "3 estancias", description: "21 noches por año" },
  { value: "4", label: "4 estancias", description: "28 noches por año" },
]

interface CertificateSelectorProps {
  onSelect?: (product: { maxPax: number; estancias: number; priceUsd: number }) => void
  showPurchaseButton?: boolean
}

export function CertificateSelector({ onSelect, showPurchaseButton = true }: CertificateSelectorProps) {
  const router = useRouter()
  const [selectedPax, setSelectedPax] = useState<string>("4")
  const [selectedEstancias, setSelectedEstancias] = useState<string>("1")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const maxPax = Number.parseInt(selectedPax)
  const estancias = Number.parseInt(selectedEstancias)
  const priceKey = `${maxPax}_${estancias}`
  const priceUsd = PAX_CATALOG[priceKey] || 0

  useEffect(() => {
    onSelect?.({ maxPax, estancias, priceUsd })
  }, [maxPax, estancias, priceUsd, onSelect])

  const handlePurchase = async () => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push("/auth?redirect=/certificates")
        return
      }

      const response = await fetch("/api/certificates/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maxPax,
          estancias,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.error === "CAPACITY_BLOCKED") {
          setError(data.message || "Este certificado no está disponible actualmente.")
          return
        }
        throw new Error(data.error || "Error al procesar la compra")
      }

      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err: any) {
      setError(err.message || "Error al procesar la compra")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Smart Selector */}
      <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-amber-600" />
            Configura tu Certificado Digital Personalizado
          </CardTitle>
          <CardDescription>
            El sistema asigna automáticamente alojamientos compatibles según tu selección
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* PAX Selection */}
          <div>
            <Label className="text-base font-semibold flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-slate-600" />
              ¿Cuántas personas viajan habitualmente?
            </Label>
            <p className="text-sm text-slate-600 mb-4">
              El sistema asigna automáticamente certificados compatibles con alojamientos adecuados para este número de
              personas
            </p>
            <RadioGroup
              value={selectedPax}
              onValueChange={setSelectedPax}
              className="grid grid-cols-2 md:grid-cols-4 gap-3"
            >
              {PAX_OPTIONS.map((option) => (
                <div key={option.value}>
                  <RadioGroupItem value={option.value} id={`pax-${option.value}`} className="peer sr-only" />
                  <Label
                    htmlFor={`pax-${option.value}`}
                    className="flex flex-col items-center justify-center rounded-xl border-2 border-slate-200 bg-white p-4 hover:bg-slate-50 peer-data-[state=checked]:border-amber-500 peer-data-[state=checked]:bg-amber-50 cursor-pointer transition-all"
                  >
                    <span className="text-lg font-bold text-slate-900">{option.label}</span>
                    <span className="text-xs text-slate-500">{option.description}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Estancias Selection */}
          <div>
            <Label className="text-base font-semibold flex items-center gap-2 mb-4">
              <Calendar className="h-4 w-4 text-slate-600" />
              ¿Cuántas estancias deseas solicitar por año?
            </Label>
            <RadioGroup
              value={selectedEstancias}
              onValueChange={setSelectedEstancias}
              className="grid grid-cols-2 md:grid-cols-4 gap-3"
            >
              {ESTANCIA_OPTIONS.map((option) => (
                <div key={option.value}>
                  <RadioGroupItem value={option.value} id={`estancia-${option.value}`} className="peer sr-only" />
                  <Label
                    htmlFor={`estancia-${option.value}`}
                    className="flex flex-col items-center justify-center rounded-xl border-2 border-slate-200 bg-white p-4 hover:bg-slate-50 peer-data-[state=checked]:border-amber-500 peer-data-[state=checked]:bg-amber-50 cursor-pointer transition-all"
                  >
                    <span className="text-lg font-bold text-slate-900">{option.label}</span>
                    <span className="text-xs text-slate-500">{option.description}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* Selected Product Summary */}
      <Card className="border-2 border-slate-900 bg-slate-900 text-white">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <Badge className="bg-amber-500 text-white">Tu Certificado</Badge>
              <h3 className="text-2xl font-bold">
                Hasta {maxPax} personas • {estancias} estancia{estancias > 1 ? "s" : ""}/año
              </h3>
              <p className="text-slate-400 text-sm">
                Certificado Digital con vigencia de 15 años • Sujeto a disponibilidad del sistema WEEK-CHAIN
              </p>
              <div className="flex items-center gap-4 text-sm text-slate-400 mt-2">
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  NOM-151
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  15 años
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  REQUEST → OFFER → CONFIRM
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-amber-400">
                ${priceUsd.toLocaleString()}
                <span className="text-lg text-slate-400 font-normal"> USD</span>
              </div>
              <p className="text-slate-400 text-sm">Pago único</p>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-900/50 border border-red-500 rounded-lg">
              <p className="text-red-200 text-sm flex items-center gap-2">
                <Info className="h-4 w-4" />
                {error}
              </p>
            </div>
          )}

          {showPurchaseButton && (
            <div className="mt-6">
              <div className="mb-4 p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Este certificado otorga un derecho personal y digital de uso vacacional anual. No garantiza fechas
                  específicas y está sujeto a disponibilidad del sistema WEEK-CHAIN. No constituye propiedad,
                  copropiedad, fracción inmobiliaria, inversión ni tiempo compartido tradicional.
                </p>
              </div>

              <Button
                onClick={handlePurchase}
                disabled={loading}
                className="w-full md:w-auto bg-amber-500 hover:bg-amber-600 text-white font-semibold py-6 px-8 text-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    Activar Certificado Digital
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* How It Works */}
      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
        <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Info className="h-5 w-5 text-amber-600" />
          ¿Cómo funciona el proceso?
        </h4>
        <div className="grid md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold flex-shrink-0">
              1
            </div>
            <div>
              <p className="font-semibold text-slate-900">Activas tu Certificado</p>
              <p className="text-slate-600">Selecciona personas y estancias</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold flex-shrink-0">
              2
            </div>
            <div>
              <p className="font-semibold text-slate-900">Solicitas estancias</p>
              <p className="text-slate-600">Indica fechas y preferencias</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold flex-shrink-0">
              3
            </div>
            <div>
              <p className="font-semibold text-slate-900">Recibes ofertas</p>
              <p className="text-slate-600">Equipo te envía opciones disponibles</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold flex-shrink-0">
              4
            </div>
            <div>
              <p className="font-semibold text-slate-900">Confirmas y viajas</p>
              <p className="text-slate-600">Sujeto a disponibilidad</p>
            </div>
          </div>
        </div>
      </div>

      {/* Legal Disclaimer */}
      <p className="text-xs text-slate-500 text-center leading-relaxed">
        El certificado otorga derecho de solicitud de estancias vacacionales. No garantiza fechas, destinos ni
        propiedades específicas. Todas las reservaciones están sujetas a disponibilidad del sistema. Cumple con NOM-151.
      </p>
    </div>
  )
}
