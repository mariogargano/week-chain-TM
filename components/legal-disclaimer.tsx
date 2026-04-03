"use client"

import { useState } from "react"
import { AlertTriangle, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function LegalDisclaimer() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md">
      <div className="rounded-2xl bg-white border-2 border-amber-200 shadow-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>

          <div className="flex-1">
            <h3 className="font-bold text-slate-900 mb-2">Aviso Legal Importante</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4 text-justify">
              El Smart Vacational Certificate (SVC) otorga derechos personales y temporales de uso vacacional por hasta 15 años, sujetos a disponibilidad y confirmación. No constituye propiedad, copropiedad, tiempo compartido tradicional, fracción inmobiliaria, inversión ni instrumento financiero. El certificado es nominal y no es libremente transferible; cualquier cesión estará sujeta a aprobación de la plataforma y validación de identidad (KYC) del receptor. Solicitudes procesadas bajo el modelo REQUEST → OFFER → CONFIRM.
            </p>
            <Button onClick={() => setIsVisible(false)} size="sm" variant="outline" className="w-full">
              Entendido
            </Button>
          </div>

          <button onClick={() => setIsVisible(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
