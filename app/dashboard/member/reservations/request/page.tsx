"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  CalendarIcon,
  MapPin,
  Users,
  Send,
  ArrowLeft,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import { format, addDays } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import { Navbar } from "@/components/navbar"

interface Certificate {
  id: string
  pax_capacity: number
  weeks_per_year: number
  status: string
  year: number
}

const DESTINATIONS = [
  { id: "cancun", name: "Cancun", region: "Caribe Mexicano" },
  { id: "los-cabos", name: "Los Cabos", region: "Baja California" },
  { id: "puerto-vallarta", name: "Puerto Vallarta", region: "Pacifico" },
  { id: "riviera-maya", name: "Riviera Maya", region: "Caribe Mexicano" },
  { id: "mazatlan", name: "Mazatlan", region: "Pacifico" },
  { id: "san-miguel", name: "San Miguel de Allende", region: "Centro" },
  { id: "cualquiera", name: "Sin preferencia especifica", region: "Flexible" },
]

export default function ReservationRequestPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [selectedCertificate, setSelectedCertificate] = useState<string>("")
  const [preferredDestination, setPreferredDestination] = useState<string>("")
  const [alternateDestination, setAlternateDestination] = useState<string>("")
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [flexibleDates, setFlexibleDates] = useState(false)
  const [guests, setGuests] = useState(2)
  const [specialRequests, setSpecialRequests] = useState("")
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    loadCertificates()
  }, [])

  const loadCertificates = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace("/auth")
        return
      }

      // Get user's active certificates
      const { data: certs } = await supabase
        .from("week_tokens")
        .select("*")
        .eq("owner_id", user.id)
        .eq("status", "active")

      setCertificates(certs || [])
    } catch (error) {
      console.error("Error loading certificates:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!selectedCertificate || !preferredDestination || !startDate) {
      return
    }

    setSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const selectedCert = certificates.find(c => c.id === selectedCertificate)

      const { error } = await supabase.from("reservation_requests").insert({
        user_id: user.id,
        certificate_id: selectedCertificate,
        preferred_destination: preferredDestination,
        alternate_destinations: alternateDestination ? [alternateDestination] : [],
        preferred_start_date: startDate.toISOString(),
        preferred_end_date: endDate?.toISOString() || addDays(startDate, 7).toISOString(),
        flexible_dates: flexibleDates,
        guests_count: guests,
        special_requests: specialRequests,
        pax_required: selectedCert?.pax_capacity || guests,
        status: "pending",
      })

      if (error) throw error

      setSubmitted(true)
    } catch (error) {
      console.error("Error submitting request:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const selectedCert = certificates.find(c => c.id === selectedCertificate)

  if (loading) {
    return (
      <div className="flex h-screen flex-col overflow-hidden bg-gradient-to-br from-sky-50 via-cyan-50 to-teal-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="glass-card rounded-2xl p-8 text-center">
            <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600">Cargando tus certificados...</p>
          </div>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="flex h-screen flex-col overflow-hidden bg-gradient-to-br from-sky-50 via-cyan-50 to-teal-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="glass-card max-w-lg w-full text-center border-0">
            <CardHeader>
              <div className="w-20 h-20 bg-gradient-to-br from-sky-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl text-slate-800">Solicitud Enviada</CardTitle>
              <CardDescription className="text-base">
                Tu solicitud de reservacion ha sido recibida exitosamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-sky-50 rounded-xl p-4 text-left space-y-2">
                <p className="text-sm text-slate-600">
                  <span className="font-semibold text-slate-800">Destino preferido:</span>{" "}
                  {DESTINATIONS.find(d => d.id === preferredDestination)?.name}
                </p>
                <p className="text-sm text-slate-600">
                  <span className="font-semibold text-slate-800">Fecha solicitada:</span>{" "}
                  {startDate && format(startDate, "PPP", { locale: es })}
                </p>
                <p className="text-sm text-slate-600">
                  <span className="font-semibold text-slate-800">Huespedes:</span> {guests} personas
                </p>
              </div>

              <div className="glass-blue rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-sky-600 mt-0.5" />
                  <div className="text-left">
                    <p className="font-semibold text-slate-800">Siguiente paso</p>
                    <p className="text-sm text-slate-600">
                      Nuestro equipo revisara tu solicitud y te enviara ofertas de propiedades disponibles 
                      dentro de las proximas 24-48 horas.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Link href="/dashboard/member/reservations" className="flex-1">
                  <Button variant="outline" className="w-full bg-transparent">
                    Ver mis solicitudes
                  </Button>
                </Link>
                <Link href="/dashboard/member" className="flex-1">
                  <Button className="w-full glass-button text-white border-0">
                    Ir al dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gradient-to-br from-sky-50 via-cyan-50 to-teal-50">
      <Navbar />
      <div className="flex-1 overflow-y-auto pt-16">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Link href="/dashboard/member">
              <Button variant="ghost" size="icon" className="glass rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Solicitar Reservacion</h1>
              <p className="text-slate-600">Paso 1 de 3: Envia tu solicitud de semana vacacional</p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                  1
                </div>
                <div>
                  <p className="font-semibold text-slate-800">REQUEST</p>
                  <p className="text-xs text-slate-500">Solicita tu semana</p>
                </div>
              </div>
              <div className="h-0.5 flex-1 mx-4 bg-slate-200" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">
                  2
                </div>
                <div>
                  <p className="font-semibold text-slate-400">OFFER</p>
                  <p className="text-xs text-slate-400">Recibe ofertas</p>
                </div>
              </div>
              <div className="h-0.5 flex-1 mx-4 bg-slate-200" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">
                  3
                </div>
                <div>
                  <p className="font-semibold text-slate-400">CONFIRM</p>
                  <p className="text-xs text-slate-400">Confirma tu reserva</p>
                </div>
              </div>
            </div>
          </div>

          {certificates.length === 0 ? (
            <Card className="glass-card border-0">
              <CardContent className="p-8 text-center">
                <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  No tienes certificados activos
                </h3>
                <p className="text-slate-600 mb-4">
                  Necesitas al menos un Smart Vacational Certificate activo para solicitar una reservacion.
                </p>
                <Link href="/">
                  <Button className="glass-button text-white border-0">
                    Adquirir Certificado
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Certificate Selection */}
                <Card className="glass-card border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-800">
                      <Sparkles className="w-5 h-5 text-sky-500" />
                      Selecciona tu Certificado
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {certificates.map((cert) => (
                        <button
                          key={cert.id}
                          onClick={() => {
                            setSelectedCertificate(cert.id)
                            setGuests(Math.min(guests, cert.pax_capacity))
                          }}
                          className={`p-4 rounded-xl text-left transition-all ${
                            selectedCertificate === cert.id
                              ? "glass-blue border-2 border-sky-500"
                              : "glass hover:border-sky-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-slate-800">
                                Certificado {cert.pax_capacity} PAX - {cert.weeks_per_year} semana(s)/año
                              </p>
                              <p className="text-sm text-slate-500">Año {cert.year}</p>
                            </div>
                            <Badge className={`${
                              selectedCertificate === cert.id 
                                ? "bg-sky-500 text-white" 
                                : "bg-slate-100 text-slate-600"
                            }`}>
                              {cert.status}
                            </Badge>
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Destination */}
                <Card className="glass-card border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-800">
                      <MapPin className="w-5 h-5 text-sky-500" />
                      Destino Preferido
                    </CardTitle>
                    <CardDescription>
                      Selecciona tu destino ideal. Puedes agregar una alternativa.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-slate-700">Destino principal</Label>
                      <Select value={preferredDestination} onValueChange={setPreferredDestination}>
                        <SelectTrigger className="glass-input mt-1">
                          <SelectValue placeholder="Selecciona un destino" />
                        </SelectTrigger>
                        <SelectContent>
                          {DESTINATIONS.map((dest) => (
                            <SelectItem key={dest.id} value={dest.id}>
                              <div className="flex items-center gap-2">
                                <span>{dest.name}</span>
                                <span className="text-xs text-slate-400">({dest.region})</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-slate-700">Destino alternativo (opcional)</Label>
                      <Select value={alternateDestination} onValueChange={setAlternateDestination}>
                        <SelectTrigger className="glass-input mt-1">
                          <SelectValue placeholder="Selecciona alternativa" />
                        </SelectTrigger>
                        <SelectContent>
                          {DESTINATIONS.filter(d => d.id !== preferredDestination).map((dest) => (
                            <SelectItem key={dest.id} value={dest.id}>
                              <div className="flex items-center gap-2">
                                <span>{dest.name}</span>
                                <span className="text-xs text-slate-400">({dest.region})</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Dates */}
                <Card className="glass-card border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-800">
                      <CalendarIcon className="w-5 h-5 text-sky-500" />
                      Fechas Deseadas
                    </CardTitle>
                    <CardDescription>
                      Indica cuando te gustaria viajar. Recuerda que esto es una solicitud sujeta a disponibilidad.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-slate-700">Fecha de inicio</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal glass-input mt-1 bg-transparent"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {startDate ? format(startDate, "PPP", { locale: es }) : "Selecciona fecha"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={startDate}
                              onSelect={(date) => {
                                setStartDate(date)
                                if (date) setEndDate(addDays(date, 7))
                              }}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div>
                        <Label className="text-slate-700">Fecha de fin</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal glass-input mt-1 bg-transparent"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {endDate ? format(endDate, "PPP", { locale: es }) : "Selecciona fecha"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={endDate}
                              onSelect={setEndDate}
                              disabled={(date) => date < (startDate || new Date())}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={flexibleDates}
                        onChange={(e) => setFlexibleDates(e.target.checked)}
                        className="w-5 h-5 rounded border-sky-300 text-sky-500 focus:ring-sky-500"
                      />
                      <span className="text-slate-700">
                        Mis fechas son flexibles (+/- 1 semana)
                      </span>
                    </label>
                  </CardContent>
                </Card>

                {/* Guests & Requests */}
                <Card className="glass-card border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-800">
                      <Users className="w-5 h-5 text-sky-500" />
                      Huespedes y Solicitudes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-slate-700">Numero de huespedes</Label>
                      <Select 
                        value={guests.toString()} 
                        onValueChange={(v) => setGuests(parseInt(v))}
                      >
                        <SelectTrigger className="glass-input mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: selectedCert?.pax_capacity || 10 }, (_, i) => i + 1).map((n) => (
                            <SelectItem key={n} value={n.toString()}>
                              {n} {n === 1 ? "persona" : "personas"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedCert && (
                        <p className="text-xs text-slate-500 mt-1">
                          Tu certificado permite hasta {selectedCert.pax_capacity} personas
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className="text-slate-700">Solicitudes especiales (opcional)</Label>
                      <Textarea
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                        placeholder="Ej: Piso alto, vista al mar, cuna para bebe, accesibilidad..."
                        className="glass-input mt-1 min-h-[100px]"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Summary Sidebar */}
              <div className="space-y-6">
                <Card className="glass-card border-0 sticky top-24">
                  <CardHeader>
                    <CardTitle className="text-slate-800">Resumen de Solicitud</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedCert ? (
                      <>
                        <div className="p-3 bg-gradient-to-br from-sky-500/10 to-cyan-500/10 rounded-xl">
                          <p className="text-xs text-sky-600 font-medium">CERTIFICADO</p>
                          <p className="font-semibold text-slate-800">
                            {selectedCert.pax_capacity} PAX - {selectedCert.weeks_per_year} semana(s)
                          </p>
                        </div>

                        {preferredDestination && (
                          <div className="flex items-center gap-3 text-slate-700">
                            <MapPin className="w-4 h-4 text-sky-500" />
                            <span>{DESTINATIONS.find(d => d.id === preferredDestination)?.name}</span>
                          </div>
                        )}

                        {startDate && (
                          <div className="flex items-center gap-3 text-slate-700">
                            <CalendarIcon className="w-4 h-4 text-sky-500" />
                            <span>{format(startDate, "PP", { locale: es })}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-3 text-slate-700">
                          <Users className="w-4 h-4 text-sky-500" />
                          <span>{guests} huespedes</span>
                        </div>

                        <div className="pt-4 border-t border-sky-100">
                          <Button
                            onClick={handleSubmit}
                            disabled={!selectedCertificate || !preferredDestination || !startDate || submitting}
                            className="w-full glass-button text-white border-0 h-12"
                          >
                            {submitting ? (
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Enviando...
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Send className="w-4 h-4" />
                                Enviar Solicitud
                              </div>
                            )}
                          </Button>
                        </div>
                      </>
                    ) : (
                      <p className="text-slate-500 text-sm text-center py-4">
                        Selecciona un certificado para ver el resumen
                      </p>
                    )}
                  </CardContent>
                </Card>

                <div className="glass-blue rounded-xl p-4">
                  <h4 className="font-semibold text-slate-800 mb-2">Como funciona</h4>
                  <ul className="text-sm text-slate-600 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-sky-500 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                      <span>Envia tu solicitud con preferencias</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-sky-500 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                      <span>Recibe ofertas de propiedades disponibles</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-sky-500 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                      <span>Confirma la opcion que mas te guste</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
