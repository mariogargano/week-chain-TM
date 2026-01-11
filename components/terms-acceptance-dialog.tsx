"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Shield, FileText, Lock } from "lucide-react"
import Link from "next/link"

interface TermsAcceptanceDialogProps {
  open: boolean
  onAccept: () => Promise<void>
  onCancel?: () => void
  onOpenChange?: (open: boolean) => void
  title?: string
  description?: string
}

export function TermsAcceptanceDialog({
  open,
  onAccept,
  onCancel,
  onOpenChange,
  title = "Aceptación de Términos y Condiciones",
  description = "Para proteger tanto a usted como a WEEK-CHAIN, debe aceptar nuestros términos legales antes de continuar.",
}: TermsAcceptanceDialogProps) {
  const [accepted, setAccepted] = useState(false)
  const [isAccepting, setIsAccepting] = useState(false)

  const handleAccept = async () => {
    if (!accepted) return

    setIsAccepting(true)
    try {
      await onAccept()
    } finally {
      setIsAccepting(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && onCancel) {
      onCancel()
    }
    if (onOpenChange) {
      onOpenChange(newOpen)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-amber-100">
              <Shield className="h-6 w-6 text-amber-600" />
            </div>
            <DialogTitle className="text-2xl">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-base">{description}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] rounded-lg border border-slate-200 p-6 bg-slate-50">
          <div className="space-y-6 text-sm text-slate-700">
            <section>
              <h3 className="font-semibold text-lg text-slate-900 mb-3 flex items-center gap-2">
                <FileText className="h-5 w-5 text-amber-600" />
                Términos y Condiciones
              </h3>
              <p className="mb-3">Al aceptar estos términos, usted reconoce y acepta que:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Los certificados digitales de WEEK-CHAIN representan derechos de uso vacacional por 15 años</li>
                <li>No constituyen propiedad inmobiliaria ni instrumento financiero</li>
                <li>Está sujeto a las regulaciones mexicanas NOM-029-SE-2021 y NOM-151-SCFI-2016</li>
                <li>Tiene un periodo de reflexión de 5 días hábiles para cancelar su compra</li>
                <li>Los pagos son procesados de forma segura según PCI-DSS</li>
                <li>El certificado digital está respaldado por un contrato notariado verificable</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-lg text-slate-900 mb-3 flex items-center gap-2">
                <Lock className="h-5 w-5 text-amber-600" />
                Aviso de Privacidad
              </h3>
              <p className="mb-3">
                Sus datos personales serán tratados conforme a la Ley Federal de Protección de Datos Personales en
                Posesión de los Particulares (LFPDPPP).
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Recopilamos datos necesarios para procesar su compra y cumplir obligaciones legales</li>
                <li>Sus datos están protegidos con cifrado y medidas de seguridad</li>
                <li>Puede ejercer sus derechos ARCO en cualquier momento</li>
                <li>No compartimos sus datos con terceros sin su consentimiento</li>
              </ul>
            </section>

            <section className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-semibold text-amber-900 mb-2">Certificación NOM-151</h4>
              <p className="text-sm text-amber-800">
                Su aceptación será certificada digitalmente con hash SHA-256 conforme a NOM-151-SCFI-2016, garantizando
                la integridad y autenticidad legal de este documento.
              </p>
            </section>

            <section className="bg-slate-100 border border-slate-300 rounded-lg p-4">
              <h4 className="font-semibold text-slate-900 mb-2">Sobre los Certificados Digitales</h4>
              <p className="text-sm text-slate-700">
                Los certificados de WEEK-CHAIN son documentos digitales verificables que acreditan su derecho de uso
                sobre una semana vacacional específica. Cada certificado está vinculado a un contrato notariado y puede
                ser transferido o vendido según los términos establecidos.
              </p>
            </section>
          </div>
        </ScrollArea>

        <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <Checkbox
            id="accept-terms"
            checked={accepted}
            onCheckedChange={(checked) => setAccepted(checked as boolean)}
            className="mt-1"
          />
          <label htmlFor="accept-terms" className="text-sm text-slate-700 cursor-pointer">
            He leído y acepto los{" "}
            <Link href="/terms" target="_blank" className="text-amber-600 hover:underline font-medium">
              Términos y Condiciones
            </Link>{" "}
            y el{" "}
            <Link href="/privacy" target="_blank" className="text-amber-600 hover:underline font-medium">
              Aviso de Privacidad
            </Link>{" "}
            de WEEK-CHAIN S.A.P.I. de C.V.
          </label>
        </div>

        <DialogFooter className="gap-2">
          {onCancel && (
            <Button variant="outline" onClick={onCancel} disabled={isAccepting}>
              Cancelar
            </Button>
          )}
          <Button
            onClick={handleAccept}
            disabled={!accepted || isAccepting}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          >
            {isAccepting ? "Procesando..." : "Aceptar y Continuar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
