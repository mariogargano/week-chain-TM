"use client"

import { useEffect, useState } from "react"
import SumsubWebSdk from "@sumsub/websdk-react"
import { generateSumsubAccessToken, getSumsubConfig } from "@/lib/kyc/sumsub-client"
import { Loader2 } from "lucide-react"
import { analytics } from "@/lib/analytics/events"

interface SumsubKYCWidgetProps {
  userId: string
  onComplete?: () => void
  onError?: (error: any) => void
}

export function SumsubKYCWidget({ userId, onComplete, onError }: SumsubKYCWidgetProps) {
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function initToken() {
      try {
        analytics.events.startKYC()

        const token = await generateSumsubAccessToken(userId, "basic-kyc-level")
        setAccessToken(token)
      } catch (err) {
        console.error("[v0] Failed to generate access token:", err)
        setError("Failed to initialize KYC verification")
        onError?.(err)
      } finally {
        setLoading(false)
      }
    }

    initToken()
  }, [userId, onError])

  const handleMessage = (type: string, payload: any) => {
    console.log("[v0] Sumsub message:", type, payload)

    if (type === "idCheck.onApplicantSubmitted") {
      analytics.events.completeKYC()
      onComplete?.()
    }
  }

  const handleError = (error: any) => {
    console.error("[v0] Sumsub error:", error)
    setError("An error occurred during verification")
    onError?.(error)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !accessToken) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">{error || "Failed to load verification widget"}</p>
      </div>
    )
  }

  const config = getSumsubConfig(accessToken, userId)

  return (
    <div className="w-full">
      <SumsubWebSdk
        accessToken={accessToken}
        expirationHandler={() => generateSumsubAccessToken(userId, "basic-kyc-level")}
        config={config}
        options={{ addViewportTag: false, adaptIframeHeight: true }}
        onMessage={handleMessage}
        onError={handleError}
      />
    </div>
  )
}
