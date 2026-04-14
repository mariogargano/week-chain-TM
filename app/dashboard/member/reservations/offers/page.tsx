"use client";
import React from "react";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MapPin,
  Calendar,
  Users,
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
  X,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import Image from "next/image";

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
  Cancun: <Waves className="w-4 h-4" />,
  "Los Cabos": <Mountain className="w-4 h-4" />,
  "Puerto Vallarta": <TreePalm className="w-4 h-4" />,
  "Riviera Maya": <TreePalm className="w-4 h-4" />,
}

type DialogMode = "accept" | "decline" | null

export default function ReservationOffersPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState<Request[]>([])
  const [offers, setOffers] = useState<Offer[]>([])
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null)
  const [dialogMode, setDialogMode] = useState<DialogMode>(null)
  const [processing, setProcessing] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.replace("/auth")
        return
      }

      // Cargar solicitudes con ofertas pendientes
      const { data: requestsData } = await supabase
        .from("reservation_requests")
        .select("*")
        .eq("user_id", user.id)
        .in("status", ["pending", "offers_sent", "offered"])
        .order("created_at", { ascending: false })

      setRequests(requestsData || [])

      // Cargar ofertas para estas solicitudes
      if (requestsData && requestsData.length > 0) {
        const requestIds = requestsData.map((r) => r.id)
        const { data: offersData } = await supabase
          .from("reservation_offers")
          .select("*")
          .in("request_id", requestIds)
          .eq("status", "pending")
          .order("created_at", { ascending: false })

        setOffers(offersData || [])
      } else {
        setOffers([])
      }
    } catch {
      // Error silencioso — la UI mostrará estado vacío
    } finally {
      setLoading(false)
    }
  }

  const openDialog = (offer: Offer, mode: DialogMode) => {
    setSelectedOffer(offer)
    setDialogMode(mode)
    setActionError(null)
  }

  const closeDialog = () => {
    if (!processing) {
      setSelectedOffer(null)
      setDialogMode(null)
      setActionError(null)
    }
  }

  const handleAcceptOffer = async () => {
    if (!selectedOffer) return
    setProcessing(true)
    setActionError(null)

    try {
      const res = await fetch("/api/reservations/respond-to-offer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          request_id: selectedOffer.request_id,
          response: "accept",
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.revertToRequested) {
          // La propiedad ya no está disponible — recargar datos
          setActionError(
            "Esta propiedad ya no está disponible para las fechas seleccionadas. Se te enviará una nueva oferta pronto.",
          )
          await loadData()
          return
        }
        setActionError(data.error || "Ocurrió un error al confirmar la oferta.")
        return
      }

      // Éxito: redirigir a confirmación
      // Usamos el offer id para que la página de confirmación lo busque
      router.push(`/dashboard/member/reservations/confirmed?offer=${selectedOffer.id}`)
    } catch {
      setActionError("Error de red. Por favor intenta de nuevo.")
    } finally {
      setProcessing(false)
    }
  }

  const handleDeclineOffer = async () => {
    if (!selectedOffer) return
    setProcessing(true)
    setActionError(null)

    try {
      const res = await fetch("/api/reservations/respond-to-offer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          request_id: selectedOffer.request_id,
          response: "decline",
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setActionError(data.error || "Ocurrió un error al rechazar la oferta.")
        return
      }

      // Éxito: cerrar dialog y recargar
      closeDialog()
      await loadData()
    } catch {
      setActionError("Error de red. Por favor intenta de nuevo.")
    } finally {
      setProcessing(false)
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
      return `${days} día${days > 1 ? "s" : ""} restante${days > 1 ? "s" : ""}`
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
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-800">Ofertas Disponibles</h1>
              <p className="text-slate-600">Paso 2 de 3: Revisa y selecciona una oferta</p>
            </div>
            <Button variant="ghost" size="icon" onClick={loadData} className="glass rounded-full" title="Actualizar">
              <RefreshCw className="w-5 h-5" />
            </Button>
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
                  <p className="text-xs text-slate-500">Selecciona una opción</p>
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

          {/* Offers list or empty state */}
          {offers.length === 0 ? (
            <Card className="glass-card border-0">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-sky-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-10 h-10 text-sky-500" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">Esperando ofertas</h3>
                <p className="text-slate-600 max-w-md mx-auto mb-6">
                  {requests.length > 0
                    ? "Tu solicitud está siendo procesada. Recibirás ofertas dentro de las próximas 24-48 horas."
                    : "No tienes solicitudes activas. Crea una nueva solicitud para recibir ofertas."}
                </p>
                {requests.length === 0 && (
                  <Link href="/dashboard/member/reservations/request">
                    <Button className="glass-button text-white border-0">Nueva Solicitud</Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {offers.map((offer) => {
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
                              src={offer.property_image}
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
                            {DESTINATION_ICONS[offer.destination] || null}
                            <span className="ml-1">{offer.destination}</span>
                          </Badge>
                        </div>
                        {!isExpired && offer.expires_at && (
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
                                <h3 className="text-xl font-bold text-slate-800">{offer.property_name}</h3>
                                <p className="text-slate-500 flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {offer.destination}
                                  {offer.region ? `, ${offer.region}` : ""}
                                </p>
                              </div>
                              {isExpired ? (
                                <Badge className="bg-red-100 text-red-700">Expirada</Badge>
                              ) : (
                                <Badge className="bg-green-100 text-green-700">Disponible</Badge>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div className="glass-blue rounded-xl p-3">
                                <p className="text-xs text-sky-600 font-medium uppercase">Fechas</p>
                                <p className="font-semibold text-slate-800">
                                  {format(new Date(offer.start_date), "d MMM", { locale: es })} –{" "}
                                  {format(new Date(offer.end_date), "d MMM yyyy", { locale: es })}
                                </p>
                              </div>
                              <div className="glass-blue rounded-xl p-3">
                                <p className="text-xs text-sky-600 font-medium uppercase">Capacidad</p>
                                <p className="font-semibold text-slate-800 flex items-center gap-1">
                                  <Users className="w-4 h-4" />
                                  Hasta {offer.max_guests} huéspedes
                                </p>
                              </div>
                            </div>

                            {offer.amenities && offer.amenities.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-4">
                                {offer.amenities.slice(0, 5).map((amenity, i) => (
                                  <Badge
                                    key={i}
                                    variant="outline"
                                    className="bg-transparent border-sky-200 text-sky-700"
                                  >
                                    {amenity}
                                  </Badge>
                                ))}
                                {offer.amenities.length > 5 && (
                                  <Badge variant="outline" className="bg-transparent border-slate-200">
                                    +{offer.amenities.length - 5} más
                                  </Badge>
                                )}
                              </div>
                            )}

                            {offer.admin_notes && (
                              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                                <p className="text-sm text-amber-800">
                                  <strong>Nota:</strong> {offer.admin_notes}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
                            <div className="text-sm text-slate-500">
                              Oferta recibida:{" "}
                              {format(new Date(offer.created_at), "PPP", { locale: es })}
                            </div>
                            {!isExpired && (
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openDialog(offer, "decline")}
                                  className="bg-transparent border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                                >
                                  <X className="w-4 h-4 mr-1" />
                                  Rechazar
                                </Button>
                                <Button
                                  onClick={() => openDialog(offer, "accept")}
                                  className="glass-button text-white border-0"
                                  size="sm"
                                >
                                  <Check className="w-4 h-4 mr-1" />
                                  Aceptar
                                  <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                              </div>
                            )}
                            {isExpired && (
                              <Badge className="bg-red-100 text-red-700 text-sm px-3 py-1">Oferta Expirada</Badge>
                            )}
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
                  Cada oferta tiene un tiempo de validez limitado. Si rechazas una oferta o ésta expira, tu solicitud
                  volverá a estado pendiente y recibirás nuevas opciones. Al aceptar, se usará una semana de tu
                  certificado para el año en curso.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accept Confirmation Dialog */}
      <Dialog open={dialogMode === "accept"} onOpenChange={closeDialog}>
        <DialogContent className="glass-card border-0 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-800">Confirmar Selección</DialogTitle>
            <DialogDescription>
              Estás a punto de confirmar tu reservación. Esta acción no se puede deshacer.
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
                    {format(new Date(selectedOffer.start_date), "PPP", { locale: es })} –{" "}
                    {format(new Date(selectedOffer.end_date), "PPP", { locale: es })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Users className="w-4 h-4" />
                  <span>Hasta {selectedOffer.max_guests} huéspedes</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">
                  Al confirmar, se usará una semana de tu certificado para el año actual.
                </p>
              </div>

              {actionError && (
                <div className="flex items-start gap-3 p-3 bg-red-50 rounded-xl border border-red-200">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{actionError}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={processing} className="bg-transparent">
              Cancelar
            </Button>
            <Button onClick={handleAcceptOffer} disabled={processing} className="glass-button text-white border-0">
              {processing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Confirmando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Confirmar Reservación
                </div>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Decline Confirmation Dialog */}
      <Dialog open={dialogMode === "decline"} onOpenChange={closeDialog}>
        <DialogContent className="glass-card border-0 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-800">Rechazar Oferta</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas rechazar esta oferta? Tu solicitud volverá a estado pendiente y recibirás
              nuevas opciones.
            </DialogDescription>
          </DialogHeader>

          {selectedOffer && (
            <div className="space-y-4 py-4">
              <div className="glass-blue rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-sky-500" />
                  <span className="font-semibold text-slate-800">{selectedOffer.property_name}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {format(new Date(selectedOffer.start_date), "PPP", { locale: es })} –{" "}
                    {format(new Date(selectedOffer.end_date), "PPP", { locale: es })}
                  </span>
                </div>
              </div>

              {actionError && (
                <div className="flex items-start gap-3 p-3 bg-red-50 rounded-xl border border-red-200">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{actionError}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={processing} className="bg-transparent">
              Cancelar
            </Button>
            <Button
              onClick={handleDeclineOffer}
              disabled={processing}
              variant="outline"
              className="bg-transparent border-red-200 text-red-600 hover:bg-red-50"
            >
              {processing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                  Rechazando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <X className="w-4 h-4" />
                  Rechazar Oferta
                </div>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
