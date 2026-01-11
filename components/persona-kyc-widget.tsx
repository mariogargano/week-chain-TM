"use client"

import { useEffect, useState } from "react"
import { createPersonaInquiry } from "@/lib/kyc/persona-client"
import { Loader2 } from "lucide-react"
import { analytics } from "@/lib/analytics/events"
import { logger } from "@/lib/config/logger"

interface PersonaKYCWidgetProps {
  userId: string
  userEmail?: string
  onComplete?: () => void
  onError?: (error: any) => void
}

export function PersonaKYCWidget({ userId, userEmail, onComplete, onError }: PersonaKYCWidgetProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inquiryId, setInquiryId] = useState<string | null>(null)

  useEffect(() => {
    async function initInquiry() {
      try {
        analytics.events.startKYC()

        const data = await createPersonaInquiry(userId, userEmail)
        setInquiryId(data.inquiryId)

        const script = document.createElement("script")
        script.src = "https://cdn.withpersona.com/dist/persona-v5.0.0.js"
        script.async = true
        script.onload = () => {
          setLoading(false)
          initPersonaClient(data.inquiryId, data.sessionToken)
        }
        script.onerror = () => {
          setError("Failed to load verification widget")
          setLoading(false)
        }
        document.body.appendChild(script)

        return () => {
          document.body.removeChild(script)
        }
      } catch (err) {
        logger.error("Failed to create Persona inquiry:", err)
        setError("Failed to initialize KYC verification")
        onError?.(err)
        setLoading(false)
      }
    }

    initInquiry()
  }, [userId, userEmail, onError])

  const initPersonaClient = (inquiryId: string, sessionToken: string) => {
    // @ts-ignore - Persona is loaded dynamically
    const client = new window.Persona.Client({
      inquiryId,
      sessionToken,
      environment: process.env.NEXT_PUBLIC_PERSONA_ENVIRONMENT || "sandbox",
      onReady: () => {
        logger.debug("Persona widget ready")
        client.open()
      },
      onComplete: ({ inquiryId, status }: { inquiryId: string; status: string }) => {
        logger.info("Persona KYC completed", { inquiryId, status })
        analytics.events.completeKYC()
        onComplete?.()
      },
      onCancel: ({ inquiryId }: { inquiryId: string }) => {
        logger.info("Persona KYC cancelled", { inquiryId })
      },
      onError: (error: any) => {
        logger.error("Persona widget error:", error)
        setError("An error occurred during verification")
        onError?.(error)
      },
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  return <div id="persona-container" className="w-full min-h-[600px]" />
}
