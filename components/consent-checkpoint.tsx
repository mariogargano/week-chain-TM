"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertCircle } from "lucide-react"

interface ConsentCheckpointProps {
  userId: string
  consentType: "reservation" | "activation" | "offer_acceptance"
  onConsentGranted: () => void
  onCancel?: () => void
}

const CONSENT_CONTENT = {
  reservation: {
    title: "Aceptación de Términos de Solicitud",
    description: "Antes de continuar con tu solicitud de reservación, debes aceptar los siguientes términos:",
    content: `Al solicitar una reservación en WEEK-CHAIN, reconozco y acepto que:

1. DERECHO DE SOLICITUD: Esta es una solicitud de acceso a servicios vacacionales, NO una garantía de disponibilidad ni confirmación automática.

2. SUJETO A DISPONIBILIDAD: El acceso está sujeto a disponibilidad en las fechas y destinos solicitados. WEEK-CHAIN evaluará cada solicitud según capacidad disponible.

3. PROCESO DE CONFIRMACIÓN: 
   - WEEK-CHAIN revisará mi solicitud
   - Si hay disponibilidad, recibiré una oferta por correo electrónico
   - Debo aceptar explícitamente la oferta para confirmar
   - Sin aceptación expresa, NO hay reservación confirmada

4. NO HAY CONFIRMACIÓN AUTOMÁTICA: Esta solicitud NO genera confirmación automática. Debo esperar la oferta y aceptarla explícitamente.

5. CANCELACIONES: Las políticas de cancelación se aplican según lo establecido en los Términos y Condiciones. Consulta la sección de cancelaciones antes de confirmar.

6. PRIVACIDAD: Mis datos personales serán tratados conforme al Aviso de Privacidad disponible en week-chain.com/legal/privacy

Entiendo que este NO es un contrato de propiedad, inversión, ni tiempo compartido. Es un servicio de acceso temporal a hospedaje sujeto a disponibilidad y confirmación.`,
  },
  activation: {
    title: "Aceptación de Términos de Activación",
    description: "Antes de activar tu certificado, debes aceptar los siguientes términos:",
    content: `Al activar mi certificado de servicios vacacionales WEEK-CHAIN, reconozco y acepto que:

1. NATURALEZA DEL SERVICIO: Este certificado otorga un derecho de solicitud de acceso a servicios vacacionales, NO propiedad ni garantía de disponibilidad.

2. VIGENCIA: El certificado tiene una vigencia específica indicada en mi dashboard. El uso de semanas debe solicitarse durante el periodo de vigencia.

3. CONDICIONES DE USO:
   - Debo solicitar reservaciones con anticipación mínima de 60 días
   - El acceso está sujeto a disponibilidad en fechas y destinos
   - Las solicitudes se evaluarán según capacidad disponible
   - Puedo recibir ofertas alternativas si mi primera opción no está disponible

4. RESTRICCIONES:
   - No puedo transferir ni revender este certificado
   - El uso es personal e intransferible
   - Aplican restricciones por temporada alta/baja según calendario publicado

5. RESPONSABILIDADES:
   - Debo mantener mis datos de contacto actualizados
   - Debo responder a ofertas dentro de los plazos indicados
   - Debo cumplir con las políticas de cada propiedad durante mi estancia

6. CANCELACIONES Y MODIFICACIONES: Sujeto a las políticas publicadas en week-chain.com/legal/cancellations

Entiendo que este NO es inversión, propiedad, ni tiempo compartido. Es un servicio de acceso temporal sujeto a disponibilidad.`,
  },
  offer_acceptance: {
    title: "Aceptación de Oferta de Reservación",
    description: "Estás a punto de confirmar una reservación. Lee cuidadosamente:",
    content: `Al aceptar esta oferta de reservación, confirmo que:

1. CONFIRMACIÓN VINCULANTE: Esta aceptación constituye una confirmación definitiva de reservación para las fechas, destino y condiciones especificadas en la oferta.

2. CONDICIONES DE LA OFERTA:
   - Acepto las fechas exactas indicadas en la oferta
   - Acepto el destino y propiedad especificados
   - Acepto el número de huéspedes confirmado
   - Entiendo que esta confirmación descuenta semanas de mi certificado según lo indicado

3. POLÍTICAS DE CANCELACIÓN:
   - Si cancelo después de confirmar, aplican penalizaciones según la política publicada
   - Consulta week-chain.com/legal/cancellations para detalles completos
   - Las cancelaciones deben solicitarse por escrito con anticipación

4. OBLIGACIONES:
   - Debo llegar en las fechas confirmadas
   - Debo cumplir con las reglas de la propiedad
   - Soy responsable de daños o incumplimientos durante mi estancia
   - Debo presentar identificación válida al check-in

5. MODIFICACIONES POST-CONFIRMACIÓN:
   - Las modificaciones están sujetas a disponibilidad
   - Pueden aplicar cargos por modificación
   - No hay garantía de poder modificar fechas confirmadas

6. RESPONSABILIDAD: Entiendo que WEEK-CHAIN actúa como intermediario y NO es responsable de:
   - Condiciones de las propiedades (mantenimiento, servicios)
   - Fuerza mayor (clima, desastres naturales)
   - Circunstancias fuera del control de WEEK-CHAIN

Esta confirmación es DEFINITIVA. Asegúrate de estar completamente seguro antes de aceptar.`,
  },
}

export function ConsentCheckpoint({ userId, consentType, onConsentGranted, onCancel }: ConsentCheckpointProps) {
  const [open, setOpen] = useState(true)
  const [hasRead, setHasRead] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [scrolledToBottom, setScrolledToBottom] = useState(false)

  const content = CONSENT_CONTENT[consentType]

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement
    const isBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50
    if (isBottom && !scrolledToBottom) {
      setScrolledToBottom(true)
      setHasRead(true)
    }
  }

  const handleAccept = async () => {
    if (!accepted || !hasRead) return

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/consent/record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          consentType,
          consentVersion: "v1.0",
          consentTextHash: await hashText(content.content),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to record consent")
      }

      setOpen(false)
      onConsentGranted()
    } catch (error) {
      console.error("[v0] Failed to record consent:", error)
      alert("Error al registrar tu aceptación. Por favor intenta de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setOpen(false)
    onCancel?.()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{content.title}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">{content.description}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] w-full rounded-md border p-4" onScrollCapture={handleScroll}>
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{content.content}</div>
        </ScrollArea>

        {!scrolledToBottom && (
          <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>Debes leer todo el contenido antes de continuar (desplázate hasta el final)</span>
          </div>
        )}

        <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-md">
          <Checkbox
            id="consent-checkbox"
            checked={accepted}
            onCheckedChange={(checked) => setAccepted(checked === true)}
            disabled={!hasRead}
          />
          <label htmlFor="consent-checkbox" className="text-sm leading-relaxed cursor-pointer select-none">
            He leído y acepto explícitamente los términos indicados arriba. Entiendo que esta aceptación será registrada
            con fecha, hora e IP para efectos legales.
          </label>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleAccept} disabled={!accepted || !hasRead || isSubmitting} className="min-w-32">
            {isSubmitting ? "Registrando..." : "Aceptar y Continuar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Helper function to generate SHA-256 hash of text
async function hashText(text: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}
