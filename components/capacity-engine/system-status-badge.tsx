"use client"

import { cn } from "@/lib/utils"
import type { SystemStatus } from "@/lib/capacity-engine/types"

interface SystemStatusBadgeProps {
  status: SystemStatus
  showLabel?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

const statusConfig: Record<SystemStatus, { label: string; color: string; bgColor: string; description: string }> = {
  GREEN: {
    label: "Disponible",
    color: "text-green-700",
    bgColor: "bg-green-100",
    description: "Todos los certificados disponibles",
  },
  YELLOW: {
    label: "Alta Demanda",
    color: "text-yellow-700",
    bgColor: "bg-yellow-100",
    description: "Capacidad en aumento",
  },
  ORANGE: {
    label: "Limitado",
    color: "text-orange-700",
    bgColor: "bg-orange-100",
    description: "Disponibilidad limitada",
  },
  RED: {
    label: "Lista de Espera",
    color: "text-red-700",
    bgColor: "bg-red-100",
    description: "Únete a la lista de espera",
  },
}

export function SystemStatusBadge({ status, showLabel = true, size = "md", className }: SystemStatusBadgeProps) {
  const config = statusConfig[status]

  const sizeClasses = {
    sm: "h-2 w-2",
    md: "h-3 w-3",
    lg: "h-4 w-4",
  }

  return (
    <div className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1", config.bgColor, className)}>
      <span
        className={cn(
          "rounded-full animate-pulse",
          sizeClasses[size],
          status === "GREEN" && "bg-green-500",
          status === "YELLOW" && "bg-yellow-500",
          status === "ORANGE" && "bg-orange-500",
          status === "RED" && "bg-red-500",
        )}
      />
      {showLabel && <span className={cn("text-sm font-medium", config.color)}>{config.label}</span>}
    </div>
  )
}

export function SystemStatusIndicator({
  status,
  utilizationPct,
  className,
}: {
  status: SystemStatus
  utilizationPct: number
  className?: string
}) {
  const config = statusConfig[status]

  return (
    <div className={cn("rounded-lg border p-4", className)}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-sm">Estado del Sistema</h4>
        <SystemStatusBadge status={status} size="sm" />
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
        <div
          className={cn(
            "h-full transition-all duration-500",
            status === "GREEN" && "bg-green-500",
            status === "YELLOW" && "bg-yellow-500",
            status === "ORANGE" && "bg-orange-500",
            status === "RED" && "bg-red-500",
          )}
          style={{ width: `${Math.min(utilizationPct, 100)}%` }}
        />
      </div>

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Utilización: {utilizationPct.toFixed(1)}%</span>
        <span>{config.description}</span>
      </div>
    </div>
  )
}
