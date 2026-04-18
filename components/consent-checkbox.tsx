"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Shield } from "lucide-react"
import Link from "next/link"

interface ConsentCheckboxProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  type: "certificate" | "reservation" | "offer"
  disabled?: boolean
}

const CONSENT_TEXT = {
  certificate: {
    title: "Activación de Certificado",
    text: "He leído y acepto los Términos y Condiciones, Aviso de Privacidad, y entiendo que:",
    points: [
      "Este es un certificado digital de uso vacacional",
      "NO representa propiedad inmobiliaria ni inversión",
      "La disponibilidad está sujeta a solicitud y confirmación",
    ],
  },
  reservation: {
    title: "Solicitud de Reservación",
    text: "He leído y acepto los Términos y Condiciones, Aviso de Privacidad, y entiendo que:",
    points: [
      "Esta es una SOLICITUD sujeta a disponibilidad",
      "La confirmación depende de la oferta del propietario",
      "Puedo cancelar dentro del periodo de retracto de 5 días",
    ],
  },
  offer: {
    title: "Aceptación de Oferta",
    text: "He leído y acepto los Términos y Condiciones, Aviso de Privacidad, y entiendo que:",
    points: [
      "Esta aceptación es VINCULANTE y genera obligación de pago",
      "Tengo 5 días hábiles para ejercer mi derecho de retracto",
      "Los pagos son procesados de forma segura según PCI-DSS",
    ],
  },
}

export function ConsentCheckbox({ checked, onCheckedChange, type, disabled }: ConsentCheckboxProps) {
  const content = CONSENT_TEXT[type]

  return (
    <div className="space-y-4">
      <Alert className="border-amber-200 bg-amber-50">
        <Shield className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-sm text-amber-900">
          <strong className="font-semibold">{content.title}</strong>
          <p className="mt-2">{content.text}</p>
          <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
            {content.points.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        </AlertDescription>
      </Alert>

      <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
        {/* CRITICAL: Checkbox must be UNCHECKED by default */}
        <Checkbox
          id={`consent-${type}`}
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          className="mt-1"
        />
        <label htmlFor={`consent-${type}`} className="text-sm text-slate-700 cursor-pointer flex-1">
          He leído y acepto los{" "}
          <Link href="/legal/terms" target="_blank" className="text-blue-600 hover:underline font-medium">
            Términos y Condiciones
          </Link>
          , el{" "}
          <Link href="/legal/privacy" target="_blank" className="text-blue-600 hover:underline font-medium">
            Aviso de Privacidad
          </Link>
          , y entiendo que:
          <ul className="list-disc list-inside mt-2 space-y-1 ml-2 text-slate-600">
            {content.points.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        </label>
      </div>

      {!checked && (
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Debe aceptar explícitamente los términos y condiciones para continuar. Esta acción está protegida por
            click-wrap conforme a NOM-151-SCFI-2016.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
