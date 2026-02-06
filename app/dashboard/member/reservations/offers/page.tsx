"use client"

import React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  MapPin,
  Calendar,
  Users,
  Star,
  ArrowLeft,
  Check,
  Clock,
  Building,
  Waves,
  Mountain,
  TreePalm,
  Sparkles,
  ChevronRight,
  AlertCircle,
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import Navbar from "@/components/navbar"
import Image from "next/image"

interface Offer {
  id: string
  request_id: string
  property_id: string
  property_name: string
  property_image: string
  destination: string
  region: string
  start_date: string
  end_date: string
  amenities: string[]
  unit_type: string
  max_guests: number
  status: string
  expires_at: string
  admin_notes: string
  created_at: string
}

interface Request {
  id: string
  preferred_destination: string
  preferred_start_date: string
  status: string
  created_at: string
}

const DESTINATION_ICONS: Record<string, React.ReactNode> = {
  "Cancun": <Waves className="w-4 h-4" />,
  "Los Cabos": <Mountain className="w-4 h-4" />,
  "Puerto Vallarta": <TreePalm className="w-4 h-4" />,
  "Riviera Maya": <TreePalm className="w-4 h-4" />,
}

export default function ReservationOffersPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState<Request[]>([])
  const [offers, setOffers] = useState<Offer[]>([])
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace("/auth")
        return
      }

      // Load requests with pending offers
      const { data: requestsData } = await supabase
        .from("reservation_requests")
        .select("*")
        .eq("user_id", user.id)
        .in("status", ["pending", "offers_sent"])
        .order("created_at", { ascending: false })

      setRequests(requestsData || [])

      // Load offers for these requests
      if (requestsData && requestsData.length > 0) {
        const requestIds = requestsData.map(r => r.id)
        const { data: offersData } = await supabase
          .from("reservation_offers")
          .select("*")
          .in("request_id", requestIds)
          .eq("status", "pending")
          .order("created_at", { ascending: false })

        setOffers(offersData || [])
      }
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmOffer = async () => {
    if (!selectedOffer) return

    setConfirming(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Update offer status
      const { error: offerError } = await supabase
        .from("reservation_offers")
        .update({ status: "accepted" })
        .eq("id", selectedOffer.id)

      if (offerError) throw offerError

      // Update request status
      const { error: requestError } = await supabase
        .from("reservation_requests")
        .update({ status: "confirmed" })
        .eq("id", selectedOffer.request_id)

      if (requestError) throw requestError

      // Reject other offers for this request
      await supabase
        .from("reservation_offers")
        .update({ status: "declined" })
        .eq("request_id", selectedOffer.request_id)
        .neq("id", selectedOffer.id)

      // Redirect to confirmation page
      router.push(`/dashboard/member/reservations/confirmed?offer=${selectedOffer.id}`)
    } catch (error) {
      console.error("Error confirming offer:", error)
    } finally {
      setConfirming(false)
      setConfirmDialogOpen(false)
    }
  }

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date()
    const expires = new Date(expiresAt)
    const diff = expires.getTime() - now.getTime()
    
    if (diff <= 0) return "Expirada"
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 24) {
      const days = Math.floor(hours / 24)
      return `${days} dia${days > 1 ? 's' : ''} restante${days > 1 ? 's' : ''}`
    }
    
    return `${hours}h ${minutes}m restantes`
  }

  if (loading) {
    return (
      <div className="flex h-screen flex-col overflow-hidden bg-gradient-to-br from-sky-50 via-cyan-50 to-teal-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="glass-card rounded-2xl p-8 text-center">
            <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600">Cargando ofertas...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gradient-to-br from-sky-50 via-cyan-50 to-teal-50">
      <Navbar />
      <div className="flex-1 overflow-y-auto pt-16">
        <div className="max-w-6xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Link href="/dashboard/member">
              <Button variant="ghost" size="icon" className="glass rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Ofertas Disponibles</h1>
              <p className="text-slate-600">Paso 2 de 3: Revisa y selecciona una oferta</p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center text-white">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-sky-600">REQUEST</p>
                  <p className="text-xs text-slate-500">Completado</p>
                </div>
              </div>
              <div className="h-0.5 flex-1 mx-4 bg-sky-500" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                  2
                </div>
                <div>
                  <p className="font-semibold text-slate-800">OFFER</p>
                  <p className="text-xs text-slate-500">Selecciona una opcion</p>
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

          {offers.length === 0 ? (
            <Card className="glass-card border-0">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-sky-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-10 h-10 text-sky-500" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                  Esperando ofertas
                </h3>
                <p className="text-slate-600 max-w-md mx-auto mb-6">
                  {requests.length > 0 
                    ? "Tu solicitud esta siendo procesada. Recibiras ofertas dentro de las proximas 24-48 horas."
                    : "No tienes solicitudes activas. Crea una nueva solicitud para recibir ofertas."}
                </p>
                {requests.length === 0 && (
                  <Link href="/dashboard/member/reservations/request">
                    <Button className="glass-button text-white border-0">
                      Nueva Solicitud
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {offers.map((offer) => {
                const request = requests.find(r => r.id === offer.request_id)
                const isExpired = new Date(offer.expires_at) < new Date()

                return (
                  <Card 
                    key={offer.id} 
                    className={`glass-card border-0 overflow-hidden transition-all hover:shadow-lg ${
                      isExpired ? "opacity-60" : ""
                    }`}
                  >
                    <div className="grid md:grid-cols-3">
                      {/* Property Image */}
                      <div className="relative h-48 md:h-auto">
                        <div className="absolute inset-0 bg-gradient-to-br from-sky-500 to-cyan-600">
                          {offer.property_image ? (
                            <Image
                              src={offer.property_image || "/placeholder.svg"}
                              alt={offer.property_name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Building className="w-16 h-16 text-white/50" />
                            </div>
                          )}
                        </div>
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-white/90 text-sky-700">
                            {offer.destination}
                          </Badge>
                        </div>
                        {!isExpired && (
                          <div className="absolute bottom-4 left-4 right-4">
                            <div className="glass-dark rounded-lg px-3 py-2 text-sm text-white flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {getTimeRemaining(offer.expires_at)}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Property Details */}
                      <div className="md:col-span-2 p-6">
                        <div className="flex flex-col h-full">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className="text-xl font-bold text-slate-800">
                                  {offer.property_name}
                                </h3>
                                <p className="text-slate-500 flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {offer.destination}, {offer.region}
                                </p>
                              </div>
                              {!isExpired && (
                                <Badge className="bg-green-100 text-green-700">
                                  Disponible
                                </Badge>
                              )}
                              {isExpired && (
                                <Badge className="bg-red-100 text-red-700">
                                  Expirada
                                </Badge>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div className="glass-blue rounded-xl p-3">
                                <p className="text-xs text-sky-600 font-medium">FECHAS</p>
                                <p className="font-semibold text-slate-800">
                                  {format(new Date(offer.start_date), "d MMM", { locale: es })} -{" "}
                                  {format(new Date(offer.end_date), "d MMM yyyy", { locale: es })}
                                </p>
                              </div>
                              <div className="glass-blue rounded-xl p-3">
                                <p className="text-xs text-sky-600 font-medium">CAPACIDAD</p>
                                <p className="font-semibold text-slate-800 flex items-center gap-1">
                                  <Users className="w-4 h-4" />
                                  Hasta {offer.max_guests} huespedes
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-4">
                              {offer.amenities?.slice(0, 5).map((amenity, i) => (
                                <Badge key={i} variant="outline" className="bg-transparent border-sky-200 text-sky-700">
                                  {amenity}
                                </Badge>
                              ))}
                              {offer.amenities?.length > 5 && (
                                <Badge variant="outline" className="bg-transparent border-slate-200">
                                  +{offer.amenities.length - 5} mas
                                </Badge>
                              )}
                            </div>

                            {offer.admin_notes && (
                              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                                <p className="text-sm text-amber-800">
                                  <strong>Nota:</strong> {offer.admin_notes}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                            <div className="text-sm text-slate-500">
                              Oferta recibida: {format(new Date(offer.created_at), "PPP", { locale: es })}
                            </div>
                            <Button
                              onClick={() => {
                                setSelectedOffer(offer)
                                setConfirmDialogOpen(true)
                              }}
                              disabled={isExpired}
                              className="glass-button text-white border-0"
                            >
                              {isExpired ? "Oferta Expirada" : "Seleccionar Esta Opcion"}
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Help Section */}
          <div className="glass-blue rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-sky-500/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-sky-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-1">Sobre las ofertas</h3>
                <p className="text-sm text-slate-600">
                  Cada oferta tiene un tiempo de validez limitado. Si una oferta expira, podras solicitar
                  nuevas opciones. Las ofertas son personalizadas basadas en tu solicitud y la disponibilidad
                  actual de propiedades en la red WEEK-CHAIN.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="glass-card border-0 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-800">Confirmar Seleccion</DialogTitle>
            <DialogDescription>
              Estas a punto de confirmar tu reservacion. Esta accion no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          {selectedOffer && (
            <div className="space-y-4 py-4">
              <div className="glass-blue rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-sky-500" />
                  <span className="font-semibold text-slate-800">{selectedOffer.property_name}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="w-4 h-4" />
                  <span>{selectedOffer.destination}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {format(new Date(selectedOffer.start_date), "PPP", { locale: es })} -{" "}
                    {format(new Date(selectedOffer.end_date), "PPP", { locale: es })}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">
                  Al confirmar, se usara una semana de tu certificado para el año actual.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setConfirmDialogOpen(false)}
              className="bg-transparent"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirmOffer}
              disabled={confirming}
              className="glass-button text-white border-0"
            >
              {confirming ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Confirmando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Confirmar Reservacion
                </div>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
