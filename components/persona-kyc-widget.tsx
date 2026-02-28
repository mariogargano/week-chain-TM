"use client"

import { useEffect, useState } from "react"
import { createPersonaInquiry } from "@/lib/kyc/persona-client"
import { Loader2 } from "lucide-react"

interface PersonaKYCWidgetProps {
  userId: string
  userEmail?: string
  onComplete?: () => void
  onError?: (error: any) => void
}

export function PersonaKYCWidget({ userId, userEmail, onComplete, onError }: PersonaKYCWidgetProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function initInquiry() {
      try {
        const data = await createPersonaInquiry(userId, userEmail)

        // If no Persona API key, the API returns pending status with manual review mode
        if (data.status === "pending" && !data.inquiryId) {
          setLoading(false)
          onComplete?.()
          return
        }

        const script = document.createElement("script")
        script.src = "https://cdn.withpersona.com/dist/persona-v5.0.0.js"
        script.async = true
        script.onload = () => {
          setLoading(false)
          if (data.inquiryId && data.sessionToken) {
            initPersonaClient(data.inquiryId, data.sessionToken)
          }
        }
        script.onerror = () => {
          setError("No se pudo cargar el widget de verificacion")
          setLoading(false)
        }
        document.body.appendChild(script)

        return () => {
          if (document.body.contains(script)) {
            document.body.removeChild(script)
          }
        }
      } catch (err) {
        console.error("[v0] Failed to create Persona inquiry:", err)
        setError("No se pudo iniciar la verificacion KYC")
        onError?.(err)
        setLoading(false)
      }
    }

    initInquiry()
  }, [userId, userEmail, onComplete, onError])

  const initPersonaClient = (inquiryId: string, sessionToken: string) => {
    // @ts-ignore - Persona is loaded dynamically
    const client = new window.Persona.Client({
      inquiryId,
      sessionToken,
      environment: process.env.NEXT_PUBLIC_PERSONA_ENVIRONMENT || "sandbox",
      onReady: () => {
        console.log("[v0] Persona widget ready")
        client.open()
      },
      onComplete: ({ status }: { inquiryId: string; status: string }) => {
        console.log("[v0] Persona KYC completed:", status)
        onComplete?.()
      },
      onCancel: () => {
        console.log("[v0] Persona KYC cancelled")
      },
      onError: (err: any) => {
        console.error("[v0] Persona widget error:", err)
        setError("Ocurrio un error durante la verificacion")
        onError?.(err)
      },
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-400">{error}</p>
      </div>
    )
  }

  return <div id="persona-container" className="w-full min-h-[600px]" />
}
