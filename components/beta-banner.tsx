"use client"

import { useState, useEffect } from "react"
import { X, Sparkles, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"

export function BetaBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [betaStats, setBetaStats] = useState({ sold: 0, remaining: 68, percentage: 0 })

  useEffect(() => {
    setIsMounted(true)
    const dismissed = localStorage.getItem("week-chain-beta-banner-dismissed")

    const isBetaMode = process.env.NEXT_PUBLIC_BETA_MODE === "true"
    if (isBetaMode && !dismissed) {
      setIsVisible(true)
      fetchBetaStats()
    }
  }, [])

  const fetchBetaStats = async () => {
    try {
      const response = await fetch("/api/certificates/beta-stats")
      const data = await response.json()
      if (data.sold !== undefined) {
        const sold = data.sold
        const remaining = 68 - sold
        const percentage = (sold / 68) * 100
        setBetaStats({ sold, remaining, percentage })
      }
    } catch (error) {
      console.error("[v0] Error fetching beta stats:", error)
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem("week-chain-beta-banner-dismissed", "true")
  }

  if (!isMounted || !isVisible) return null

  const getBannerColor = () => {
    if (betaStats.remaining <= 10) return "from-red-600 via-rose-600 to-pink-600"
    if (betaStats.remaining <= 25) return "from-orange-600 via-amber-600 to-yellow-600"
    return "from-blue-600 via-indigo-600 to-purple-600"
  }

  return (
    <div className={`relative z-40 bg-gradient-to-r ${getBannerColor()} text-white shadow-lg`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0">
              <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm sm:text-base font-semibold mb-0.5 flex items-center gap-2">
                Versión Beta Controlada - Solo {betaStats.remaining} Certificados Disponibles
                {betaStats.remaining <= 10 && <TrendingUp className="h-4 w-4 animate-bounce" />}
              </p>
              <p className="text-xs sm:text-sm text-blue-100">
                {betaStats.sold} de 68 certificados activados ({betaStats.percentage.toFixed(1)}% vendido). Algunos
                destinos en proceso de incorporación.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href="/faq"
              className="hidden sm:inline-flex text-xs font-medium text-white hover:text-yellow-300 transition-colors underline"
            >
              Más Info
            </a>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 hover:text-white p-1.5 h-auto"
              onClick={handleDismiss}
              aria-label="Cerrar banner"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
