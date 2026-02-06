"use client"

import React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  MapPin,
  Calendar,
  ArrowLeft,
  ChevronRight,
  Inbox,
  Send,
  FileCheck,
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import Navbar from "@/components/navbar"

interface Request {
  id: string
  preferred_destination: string
  preferred_start_date: string
  preferred_end_date: string
  guests_count: number
  status: string
  created_at: string
  offers_count?: number
}

interface Reservation {
  id: string
  property_name: string
  destination: string
  start_date: string
  end_date: string
  status: string
  confirmation_code: string
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "Pendiente", color: "bg-amber-100 text-amber-700", icon: <Clock className="w-3 h-3" /> },
  offers_sent: { label: "Ofertas disponibles", color: "bg-sky-100 text-sky-700", icon: <Inbox className="w-3 h-3" /> },
  confirmed: { label: "Confirmada", color: "bg-green-100 text-green-700", icon: <CheckCircle2 className="w-3 h-3" /> },
  completed: { label: "Completada", color: "bg-slate-100 text-slate-700", icon: <FileCheck className="w-3 h-3" /> },
  cancelled: { label: "Cancelada", color: "bg-red-100 text-red-700", icon: <XCircle className="w-3 h-3" /> },
  expired: { label: "Expirada", color: "bg-slate-100 text-slate-500", icon: <XCircle className="w-3 h-3" /> },
}

const DESTINATIONS: Record<string, string> = {
  "cancun": "Cancun",
  "los-cabos": "Los Cabos",
  "puerto-vallarta": "Puerto Vallarta",
  "riviera-maya": "Riviera Maya",
  "mazatlan": "Mazatlan",
  "san-miguel": "San Miguel de Allende",
  "cualquiera": "Flexible",
}

