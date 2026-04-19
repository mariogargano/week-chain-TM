"use client"

import { useEffect, useState } from "react"
import { Sparkles } from "lucide-react"

/**
 * Thin banner shown at the top of public purchase pages when the visitor
 * arrived with a referral code. Reads the `week_chain_ref` cookie the
 * middleware persists.
 */
export function ReferralBanner() {
  const [code, setCode] = useState<string | null>(null)
  const [agentName, setAgentName] = useState<string | null>(null)

  useEffect(() => {
    if (typeof document === "undefined") return
    const match = document.cookie.match(/(?:^|; )week_chain_ref=([^;]+)/)
    if (!match) return
    const refCode = decodeURIComponent(match[1])
    setCode(refCode)

    // Best-effort: ask the API for the agent display name (non-blocking)
    fetch(`/api/referral/lookup?code=${encodeURIComponent(refCode)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.displayName) setAgentName(data.displayName)
      })
      .catch(() => {})
  }, [])

  if (!code) return null

  return (
    <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-orange-50 px-4 py-3">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-500">
        <Sparkles className="h-4 w-4 text-white" />
      </div>
      <div className="flex-1 text-sm">
        <span className="font-semibold text-amber-900">
          {agentName ? `Te refirio ${agentName}` : "Estas usando un enlace de agente"}
        </span>
        <span className="ml-1 text-amber-800">
          Codigo: <span className="font-mono font-semibold">{code}</span>
        </span>
      </div>
    </div>
  )
}
