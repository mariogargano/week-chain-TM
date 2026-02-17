"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { AlertTriangle, Info } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface Week {
  id: string
  week_number: number
  start_date: string
  end_date: string
  price: number
  season: string
  status: string
  owner_wallet: string | null
  property_id: string
}

interface WeekCalendarProps {
  weeks: Week[]
  propertyId: string
  propertyName: string
}

const seasonColors = {
  alta: "bg-[#FFE5E5] text-[#8B4513] border-[#FFB6C1]",
  media: "bg-[#FFF4E5] text-[#D2691E] border-[#FFD700]",
  baja: "bg-[#E5F5E5] text-[#2F4F2F] border-[#90EE90]",
  empresa: "bg-[#F0E5FF] text-[#4B0082] border-[#DDA0DD]",
  high: "bg-[#FFE5E5] text-[#8B4513] border-[#FFB6C1]",
  medium: "bg-[#FFF4E5] text-[#D2691E] border-[#FFD700]",
  low: "bg-[#E5F5E5] text-[#2F4F2F] border-[#90EE90]",
}

const statusColors = {
  available: "hover:border-[#87CEEB] hover:bg-[#E0F2FE] cursor-pointer transition-all",
  reserved: "bg-[#F5F5F5] cursor-not-allowed opacity-60",
  sold: "bg-[#E5E5E5] cursor-not-allowed opacity-60",
}

export function WeekCalendar({ weeks, propertyId, propertyName }: WeekCalendarProps) {
  const [selectedWeek, setSelectedWeek] = useState<Week | null>(null)

  const handleWeekClick = (week: Week) => {
    if (week.status === "available") {
      setSelectedWeek(week)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 border-amber-500 bg-gradient-to-br from-amber-50 to-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <AlertTriangle className="h-6 w-6 text-amber-600" />
            Calendarios de Semanas Deshabilitados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white rounded-lg p-4 border border-amber-200">
            <p className="text-amber-900 font-semibold mb-2">Modelo Smart Vacational Certificate Activo</p>
            <p className="text-sm text-amber-800 leading-relaxed">
              La selección y compra directa de semanas específicas{" "}
              <span className="font-bold">ya no está disponible</span>. El sistema WEEK-CHAIN ahora opera bajo el modelo
              Smart Vacational Certificate.
            </p>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="flex items-center gap-2 text-blue-900 font-semibold mb-2">
              <Info className="h-4 w-4" />
              Nuevo Modelo de Acceso
            </p>
            <p className="text-sm text-blue-800 leading-relaxed mb-3">
              Con tu certificado, podrás <span className="font-bold">solicitar acceso</span> a destinos participantes
              según disponibilidad del sistema.
            </p>
            <Link href="/auth">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                Adquirir Smart Vacational Certificate
              </Button>
            </Link>
          </div>

          <p className="text-xs text-amber-700 text-center">
            Este componente ha sido deshabilitado permanentemente bajo las nuevas políticas de compliance legal.
          </p>
        </CardContent>
      </Card>

      {/* Completely disable week calendar component - no longer used under SVC model */}
      {/* {selectedWeek && (
        <Card className="border-2 border-[#87CEEB] bg-gradient-to-br from-[#E0F2FE] to-white shadow-lg">
          <CardHeader>
            <CardTitle>Week {selectedWeek.week_number} Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dates:</span>
                <span className="font-medium">
                  {new Date(selectedWeek.start_date).toLocaleDateString()} -{" "}
                  {new Date(selectedWeek.end_date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Season:</span>
                <Badge className={seasonColors[selectedWeek.season as keyof typeof seasonColors]}>
                  {selectedWeek.season.toUpperCase()}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price:</span>
                <span className="text-lg font-bold">${selectedWeek.price.toLocaleString()} MXN</span>
              </div>
            </div>

            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
              <p className="text-sm text-blue-800">
                💳 Acepta tarjetas de crédito/débito
                <br />🏪 Pago en efectivo en Oxxo
                <br />📱 Transferencia SPEI
              </p>
            </div>
          </CardContent>
        </Card>
      )} */}
    </div>
  )
}