export default function ReservationsPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState<Request[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])

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

      // Load requests
      const { data: requestsData } = await supabase
        .from("reservation_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      // Count offers for each request
      if (requestsData) {
        const requestsWithOffers = await Promise.all(
          requestsData.map(async (req) => {
            const { count } = await supabase
              .from("reservation_offers")
              .select("*", { count: "exact", head: true })
              .eq("request_id", req.id)
              .eq("status", "pending")
            
            return { ...req, offers_count: count || 0 }
          })
        )
        setRequests(requestsWithOffers)
      }

      // Load confirmed reservations from offers
      const { data: offersData } = await supabase
        .from("reservation_offers")
        .select("*")
        .eq("status", "accepted")
        .order("start_date", { ascending: false })

      if (offersData) {
        setReservations(offersData.map(offer => ({
          id: offer.id,
          property_name: offer.property_name,
          destination: offer.destination,
          start_date: offer.start_date,
          end_date: offer.end_date,
          status: new Date(offer.end_date) < new Date() ? "completed" : "confirmed",
          confirmation_code: `WC-${offer.id.slice(0, 8).toUpperCase()}`,
        })))
      }
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const pendingRequests = requests.filter(r => ["pending", "offers_sent"].includes(r.status))
  const pastRequests = requests.filter(r => ["confirmed", "cancelled", "expired"].includes(r.status))

  if (loading) {
    return (
      <div className="flex h-screen flex-col overflow-hidden bg-gradient-to-br from-sky-50 via-cyan-50 to-teal-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="glass-card rounded-2xl p-8 text-center">
            <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600">Cargando reservaciones...</p>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/member">
                <Button variant="ghost" size="icon" className="glass rounded-full">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Mis Reservaciones</h1>
                <p className="text-slate-600">Gestiona tus solicitudes y reservaciones</p>
              </div>
            </div>
            <Link href="/dashboard/member/reservations/request">
              <Button className="glass-button text-white border-0">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Solicitud
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid sm:grid-cols-3 gap-4">
            <Card className="glass-card border-0">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Send className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{pendingRequests.length}</p>
                  <p className="text-sm text-slate-500">Solicitudes activas</p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card border-0">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center">
                  <Inbox className="w-6 h-6 text-sky-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">
                    {requests.reduce((sum, r) => sum + (r.offers_count || 0), 0)}
                  </p>
                  <p className="text-sm text-slate-500">Ofertas pendientes</p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card border-0">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{reservations.length}</p>
                  <p className="text-sm text-slate-500">Reservaciones confirmadas</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Tabs */}
          <Tabs defaultValue="active" className="space-y-6">
            <TabsList className="glass p-1 border-0">
              <TabsTrigger value="active" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Activas ({pendingRequests.length})
              </TabsTrigger>
              <TabsTrigger value="confirmed" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Confirmadas ({reservations.length})
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Historial ({pastRequests.length})
              </TabsTrigger>
            </TabsList>

            {/* Active Requests */}
            <TabsContent value="active" className="space-y-4">
              {pendingRequests.length === 0 ? (
                <Card className="glass-card border-0">
                  <CardContent className="p-12 text-center">
                    <Send className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">
                      No tienes solicitudes activas
                    </h3>
                    <p className="text-slate-500 mb-4">
                      Crea una nueva solicitud para comenzar el proceso de reservacion.
                    </p>
                    <Link href="/dashboard/member/reservations/request">
                      <Button className="glass-button text-white border-0">
                        <Plus className="w-4 h-4 mr-2" />
                        Nueva Solicitud
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                pendingRequests.map((request) => (
                  <Card key={request.id} className="glass-card border-0 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Badge className={STATUS_CONFIG[request.status]?.color}>
                              {STATUS_CONFIG[request.status]?.icon}
                              <span className="ml-1">{STATUS_CONFIG[request.status]?.label}</span>
                            </Badge>
                            {request.offers_count && request.offers_count > 0 && (
                              <Badge className="bg-sky-500 text-white">
                                {request.offers_count} oferta{request.offers_count > 1 ? 's' : ''} disponible{request.offers_count > 1 ? 's' : ''}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-slate-700">
                            <MapPin className="w-4 h-4 text-sky-500" />
                            <span className="font-semibold">
                              {DESTINATIONS[request.preferred_destination] || request.preferred_destination}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {format(new Date(request.preferred_start_date), "d MMM yyyy", { locale: es })}
                            </span>
                            <span>{request.guests_count} huespedes</span>
                          </div>
                          <p className="text-xs text-slate-400">
                            Solicitado: {format(new Date(request.created_at), "PPP", { locale: es })}
                          </p>
                        </div>
                        <Link 
                          href={request.offers_count && request.offers_count > 0 
                            ? "/dashboard/member/reservations/offers" 
                            : "#"
                          }
                        >
                          <Button 
                            variant={request.offers_count && request.offers_count > 0 ? "default" : "outline"}
                            className={request.offers_count && request.offers_count > 0 
                              ? "glass-button text-white border-0" 
                              : "bg-transparent"
                            }
                            disabled={!request.offers_count || request.offers_count === 0}
                          >
                            {request.offers_count && request.offers_count > 0 ? "Ver Ofertas" : "Esperando ofertas"}
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* Confirmed Reservations */}
            <TabsContent value="confirmed" className="space-y-4">
              {reservations.length === 0 ? (
                <Card className="glass-card border-0">
                  <CardContent className="p-12 text-center">
                    <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">
                      No tienes reservaciones confirmadas
                    </h3>
                    <p className="text-slate-500">
                      Las reservaciones confirmadas aparecerán aqui.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                reservations.map((reservation) => (
                  <Card key={reservation.id} className="glass-card border-0 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Badge className={STATUS_CONFIG[reservation.status]?.color}>
                              {STATUS_CONFIG[reservation.status]?.icon}
                              <span className="ml-1">{STATUS_CONFIG[reservation.status]?.label}</span>
                            </Badge>
                            <span className="text-sm text-slate-500">
                              {reservation.confirmation_code}
                            </span>
                          </div>
                          <h3 className="font-semibold text-slate-800">{reservation.property_name}</h3>
                          <div className="flex items-center gap-2 text-slate-600">
                            <MapPin className="w-4 h-4 text-sky-500" />
                            <span>{reservation.destination}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-slate-500">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(reservation.start_date), "d MMM", { locale: es })} -{" "}
                            {format(new Date(reservation.end_date), "d MMM yyyy", { locale: es })}
                          </div>
                        </div>
                        <Link href={`/dashboard/member/reservations/confirmed?offer=${reservation.id}`}>
                          <Button variant="outline" className="bg-transparent">
                            Ver detalles
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* History */}
            <TabsContent value="history" className="space-y-4">
              {pastRequests.length === 0 ? (
                <Card className="glass-card border-0">
                  <CardContent className="p-12 text-center">
                    <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">
                      Sin historial
                    </h3>
                    <p className="text-slate-500">
                      Tu historial de solicitudes aparecerá aqui.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                pastRequests.map((request) => (
                  <Card key={request.id} className="glass-card border-0 opacity-75">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <Badge className={STATUS_CONFIG[request.status]?.color}>
                            {STATUS_CONFIG[request.status]?.icon}
                            <span className="ml-1">{STATUS_CONFIG[request.status]?.label}</span>
                          </Badge>
                          <div className="flex items-center gap-2 text-slate-600">
                            <MapPin className="w-4 h-4" />
                            <span>{DESTINATIONS[request.preferred_destination] || request.preferred_destination}</span>
                          </div>
                          <p className="text-sm text-slate-400">
                            {format(new Date(request.created_at), "PPP", { locale: es })}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
