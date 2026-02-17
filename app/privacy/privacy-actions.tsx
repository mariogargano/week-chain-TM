"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"

export function PrivacyActions() {
  const [accepted, setAccepted] = useState(false)
  const [marketingConsent, setMarketingConsent] = useState(false)
  const [dataSharingConsent, setDataSharingConsent] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleAcceptPrivacy = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/legal/accept-privacy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          privacy_version: "v1.0",
          marketing_consent: marketingConsent,
          data_sharing_consent: dataSharingConsent,
        }),
      })

      if (!response.ok) throw new Error("Error al aceptar política")

      toast({
        title: "Política de Privacidad",
        description: "Has aceptado la política de privacidad correctamente.",
      })

      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo aceptar la política. Intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 pt-4">
      <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
        <Checkbox
          id="accept-privacy"
          checked={accepted}
          onCheckedChange={(checked) => setAccepted(checked as boolean)}
          className="mt-1"
        />
        <label htmlFor="accept-privacy" className="text-sm font-medium leading-relaxed cursor-pointer">
          He leído y acepto la Política de Privacidad de WEEK-CHAIN. Entiendo cómo se recopilan, usan y protegen mis
          datos personales.
        </label>
      </div>

      <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <Checkbox
          id="marketing"
          checked={marketingConsent}
          onCheckedChange={(checked) => setMarketingConsent(checked as boolean)}
          className="mt-1"
        />
        <label htmlFor="marketing" className="text-sm leading-relaxed cursor-pointer">
          Acepto recibir comunicaciones promocionales, ofertas especiales y novedades sobre propiedades y servicios de
          WEEK-CHAIN. (Opcional)
        </label>
      </div>

      <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
        <Checkbox
          id="data-sharing"
          checked={dataSharingConsent}
          onCheckedChange={(checked) => setDataSharingConsent(checked as boolean)}
          className="mt-1"
        />
        <label htmlFor="data-sharing" className="text-sm leading-relaxed cursor-pointer">
          Acepto que mis datos puedan ser compartidos con socios estratégicos de WEEK-CHAIN para mejorar mi experiencia.
          (Opcional)
        </label>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => router.back()} className="flex-1">
          Volver
        </Button>
        <Button disabled={!accepted || loading} onClick={handleAcceptPrivacy} className="flex-1">
          {loading ? "Procesando..." : "Aceptar y Continuar"}
        </Button>
      </div>
    </div>
  )
}
