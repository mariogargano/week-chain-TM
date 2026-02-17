"use client"

import type React from "react"

import { useEffect } from "react"
import { getDeviceFingerprint } from "@/lib/compliance/get-device-fingerprint"
import { detectBotBehavior } from "@/lib/compliance/detect-bot-behavior"

export function FraudCheckWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    async function checkForFraud() {
      try {
        // Obtener fingerprint del dispositivo
        const fingerprint = await getDeviceFingerprint()

        // Detectar comportamiento de bot
        const botDetection = detectBotBehavior()

        // Obtener IP del usuario (desde headers en server-side)
        const response = await fetch("/api/compliance/check-fraud", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            deviceFingerprint: fingerprint,
            ipAddress: "", // Se obtiene del servidor
            userAgent: navigator.userAgent,
            botDetection,
          }),
        })

        const result = await response.json()

        if (result.requiresReview) {
          console.log("[v0] Fraud check: Requiere revisión manual")
        }
      } catch (error) {
        console.error("[v0] Error en fraud check:", error)
      }
    }

    checkForFraud()
  }, [])

  return <>{children}</>
}
