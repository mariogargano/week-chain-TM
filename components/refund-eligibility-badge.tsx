"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, XCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface RefundEligibilityBadgeProps {
  id: string
  type?: "voucher" | "booking"
  className?: string
}

interface EligibilityData {
  eligible: boolean
  hours_remaining: number
  deadline: string
  reason: string
  message: string
}

export function RefundEligibilityBadge({ id, type = "voucher", className }: RefundEligibilityBadgeProps) {
  const [eligibility, setEligibility] = useState<EligibilityData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkEligibility() {
      try {
        const response = await fetch(`/api/legal/check-refund-eligibility?id=${id}&type=${type}`)
        if (response.ok) {
          const data = await response.json()
          setEligibility(data)
        }
      } catch (error) {
        console.error("Error checking refund eligibility:", error)
      } finally {
        setLoading(false)
      }
    }

    checkEligibility()
  }, [id, type])

  if (loading) {
    return (
      <Badge variant="outline" className={className}>
        <Clock className="mr-1 h-3 w-3" />
        Verificando...
      </Badge>
    )
  }

  if (!eligibility) {
    return null
  }

  if (eligibility.eligible) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="default" className={`bg-green-500 hover:bg-green-600 ${className}`}>
              <CheckCircle className="mr-1 h-3 w-3" />
              Reembolso automático disponible
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm">{eligibility.message}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Fecha límite: {new Date(eligibility.deadline).toLocaleString("es-MX")}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="secondary" className={className}>
            <XCircle className="mr-1 h-3 w-3" />
            Revisión manual requerida
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">{eligibility.reason}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
