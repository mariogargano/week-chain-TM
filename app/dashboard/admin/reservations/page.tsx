"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Send,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Loader2,
  Search,
  Filter,
  Eye,
  MessageSquare,
} from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"

type ReservationRequest = {
  id: string
  user_id: string
  certificate_id: string
  destination_preference: string
  date_range_start: string
  date_range_end: string
  pax_count: number
  special_requests: string
  status: string
  created_at: string
  profiles?: { full_name: string; email: string }
}

type ReservationOffer = {
  id: string
  request_id: string
  property_name: string
  destination: string
  check_in: string
  check_out: string
  total_nights: number
  amenities: string[]
  image_url: string
  admin_notes: string
  status: string
}

export default function AdminReservationsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState<ReservationRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<ReservationRequest | null>(null)
  const [offers, setOffers] = useState<ReservationOffer[]>([])
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [sendingOffer, setSendingOffer] = useState(false)
  const [showOfferForm, setShowOfferForm] = useState(false)

  const [newOffer, setNewOffer] = useState({
    property_name: "",
    destination: "",
    check_in: "",
    check_out: "",
    total_nights: 7,
    amenities: "",
    image_url: "",
    admin_notes: "",
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace("/auth"); return }

      const { data: adminUser } = await supabase
        .from("admin_users")
        .select("*")
        .eq("email", user.email?.toLowerCase())
        .eq("status", "active")
        .single()

      if (!adminUser) { router.replace("/dashboard"); return }

      const { data: requestsData } = await supabase
        .from("reservation_requests")
        .select("*, profiles(full_name, email)")
        .order("created_at", { ascending: false })

      setRequests(requestsData || [])
      setLoading(false)
    } catch (err) {
      console.error("Error:", err)
      setLoading(false)
    }
  }

  const loadOffersForRequest = async (requestId: string) => {
    const supabase = createClient()
    const { data } = await supabase
      .from("reservation_offers")
      .select("*")
      .eq("request_id", requestId)
      .order("created_at", { ascending: false })
    setOffers(data || [])
  }

  const selectRequest = async (req: ReservationRequest) => {
    setSelectedRequest(req)
    await loadOffersForRequest(req.id)
  }

  const sendOffer = async () => {
    if (!selectedRequest) return
    setSendingOffer(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from("reservation_offers").insert({
        request_id: selectedRequest.id,
        property_name: newOffer.property_name,
        destination: newOffer.destination,
        check_in: newOffer.check_in,
        check_out: newOffer.check_out,
        total_nights: newOffer.total_nights,
        amenities: newOffer.amenities.split(",").map((a) => a.trim()),
        image_url: newOffer.image_url,
        admin_notes: newOffer.admin_notes,
        status: "offered",
      })

      if (!error) {
        await supabase
          .from("reservation_requests")
          .update({ status: "offer_sent" })
          .eq("id", selectedRequest.id)

        setShowOfferForm(false)
        setNewOffer({ property_name: "", destination: "", check_in: "", check_out: "", total_nights: 7, amenities: "", image_url: "", admin_notes: "" })
        await loadOffersForRequest(selectedRequest.id)
        await fetchData()
      }
    } catch (err) {
      console.error("Error sending offer:", err)
    }
    setSendingOffer(false)
  }

  const rejectRequest = async (requestId: string) => {
    const supabase = createClient()
    await supabase.from("reservation_requests").update({ status: "rejected" }).eq("id", requestId)
    setSelectedRequest(null)
    await fetchData()
  }

  const statusConfig: Record<string, { label: string; color: string }> = {
    requested: { label: "Solicitud Nueva", color: "bg-sky-500 text-white" },
    processing: { label: "En Proceso", color: "bg-cyan-500 text-white" },
    offer_sent: { label: "Oferta Enviada", color: "bg-teal-500 text-white" },
    confirmed: { label: "Confirmado", color: "bg-emerald-500 text-white" },
    rejected: { label: "Rechazado", color: "bg-red-500 text-white" },
    cancelled: { label: "Cancelado", color: "bg-slate-500 text-white" },
  }

  const filteredRequests = requests.filter((r) => {
    if (filter !== "all" && r.status !== filter) return false
    if (searchTerm && !r.destination_preference?.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-sky-900 to-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-900/50 to-slate-900 text-white">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/admin">
              <Button variant="outline" size="icon" className="border-sky-400/30 text-sky-300 hover:bg-sky-500/10 bg-transparent">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-300 to-cyan-300 bg-clip-text text-transparent">
                Control de Reservaciones
              </h1>
              <p className="text-sky-300/70">Flujo REQUEST - OFFER - CONFIRM</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-sky-500/20 text-sky-300 border border-sky-500/30 text-sm px-3 py-1.5">
              {requests.filter((r) => r.status === "requested").length} nuevas
            </Badge>
            <Badge className="bg-teal-500/20 text-teal-300 border border-teal-500/30 text-sm px-3 py-1.5">
              {requests.filter((r) => r.status === "offer_sent").length} ofertas pendientes
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sky-400" />
            <Input
              placeholder="Buscar por destino..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/5 border-sky-400/30 text-white placeholder:text-sky-300/50"
            />
          </div>
          <div className="flex gap-2">
            {[
              { key: "all", label: "Todos" },
              { key: "requested", label: "Nuevas" },
              { key: "processing", label: "En proceso" },
              { key: "offer_sent", label: "Oferta enviada" },
              { key: "confirmed", label: "Confirmadas" },
            ].map((f) => (
              <Button
                key={f.key}
                variant="outline"
                size="sm"
                onClick={() => setFilter(f.key)}
                className={`border-sky-400/30 bg-transparent ${filter === f.key ? "bg-sky-500/20 text-sky-200 border-sky-400" : "text-sky-300/70 hover:bg-sky-500/10"}`}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Requests List */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-lg font-semibold text-sky-200 flex items-center gap-2">
              <Filter className="h-4 w-4" /> Solicitudes ({filteredRequests.length})
            </h3>
            <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
              {filteredRequests.length === 0 ? (
                <Card className="border-sky-400/20 bg-white/5 backdrop-blur">
                  <CardContent className="p-8 text-center text-sky-300/60">
                    No hay solicitudes con este filtro
                  </CardContent>
                </Card>
              ) : (
                filteredRequests.map((req) => (
                  <Card
                    key={req.id}
                    onClick={() => selectRequest(req)}
                    className={`cursor-pointer border transition-all backdrop-blur ${
                      selectedRequest?.id === req.id
                        ? "border-sky-400 bg-sky-500/20 shadow-lg shadow-sky-500/20"
                        : "border-sky-400/20 bg-white/5 hover:border-sky-400/40 hover:bg-white/10"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-sky-400" />
                          <span className="font-semibold text-white text-sm">
                            {req.destination_preference || "Destino flexible"}
                          </span>
                        </div>
                        <Badge className={statusConfig[req.status]?.color || "bg-slate-500 text-white"}>
                          {statusConfig[req.status]?.label || req.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-sky-300/70">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" /> {req.pax_count} pax
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {req.date_range_start ? new Date(req.date_range_start).toLocaleDateString("es-MX") : "Sin fecha"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(req.created_at).toLocaleDateString("es-MX")}
                        </span>
                      </div>
                      {req.profiles && (
                        <p className="text-xs text-sky-300/50 mt-2">
                          {req.profiles.full_name || req.profiles.email}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Request Detail + Offer Panel */}
          <div className="lg:col-span-3 space-y-4">
            {selectedRequest ? (
              <>
                {/* Request Detail */}
                <Card className="border-sky-400/30 bg-white/5 backdrop-blur-lg">
                  <CardHeader className="border-b border-sky-400/20">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-white">Detalle de Solicitud</CardTitle>
                      <Badge className={statusConfig[selectedRequest.status]?.color || "bg-slate-500 text-white"}>
                        {statusConfig[selectedRequest.status]?.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-sky-300/60 uppercase tracking-wider">Destino</p>
                        <p className="font-semibold text-white">{selectedRequest.destination_preference || "Flexible"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-sky-300/60 uppercase tracking-wider">PAX</p>
                        <p className="font-semibold text-white">{selectedRequest.pax_count} personas</p>
                      </div>
                      <div>
                        <p className="text-xs text-sky-300/60 uppercase tracking-wider">Fecha Inicio</p>
                        <p className="font-semibold text-white">
                          {selectedRequest.date_range_start
                            ? new Date(selectedRequest.date_range_start).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })
                            : "Sin preferencia"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-sky-300/60 uppercase tracking-wider">Fecha Fin</p>
                        <p className="font-semibold text-white">
                          {selectedRequest.date_range_end
                            ? new Date(selectedRequest.date_range_end).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })
                            : "Sin preferencia"}
                        </p>
                      </div>
                    </div>
                    {selectedRequest.special_requests && (
                      <div>
                        <p className="text-xs text-sky-300/60 uppercase tracking-wider mb-1">Notas del Member</p>
                        <p className="text-sm text-sky-200 bg-sky-500/10 p-3 rounded-lg border border-sky-400/20">
                          {selectedRequest.special_requests}
                        </p>
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      {(selectedRequest.status === "requested" || selectedRequest.status === "processing") && (
                        <>
                          <Button
                            onClick={() => setShowOfferForm(true)}
                            className="flex-1 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white"
                          >
                            <Send className="h-4 w-4 mr-2" /> Enviar Oferta
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => rejectRequest(selectedRequest.id)}
                            className="border-red-400/30 text-red-300 hover:bg-red-500/10 bg-transparent"
                          >
                            <XCircle className="h-4 w-4 mr-2" /> Rechazar
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Offer Form */}
                {showOfferForm && (
                  <Card className="border-sky-400/30 bg-sky-500/10 backdrop-blur-lg">
                    <CardHeader>
                      <CardTitle className="text-lg text-white flex items-center gap-2">
                        <Send className="h-5 w-5 text-sky-400" /> Nueva Oferta
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-sky-300/70 mb-1 block">Nombre Propiedad</label>
                          <Input
                            value={newOffer.property_name}
                            onChange={(e) => setNewOffer({ ...newOffer, property_name: e.target.value })}
                            className="bg-white/10 border-sky-400/30 text-white placeholder:text-sky-300/40"
                            placeholder="Villa Cancun..."
                          />
                        </div>
                        <div>
                          <label className="text-xs text-sky-300/70 mb-1 block">Destino</label>
                          <Input
                            value={newOffer.destination}
                            onChange={(e) => setNewOffer({ ...newOffer, destination: e.target.value })}
                            className="bg-white/10 border-sky-400/30 text-white placeholder:text-sky-300/40"
                            placeholder="Cancun, Mexico"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-sky-300/70 mb-1 block">Check-in</label>
                          <Input
                            type="date"
                            value={newOffer.check_in}
                            onChange={(e) => setNewOffer({ ...newOffer, check_in: e.target.value })}
                            className="bg-white/10 border-sky-400/30 text-white"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-sky-300/70 mb-1 block">Check-out</label>
                          <Input
                            type="date"
                            value={newOffer.check_out}
                            onChange={(e) => setNewOffer({ ...newOffer, check_out: e.target.value })}
                            className="bg-white/10 border-sky-400/30 text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-sky-300/70 mb-1 block">Amenidades (separar con coma)</label>
                        <Input
                          value={newOffer.amenities}
                          onChange={(e) => setNewOffer({ ...newOffer, amenities: e.target.value })}
                          className="bg-white/10 border-sky-400/30 text-white placeholder:text-sky-300/40"
                          placeholder="Piscina, WiFi, Vista al mar, Cocina..."
                        />
                      </div>
                      <div>
                        <label className="text-xs text-sky-300/70 mb-1 block">URL Imagen (opcional)</label>
                        <Input
                          value={newOffer.image_url}
                          onChange={(e) => setNewOffer({ ...newOffer, image_url: e.target.value })}
                          className="bg-white/10 border-sky-400/30 text-white placeholder:text-sky-300/40"
                          placeholder="https://..."
                        />
                      </div>
                      <div>
                        <label className="text-xs text-sky-300/70 mb-1 block">Notas para el member</label>
                        <Textarea
                          value={newOffer.admin_notes}
                          onChange={(e) => setNewOffer({ ...newOffer, admin_notes: e.target.value })}
                          className="bg-white/10 border-sky-400/30 text-white placeholder:text-sky-300/40"
                          placeholder="Detalles adicionales..."
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={sendOffer}
                          disabled={sendingOffer || !newOffer.property_name || !newOffer.destination}
                          className="flex-1 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white"
                        >
                          {sendingOffer ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                          Enviar Oferta al Member
                        </Button>
                        <Button variant="outline" onClick={() => setShowOfferForm(false)} className="border-sky-400/30 text-sky-300 hover:bg-sky-500/10 bg-transparent">
                          Cancelar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Existing Offers */}
                {offers.length > 0 && (
                  <Card className="border-sky-400/30 bg-white/5 backdrop-blur-lg">
                    <CardHeader className="border-b border-sky-400/20">
                      <CardTitle className="text-lg text-white flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-sky-400" /> Ofertas Enviadas ({offers.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      {offers.map((offer) => (
                        <div key={offer.id} className="p-4 rounded-lg border border-sky-400/20 bg-white/5">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold text-white">{offer.property_name}</p>
                              <p className="text-sm text-sky-300">{offer.destination}</p>
                            </div>
                            <Badge className={offer.status === "accepted" ? "bg-emerald-500 text-white" : offer.status === "rejected" ? "bg-red-500 text-white" : "bg-sky-500/30 text-sky-200"}>
                              {offer.status === "accepted" ? "Aceptada" : offer.status === "rejected" ? "Rechazada" : "Pendiente"}
                            </Badge>
                          </div>
                          <div className="flex gap-4 text-xs text-sky-300/60">
                            <span>Check-in: {offer.check_in ? new Date(offer.check_in).toLocaleDateString("es-MX") : "-"}</span>
                            <span>Check-out: {offer.check_out ? new Date(offer.check_out).toLocaleDateString("es-MX") : "-"}</span>
                            <span>{offer.total_nights} noches</span>
                          </div>
                          {offer.admin_notes && (
                            <p className="text-xs text-sky-200/60 mt-2 italic">Nota: {offer.admin_notes}</p>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card className="border-sky-400/20 bg-white/5 backdrop-blur-lg">
                <CardContent className="p-16 text-center">
                  <Eye className="h-12 w-12 text-sky-400/40 mx-auto mb-4" />
                  <p className="text-sky-300/60 text-lg">Selecciona una solicitud para ver los detalles</p>
                  <p className="text-sky-300/40 text-sm mt-2">
                    Puedes enviar ofertas, rechazar solicitudes o ver el historial
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
