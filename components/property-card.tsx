import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { MapPin, DollarSign, Calendar, Lock, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface PropertyCardProps {
  property: {
    id: string
    name: string
    location: string
    location_group?: string
    description: string
    image_url: string
    valor_total_usd: number
    recaudado_actual: number
    status: string
    unlock_status?: "available" | "locked" | "sold_out"
    unlock_order?: number
    weeks_available?: number
    weeks_remaining?: number
    weeks_sold?: number
    presale_target?: number
    total_weeks?: number
    price?: number
  }
}

export function PropertyCard({ property }: PropertyCardProps) {
  const percentageFunded = property.valor_total_usd ? (property.recaudado_actual / property.valor_total_usd) * 100 : 0

  const presaleProgress = property.presale_target ? ((property.weeks_sold || 0) / property.presale_target) * 100 : 0
  const weeksAvailable = property.weeks_remaining ?? (property.total_weeks || 52) - (property.weeks_sold || 0)

  const isLocked = property.unlock_status === "locked"
  const isSoldOut = property.unlock_status === "sold_out"
  const isAvailable = property.unlock_status === "available"

  const propertyImage =
    property.image_url ||
    `/placeholder.svg?height=400&width=600&query=luxury ${property.location} vacation property beach resort`

  const accentColors = ["#FF9AA2", "#FFB7B2", "#FFDAC1", "#E2F0CB", "#B5EAD7", "#C7CEEA"]
  const hashCode = (str: string) => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash
    }
    return Math.abs(hash)
  }
  const accentColor = accentColors[hashCode(property.id) % accentColors.length]

  return (
    <TooltipProvider>
      <Card
        className={`overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-1 duration-300 border-2 rounded-2xl focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-emerald-500 ${isLocked ? "opacity-75" : ""}`}
        style={{ borderTopColor: accentColor, borderTopWidth: "4px" }}
      >
        <div className="relative h-56 w-full overflow-hidden group">
          {isLocked && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm cursor-help">
                  <div className="text-center text-white px-4">
                    <Lock className="mx-auto mb-2 h-10 w-10" />
                    <p className="text-base font-semibold">Bloqueada</p>
                    <p className="text-xs opacity-90">Se desbloqueará al venderse la anterior</p>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-semibold mb-1">Sistema de Desbloqueo Progresivo</p>
                <p className="text-sm">
                  Esta propiedad se desbloqueará automáticamente cuando la propiedad anterior en {property.location}{" "}
                  alcance el 100% de ventas (48 semanas vendidas).
                </p>
              </TooltipContent>
            </Tooltip>
          )}

          {isSoldOut && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-emerald-900/70 backdrop-blur-sm">
              <div className="text-center text-white px-4">
                <CheckCircle2 className="mx-auto mb-2 h-10 w-10" />
                <p className="text-base font-semibold">¡Vendida!</p>
                <p className="text-xs opacity-90">Todas las semanas adquiridas</p>
              </div>
            </div>
          )}

          <Image
            src={propertyImage || "/placeholder.svg"}
            alt={property.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {isAvailable && (
            <Badge className="absolute right-3 top-3 bg-emerald-600 text-white font-semibold border-0 shadow-lg">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Disponible
            </Badge>
          )}

          <div
            className="absolute left-3 top-3 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg"
            style={{ background: accentColor }}
          >
            <Calendar className="h-3 w-3 inline mr-1" />
            {weeksAvailable} Disponibles
          </div>
        </div>

        <CardContent className="p-8 space-y-4">
          <div>
            {property.location_group && (
              <Badge variant="outline" className="mb-2 text-xs">
                {property.location_group.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </Badge>
            )}

            <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-1 text-balance">{property.name}</h3>

            <div className="flex items-center gap-1.5 text-sm text-slate-700 mb-3">
              <MapPin className="h-4 w-4" style={{ color: accentColor }} />
              <span className="font-medium">{property.location}</span>
            </div>

            <p className="line-clamp-2 text-sm text-slate-700 leading-relaxed text-pretty">{property.description}</p>
          </div>

          <div className="space-y-3 pt-2 border-t" style={{ borderColor: `${accentColor}20` }}>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-700 font-medium">Desde</span>
              <span className="flex items-center font-bold text-xl text-slate-900">
                <DollarSign className="h-5 w-5 text-green-600" />
                {property.price?.toLocaleString() || "N/A"}
                <span className="text-sm text-slate-600 ml-1">/semana</span>
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-700 font-medium flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Semanas Disponibles
                </span>
                <span className="font-bold" style={{ color: accentColor }}>
                  {weeksAvailable} de {property.presale_target || 48}
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 shadow-inner">
                <div
                  className="h-full transition-all duration-500 shadow-sm"
                  style={{
                    width: `${Math.min(100 - presaleProgress, 100)}%`,
                    background: `linear-gradient(to right, ${accentColor}, ${accentColor}dd)`,
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-8 pt-0 flex-col gap-2">
          <div className="w-full flex items-center justify-center gap-2 text-xs text-slate-700 mb-2">
            <span>💳 Tarjeta</span>
            <span>•</span>
            <span>🏦 SPEI</span>
            <span>•</span>
            <span className="font-bold text-[#FF9AA2]">🏪 OXXO</span>
          </div>

          <Button
            asChild={!isLocked && !isSoldOut}
            disabled={isLocked || isSoldOut}
            className="w-full text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500"
            style={{
              background:
                isLocked || isSoldOut ? "#94a3b8" : `linear-gradient(to right, ${accentColor}, ${accentColor}dd)`,
            }}
          >
            {isLocked || isSoldOut ? (
              <span className="flex items-center justify-center gap-2">
                {isLocked && (
                  <>
                    <Lock className="h-4 w-4" /> Bloqueada
                  </>
                )}
                {isSoldOut && (
                  <>
                    <CheckCircle2 className="h-4 w-4" /> Vendida
                  </>
                )}
              </span>
            ) : (
              <Link href={`/properties/${property.id}`}>Reservar Semana</Link>
            )}
          </Button>
        </CardFooter>
      </Card>
    </TooltipProvider>
  )
}
