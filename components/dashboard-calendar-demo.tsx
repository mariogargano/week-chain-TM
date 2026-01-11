"use client"

import { useState } from "react"
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  Users,
  Search,
  Award,
  CalendarClock,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
]

const WEEKDAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

const DEMO_CERTIFICATE = {
  code: "WC-2024-TULUM-001",
  status: "active",
  property: "Aflora Tulum",
  location: "Tulum, Q. Roo",
  weeksAvailable: 2,
  weeksUsed: 0,
  validUntil: "2039-12-31",
  destinations: ["Tulum", "Playa del Carmen", "Cancún", "Puerto Vallarta", "Los Cabos", "Ciudad de México"],
}

const DEMO_RESERVATIONS = [
  {
    id: 1,
    startDay: 5,
    endDay: 12,
    destination: "Tulum",
    guests: 2,
    status: "confirmed",
    color: "from-[#FF9AA2] to-[#FFB7B2]",
  },
  {
    id: 2,
    startDay: 18,
    endDay: 25,
    destination: "Playa del Carmen",
    guests: 4,
    status: "pending",
    color: "from-[#FFDAC1] to-[#E2F0CB]",
  },
]

export function DashboardCalendarDemo() {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear] = useState(new Date().getFullYear())
  const [selectedReservation, setSelectedReservation] = useState<number | null>(null)
  const [certificateCode, setCertificateCode] = useState("")
  const [showCertificateDetails, setShowCertificateDetails] = useState(false)

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay()
  }

  const daysInMonth = getDaysInMonth(currentMonth, currentYear)
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear)

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => (prev === 0 ? 11 : prev - 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth((prev) => (prev === 11 ? 0 : prev + 1))
  }

  const hasReservation = (day: number) => {
    return DEMO_RESERVATIONS.find((res) => day >= res.startDay && day <= res.endDay)
  }

  const handleCertificateSearch = () => {
    if (certificateCode.trim()) {
      setShowCertificateDetails(true)
    }
  }

  return (
    <div className="w-full space-y-6">
      <Card className="bg-gradient-to-br from-slate-50 to-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF9AA2] to-[#FFB7B2] flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900">Ingresa tu Certificado</h3>
              <p className="text-sm text-slate-600">Descubre los destinos disponibles para tu certificado WEEK-CHAIN</p>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Input
              placeholder="Ej: WC-2024-TULUM-001"
              value={certificateCode}
              onChange={(e) => setCertificateCode(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleCertificateSearch()}
              className="flex-1 h-12 text-base border-slate-300 focus:border-[#FF9AA2] focus:ring-[#FF9AA2]"
            />
            <Button
              onClick={handleCertificateSearch}
              className="h-12 px-8 bg-gradient-to-r from-[#FF9AA2] to-[#FFB7B2] hover:from-[#FFB7B2] hover:to-[#FFDAC1] text-white border-0"
            >
              <Search className="w-4 h-4 mr-2" />
              Buscar
            </Button>
          </div>

          {showCertificateDetails && (
            <div className="mt-6 p-6 bg-white rounded-2xl border-2 border-[#B5EAD7] space-y-4 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-start justify-between">
                <div>
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 mb-2">
                    {DEMO_CERTIFICATE.status === "active" ? "Activo" : "Inactivo"}
                  </Badge>
                  <h4 className="text-xl font-bold text-slate-900">{DEMO_CERTIFICATE.code}</h4>
                  <p className="text-sm text-slate-600 mt-1">{DEMO_CERTIFICATE.property}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Válido hasta</p>
                  <p className="text-sm font-bold text-slate-900">{DEMO_CERTIFICATE.validUntil}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
                <div className="text-center p-4 bg-gradient-to-br from-[#FF9AA2]/10 to-[#FFB7B2]/10 rounded-xl">
                  <CalendarClock className="w-5 h-5 mx-auto mb-2 text-[#FF9AA2]" />
                  <p className="text-2xl font-bold text-slate-900">{DEMO_CERTIFICATE.weeksAvailable}</p>
                  <p className="text-xs text-slate-600 mt-1">Semanas Disponibles</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-[#B5EAD7]/10 to-[#C7CEEA]/10 rounded-xl">
                  <Clock className="w-5 h-5 mx-auto mb-2 text-[#B5EAD7]" />
                  <p className="text-2xl font-bold text-slate-900">{DEMO_CERTIFICATE.weeksUsed}</p>
                  <p className="text-xs text-slate-600 mt-1">Semanas Utilizadas</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-[#FFDAC1]/10 to-[#E2F0CB]/10 rounded-xl">
                  <MapPin className="w-5 h-5 mx-auto mb-2 text-[#FFDAC1]" />
                  <p className="text-2xl font-bold text-slate-900">{DEMO_CERTIFICATE.destinations.length}</p>
                  <p className="text-xs text-slate-600 mt-1">Destinos Disponibles</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <p className="text-xs font-semibold text-slate-700 mb-3">DESTINOS DISPONIBLES CON ESTE CERTIFICADO:</p>
                <div className="flex flex-wrap gap-2">
                  {DEMO_CERTIFICATE.destinations.map((dest) => (
                    <Badge
                      key={dest}
                      variant="outline"
                      className="bg-white border-[#C7CEEA] text-slate-700 hover:bg-[#C7CEEA]/10"
                    >
                      <MapPin className="w-3 h-3 mr-1" />
                      {dest}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Calendar Section */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 via-slate-800 to-slate-900 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Badge className="bg-gradient-to-r from-[#FF9AA2] to-[#FFB7B2] text-white border-0 mb-2">
                <CalendarIcon className="w-3 h-3 mr-1" />
                Vista Previa Dashboard
              </Badge>
              <h3 className="text-2xl font-bold text-white">Calendario Interactivo</h3>
              <p className="text-slate-400 text-sm mt-1">
                Así visualizarás tus solicitudes de uso vacacional en tu dashboard
              </p>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-xl font-bold text-slate-900">
              {MONTHS[currentMonth]} {currentYear}
            </h4>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevMonth}
                className="h-9 w-9 p-0 border-slate-200 hover:bg-slate-50 bg-transparent"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextMonth}
                className="h-9 w-9 p-0 border-slate-200 hover:bg-slate-50 bg-transparent"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-2 mb-3">
            {WEEKDAYS.map((day) => (
              <div key={day} className="text-center text-xs font-medium text-slate-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: firstDay }).map((_, idx) => (
              <div key={`empty-${idx}`} className="aspect-square" />
            ))}

            {/* Days of the month */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1
              const reservation = hasReservation(day)
              const isStart = reservation && day === reservation.startDay
              const isEnd = reservation && day === reservation.endDay
              const isMiddle = reservation && day > reservation.startDay && day < reservation.endDay

              return (
                <div
                  key={day}
                  onClick={() => reservation && setSelectedReservation(reservation.id)}
                  className={`
                    aspect-square rounded-lg flex items-center justify-center text-sm font-medium
                    transition-all cursor-pointer relative group
                    ${
                      reservation
                        ? `bg-gradient-to-br ${reservation.color} text-white shadow-md hover:shadow-lg hover:scale-105`
                        : "text-slate-700 hover:bg-slate-50 border border-slate-200"
                    }
                    ${isStart ? "rounded-l-xl" : ""}
                    ${isEnd ? "rounded-r-xl" : ""}
                    ${isMiddle ? "rounded-none" : ""}
                  `}
                >
                  {day}
                  {reservation && (
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
                  )}
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-xs font-medium text-slate-500 mb-3">Leyenda</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {DEMO_RESERVATIONS.map((res) => (
                <div
                  key={res.id}
                  onClick={() => setSelectedReservation(res.id)}
                  className={`
                    p-4 rounded-xl border-2 cursor-pointer transition-all
                    ${
                      selectedReservation === res.id
                        ? `border-slate-300 bg-gradient-to-br ${res.color} bg-opacity-10`
                        : "border-slate-200 hover:border-slate-300 hover:shadow-md"
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${res.color} flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[#FF9AA2]" />
                        {res.destination}
                      </p>
                      <p className="text-xs text-slate-600 mt-1 flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {MONTHS[currentMonth]} {res.startDay} - {res.endDay}, {currentYear}
                      </p>
                      <p className="text-xs text-slate-600 mt-1 flex items-center gap-2">
                        <Users className="w-3 h-3" />
                        {res.guests} huéspedes
                      </p>
                      <Badge
                        className={`mt-2 text-[10px] ${
                          res.status === "confirmed"
                            ? "bg-green-100 text-green-700 border-green-300"
                            : "bg-amber-100 text-amber-700 border-amber-300"
                        }`}
                      >
                        {res.status === "confirmed" ? "Confirmada" : "Pendiente"}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Info banner */}
          <div className="mt-6 p-4 bg-gradient-to-r from-[#B5EAD7]/20 to-[#C7CEEA]/20 rounded-xl border border-[#B5EAD7]/30">
            <p className="text-sm text-slate-700">
              <span className="font-bold">💡 En tu dashboard real:</span> Podrás ver todas tus solicitudes de uso
              vacacional, gestionar tus certificados, recibir ofertas del sistema, y coordinar tus estadías con el
              equipo WEEK-CHAIN.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
