"use client"

import { useState, useEffect, Suspense } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle2,
  MapPin,
  Calendar,
  Users,
  Download,
  Share2,
  Home,
  Building,
  Phone,
  Mail,
  Clock,
  Sparkles,
  QrCode,
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import { Navbar } from "@/components/navbar"

interface ConfirmedReservation {
  id: string
  property_name: string
  property_image: string
  destination: string
  region: string
  start_date: string
  end_date: string
  unit_type: string
  max_guests: number
  amenities: string[]
  check_in_time: string
  check_out_time: string
  contact_phone: string
  contact_email: string
  confirmation_code: string
  special_instructions: string
}

function ConfirmedContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const offerId = searchParams.get("offer")
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [reservation, setReservation] = useState<ConfirmedReservation | null>(null)

  useEffect(() => {
    loadReservation()
  }, [offerId])

  const loadReservation = async () => {
    if (!offerId) {
      router.replace("/dashboard/member")
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace("/auth")
        return
      }

      // Get offer details
      const { data: offer } = await supabase
        .from("reservation_offers")
        .select("*")
        .eq("id", offerId)
        .eq("status", "accepted")
        .single()

      if (offer) {
        setReservation({
          id: offer.id,
          property_name: offer.property_name,
          property_image: offer.property_image,
          destination: offer.destination,
          region: offer.region || "Mexico",
          start_date: offer.start_date,
          end_date: offer.end_date,
          unit_type: offer.unit_type || "Suite",
          max_guests: offer.max_guests,
          amenities: offer.amenities || [],
          check_in_time: "3:00 PM",
          check_out_time: "11:00 AM",
          contact_phone: "+52 998 123 4567",
          contact_email: "reservaciones@week-chain.com",
          confirmation_code: `WC-${Date.now().toString(36).toUpperCase()}`,
          special_instructions: offer.admin_notes || "",
        })
      }
    } catch (error) {
      console.error("Error loading reservation:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen flex-col overflow-hidden bg-gradient-to-br from-sky-50 via-cyan-50 to-teal-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="glass-card rounded-2xl p-8 text-center">
            <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600">Cargando confirmacion...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!reservation) {
    return (
      <div className="flex h-screen flex-col overflow-hidden bg-gradient-to-br from-sky-50 via-cyan-50 to-teal-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Card className="glass-card border-0 max-w-md">
            <CardContent className="p-8 text-center">
              <p className="text-slate-600 mb-4">No se encontro la reservacion.</p>
              <Link href="/dashboard/member">
                <Button className="glass-button text-white border-0">
                  Volver al Dashboard
                </Button>
              </Link>
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
          {/* Success Header */}
          <div className="glass-card rounded-2xl p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Reservacion Confirmada</h1>
            <p className="text-slate-600 mb-4">
              Tu semana vacacional ha sido reservada exitosamente
            </p>
            <Badge className="bg-sky-100 text-sky-700 text-lg px-4 py-2">
              Codigo: {reservation.confirmation_code}
            </Badge>
          </div>

          {/* Progress Complete */}
          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-green-600">REQUEST</p>
                  <p className="text-xs text-slate-500">Completado</p>
                </div>
              </div>
              <div className="h-0.5 flex-1 mx-4 bg-green-500" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-green-600">OFFER</p>
                  <p className="text-xs text-slate-500">Completado</p>
                </div>
              </div>
              <div className="h-0.5 flex-1 mx-4 bg-green-500" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-green-600">CONFIRM</p>
                  <p className="text-xs text-slate-500">Completado</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Reservation Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Property Card */}
              <Card className="glass-card border-0 overflow-hidden">
                <div className="relative h-48 bg-gradient-to-br from-sky-500 to-cyan-600">
                  {reservation.property_image ? (
                    <img
                      src={reservation.property_image || "/placeholder.svg"}
                      alt={reservation.property_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Building className="w-16 h-16 text-white/50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h2 className="text-2xl font-bold text-white">{reservation.property_name}</h2>
                    <p className="text-white/90 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {reservation.destination}, {reservation.region}
                    </p>
                  </div>
                </div>
                <CardContent className="p-6 space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="glass-blue rounded-xl p-4">
                      <div className="flex items-center gap-2 text-sky-600 mb-1">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm font-medium">CHECK-IN</span>
                      </div>
                      <p className="font-bold text-slate-800">
                        {format(new Date(reservation.start_date), "EEEE d MMMM yyyy", { locale: es })}
                      </p>
                      <p className="text-sm text-slate-500">Desde las {reservation.check_in_time}</p>
                    </div>
                    <div className="glass-blue rounded-xl p-4">
                      <div className="flex items-center gap-2 text-sky-600 mb-1">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm font-medium">CHECK-OUT</span>
                      </div>
                      <p className="font-bold text-slate-800">
                        {format(new Date(reservation.end_date), "EEEE d MMMM yyyy", { locale: es })}
                      </p>
                      <p className="text-sm text-slate-500">Antes de las {reservation.check_out_time}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-slate-500" />
                      <span className="text-slate-700">Hasta {reservation.max_guests} huespedes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Home className="w-5 h-5 text-slate-500" />
                      <span className="text-slate-700">{reservation.unit_type}</span>
                    </div>
                  </div>

                  {reservation.amenities.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-slate-800 mb-2">Amenidades incluidas</h4>
                      <div className="flex flex-wrap gap-2">
                        {reservation.amenities.map((amenity, i) => (
                          <Badge key={i} variant="outline" className="bg-transparent border-sky-200 text-sky-700">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {reservation.special_instructions && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <h4 className="font-semibold text-amber-800 mb-1">Instrucciones especiales</h4>
                      <p className="text-sm text-amber-700">{reservation.special_instructions}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Contact Info */}
              <Card className="glass-card border-0">
                <CardHeader>
                  <CardTitle className="text-slate-800">Contacto de la propiedad</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <a href={`tel:${reservation.contact_phone}`} className="flex items-center gap-3 p-3 glass rounded-xl hover:bg-sky-50 transition-colors">
                    <Phone className="w-5 h-5 text-sky-500" />
                    <span className="text-slate-700">{reservation.contact_phone}</span>
                  </a>
                  <a href={`mailto:${reservation.contact_email}`} className="flex items-center gap-3 p-3 glass rounded-xl hover:bg-sky-50 transition-colors">
                    <Mail className="w-5 h-5 text-sky-500" />
                    <span className="text-slate-700">{reservation.contact_email}</span>
                  </a>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* QR Code Card */}
              <Card className="glass-card border-0">
                <CardContent className="p-6 text-center">
                  <div className="w-40 h-40 bg-white rounded-xl mx-auto mb-4 flex items-center justify-center border-2 border-sky-100">
                    <QrCode className="w-32 h-32 text-slate-300" />
                  </div>
                  <p className="text-sm text-slate-500 mb-4">
                    Muestra este codigo QR al llegar
                  </p>
                  <Button variant="outline" className="w-full bg-transparent">
                    <Download className="w-4 h-4 mr-2" />
                    Descargar QR
                  </Button>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card className="glass-card border-0">
                <CardContent className="p-6 space-y-3">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Download className="w-4 h-4 mr-2" />
                    Descargar confirmacion
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Calendar className="w-4 h-4 mr-2" />
                    Agregar al calendario
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartir detalles
                  </Button>
                </CardContent>
              </Card>

              {/* Help */}
              <div className="glass-blue rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-sky-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-1">Necesitas ayuda?</h4>
                    <p className="text-sm text-slate-600">
                      Nuestro equipo de soporte esta disponible 24/7 para asistirte con cualquier consulta.
                    </p>
                  </div>
                </div>
              </div>

              <Link href="/dashboard/member">
                <Button className="w-full glass-button text-white border-0">
                  Volver al Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ConfirmedPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen flex-col overflow-hidden bg-gradient-to-br from-sky-50 via-cyan-50 to-teal-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="glass-card rounded-2xl p-8 text-center">
            <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600">Cargando...</p>
          </div>
        </div>
      </div>
    }>
      <ConfirmedContent />
    </Suspense>
  )
}
