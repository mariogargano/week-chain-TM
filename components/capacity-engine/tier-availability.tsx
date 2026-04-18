"use client"

import { cn } from "@/lib/utils"
import type { CertificateTier, CapacityEngineStatus } from "@/lib/capacity-engine/types"
import { CERTIFICATE_PRICES, CERTIFICATE_WEEKS, REQUEST_WINDOW_DAYS } from "@/lib/capacity-engine/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface TierAvailabilityProps {
  status: CapacityEngineStatus | null
  onSelectTier?: (tier: CertificateTier) => void
  onJoinWaitlist?: () => void
}

const tierConfig: Record<CertificateTier, { name: string; color: string; icon: string }> = {
  Silver: { name: "WEEK Silver™", color: "from-slate-300 to-slate-400", icon: "🥈" },
  Gold: { name: "WEEK Gold™", color: "from-amber-300 to-amber-500", icon: "🥇" },
  Platinum: { name: "WEEK Platinum™", color: "from-slate-400 to-slate-600", icon: "💎" },
  Signature: { name: "WEEK Signature™", color: "from-purple-400 to-purple-600", icon: "👑" },
}

export function TierAvailabilityGrid({ status, onSelectTier, onJoinWaitlist }: TierAvailabilityProps) {
  const tiers: CertificateTier[] = ["Silver", "Gold", "Platinum", "Signature"]

  const isTierEnabled = (tier: CertificateTier): boolean => {
    if (!status) return true
    switch (tier) {
      case "Silver":
        return status.silverSalesEnabled
      case "Gold":
        return status.goldSalesEnabled
      case "Platinum":
        return status.platinumSalesEnabled
      case "Signature":
        return status.signatureSalesEnabled
      default:
        return false
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {tiers.map((tier) => {
        const config = tierConfig[tier]
        const enabled = isTierEnabled(tier)
        const price = CERTIFICATE_PRICES[tier]
        const weeks = CERTIFICATE_WEEKS[tier]
        const window = REQUEST_WINDOW_DAYS[tier]

        return (
          <div
            key={tier}
            className={cn(
              "relative rounded-xl border p-5 transition-all",
              enabled ? "bg-white hover:shadow-lg cursor-pointer" : "bg-gray-50 opacity-75",
            )}
          >
            {/* Availability badge */}
            <div className="absolute top-3 right-3">
              {enabled ? (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Disponible
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  Lista de Espera
                </Badge>
              )}
            </div>

            {/* Tier header */}
            <div
              className={cn(
                "w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center mb-3",
                config.color,
              )}
            >
              <span className="text-xl">{config.icon}</span>
            </div>

            <h3 className="font-bold text-lg mb-1">{config.name}</h3>

            <div className="text-2xl font-bold text-primary mb-3">
              ${price.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">USD</span>
            </div>

            <ul className="space-y-2 text-sm text-muted-foreground mb-4">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                {weeks} semana{weeks > 1 ? "s" : ""}-equivalente/año
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Ventana de {window} días
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Vigencia 15 años
              </li>
            </ul>

            {enabled ? (
              <Button className="w-full" onClick={() => onSelectTier?.(tier)}>
                Adquirir Certificado
              </Button>
            ) : (
              <Button variant="outline" className="w-full bg-transparent" onClick={onJoinWaitlist}>
                Unirse a Lista de Espera
              </Button>
            )}
          </div>
        )
      })}
    </div>
  )
}
